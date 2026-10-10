// The Courier's director (DOM only, no React state, no dependencies). ONE delivery runs at a time; headings queue and are served in order.
//
// ONE continuous performance, one owner per stage:
//   enter   the Courier comes in from OUTSIDE the viewport (left / right / above / below), already carrying a copy of the heading's own icon, which is attached to it the whole way
//   push    the icon is pushed up/in at its slot; the slot (a real inline box in the heading) widens with a damped spring, so the words after it are shoved aside and settle
//   release the slot's own icon takes over at the exact spot the carried copy sits (same frame, same size): the carried copy is hidden, so there is never a second icon
//   stay    the Courier steps out from under the heading and says its line for a beat
//   exit    it leaves through a viewport edge, pill attached
// Each delivery draws a small PERSONALITY from one seed (direct / wandering / cheeky; a drift or S-curve, a hesitation, an overshoot, a nudge / sidestep / quick push / pause / recoil,
// and one of several exits). The profile is fixed for the delivery (root.dataset.seed / .profile), only ever changes the route and the pacing, and always ends at the exact slot.
// There are NO opacity fades: the character is visible only while it is on its way, and it is moved by position alone.
// The Courier's path is one Web Animation; the slot's widening is another (its end IS the release); both are cancelled together in cancelAll/end, and every callback checks that its
// delivery is still the current one, so a stale callback can never finish an old delivery.
//
// REVERT: set COURIER_ENABLED to false (headings render exactly as before and no Courier is drawn), or remove <Courier /> from app/page.tsx.
import { setPill } from "./Cursor";
import { COURIER, pickOne } from "@/lib/home/cursorCopy";

export const COURIER_ENABLED = true;

/** Headings that have had their delivery this page session (a reload resets it; scrolling back never replays it). */
export const delivered = new Set<string>();

export type Rig = { layer: HTMLElement; root: HTMLElement; body: HTMLElement; cargo: HTMLElement };
export type Delivery = {
  host: HTMLElement;              // the h2
  wrap: HTMLElement;              // the heading block (eyebrow + h2): visibility and the reveal transform are read from it
  eyebrow: HTMLElement | null;    // the metadata label: the Courier's path never crosses it
  slotEl?: HTMLElement;           // the icon slot to fill (default: the first .hm-sh-slot inside host); the Hero has two slots in one heading
  padBottom?: number;             // space below the heading's text inside host (default 20, a section heading's padding-bottom); the Courier stays just below host's text
  alive: () => boolean;
  open: () => void;               // slot: collapsed -> "open" (margin released; icon still hidden)
  done: () => void;               // slot's own icon takes over; layout is final; marked delivered
};
type Pt = { x: number; y: number };
type Dir = "left" | "right" | "above" | "below";
type Running = { d: Delivery; anims: Animation[]; timers: ReturnType<typeof setTimeout>[]; io: IntersectionObserver };

