"use client";
// Layered Hero artwork for the home page: a stable board plus independent transparent objects.
// Two compositions reproduce the two flattened images they replace (positions/rotations/scales were
// measured by matching each asset against the flattened art, then stored as % of the stage):
//   desktop: 2160x800 frame (hero-top.png), mobile: 852x480 frame (hero-top-mobile.png).
// Per object, from outside in:  .hm-hs-obj (placement) > .hm-hs-idle (CSS stop-motion, 1-2px / ~1.8deg) >
//   .hm-hs-hover (pick-up hover) > .hm-hs-drag (press-and-hold drag, springs home) > <img>.
// There is NO pointer parallax: objects move when idle-animating, touched, dragged, or when the director (useHeroDirector) acts: Clippy steals an
// object and the Restocker brings another; clicking the board shakes it, scatters the objects and restocks. The initial composition is always the approved one.
import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTactile, useInteractive, opaqueAt } from "./useTactile";
import { ASSET_BY_ID } from "./heroObjects";
import { useHeroDirector, type HeroItem, type ItemCtl } from "./useHeroDirector";
import { Actor, type ActorHandle } from "./HeroActors";
import { CLIPPY, RESTOCKERS } from "@/lib/home/cursorCopy";

const BASE = "/hero%20section%20image/";
// 1x1 transparent gif: the <picture> of the layout that isn't shown resolves to this so its assets are never fetched.
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

type Obj = { key: string; src: string; aw: number; ah: number; cx: number; cy: number; s: number; rot: number };
type Layout = { w: number; h: number; board: { cx: number; cy: number; w: number }; objects: Obj[]; hideWhen: string };

// cx/cy = asset centre in stage px, s = render scale of the asset, rot = degrees clockwise.
const LAYOUTS: Record<"desktop" | "mobile", Layout> = {
  desktop: {
    w: 2160, h: 800, hideWhen: "(max-width: 767px)",
    board: { cx: 1080, cy: 400, w: 2160 },
    objects: [
      { key: "glasses",   src: "glasses.png",   aw: 605, ah: 200, cx: 488,    cy: 562.5, s: 1.67, rot: -17 },
      { key: "flame",     src: "flame.png",     aw: 179, ah: 252, cx: 1195,   cy: 577.5, s: 1.67, rot: -1.5 },
      { key: "earphones", src: "earphones.png", aw: 456, ah: 526, cx: 1776.8, cy: 305.2, s: 1.67, rot: 0 },
      { key: "ok",        src: "ok.png",        aw: 147, ah: 81,  cx: 280.3,  cy: 374.2, s: 1.67, rot: 13.85 },
    ],
  },
  // MOBILE_HERO: taller frame (852x720) with its own board scale and object poses (the board's slanted lower edge runs ~y 625 left to ~y 716 right of the 720 frame, objects hang over it).
  // Revert = restore the ORIGINAL mobile entry: w 852, h 480, board { cx: 600.48, cy: 133.155, w: 2592 * 0.7971 }, flame (280.39, 295, s 1.5), earphones (702.33, 155.57, s 1.18), ok (122.02, 110.7, s 1.5, rot 25.7).
  mobile: {
    w: 852, h: 720, hideWhen: "(min-width: 768px)",
    board: { cx: 660, cy: 398, w: 2592 * 0.85 },
    objects: [
      { key: "flame",     src: "flame.png",     aw: 179, ah: 252, cx: 262,    cy: 480, s: 1.55, rot: -1.5 },
      { key: "earphones", src: "earphones.png", aw: 456, ah: 526, cx: 655,    cy: 300, s: 1.15, rot: 0 },
      { key: "ok",        src: "ok.png",        aw: 147, ah: 81,  cx: 150,    cy: 150, s: 1.7,  rot: 25.7 },
    ],
  },
};

const initialItems = (L: Layout): HeroItem[] =>
  L.objects.map(o => ({ id: o.key, assetId: o.key, cx: o.cx, cy: o.cy, w: o.aw * o.s, rot: o.rot, idle: o.key }));

