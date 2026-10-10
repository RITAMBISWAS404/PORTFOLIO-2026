"use client";
// Director for the living Hero pegboard (the home page only). Exactly two autonomous behaviours, driven by one small state machine (see Phase):
//   1. occasional theft   idle -> stealing -> replacing -> settling -> idle   Clippy takes ONE object; one Restocker brings ONE replacement back
//   2. the visitor's shake  idle -> scattering -> restocking -> settling -> idle   scatter, clear the old objects, plan a fresh composition with the
//      one coverage-first engine, then the restockers place it in coordinated waves (Clippy stays out of it)
// Nothing else moves by itself. Only one event runs at a time; a shake during a theft is remembered once. Every event is cancellable (Hero scrolled away, tab hidden,
// resize, unmount) and leaves the board in a coherent state. Objects move through their own motion values (transform only, no React state
// per frame). React state changes only when an object is added, removed or REBASED.
//
// Transform ownership (one writer per property, nothing is ever reset to a default):
//   .hm-hs-obj   placement from the item's base (cx, cy) in % of the frame            <- React state, changes only on add/remove/rebase
//   <img>         the item's base rotation `rot`                                        <- React state
//   motion.div    x / y / rotate / scale = OFFSETS from that base                       <- motion values: director, drag and spring-back
// Every animation starts from the offsets as they are right now. When a movement is finished (scatter, nudge) it is REBASED: the base takes
// the new position/rotation and the offsets are reduced by exactly the same amount in a layout effect, so nothing moves on screen and the
// new pose becomes the object's resting pose. Visitor drags always win: grabbing an object cancels whatever the director was doing with it,
// and an object that is held (or being carried) is never picked, scattered, stolen, collected, nudged or rebased.
import { useEffect, useRef, type MutableRefObject, type RefObject } from "react";
import { animate, type MotionValue } from "framer-motion";
import { ASSET_BY_ID } from "./heroObjects";
import {
  footprint, makeBoardMask, placedFrom, planAdd, planFull, planReplacement, remember, shapeFor, separation, shareIn, silhouetteOverlap, validShape, visibleArea,
  type Env, type Existing, type Move, type Placed, type Plan, type Rect, type Shape,
} from "./heroComposer";
import type { ActorHandle } from "./HeroActors";
import { CLIPPY, pickOne } from "@/lib/home/cursorCopy";

export type HeroItem = {
  id: string; assetId: string;
  cx: number; cy: number; w: number; rot: number;        // frame px / degrees (the resting pose)
  idle: string;                                           // idle keyframe class
  start?: { x: number; y: number };                       // screen-px offset an object is mounted with (carried in from off-board)
  shift?: { n: number; x: number; y: number; rot: number };   // last rebase, screen px / degrees; the Layer subtracts it from its offsets in a layout effect
};
export type ItemCtl = {
  dx: MotionValue<number>; dy: MotionValue<number>; rot: MotionValue<number>; lift: MotionValue<number>;
  isHeld: () => boolean; lock: (on: boolean) => void;
  release: () => void;                                  // end a drag in place (no spring home)
};

type P = { x: number; y: number };
type Handle = { stop: () => void };
type Run = { dead: boolean };
type Side = "L" | "R" | "T";
/**
 * The board's operating state. Exactly one at a time; every change goes through go(), which refuses anything not listed in NEXT.
 *   idle              normal board; the only state in which Clippy's scheduler may start a theft
 *   user-interacting  the visitor is dragging an object (no autonomous theft); a click on the board may still start a shake
 *   stealing/replacing  one ambient event: Clippy takes an object, the restockers bring the replacement(s)
 *   scattering        the visitor's shake: the board shakes and the objects fly apart
 *   restocking        the restockers (through the shared coordinator) bring the new composition while Clippy clears the scattered objects
 *   settling          placements are finished, everything springs to rest; then idle again
 */
type Phase = "idle" | "user-interacting" | "stealing" | "replacing" | "scattering" | "restocking" | "settling";
const NEXT: Record<Phase, Phase[]> = {
  idle: ["user-interacting", "stealing", "scattering"],
  "user-interacting": ["idle", "scattering"],
  stealing: ["replacing", "settling", "idle"],
  replacing: ["settling", "idle"],
  scattering: ["restocking", "settling", "idle"],
  restocking: ["settling", "idle"],
  settling: ["idle", "scattering"],          // a shake right after a recovery is allowed
};
/** One planned placement: planned -> reserved -> picked-up -> in-transit -> placed -> committed (or failed at any step, which releases everything it holds). */
type TaskState = "planned" | "reserved" | "picked-up" | "in-transit" | "placed" | "committed" | "failed";
type Task = { op: number; asset: string; actor: string; item?: string; state: TaskState; why?: string };

// Clippy's introduction runs once per page session (a module flag survives remounts and Strict Mode's double effect).
let introDone = false;
const INTRO_AFTER_READY = [1800, 2600] as const, MIN_GAP_MS = 12000;

const IDLES = ["glasses", "flame", "earphones", "ok"];
/** "OPEN TO NEW OPPOTITIES :P" printed on the board artwork (2592 x 960 px image), padded: the one small protected region. Measured from the PNG. */
const BOARD_NAT = { w: 2592, h: 960 };
const BOARD_TEXT = { l: 2015, t: 809, r: 2476, b: 917 };
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const sgn = () => (Math.random() < 0.5 ? -1 : 1);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t * t;

const loaded = new Set<string>();
function preload(src: string): Promise<boolean> {
  if (loaded.has(src)) return Promise.resolve(true);
  return new Promise(res => {
    const im = new Image();
    im.src = src;
    const done = (ok: boolean) => { if (ok) loaded.add(src); res(ok); };
    if (im.decode) im.decode().then(() => done(true), () => done(false));
    else { im.onload = () => done(true); im.onerror = () => done(false); }
  });
}

type Args = {
  frame: { w: number; h: number }; counts: { base: number; max: number };   // object counts of a composition: usual and maximum
  board: { cx: number; cy: number; w: number };                              // the board artwork's placement in the frame
  stageRef: RefObject<HTMLElement | null>; shakeRef: RefObject<HTMLElement | null>; boardImgRef: RefObject<HTMLImageElement | null>;
  itemsRef: MutableRefObject<HeroItem[]>;
  setItems: (f: (p: HeroItem[]) => HeroItem[]) => void;
  ctls: MutableRefObject<Map<string, ItemCtl>>;
  clippy: RefObject<ActorHandle | null>; restockers: RefObject<ActorHandle | null>[];
  motionOk: boolean;
};