let rig: Rig | null = null, cur: Running | null = null, busy = false, lastPhrase = "";
let bag: Dir[] = [];                                      // a shuffled bag of directions: genuinely random order, but all four get used before any repeats
const queue: Delivery[] = [];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const shuffle = <T,>(a: T[]) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function mulberry32(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const lerp = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const bez = (a: Pt, c: Pt, b: Pt, t: number): Pt => lerp(lerp(a, c, t), lerp(c, b, t), t);
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

// How fast the page is being scrolled (px/ms): a delivery is not started while the visitor is flying past, and one in flight is dropped when its heading leaves the screen.
let sy = 0, st = 0, vel = 0;
const onScroll = () => { const n = performance.now(), y = scrollY, v = Math.abs(y - sy) / Math.max(4, n - st); vel = vel * 0.6 + v * 0.4; sy = y; st = n; };   // smoothed, so one coalesced event is not mistaken for a fling

export function registerCourier(r: Rig | null) {
  rig = r;
  if (r) { sy = scrollY; st = performance.now(); window.addEventListener("scroll", onScroll, { passive: true }); pump(); }
  else { window.removeEventListener("scroll", onScroll); cancelAll(); }
}

export function deliver(d: Delivery) { queue.push(d); pump(); }

/** Complete a delivery without the show: the slot just opens (a short ease if the heading is on screen, so the text never jumps), then the icon is the heading's own. */
function instant(d: Delivery) {
  if (!d.alive()) return;
  const slot = d.slotEl ?? d.host.querySelector<HTMLElement>(".hm-sh-slot"), r = d.wrap.getBoundingClientRect();
  d.open();
  if (!slot || !(r.bottom > 0 && r.top < innerHeight)) { d.done(); return; }
  const w = parseFloat(getComputedStyle(slot).width) || 0;
  const a = slot.animate([{ width: "0px", margin: "0 -3px" }, { width: `${w}px`, margin: "0px" }], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
  a.onfinish = () => d.done(); a.oncancel = () => d.done();
}

function pump() {
  if (busy) return;
  const d = queue.shift();
  if (!d) return;
  if (!d.alive()) { pump(); return; }
  busy = true;
  try { run(d); } catch (e) { console.error("[courier] delivery failed; the heading just opens", e); busy = false; cur = null; instant(d); pump(); }
}

function hideCourier() {
  if (!rig) return;
  rig.root.style.visibility = "hidden"; rig.root.removeAttribute("data-say"); rig.root.removeAttribute("data-carry"); rig.cargo.replaceChildren();
}

export function cancelAll() {
  const c = cur; cur = null; busy = false;
  if (c) { c.timers.forEach(clearTimeout); c.io.disconnect(); c.anims.forEach(a => { a.onfinish = null; a.oncancel = null; try { a.cancel(); } catch { /* done */ } }); hideCourier(); c.d.open(); c.d.done(); }
  queue.splice(0).forEach(instant);
}

function run(d: Delivery) {
  if (!rig || !d.wrap.isConnected) { busy = false; instant(d); pump(); return; }
  // Stale: scrolled away before its turn, or the visitor is flying past. Complete quietly rather than play late.
  const wr = d.wrap.getBoundingClientRect();
  const flying = vel > 3 && performance.now() - st < 200;                              // a fling (3000px/s+), not ordinary scrolling
  const skip = flying ? "flying" : wr.bottom < 56 ? "above" : wr.top > innerHeight * 0.94 ? "below" : "";
  if (skip) { rig.root.dataset.skip = skip; busy = false; instant(d); pump(); return; }

  const { layer, root, body, cargo } = rig;
  const slot = d.slotEl ?? d.host.querySelector<HTMLElement>(".hm-sh-slot"), icon = slot?.querySelector<HTMLElement>(".hm-sh-icon, .hm-icon");
  if (!slot || !icon) { root.dataset.skip = "no-slot"; busy = false; instant(d); pump(); return; }

  const mobile = innerWidth < 768, k = mobile ? 0.8 : 1, L = layer.getBoundingClientRect();

  // ── this delivery's personality: bounded, weighted draws from ONE seed, then fixed ──
  const seed = (Math.random() * 4294967296) >>> 0, R = mulberry32(seed);
  const rnd = (a: number, b: number) => a + R() * (b - a), chance = (pr: number) => R() < pr;
  type Push = "none" | "nudge" | "sidestep" | "quick";
  const isPush = (m: string) => m === "nudge" || m === "sidestep" || m === "quick";
  const roll = R(), style = roll < 0.45 ? "direct" : roll < 0.75 ? "wander" : "cheeky";               // most are plain; some wander; a few are cheeky
  const cr = R(), count = style === "direct" ? (cr < 0.3 ? 1 : 0) : style === "wander" ? (cr < 0.55 ? 1 : 0) : (cr < 0.45 ? 2 : 1);   // how many bits of mischief at the delivery
  const pool: [string, number][] = [["nudge", 0.25], ["sidestep", 0.2], ["quick", 0.2], ["pause", 0.2], ["recoil", 0.15]], picked: string[] = [];
  for (let n = 0; n < count; n++) {
    const avail = pool.filter(([m]) => !picked.includes(m) && !(isPush(m) && picked.some(isPush)));      // never two pushes
    let r = R() * avail.reduce((a, [, w]) => a + w, 0);
    for (const [m, w] of avail) if ((r -= w) <= 0) { picked.push(m); break; }
  }
  const er = R(), er2 = R();
  const prof = {
    style, speed: rnd(0.92, 1.1), drift: style === "direct" ? 0 : rnd(8, style === "cheeky" ? 22 : 16) * k, sCurve: style !== "direct" && chance(0.5), dsign: chance(0.5) ? 1 : -1,
    hesitate: !picked.some(isPush) && chance(style === "direct" ? 0.12 : style === "wander" ? 0.4 : 0.5), hesMs: rnd(90, 170),
    overshoot: chance(style === "direct" ? 0.3 : 0.55) ? rnd(5, 11) * k : 0,
    push: (picked.find(isPush) ?? "none") as Push, pause: picked.includes("pause"), recoil: picked.includes("recoil"),
    ease: (er < 0.5 ? "sine" : er < 0.8 ? "out" : "late") as "sine" | "out" | "late",
    exit: (er2 < 0.35 ? "direct" : er2 < 0.55 ? "dart" : er2 < 0.75 ? "curve" : er2 < 0.9 ? "linger" : "sidestep") as "direct" | "dart" | "curve" | "linger" | "sidestep",
    exitSpeed: rnd(0.9, 1.15), exitPow: rnd(2.6, 3.2),
  };
  const vx0 = -L.left, vy0 = -L.top, vx1 = vx0 + innerWidth, vy1 = vy0 + innerHeight;          // the viewport, in layer coordinates
  const fs = parseFloat(getComputedStyle(d.host).fontSize) || 40, iconW = fs * 1.2, slotW = iconW - 3;
  // The heading may still be easing in (translateY): aim at where it will REST.
  const tyNow = new DOMMatrix(getComputedStyle(d.wrap).transform).m42 || 0;
  const sr = slot.getBoundingClientRect(), hr = d.host.getBoundingClientRect();
  // The collapsed slot's left edge sits 3px before where it will be once open (margin -3 -> 0), and it will be 1.2em - 3px wide.
  const T: Pt = { x: sr.left + 3 + slotW / 2 - L.left, y: sr.top + sr.height / 2 - tyNow - L.top };   // the slot's final centre
  const textBottom = hr.bottom - tyNow - (d.padBottom ?? 20) - L.top;                                    // the heading's text ends padBottom px above its bottom edge
  // the label is a full-width block, but only its TEXT must stay clear: measure the text's own extent
  let eb: DOMRect | undefined = d.eyebrow?.getBoundingClientRect();
  if (d.eyebrow) { const rg = document.createRange(); rg.selectNodeContents(d.eyebrow); const t = rg.getBoundingClientRect(); if (t.width > 0) eb = t; }
  const ebRect = eb ? { l: eb.left - L.left - 2, r: eb.right - L.left + 2, t: eb.top - tyNow - L.top - 2, b: eb.bottom - tyNow - L.top + 2 } : null;

  // The icon is held up and to the right of the cursor tip, its lower-left corner just over the glyph: a small fixed carrying position, so the cursor visibly has it in hand.
  const cx = iconW * 0.5 + 6, cy = -(iconW * 0.5 - 8);                                  // the carried icon's centre, relative to the tip
  const tipT: Pt = { x: T.x - cx, y: T.y - cy };                                         // where the tip is when the icon sits exactly in the slot
  const half = iconW * 0.5, span = cx + iconW * 0.5 + 8;

  const hitsLabel = (pts: Pt[]) => !!ebRect && pts.some(p => { const x = p.x + cx, y = p.y + cy; return x > ebRect.l - half && x < ebRect.r + half && y > ebRect.t - half && y < ebRect.b + half; });

  // ── entry paths: each starts OUTSIDE the viewport edge it names and ends at A, a short run-up below / beside the slot; then the push goes A -> tipT ──
  type Path = { S: Pt; C: Pt; A: Pt };
  const build = (dir: Dir): Path | null => {
    for (let n = 0; n < 4; n++) {
      const sgn = n % 2 ? 1 : -1;
      let S: Pt, C: Pt, A: Pt;
      if (dir === "left")       { A = { x: tipT.x - 30 * k, y: tipT.y + 52 * k }; S = { x: vx0 - span - 10, y: A.y + rnd(-6, 18) }; C = { x: S.x + (A.x - S.x) * 0.55, y: A.y + sgn * rnd(12, 26) }; }
      else if (dir === "right") { A = { x: tipT.x + 30 * k, y: tipT.y + 52 * k }; S = { x: vx1 + 14, y: A.y + rnd(-6, 18) }; C = { x: S.x + (A.x - S.x) * 0.55, y: A.y + sgn * rnd(12, 26) }; }
      else if (dir === "below") { A = { x: tipT.x, y: tipT.y + 56 * k }; S = { x: A.x + sgn * rnd(40, 110), y: vy1 + 52 }; C = { x: A.x + sgn * rnd(24, 60), y: (S.y + A.y) / 2 }; }
      else {
        A = { x: tipT.x + rnd(12, 26), y: tipT.y - 56 * k }; S = { x: A.x + rnd(60, 150), y: vy0 - 22 }; C = { x: A.x + rnd(20, 60), y: (S.y + A.y) / 2 };
        if (A.y + cy - iconW * 0.5 < vy0 + 64) return null;                           // would end up under the navbar
      }
      const pts: Pt[] = []; for (let i = 0; i <= 14; i++) pts.push(bez(S, C, A, i / 14)); for (let i = 1; i <= 4; i++) pts.push(lerp(A, tipT, i / 6));            // the last stretch of the push is the insertion itself: it ends right beside the heading by design
      if (!hitsLabel(pts)) return { S, C, A };
    }
    return null;
  };
  const options = new Map<Dir, Path>(); (["left", "right", "above", "below"] as Dir[]).forEach(dr => { const p = build(dr); if (p) options.set(dr, p); });
  if (!options.size) { root.dataset.skip = "no-path"; busy = false; instant(d); pump(); return; }
  if (!bag.some(dr => options.has(dr))) bag = shuffle(["left", "right", "above", "below"] as Dir[]);     // refill when nothing valid is left in the bag
  const dir = bag.find(dr => options.has(dr))!; bag.splice(bag.indexOf(dir), 1);
  const { S, C, A } = options.get(dir)!;

  // ── the carried icon: a copy of the heading's own icon, attached to the tip by the fixed offset above ──
  const clone = icon.cloneNode(true) as HTMLElement;
  if (icon.classList.contains("hm-sh-icon")) { clone.className = "hm-sh-icon"; clone.removeAttribute("style"); }   // (the Hero's .hm-icon clone keeps its own classes; its idle tilt is switched off in CSS)
  cargo.replaceChildren(clone); cargo.style.fontSize = `${fs}px`; cargo.style.left = `${cx}px`; cargo.style.top = `${cy}px`;

  // ── the stay: just BELOW the heading text, so the pill never covers a word ──
  const P: Pt = { x: tipT.x + 10, y: textBottom + 4 };
  let phrase = pickOne(COURIER.delivered); if (phrase === lastPhrase) phrase = pickOne(COURIER.delivered); lastPhrase = phrase;
  setPill(body, phrase, true);
  const estW = phrase.length * 6.6 + 18;
  body.toggleAttribute("data-flip-x", P.x + 13 + estW + 8 > vx1);
  const exits: Pt[] = [{ x: vx1 + 24, y: P.y + rnd(0, 36) }, { x: vx0 - estW - 44, y: P.y + rnd(0, 36) }, { x: P.x + rnd(-50, 50), y: vy1 + 40 }];
  const E = exits[Math.floor(R() * exits.length)];      // independent of the entry; always along the line below the heading (or straight down), never back over it

  // ── timeline (ms), built from this delivery's personality ──
  // Everything below is a smooth path through a few waypoints sampled every ~28ms (linear between samples), so it is continuous and jitter-free; it always ends at tipT exactly.
  const ease = (u: number) => (1 - Math.cos(Math.PI * u)) / 2;                       // sine in-out
  const easeOut = (u: number) => 1 - (1 - u) * (1 - u);
  const easeOut3 = (u: number) => 1 - Math.pow(1 - u, 3);
  const easeIn3 = (u: number) => u * u * u;
  const easeCubic = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  const norm = (v: Pt): Pt => { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; };
  const fd = norm({ x: tipT.x - A.x, y: tipT.y - A.y });                            // the direction of the final approach
  const pushMod = prof.push !== "none";

  // the approach path: the label-safe base curve (S -> C -> A) plus a lateral drift that is zero at both ends (a drift, or an S-curve), so A and the destination stay exact
  const baseN = 60, approachPts: Pt[] = [];
  const nAt = (t: number): Pt => { const a = bez(S, C, A, Math.max(0, t - 0.02)), b = bez(S, C, A, Math.min(1, t + 0.02)); return norm({ x: -(b.y - a.y), y: b.x - a.x }); };
  const nMid = nAt(0.5), dsign = Math.abs(nMid.y) > 0.3 ? (nMid.y > 0 ? 1 : -1) : prof.dsign;       // a drift never bends toward the label above the heading
  for (let i = 0; i <= baseN; i++) {
    const t = i / baseN, p = bez(S, C, A, t), n = nAt(t), off = prof.drift * dsign * (prof.sCurve ? Math.sin(2 * Math.PI * t) : Math.sin(Math.PI * t));
    approachPts.push({ x: p.x + n.x * off, y: p.y + n.y * off });
  }
  const pathPts = pushMod ? approachPts : approachPts.concat(Array.from({ length: 8 }, (_, i) => lerp(A, tipT, (i + 1) / 8)));    // no push variant: A -> tipT is part of one continuous run
  const cum = [0]; for (let i = 1; i < pathPts.length; i++) cum.push(cum[i - 1] + dist(pathPts[i - 1], pathPts[i]));
  const Ltot = cum[cum.length - 1] || 1;
  const atS = (s: number): Pt => { if (s <= 0) return pathPts[0]; if (s >= Ltot) return pathPts[pathPts.length - 1]; let i = 1; while (cum[i] < s) i++; return lerp(pathPts[i - 1], pathPts[i], (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)); };
  const sA = pushMod ? 1 : cum[baseN] / Ltot;                                         // the share of the run at which it reaches A

  const lenBase = cum[baseN];
  const D = Math.round((clamp(560 + lenBase * 0.55, 780, 1150) * prof.speed + (pushMod ? 0 : 380)) * k * (prof.style === "direct" ? 1 : 0.94));
  const hes = prof.hesitate ? Math.round(prof.hesMs * k) : 0, sH = clamp(sA - rnd(0.05, 0.13), 0.4, 0.9);
  const run1 = (u: number) => prof.ease === "out" ? easeOut(u) * 0.35 + ease(u) * 0.65 : prof.ease === "late" ? easeCubic(u) : ease(u);
  const sAt = (t: number) => {                                                         // the share of the run covered by time t: eased, with an optional near-stop ("hesitation") close to the heading
    if (!hes) return run1(clamp(t / D, 0, 1));
    const T1 = (D - hes) * 0.62, T2 = D - T1 - hes;
    if (t < T1) return sH * easeOut(clamp(t / T1, 0, 1));
    if (t < T1 + hes) return sH + 0.012 * ((t - T1) / hes);                            // a slow creep, not a freeze
    return Math.min(1, sH + 0.012 + (1 - sH - 0.012) * ease(clamp((t - T1 - hes) / T2, 0, 1)));
  };
  const kfs: { t: number; p: Pt }[] = []; let tc = 0, cursor = pathPts[0];
  const put = (t: number, p: Pt) => { tc = Math.max(t, kfs.length ? kfs[kfs.length - 1].t + 0.5 : 0); kfs.push({ t: tc, p }); cursor = p; };
  const seg = (to: Pt, ms: number, fn: (u: number) => number, n = Math.max(3, Math.round(ms / 28))) => { const from = cursor, t0 = tc; for (let i = 1; i <= n; i++) put(t0 + (ms * i) / n, lerp(from, to, fn(i / n))); };
  let tA = D;
  const NS = Math.max(24, Math.round(D / 28));
  for (let i = 0; i <= NS; i++) { const t = (D * i) / NS, s = sAt(t); if (tA === D && s >= sA - 1e-6 && !pushMod) tA = t; put(t, atS(Math.min(1, s) * Ltot)); }
  if (!pushMod) kfs[kfs.length - 1].p = tipT;                                          // exact destination

  // the push (only when this delivery has a mischievous one): A -> tipT in a few deliberate moves
  if (prof.push === "nudge") { const N1 = lerp(A, tipT, 0.7), N2 = { x: N1.x - fd.x * 10 * k, y: N1.y - fd.y * 10 * k }; seg(N1, 120 * k, easeOut3); seg(N2, 100 * k, ease); seg(tipT, 190 * k, ease); }
  else if (prof.push === "sidestep") { const nn = { x: -fd.y, y: fd.x }, A2 = { x: A.x + nn.x * 12 * k * prof.dsign, y: A.y + nn.y * 12 * k * prof.dsign }; seg(A2, 110 * k, ease); seg(tipT, 300 * k, ease); }
  else if (prof.push === "quick") seg(tipT, 230 * k, easeIn3);
  const over = prof.overshoot;                                                         // a small, damped overshoot past the slot, then back
  if (over) { seg({ x: tipT.x + fd.x * over, y: tipT.y + fd.y * over }, 110 * k, easeOut3); seg(tipT, 140 * k, ease); }
  const arrived = tc;
  const slotMs = Math.round(620 * k), slotStart = (pushMod ? D : tA) + 40;
  const hand = Math.round(Math.max(slotStart + slotMs, arrived + (prof.pause ? 130 : 60) * k));       // the release: the slot's spring has finished, the icon has arrived (and, sometimes, a beat's pause)
  put(hand, tipT);
  if (prof.recoil) seg({ x: tipT.x - fd.x * 8 * k, y: tipT.y - fd.y * 8 * k }, 70 * k, easeOut3);   // a tiny recoil once the icon is down
  const goMs = Math.round(210 * k);
  seg(P, goMs, ease);                                                                  // step out from under the heading
  if (prof.exit === "sidestep") seg({ x: P.x + prof.dsign * 16, y: P.y }, 130 * k, ease);
  const room = Math.max(0, 3050 * k - (tc + 850 * k)), stayMs = Math.round(330 * k + (prof.exit === "linger" ? Math.min(rnd(160, 240) * k, room) : 0));   // a lingering exit never pushes the whole delivery past ~3s
  const exitFrom = cursor;
  put(tc + stayMs, cursor);                                                            // the beat: pill up, readable
  const exitStart = tc;
  const nx = norm({ x: -(E.y - exitFrom.y), y: E.x - exitFrom.x }), cside = nx.y > 0 ? 1 : -1;
  const EC2: Pt = prof.exit === "curve" ? { x: (exitFrom.x + E.x) / 2 + nx.x * cside * rnd(40, 70), y: Math.max(exitFrom.y, (exitFrom.y + E.y) / 2) + nx.y * cside * rnd(40, 70) } : { x: (exitFrom.x + E.x) / 2, y: Math.max(exitFrom.y, E.y) + rnd(8, 22) };
  const exitMs = Math.round(clamp(300 + dist(exitFrom, E) * 0.4, 400, 600) * k * (prof.exit === "dart" ? 0.75 : prof.exit === "curve" ? 1.05 : prof.exitSpeed));
  const exitEase = prof.exit === "dart" ? 2.4 : prof.exitPow;
  for (let i = 1; i <= 14; i++) { const u = i / 14; put(exitStart + exitMs * u, bez(exitFrom, EC2, E, Math.pow(u, exitEase))); }   // out through the edge, accelerating
  const total = Math.round(tc);
  const tr = (p: Pt) => `translate(${Math.round(p.x * 2) / 2}px, ${Math.round(p.y * 2) / 2}px)`;
  const keyframes: Keyframe[] = kfs.map(f => ({ transform: tr(f.p), offset: Math.min(1, f.t / total), easing: "linear" }));
  keyframes[0].offset = 0; keyframes[keyframes.length - 1].offset = 1;
  root.dataset.seed = String(seed); root.dataset.profile = `${prof.style}/${prof.push}/${prof.exit}${prof.hesitate ? "/hes" : ""}${prof.overshoot ? "/over" : ""}${prof.pause ? "/pause" : ""}${prof.recoil ? "/recoil" : ""}`;

  // ── start: visible only while it is in transit; nothing here fades ──
  root.removeAttribute("data-say"); root.setAttribute("data-carry", ""); root.dataset.dir = dir; root.style.visibility = "visible";
  const main = root.animate(keyframes, { duration: total, fill: "both" });
  const glyph = root.querySelector<HTMLElement>(".hm-cur-glyph"), lean = (S.x < tipT.x ? 1 : -1) * (dir === "above" || dir === "below" ? 6 : 9);
  const tilt = glyph ? glyph.animate([{ rotate: `${lean}deg`, offset: 0 }, { rotate: "0deg", offset: Math.min(0.95, arrived / total) }, { rotate: "0deg", offset: Math.min(0.97, exitStart / total) }, { rotate: `${E.x < P.x ? -8 : 8}deg`, offset: 1 }], { duration: total, fill: "both", easing: "ease-in-out" }) : null;

  const io = new IntersectionObserver(([e]) => { if (e && !e.isIntersecting) end(true); }, { threshold: 0 });   // the heading left the screen mid-delivery: drop the show, keep the icon
  const run_: Running = { d, anims: tilt ? [main, tilt] : [main], timers: [], io }; cur = run_; io.observe(d.wrap);
  const later = (fn: () => void, ms: number) => { run_.timers.push(setTimeout(() => { if (cur === run_) fn(); }, ms)); };

  // The slot: widens from nothing with a damped spring (a small overshoot, then back); the words after it are pushed along by REAL layout. Its end is the release.
  later(() => {
    d.open();
    const sa = slot.animate([
      { width: "0px", margin: "0 -3px", offset: 0, easing: "cubic-bezier(.3,.6,.4,1)" },
      { width: `${slotW * 1.12}px`, margin: "0px", offset: 0.5, easing: "ease-in-out" },
      { width: `${slotW * 0.97}px`, margin: "0px", offset: 0.78, easing: "ease-in-out" },
      { width: `${slotW}px`, margin: "0px", offset: 1 },
    ], { duration: slotMs, fill: "none" });
    run_.anims.push(sa);
    sa.onfinish = () => { if (cur !== run_) return; root.removeAttribute("data-carry"); cargo.replaceChildren(); d.done(); };   // same task: the carried copy goes, the slot's own icon shows
  }, slotStart);
  later(() => root.setAttribute("data-say", ""), hand + goMs * 0.7);

  function end(abort = false) {
    if (cur !== run_) return;
    run_.timers.forEach(clearTimeout); io.disconnect(); cur = null; busy = false;
    run_.anims.forEach(a => { a.onfinish = null; a.oncancel = null; try { a.cancel(); } catch { /* done */ } });
    hideCourier();
    d.open(); d.done();                                                                                // idempotent: if the release already happened this changes nothing
    void abort;
    pump();
  }
  main.onfinish = () => end();
}