function Layer({ item, L, interactive, ctls, onHeld }: {
  item: HeroItem; L: Layout; interactive: boolean; ctls: MutableRefObject<Map<string, ItemCtl>>; onHeld: (id: string, held: boolean) => void;
}) {
  const asset = ASSET_BY_ID[item.assetId];
  const imgRef = useRef<HTMLImageElement>(null);
  const hoverRef = useRef<HTMLElement | null>(null);
  const heldRef = useRef(false);
  const [locked, setLocked] = useState(!!item.start);   // an object being carried in cannot be grabbed until it is set down
  const t = useTactile({
    imgRef, hoverRef, rotDeg: item.rot, enabled: interactive && !locked, allowTouch: true, initial: item.start,
    onHeld: h => { heldRef.current = h; onHeld(item.id, h); },
  });
  // A rebase moved this object's resting pose by `shift`; the offsets drop by the same amount in the same frame, so nothing moves on screen.
  const shiftN = item.shift?.n;
  useLayoutEffect(() => {
    const sh = item.shift;
    if (!sh) return;
    t.dx.set(t.dx.get() - sh.x); t.dy.set(t.dy.get() - sh.y); t.rot.set(t.rot.get() - sh.rot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftN]);
  useEffect(() => {
    const map = ctls.current;
    map.set(item.id, { dx: t.dx, dy: t.dy, rot: t.rot, lift: t.lift, isHeld: () => heldRef.current, lock: setLocked, release: t.cancelDrag });
    return () => { map.delete(item.id); };
  }, [ctls, item.id, t.dx, t.dy, t.rot, t.lift, t.cancelDrag]);
  return (
    <div className="hm-hs-obj" data-item={item.id} style={{
      left: `${(item.cx / L.w) * 100}%`, top: `${(item.cy / L.h) * 100}%`, width: `${(item.w / L.w) * 100}%`,
      zIndex: t.held ? 5 : locked ? 4 : undefined,
    }}>
      <div className={`hm-hs-idle hm-idle-${item.idle}`} data-held={t.held ? "1" : undefined}>
        <div ref={el => { hoverRef.current = el; }} className="hm-hs-hover" style={{ ["--tilt" as string]: `${item.rot < 0 ? -0.9 : 0.9}deg` }}>
          <motion.div
            className="hm-hs-drag" data-int={interactive && !locked ? "1" : undefined} data-cursor-kind={interactive && !locked ? "drag" : undefined} data-ycur={interactive ? "" : undefined} data-held={t.held ? "1" : undefined}
            style={{ x: t.dx, y: t.dy, rotate: t.rot, scale: t.lift }} {...t.handlers}
          >
            <picture className="hm-hs-pic">
              <source media={L.hideWhen} srcSet={BLANK} />
              <img ref={imgRef} src={asset.src} alt="" draggable={false}
                style={{ display: "block", width: "100%", height: "auto", objectFit: "contain", transform: `rotate(${item.rot}deg)` }} />
            </picture>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function HeroStage({ layout }: { layout: "desktop" | "mobile" }) {
  const L = LAYOUTS[layout];
  const interactive = useInteractive(true, true);   // mouse, trackpad and touch on both compositions
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null), shakeRef = useRef<HTMLDivElement>(null), boardImg = useRef<HTMLImageElement>(null);
  const clippyRef = useRef<ActorHandle>(null);
  const r1 = useRef<ActorHandle>(null), r2 = useRef<ActorHandle>(null), r3 = useRef<ActorHandle>(null);
  const restockerRefs = [r1, r2, r3];                                   // one ref per entry of RESTOCKERS (the hard upper limit)
  const [items, setItems] = useState<HeroItem[]>(() => initialItems(L));
  const itemsRef = useRef<HeroItem[]>(items);
  useEffect(() => { itemsRef.current = items; }, [items]);
  const ctls = useRef<Map<string, ItemCtl>>(new Map());
  const counts = { base: L.objects.length, max: L.objects.length + 3 };   // approved count, and the most objects a composition may hold (coverage-first fills holes up to this)
  const director = useHeroDirector({
    frame: { w: L.w, h: L.h }, counts, board: L.board, boardImgRef: boardImg, stageRef, shakeRef, itemsRef, setItems, ctls, clippy: clippyRef, restockers: restockerRefs, motionOk: !reduce,
  });
  const b = L.board;
  return (
    <div ref={stageRef} className={`hm-hs-stage hm-hs-stage-${layout}`} style={{ aspectRatio: `${L.w} / ${L.h}` }}>
      <div className={layout === "mobile" ? "hm-hs-boardclip" : "hm-hs-boardwrap"}>
        <div ref={shakeRef} className="hm-hs-shake">
          <button type="button" className="hm-hs-boardbtn" data-cursor-kind="board" data-ycur="" aria-label="Shake the pegboard"
            onClick={e => { if (e.detail !== 0 && boardImg.current && !opaqueAt(boardImg.current, e.clientX, e.clientY, 0)) return; director.shake(); }}
            style={{ left: `${(b.cx / L.w) * 100}%`, top: `${(b.cy / L.h) * 100}%`, width: `${(b.w / L.w) * 100}%`, transform: "translate(-50%, -50%)" }}>
            <picture className="hm-hs-pic">
              <source media={L.hideWhen} srcSet={BLANK} />
              <img ref={boardImg} src={`${BASE}green%20board.png`} alt="" draggable={false} style={{ display: "block", width: "100%", maxWidth: "none", height: "auto" }} />
            </picture>
          </button>
        </div>
      </div>
      {items.map(it => <Layer key={it.id} item={it} L={L} interactive={interactive} ctls={ctls} onHeld={director.itemHeld} />)}
      <Actor ref={clippyRef} name={CLIPPY.name} color={CLIPPY.color} />
      {RESTOCKERS.map((r, i) => <Actor key={r.name} ref={restockerRefs[i]} name={r.name} color={r.color} carry={r.carry} placed={r.placed} />)}
    </div>
  );
}