export function useHeroDirector(args: Args) {
  const A = useRef(args);
  useEffect(() => { A.current = args; });
  const S = useRef({
    phase: "idle" as Phase, run: { dead: false } as Run, live: new Set<Handle>(), byItem: new Map<string, Set<Handle>>(),
    carrying: new Map<string, "in" | "out">(), inView: false, lastActive: 0, uid: 0, timer: 0 as unknown as ReturnType<typeof setTimeout>,
    timeouts: new Set<ReturnType<typeof setTimeout>>(), recentSteals: [] as { asset: string; zone: string }[], mask: undefined as ((x: number, y: number) => boolean) | undefined, rebase: 0,
    // the placement coordinator's shared state: destinations claimed by in-flight restocking operations, and the last time a placement began
    res: new Map<number, { pl: Placed; shape: Shape }>(), lastStart: 0, rejected: 0,
    // scheduling: last pointer activity on the board / anywhere on the page, when the last event finished, and whether the last ambient event actually took something
    lastEnd: 0, took: false,
    // placement transactions: one record per planned piece, committed exactly once (S.done); dev counters feed the diagnostics attributes
    badAssets: new Set<string>(), tasks: new Map<number, Task>(), done: new Set<number>(), committed: 0, failed: 0, failLog: [] as string[],
  }).current;
  /** The only way to change phase: an invalid transition is refused (and reported in development), so conflicting operations cannot overlap. */
  const go = (to: Phase): boolean => {
    if (S.phase === to) return true;
    if (!NEXT[S.phase].includes(to)) { if (process.env.NODE_ENV !== "production") console.warn(`[hero] refused ${S.phase} -> ${to}`); return false; }
    S.phase = to; phaseDbg(); return true;
  };
  const phaseDbg = () => { const st = A.current.stageRef.current; if (st && process.env.NODE_ENV !== "production") st.dataset.heroPhase = S.phase; };

  // ── geometry ──
  const geo = () => {
    const { frame, stageRef } = A.current;
    const r = stageRef.current!.getBoundingClientRect(), s = r.width / frame.w;
    // the visible part of the stage; the navbar is NOT a blanket top margin any more, it is an exclusion rect (see env())
    let l = Math.max(r.left, 8), rt = Math.min(r.right, innerWidth - 8), t = Math.max(r.top, 0), b = Math.min(r.bottom, innerHeight - 8);
    if (rt - l < 80) { l = r.left; rt = r.right; }
    if (b - t < 60) { t = r.top; b = r.bottom; }
    return { s, region: { l: (l - r.left) / s, r: (rt - r.left) / s, t: (t - r.top) / s, b: (b - r.top) / s }, edgeL: -r.left / s, edgeR: (innerWidth - r.left) / s, top: -r.top / s };
  };
  /**
   * Planning environment: the visible region, the board artwork mask, and the few REAL constraints, all measured now and expressed in frame coords:
   *   hard  the hero heading and CTAs (if they ever overlap the stage) and the board's printed "OPEN TO NEW OPPOTITIES :P" text (small, deliberate);
   *   soft  the navbar: objects may sit partly under it (it is layered above them) but not centred under it and mostly visible.
   * The board's other printing (numbers, grid lines) is artwork, not a constraint, and the top edge of the board is fully usable.
   */
  const env = (): Env & { s: number } => {
    const g = geo(), st = A.current.stageRef.current!.getBoundingClientRect(), hard: Rect[] = [], soft: Rect[] = [];
    const img = A.current.boardImgRef.current;
    if (!S.mask && img) S.mask = makeBoardMask(img, A.current.board);
    const toFrame = (r: { left: number; top: number; right: number; bottom: number }, m = 0): Rect => ({ l: (r.left - st.left - m) / g.s, r: (r.right - st.left + m) / g.s, t: (r.top - st.top - m) / g.s, b: (r.bottom - st.top + m) / g.s });
    const overlaps = (r: DOMRect) => r.width >= 2 && r.height >= 2 && r.right >= st.left && r.left <= st.right && r.bottom >= st.top && r.top <= st.bottom;
    document.querySelectorAll(".hm-hero-heading, .hm-btn-row").forEach(el => { const r = el.getBoundingClientRect(); if (overlaps(r)) hard.push(toFrame(r, 6)); });
    // the visible navbar bar/pill only (not the collapsed mobile menu): fixed, shown, and bar-sized
    document.querySelectorAll("header, nav").forEach(el => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el), fixedBar = cs.position === "fixed" || getComputedStyle(el.parentElement!).position === "fixed";
      if (fixedBar && cs.visibility !== "hidden" && +cs.opacity > 0.05 && r.height <= 100 && overlaps(r)) soft.push(toFrame(r, 4));
    });
    // The desktop pill starts collapsed and off-screen and grows to ~720px once the page is ready: always reserve its FINAL footprint.
    if (innerWidth >= 768 && st.bottom > 0 && st.top < 80) {
      const w = Math.min(720, innerWidth - 48), l = (innerWidth - w) / 2;
      soft.push(toFrame({ left: l, right: l + w, top: 12, bottom: 78 }, 4));
    }
    // the printed text, placed from where the board image is actually rendered
    if (img && img.getBoundingClientRect().width > 0) {
      const ir = img.getBoundingClientRect(), t = BOARD_TEXT, sx = ir.width / BOARD_NAT.w, sy = ir.height / BOARD_NAT.h;
      hard.push(toFrame({ left: ir.left + t.l * sx, right: ir.left + t.r * sx, top: ir.top + t.t * sy, bottom: ir.top + t.b * sy }));
    }
    if (process.env.NODE_ENV !== "production") A.current.stageRef.current!.dataset.heroEnv = JSON.stringify({ r: g.region, hard, soft, mask: !!S.mask, s: +g.s.toFixed(4) });   // dev aid: what the planner was given
    return { region: g.region, s: g.s, onBoard: S.mask, exclusions: hard, soft };
  };
  const ctl = (id: string) => A.current.ctls.current.get(id);
  const item = (id: string) => A.current.itemsRef.current.find(i => i.id === id);
  const heldAny = () => [...A.current.ctls.current.values()].some(c => c.isHeld());
  const sizePx = (it: HeroItem, s: number) => { const a = ASSET_BY_ID[it.assetId]; const w = it.w * s; return { w, h: (w * a.h) / a.w }; };
  const grip = (it: HeroItem, s: number) => { const p = sizePx(it, s); return { x: 0.16 * p.w, y: 0.2 * p.h }; };   // item centre = hand + grip (px)
  const placedOf = (it: HeroItem): Placed => placedFrom(it.assetId, it.cx, it.cy, it.w, it.rot);
  /** Where an item REALLY is right now: its resting pose plus the live drag/animation offsets (an object being carried IN counts at its destination). */
  const livePlaced = (it: HeroItem): Placed => {
    const c = ctl(it.id);
    if (!c || S.carrying.get(it.id) === "in") return placedOf(it);
    const s = geo().s, dx = c.dx.get() / s, dy = c.dy.get() / s, dr = c.rot.get();
    // an object resting (or only wobbling by a hair from hover / spring-back) counts at its resting pose, exactly what the planner saw; one that is
    // held or genuinely displaced counts where it really is
    if (!c.isHeld() && Math.hypot(dx, dy) < 4 && Math.abs(dr) < 2) return placedOf(it);
    return placedFrom(it.assetId, it.cx + dx, it.cy + dy, it.w, it.rot + dr);
  };
  const locked = (id: string) => !!ctl(id)?.isHeld() || S.carrying.has(id);
  const existing = (skip: Set<string> = new Set()): Existing[] => A.current.itemsRef.current.filter(i => !skip.has(i.id)).map(i => ({ id: i.id, p: livePlaced(i), locked: locked(i.id) }));
  const seedTo = (plan: Plan, what: string, e?: Env) => { const st = A.current.stageRef.current; if (st && process.env.NODE_ENV !== "production") { if (e) st.dataset.heroEnv = JSON.stringify({ r: e.region, hard: e.exclusions, soft: e.soft }); st.dataset.heroSeed = String(plan.seed); st.dataset.heroEvent = what; st.dataset.heroScore = plan.score.toFixed(2); st.dataset.heroPlan = `${plan.placed.length} new, reach ${plan.stats?.reach.toFixed(2)}, emptyLargest ${plan.stats?.emptyLargest.toFixed(2)}, minRegion ${plan.stats?.minRegion.toFixed(2)}`; } };

  // ── timing helpers: every wait/tween is registered so it can be cancelled ──
  const reg = (R: Run, h: Handle, owner?: string) => {
    S.live.add(h);
    if (owner) { let set = S.byItem.get(owner); if (!set) S.byItem.set(owner, (set = new Set())); set.add(h); }
    return () => { S.live.delete(h); if (owner) S.byItem.get(owner)?.delete(h); };
  };
  const sleep = (R: Run, ms: number) => new Promise<void>(res => {
    if (R.dead) return res();
    const t = setTimeout(() => { un(); res(); }, ms);
    const un = reg(R, { stop: () => { clearTimeout(t); un(); res(); } });
  });
  const tween = (R: Run, dur: number, ease: (t: number) => number, onUpdate: (t: number) => void, owner?: string) => new Promise<void>(res => {
    if (R.dead) return res();
    const c = animate(0, 1, { duration: dur, ease: "linear", onUpdate: v => { if (!R.dead) onUpdate(ease(v)); }, onComplete: () => { un(); res(); } });
    const un = reg(R, { stop: () => { c.stop(); un(); res(); } }, owner);
  });

  // ── points ──
  /** An off-board point on `side`. With `near`, its other coordinate lands within a modest spread of that point (so a visitor comes in roughly toward its target, not from a fixed spot). */
  const entry = (side: Side, extra: number, near?: P): P => {
    const g = geo(), rg = g.region, H = rg.b - rg.t, W = rg.r - rg.l;
    const y = near ? clamp(near.y + rnd(-0.45, 0.45) * H, rg.t + 30, rg.b - 30) : rnd(rg.t + 40, rg.b - 40);
    const x = near ? clamp(near.x + rnd(-0.3, 0.3) * W, rg.l + 60, rg.r - 60) : rnd(rg.l + 60, rg.r - 60);
    if (side === "L") return { x: g.edgeL - extra, y };
    if (side === "R") return { x: g.edgeR + extra, y };
    return { x, y: Math.min(g.top, rg.t) - extra };
  };
  /**
   * Entry and exit edges for a visit to `c`: any feasible edge (left, right, top) can be used to enter, with the nearest slightly favoured and
   * the others still common; the exit is a different edge four times in five. Constrained randomness, never a fixed direction.
   */
  const pickSides = (c: P): { enter: Side; exit: Side } => {
    const rg = geo().region, d: Record<Side, number> = { L: c.x - rg.l, R: rg.r - c.x, T: c.y - rg.t };
    const order = (Object.keys(d) as Side[]).sort((x, y) => d[x] - d[y]), w = [0.38, 0.32, 0.30];
    let r = Math.random(), enter = order[2];
    for (let i = 0; i < 3; i++) { r -= w[i]; if (r <= 0) { enter = order[i]; break; } }
    const rest = order.filter(x => x !== enter);
    return { enter, exit: Math.random() < 0.2 ? enter : rest[Math.random() < 0.5 ? 0 : 1] };
  };
  /** The part of the board an object sits in (thirds x halves): used so successive thefts do not keep targeting the same region. */
  const zoneOf = (it: HeroItem) => { const rg = geo().region; return `${clamp(Math.floor(((it.cx - rg.l) / (rg.r - rg.l)) * 3), 0, 2)}${it.cy < (rg.t + rg.b) / 2 ? 0 : 1}`; };

  async function move(R: Run, actor: ActorHandle, from: P, to: P, ease: (t: number) => number, per?: (x: number, y: number, t: number) => void, dur?: number) {
    const g = geo(), dx = to.x - from.x, dy = to.y - from.y, len = Math.hypot(dx, dy) || 1;
    const bend = sgn() * Math.min(len * 0.16, 90), cx = (from.x + to.x) / 2 - (dy / len) * bend, cy = (from.y + to.y) / 2 + (dx / len) * bend;
    const d = dur ?? clamp(0.55 + (len * g.s) / 650, 0.75, 1.6);
    await tween(R, d, ease, t => {
      const u = 1 - t, x = u * u * from.x + 2 * u * t * cx + t * t * to.x, y = u * u * from.y + 2 * u * t * cy + t * t * to.y;
      actor.x.set(x * g.s); actor.y.set(y * g.s);
      per?.(x, y, t);
    });
  }
  const place = (actor: ActorHandle, p: P) => { const g = geo(); actor.x.set(p.x * g.s); actor.y.set(p.y * g.s); };

  /** The item follows the actor's hand. Its rotation continues from whatever it is at the moment it is taken; the carry sway is added on top. */
  const follower = (it: HeroItem) => {
    const c = ctl(it.id), g = geo(), gr = grip(it, g.s), rot0 = c ? c.rot.get() : 0;
    return (hx: number, hy: number, t = 0) => {
      if (!c) return;
      c.dx.set(hx * g.s + gr.x - it.cx * g.s); c.dy.set(hy * g.s + gr.y - it.cy * g.s);
      c.rot.set(rot0 + Math.sin(t * Math.PI * 3) * 3 * Math.sin(t * Math.PI));   // sway is zero at both ends: no jump when taken, none when put down
    };
  };

  /** Make an object's current offsets its new resting pose (no visual change): the base moves, the Layer reduces the offsets by the same amount. */
  const rebase = (id: string) => {
    const c = ctl(id), it = item(id), g = geo();
    if (!c || !it || c.isHeld() || S.carrying.has(id)) return;
    const x = c.dx.get(), y = c.dy.get(), r = c.rot.get();
    if (Math.abs(x) < 0.01 && Math.abs(y) < 0.01 && Math.abs(r) < 0.01) return;
    A.current.setItems(p => p.map(i => i.id === id ? { ...i, cx: i.cx + x / g.s, cy: i.cy + y / g.s, rot: i.rot + r, shift: { n: (i.shift?.n ?? 0) + 1, x, y, rot: r } } : i));
  };

  // ── building blocks ──
  const mkItem = (pl: Placed, start?: P): HeroItem => {
    let sum = 0; for (const ch of pl.asset.id) sum += ch.charCodeAt(0);
    return { id: `${pl.asset.id}-${++S.uid}`, assetId: pl.asset.id, cx: pl.cx, cy: pl.cy, w: pl.w, rot: pl.rot, idle: IDLES[sum % IDLES.length], start };
  };
  /** Change the item list: React state AND the director's own view, in the same synchronous step (the ref otherwise lags a commit, and a reservation would see ghosts). */
  const mutate = (f: (p: HeroItem[]) => HeroItem[]) => { A.current.itemsRef.current = f(A.current.itemsRef.current); A.current.setItems(f); };
  const removeItem = (id: string) => mutate(p => p.filter(i => i.id !== id));
  const presentIds = () => new Set(A.current.itemsRef.current.map(i => i.assetId));
  /** What a plan must not use: what is on the board, and anything that failed to load earlier this session. */
  const avoid = () => new Set([...presentIds(), ...S.badAssets]);
  // ── placement coordinator ──
  // Every autonomous placement goes through reserve(): the destination must pass the SAME validShape() the composition engine uses, against
  // (a) every object really on the board (at its live position, held / scattered / leaving ones included) and (b) every destination another
  // in-flight operation has already claimed. The check and the claim happen in one synchronous step, so two restockers can never claim the same
  // or overlapping spots. The claim is released when the object is down, when the operation fails, and wholesale on abort / resize / unmount.
  const dbgRes = () => { const st = A.current.stageRef.current; if (st && process.env.NODE_ENV !== "production") { st.dataset.heroRes = String(S.res.size); st.dataset.heroRejected = String(S.rejected); } };
  const reserve = (op: number, pl: Placed, planEnv?: Env): boolean => {
    if (S.res.has(op)) return true;
    const sh = shapeFor(pl), others: Shape[] = [...existing().map(e => shapeFor(e.p)), ...[...S.res.values()].map(r => r.shape)];
    const e = planEnv ?? env();        // the SAME world the plan was made in (live objects are still checked): a page that drifted since must not veto a plan the engine approved
    if (!validShape(sh, e, others)) {
      S.rejected++; dbgRes();
      if (process.env.NODE_ENV !== "production") {
        // why: out of bounds / on an exclusion (nothing to do with other objects), or which object / claim it overlaps
        const alone = validShape(sh, e, []);
        const hit = [...existing().map(x => ({ id: x.id, sh: shapeFor(x.p) })), ...[...S.res.entries()].map(([k, r]) => ({ id: "claim" + k, sh: r.shape }))].filter(o => silhouetteOverlap(sh, o.sh) > 0 || separation(sh.o, o.sh.o) < 0).map(o => o.id);
        console.warn("[hero] reserve rejected", pl.asset.id, alone ? "overlap with " + hit.join(",") : "bounds/exclusion/board", JSON.stringify({ c: [Math.round(sh.o.x), Math.round(sh.o.y)], soft: e.soft?.map(r => [Math.round(r.t), Math.round(r.b)]), hard: e.exclusions?.length, now: env().soft?.map(r => [Math.round(r.t), Math.round(r.b)]), scrollY: Math.round(scrollY), s: +e.s.toFixed(3) }));
      }
      return false;
    }
    S.res.set(op, { pl, shape: sh }); dbgRes();
    return true;
  };
  const release = (op: number) => { S.res.delete(op); dbgRes(); };

  // ── placement transactions ──
  const dbgTasks = () => {
    const st = A.current.stageRef.current; if (!st || process.env.NODE_ENV === "production") return;
    st.dataset.heroTasks = JSON.stringify([...S.tasks.values()].filter(t => t.state !== "committed" && t.state !== "failed").map(t => `${t.op}:${t.asset}:${t.state}${t.item ? ":" + t.item : ""}`));
    st.dataset.heroCommitted = String(S.committed); st.dataset.heroFailed = String(S.failed); st.dataset.heroFailLog = JSON.stringify(S.failLog.slice(-6));
  };
  const mark = (t: Task, state: TaskState, why?: string) => {
    if (t.state === "committed" || (t.state === "failed" && state !== "failed")) return;   // terminal states are final: no double commit, no resurrection
    if (t.state === "failed") return;
    if (state === "committed") { if (S.done.has(t.op)) return; S.done.add(t.op); S.committed++; }
    if (state === "failed") {
      t.why = why;
      if (why !== "interrupted" && why !== "cancelled" && why !== "aborted") { S.failed++; const line = `op${t.op} ${t.asset} (${t.actor}) at ${t.state}: ${why}`; S.failLog.push(line); if (process.env.NODE_ENV !== "production") console.warn("[hero] placement failed:", line); }   // cancellations are expected, not failures
    }
    t.state = state; S.tasks.set(t.op, t); dbgTasks();
  };
  /** Is the object really there? In state, controllable, rendered with a decoded image and a real size. null = yes, otherwise the reason it is not. */
  const verifyRendered = (id: string): string | null => {
    if (!item(id)) return "not-in-state";
    if (!ctl(id)) return "no-controller";
    const el = A.current.stageRef.current?.querySelector<HTMLElement>(`[data-item="${id}"]`);
    if (!el) return "not-in-dom";
    const img = el.querySelector("img");
    if (!img || !img.complete || img.naturalWidth <= 2) return "image-not-decoded";
    const r = el.getBoundingClientRect();
    return r.width < 2 || r.height < 2 ? "zero-size" : null;
  };
  /** Wait (bounded, in frames) until a freshly mounted object is renderable. Returns the failure reason, or null when it is ready. */
  const whenRendered = async (R: Run, id: string): Promise<string | null> => {
    let why = verifyRendered(id);
    for (let i = 0; i < 60 && why && !R.dead; i++) { await new Promise(r => requestAnimationFrame(() => r(null))); why = verifyRendered(id); }
    if (why || R.dead) return R.dead ? "cancelled" : why;
    // The board's own <img> (not the preloader's separate Image) must be DECODED, not just loaded: a decoded bitmap can be evicted between shakes, and
    // an evicted large asset paints blank until it is decoded again. Bounded, and a decode failure fails the task instead of hiding it.
    const img = A.current.stageRef.current?.querySelector<HTMLImageElement>(`[data-item="${id}"] img`);
    if (img?.decode) {
      const ok = await Promise.race([img.decode().then(() => true, () => false), new Promise<boolean>(res => setTimeout(() => res(false), 2500))]);
      if (!ok) return "image-decode-failed";
    }
    return R.dead ? "cancelled" : verifyRendered(id);
  };

  /** Gently move obstructing objects to the spots the planner chose for them (offset tween from where they are now, then rebase). */
  async function applyMoves(R: Run, moves: Move[]) {
    const g = geo();
    await Promise.all(moves.map(async m => {
      const c = ctl(m.id); if (!c || c.isHeld() || S.carrying.has(m.id)) return;
      const x0 = c.dx.get(), y0 = c.dy.get();
      await tween(R, rnd(0.55, 0.8), easeInOut, t => { c.dx.set(x0 + m.dx * g.s * t); c.dy.set(y0 + m.dy * g.s * t); }, m.id);
      if (!R.dead) rebase(m.id);
    }));
  }

  /**
   * Bring a planned object in, hand-carried from off the board, and set it down at its planned spot. Transactional: the object is mounted and
   * VERIFIED renderable before the restocker appears carrying it (an empty hand never animates), and verified again once it is down. On any failure
   * the half-made object is removed and the task is marked failed; the caller never announces a placement that did not happen.
   */
  async function carryIn(R: Run, actor: ActorHandle, pl: Placed, side: Side, task: Task): Promise<{ id: string; at: P } | undefined> {
    const g = geo(), asset = pl.asset, extra = pl.w * 0.8 + 80;
    const startHand = entry(side, extra, { x: pl.cx, y: pl.cy });
    const pw = pl.w * g.s, ph = (pw * asset.h) / asset.w, gr = { x: 0.16 * pw, y: 0.2 * ph };
    const base = mkItem(pl, { x: startHand.x * g.s + gr.x - pl.cx * g.s, y: startHand.y * g.s + gr.y - pl.cy * g.s });
    task.item = base.id;
    S.carrying.set(base.id, "in");
    mutate(p => [...p, base]);
    const fail = (why: string) => { mark(task, "failed", why); S.carrying.delete(base.id); if (!R.dead) removeItem(base.id); actor.show(false); return undefined; };
    const notReady = await whenRendered(R, base.id);
    if (notReady) return fail(notReady);
    const c = ctl(base.id); if (!c) return fail("no-controller");
    c.lock(true);
    mark(task, "picked-up");
    const drop = { x: pl.cx - gr.x / g.s, y: pl.cy - gr.y / g.s };
    actor.show(true); place(actor, startHand); actor.say(pickOne(actor.carry));
    const rot0 = c.rot.get();
    const follow = (hx: number, hy: number, t: number) => { c.dx.set(hx * g.s + gr.x - pl.cx * g.s); c.dy.set(hy * g.s + gr.y - pl.cy * g.s); c.rot.set(rot0 + Math.sin(t * Math.PI * 3) * 3 * Math.sin(t * Math.PI)); };
    mark(task, "in-transit");
    await move(R, actor, startHand, drop, easeInOut, (x, y, t) => follow(x, y, t));
    if (R.dead) return fail("cancelled");
    c.dx.set(0); c.dy.set(0); c.lock(false); S.carrying.delete(base.id);
    mark(task, "placed");
    await new Promise(r => requestAnimationFrame(() => r(null)));
    if (R.dead) return fail("cancelled");                              // a newer shake owns the board: this placement must not touch the object any more
    const bad = verifyRendered(base.id);
    if (bad) return fail("vanished-after-placement:" + bad);
    animate(c.lift, [1.05, 1], { duration: 0.28, ease: "easeOut" });
    animate(c.rot, 0, { type: "spring", stiffness: 240, damping: 9, mass: 0.8, velocity: sgn() * 40 });   // settles from its current rotation, with a little swing
    return { id: base.id, at: drop };
  }

  /** Walk an actor to an object, take hold, and leave the board with it; the object is removed once it is out of sight. */
  async function carryOut(R: Run, actor: ActorHandle, itemId: string, from: P | undefined, side: Side, inspect = 0, exitSide: Side = side, wander = false): Promise<boolean> {
    const it = item(itemId), c = ctl(itemId);
    if (!it || !c || c.isHeld()) return false;
    const g = geo(), gr = grip(it, g.s);
    // where the object actually is right now (base + current offset), so the grab starts exactly there
    const hold = { x: it.cx + c.dx.get() / g.s - gr.x / g.s, y: it.cy + c.dy.get() / g.s - gr.y / g.s };
    actor.show(true); actor.say(CLIPPY.approach(it.assetId));
    const start = from ?? entry(side, 60, { x: it.cx, y: it.cy });
    if (!from) place(actor, start);
    if (wander && !from) {
      // not a straight line: head for a waypoint off to one side, maybe stop and look around, then go for the object
      const dx = hold.x - start.x, dy = hold.y - start.y, len = Math.hypot(dx, dy) || 1, k = rnd(0.38, 0.6), off = rnd(-1, 1) * clamp(len * 0.22, 30, 110);
      const via = { x: start.x + dx * k - (dy / len) * off, y: start.y + dy * k + (dx / len) * off };
      await move(R, actor, start, via, easeInOut, undefined, rnd(0.5, 0.9));
      if (R.dead) return false;
      if (Math.random() < 0.55) { await sleep(R, rnd(200, 600)); if (R.dead) return false; }
      await move(R, actor, via, hold, easeInOut);
    } else await move(R, actor, start, hold, easeInOut);
    if (R.dead) return false;
    if (inspect) { await sleep(R, inspect); if (R.dead) return false; }
    if (c.isHeld() || !item(itemId)) return false;                       // the visitor got there first: back off
    c.lock(true); S.carrying.set(itemId, "out"); actor.say(CLIPPY.steal(it.assetId));
    animate(c.lift, 1.04, { duration: 0.18, ease: "easeOut" });
    const out = entry(exitSide, it.w * 0.8 + 90, { x: it.cx, y: it.cy }), follow = follower(it);
    await move(R, actor, hold, out, easeIn, (x, y, t) => follow(x, y, t));
    S.carrying.delete(itemId);
    if (R.dead) { c.lock(false); return false; }
    removeItem(itemId);
    return true;
  }

  const retreat = async (R: Run, actor: ActorHandle, from: P, side: Side) => {
    if (!R.dead) await move(R, actor, from, entry(side, 70), easeIn);
    actor.show(false);
  };

  /** The active restockers: each handle that exists, never more than RESTOCKERS.length. */
  const restockers = () => A.current.restockers.map(r => r.current).filter((r): r is ActorHandle => !!r);
  const hideRestockers = () => restockers().forEach(r => r.show(false));

  /**
   * The restocking team for ONE planned composition. `pieces` is the complete plan from the composition engine; every destination is reserved up
   * front (the whole plan is claimed before anyone starts walking), then up to `maxLanes` restockers carry the pieces in WAVES: each restocker gets
   * its own piece and destination, the restockers of a wave set off a beat apart, and the next wave starts only when the previous one is down.
   * Nothing is generated or re-planned here. A piece whose reservation fails (the visitor dragged something onto its spot) is skipped, never forced.
   */
  async function restockWaves(R: Run, pieces: Placed[], maxLanes: number, planEnv: Env) {
    const rs = restockers().slice(0, Math.max(1, maxLanes));
    if (!rs.length || !pieces.length) return;
    // every piece becomes a task; a piece that is not a valid, loaded manifest asset never gets a restocker at all
    const claimed: { pl: Placed; op: number; task: Task }[] = [];
    pieces.forEach((pl, i) => {
      const op = ++S.uid, task: Task = { op, asset: pl.asset?.id ?? "?", actor: "restocker" + ((i % rs.length) + 1), state: "planned" };
      S.tasks.set(op, task);
      if (!pl.asset || ASSET_BY_ID[pl.asset.id] !== pl.asset) return mark(task, "failed", "asset-not-in-manifest");
      if (!loaded.has(pl.asset.src)) return mark(task, "failed", "asset-not-preloaded");
      if (!reserve(op, pl, planEnv)) return mark(task, "failed", "destination-rejected");
      mark(task, "reserved"); claimed.push({ pl, op, task });
    });
    const n = rs.length;
    try {
      for (let w = 0; w < claimed.length && !R.dead; w += n) {
        const used = new Set<Side>();
        await Promise.all(claimed.slice(w, w + n).map(async ({ pl, op, task }, k) => {
          const actor = rs[k];
          task.actor = "restocker" + (k + 1);
          if (k) await sleep(R, k * rnd(300, 500));
          if (R.dead) return mark(task, "failed", "cancelled");
          let side = pickSides({ x: pl.cx, y: pl.cy }).enter;
          for (let t = 0; t < 4 && used.has(side) && n > 1; t++) side = pickSides({ x: pl.cx, y: pl.cy }).enter;
          used.add(side);
          let done: Awaited<ReturnType<typeof carryIn>>;
          try { done = await carryIn(R, actor, pl, side, task); } finally { used.delete(side); release(op); }
          if (!done || R.dead) return;                                        // carryIn already marked the task failed and cleaned up; a dead Run says nothing and moves nothing
          mark(task, "committed");                                            // only a verified, rendered object is a placement; only then does the restocker say so
          actor.say(pickOne(actor.placed)); await sleep(R, 250);
          await retreat(R, actor, done.at, side);
        }));
        if (w + n < claimed.length) await sleep(R, rnd(450, 800));
      }
    } finally { claimed.forEach(c => { release(c.op); if (c.task.state !== "committed" && c.task.state !== "failed") mark(c.task, "failed", "interrupted"); }); }
  }

  // ── events ──
  const settleBack = () => {
    A.current.ctls.current.forEach(c => {
      if (c.isHeld()) return;
      animate(c.dx, 0, { type: "spring", stiffness: 260, damping: 26 }); animate(c.dy, 0, { type: "spring", stiffness: 260, damping: 26 });
      animate(c.rot, 0, { duration: 0.35 }); animate(c.lift, 1, { duration: 0.2 });
    });
  };
  /** Preload every planned asset. A failure is recorded (and the asset is excluded from later plans); it is never silently dropped. */
  const loadedPlan = async (plan: Placed[]) => {
    const ok = await Promise.all(plan.map(x => preload(x.asset.src)));
    plan.forEach((x, i) => { if (!ok[i]) { S.badAssets.add(x.asset.id); S.failed++; const line = "asset " + x.asset.id + ": failed to load (" + x.asset.src + ")"; S.failLog.push(line); if (process.env.NODE_ENV !== "production") console.warn("[hero]", line); dbgTasks(); } });
    return plan.filter((_, i) => ok[i]);
  };

  async function ambient(R: Run) {
    const { clippy, itemsRef, counts } = A.current;
    const p = clippy.current;
    if (!p || !restockers().length) return;
    // Clippy only takes from a board that is still whole (the swap keeps the count), and only something visible on screen
    if (itemsRef.current.length < counts.base) return;
    const gs = geo(), stR = A.current.stageRef.current!.getBoundingClientRect();
    const onScreen = (i: HeroItem) => { const x = stR.left + i.cx * gs.s, y = stR.top + i.cy * gs.s; return x > 40 && x < innerWidth - 40 && y > 90 && y < innerHeight - 30; };
    const prey = itemsRef.current.filter(i => ASSET_BY_ID[i.assetId]?.ambient && !locked(i.id) && onScreen(i));
    if (!prey.length) return;
    // Plan the replacement BEFORE anything is stolen. The departing object's footprint is released, the free space is analysed and the best
    // complete arrangement is chosen (never the removed object's coordinates). Objects whose removal leaves no valid composition are skipped;
    // if none qualifies, nothing is stolen and the board stays as it is.
    const e = env();
    let target: HeroItem | undefined, plan: Plan | null = null;
    // Choose the victim with constrained randomness: weighted so recently stolen assets and regions are unlikely again, never an object on the
    // protected text, and never one whose removal would leave no valid composition.
    const recent = S.recentSteals, sh = (it: HeroItem) => shapeFor(placedOf(it));
    const keyed = prey.filter(i => shareIn(sh(i), e.exclusions) <= 0.02).map(i => {
      const w = (recent.some(x => x.asset === i.assetId) ? 0.15 : 1) * 0.4 ** recent.filter(x => x.zone === zoneOf(i)).length;
      return { i, k: Math.random() ** (1 / w) };
    }).sort((a, b) => b.k - a.k);
    for (const { i: cand } of keyed) {
      plan = planReplacement({ env: e, existing: existing(new Set([cand.id])), removed: footprint(placedOf(cand)), removedArea: visibleArea(placedOf(cand)), present: avoid(), maxCount: counts.max });
      if (plan && plan.placed.length) { target = cand; break; }
    }
    if (!target || !plan) return;
    plan = { ...plan, placed: plan.placed.slice(0, 1) };           // one object taken, one brought back: a quiet swap, not a refill
    seedTo(plan, "replace", e);
    remember(plan.placed.map(x => x.asset.id));
    // nothing is stolen unless its replacement is a real, loadable object (a bad asset is recorded and skipped; the next event plans without it)
    const ready0 = await loadedPlan(plan.placed);
    if (R.dead || ready0.length < plan.placed.length) return;
    const tp = { x: target.cx, y: target.cy }, v = pickSides(tp);
    if (process.env.NODE_ENV !== "production") { const st = A.current.stageRef.current; if (st) st.dataset.heroVisit = JSON.stringify({ enter: v.enter, exit: v.exit, target: target.assetId, zone: zoneOf(target) }); }   // dev aid
    S.recentSteals.push({ asset: target.assetId, zone: zoneOf(target) }); if (S.recentSteals.length > 3) S.recentSteals.shift();
    if (!go("stealing")) return;
    const took = await carryOut(R, p, target.id, undefined, v.enter, 480, v.exit, true);
    if (R.dead) return;
    p.show(false);
    if (!took) return;
    S.took = true;
    if (!go("replacing")) return;
    if (plan.moves.length) await applyMoves(R, plan.moves);       // make room first, gently
    await sleep(R, rnd(700, 2000));
    await restockWaves(R, [...ready0], 1, e);                           // one restocker brings the one replacement
  }

  async function scatterAndRestock(R: Run) {
    const { frame, shakeRef, counts } = A.current;
    if (!restockers().length) return;
    // C is decided FIRST, in full, by the one composition engine: a fresh arrangement that only has to respect what will stay (an object the visitor
    // is holding). If no valid arrangement exists the board is left exactly as it is.
    const stay = existing().filter(e => e.locked);
    const planEnv = env();                                              // one snapshot of the world: the plan AND every reservation use it
    // The next composition is decided FIRST, in full, by the one composition engine (synchronously, so the click reacts at once). If none exists the
    // board is left exactly as it is. Asset loading runs in parallel with the burst below and is checked before anything is restocked.
    let newPlan: Plan | null = planAdd({ env: planEnv, existing: stay, maxNew: Math.max(1, counts.max - stay.length), minNew: Math.max(1, counts.base - stay.length), present: avoid(), attempts: 20 });
    if (!newPlan || !newPlan.placed.length) return;
    const pre = loadedPlan(newPlan.placed);
    seedTo(newPlan, "shake", planEnv);
    remember(newPlan.placed.map(x => x.asset.id));
    if (!go("scattering")) return;
    // A. ONE direct burst: the board shakes and, in the same instant, every object leaves FROM WHERE IT IS RIGHT NOW (resting pose plus any drag or
    // animation offset, so a dragged or already-displaced object takes part too). No intermediate shuffle, no snap-back: each object flies outward from the
    // board centre along its own random direction (wide spread), with its own distance, spin, speed and a tiny start delay, and is gone off the stage.
    const sh = shakeRef.current;
    if (sh) { sh.removeAttribute("data-shake"); void sh.getBoundingClientRect(); sh.setAttribute("data-shake", "1"); const t = setTimeout(() => sh.removeAttribute("data-shake"), 600); S.timeouts.add(t); }
    const g = geo(), olds = A.current.itemsRef.current.filter(i => !locked(i.id));
    const cx0 = frame.w / 2, cy0 = frame.h / 2, reach = Math.max(frame.w, frame.h);
    await Promise.all(olds.map(async o => {
      const c = ctl(o.id); if (!c) return;
      await sleep(R, rnd(0, 160));
      if (R.dead || c.isHeld()) return;
      const x0 = c.dx.get(), y0 = c.dy.get(), r0 = c.rot.get();
      const vx = o.cx + x0 / g.s - cx0, vy = o.cy + y0 / g.s - cy0;
      const ang = (Math.hypot(vx, vy) < 1 ? rnd(0, Math.PI * 2) : Math.atan2(vy, vx)) + rnd(-0.95, 0.95);
      const dist = reach * rnd(0.75, 1.15), dr = sgn() * rnd(40, 170);
      await tween(R, rnd(0.6, 0.95), t => 1 - (1 - t) * (1 - t) * (1 - t), t => {
        if (c.isHeld()) return;                                          // grabbed mid-flight: the visitor wins, it stays
        c.dx.set(x0 + Math.cos(ang) * dist * g.s * t); c.dy.set(y0 + Math.sin(ang) * dist * g.s * t); c.rot.set(r0 + dr * t);
      }, o.id);
    }));
    if (R.dead) return;
    // B. clear: the old instances are removed (the asset library is untouched); nothing a visitor picked up in the meantime is removed
    const gone = new Set(olds.filter(o => !locked(o.id)).map(o => o.id));
    mutate(prev => prev.filter(i => !gone.has(i.id)));
    // C/D. the board is visibly empty for a beat; the planned assets must all be loadable (otherwise the composition is planned again without the
    // failed ones), then the restockers bring the composition in waves
    if (!go("restocking")) return;
    let ready = await pre;
    for (let attempt = 0; attempt < 3 && newPlan && ready.length < newPlan.placed.length && !R.dead; attempt++) {
      newPlan = planAdd({ env: planEnv, existing: stay, maxNew: Math.max(1, counts.max - stay.length), minNew: Math.max(1, counts.base - stay.length), present: avoid(), attempts: 20 });
      ready = newPlan?.placed.length ? await loadedPlan(newPlan.placed) : [];
    }
    if (R.dead || !ready.length) return;
    await sleep(R, 300);
    if (R.dead) return;
    await restockWaves(R, ready, 3, planEnv);
  }

  function instantRestock() {
    const plan = planFull({ env: env(), count: A.current.counts.base, maxCount: A.current.counts.max, present: presentIds() });
    if (!plan) return;
    seedTo(plan, "instant");
    remember(plan.placed.map(x => x.asset.id));
    A.current.setItems(() => plan.placed.map(pl => mkItem(pl)));
  }

  function abortAll() {
    const R = S.run; R.dead = true;
    S.live.forEach(h => h.stop()); S.live.clear(); S.byItem.clear();
    S.timeouts.forEach(clearTimeout); S.timeouts.clear();
    A.current.clippy.current?.show(false); hideRestockers();
    A.current.shakeRef.current?.removeAttribute("data-shake");
    // objects that were mid-event settle back to their resting poses; an object being carried out is simply gone
    S.carrying.forEach((kind, id) => { if (kind === "out") removeItem(id); else { const c = ctl(id); c?.lock(false); } });
    S.carrying.clear();
    S.res.clear(); dbgRes();                                       // every claimed destination is released (also on resize, which aborts the event)
    S.tasks.forEach(t => { if (t.state !== "committed" && t.state !== "failed") mark(t, "failed", "aborted"); }); S.tasks.clear(); dbgTasks();
    settleBack();
    S.phase = "idle"; S.lastEnd = performance.now(); phaseDbg();     // an abort is the one unconditional exit
  }

  /**
   * A shake takes the board over RIGHT NOW. Whatever was running (a theft, a replacement, a scatter, a restock) is invalidated: its Run is marked dead,
   * so every one of its pending steps ends at its next `R.dead` check without touching the board, its tweens and waits are stopped, its destination
   * claims and tasks are dropped, and Clippy / the restockers are sent away. Unlike abortAll nothing springs back to its old pose: every object
   * (including one that was being carried in or out, and one the visitor is dragging) stays exactly where it is and is scattered from there.
   */
  function interrupt() {
    S.run.dead = true;
    S.live.forEach(h => h.stop()); S.live.clear(); S.byItem.clear();
    S.timeouts.forEach(clearTimeout); S.timeouts.clear();
    A.current.clippy.current?.show(false); hideRestockers();
    A.current.shakeRef.current?.removeAttribute("data-shake");
    A.current.ctls.current.forEach(c => { if (c.isHeld()) c.release(); });     // a drag ends in place; the later pointer-up is ignored by the hook
    S.carrying.forEach((_, id) => { ctl(id)?.lock(false); });                    // carried objects are released where they are
    S.carrying.clear();
    S.res.clear(); dbgRes();
    S.tasks.forEach(t => { if (t.state !== "committed" && t.state !== "failed") mark(t, "failed", "interrupted"); }); S.tasks.clear(); dbgTasks();
    S.phase = "idle"; phaseDbg();
  }


  async function runEvent(kind: "ambient" | "shake") {
    if (kind === "ambient" && S.phase !== "idle") return;                   // a theft only ever starts from a calm board; a shake always starts (it interrupts first)
    const R: Run = { dead: false }; S.run = R; S.took = false;
    try { await (kind === "ambient" ? ambient(R) : scatterAndRestock(R)); }
    finally {
      if (S.run === R) {
        A.current.clippy.current?.show(false); hideRestockers(); S.res.clear(); dbgRes();
        // everything is down: spring to rest, then (and only then) the board is normal again and Clippy's scheduler may run
        if (!R.dead && S.phase !== "idle" && go("settling")) { settleBack(); await sleep(R, 900); }
        if (!R.dead && S.run === R) { go("idle"); S.lastEnd = performance.now(); }
      }
    }
    // a shake that found nothing valid to plan leaves the board untouched; objects the interrupt left displaced settle back to rest
    if (kind === "shake" && S.run === R && !R.dead && S.phase === "idle") settleBack();
  }

  const shake = () => {
    if (!A.current.motionOk) { instantRestock(); return; }
    // Every click is answered at once and nothing is ever queued: the newest shake invalidates whatever was running and owns the board.
    introDone = true;
    interrupt();
    void runEvent("shake");
  };

  /** Called by each object when the visitor picks it up or lets it go. */
  const itemHeld = (id: string, held: boolean) => {
    S.lastActive = performance.now();
    if (!held) {
      // dragging is over: back to a normal board shortly after the last object is released
      const t = setTimeout(() => { S.timeouts.delete(t); if (S.phase === "user-interacting" && !heldAny()) { go("idle"); S.lastEnd = performance.now(); } }, 700);
      S.timeouts.add(t);
      return;
    }
    S.byItem.get(id)?.forEach(h => h.stop());
    S.byItem.delete(id);
    if (S.phase === "idle") go("user-interacting");
  };

  // ── ambient scheduler + lifecycle ──
  useEffect(() => {
    if (!args.motionOk) return;
    const el = A.current.stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { S.inView = !!e && e.intersectionRatio >= 0.4; if (!S.inView && S.phase !== "idle") abortAll(); }, { threshold: [0, 0.4, 0.7] });
    io.observe(el);
    const act = (e: PointerEvent) => { const r = el.getBoundingClientRect(); if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) S.lastActive = performance.now(); };
    window.addEventListener("pointermove", act, { passive: true }); window.addEventListener("pointerdown", act, { passive: true });
    let alive = true;
    // ── Clippy's scheduler: ONE timer chain, and it only ever starts an event from a stable "idle" board ──
    //   intro  once per page session: ~2 s after the board is visible and ready, Clippy takes one object (retried until it really has)
    //   later  occasional: one theft every 16-28 s at most (uneven, never on a fixed beat) and never within MIN_GAP_MS of the last event; never while dragging, shaking, recovering, hidden, off-screen or with the pointer on the board; no backlog when resuming
    let readySince = 0, introAt = 0, introTries = 0;
    const boardReady = () => { const img = A.current.boardImgRef.current; return S.inView && !document.hidden && !!img && img.complete && img.naturalWidth > 0 && A.current.itemsRef.current.length > 0; };
    const arm = (ms: number) => {
      clearTimeout(S.timer);
      S.timer = setTimeout(async () => {
        if (!alive) return;
        const now = performance.now();
        const stable = S.phase === "idle" && !heldAny() && boardReady();
        if (!introDone) {
          if (!stable) { readySince = 0; return void arm(400); }
          if (!readySince) { readySince = now; introAt = rnd(...INTRO_AFTER_READY); }
          if (now - readySince < introAt) return void arm(250);
          await runEvent("ambient");
          if (S.took || ++introTries >= 3) introDone = true;                    // only a real theft counts; a few failed tries (nothing safe to take) end the intro too
          if (alive) arm(introDone ? rnd(16000, 26000) : 3000);
          return;
        }
        const calm = now - S.lastActive > 2500, quiet = now - S.lastEnd > MIN_GAP_MS;
        if (stable && calm && quiet) {
          await runEvent("ambient");
          if (alive) arm(rnd(16000, 28000));                                    // a long, uneven pause; stillness alone never triggers anything
        } else if (alive) arm(rnd(4000, 7000));
      }, ms);
    };
    // back from a hidden tab: no catch-up; a fresh, short quiet period first
    const vis = () => { if (document.hidden) { if (S.phase !== "idle") abortAll(); } else if (alive) arm(rnd(6000, 10000)); };
    document.addEventListener("visibilitychange", vis);
    let lastW = el.getBoundingClientRect().width;
    const ro = new ResizeObserver(([e]) => { const w = e?.contentRect.width ?? lastW; if (Math.abs(w - lastW) > 2) { lastW = w; if (S.phase !== "idle") abortAll(); } }); ro.observe(el);   // only a real width change invalidates the choreography
    S.lastEnd = performance.now();
    arm(400);
    return () => {
      alive = false; clearTimeout(S.timer);
      io.disconnect(); ro.disconnect();
      window.removeEventListener("pointermove", act); window.removeEventListener("pointerdown", act);
      document.removeEventListener("visibilitychange", vis);
      S.run.dead = true; S.live.forEach(h => h.stop()); S.live.clear(); S.byItem.clear(); S.timeouts.forEach(clearTimeout); S.timeouts.clear(); S.res.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [args.motionOk]);

  return { shake, itemHeld };
}
