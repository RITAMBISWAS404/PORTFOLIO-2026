"use client";
// Layered Footer artwork for the home page: a stable board plus independent transparent objects, interacting like the Hero
// (tiny stop-motion idle, pick-up hover, free drag inside the footer frame, spring back to the exact rest pose). Same CSS classes
// (.hm-hs-*) and the same useTactile hook as HeroStage; the only difference is the drag canvas (this stage's own box).
// Two compositions reproduce the flattened footer images they replace (footer-pc.png 2160x800, footer-mobile.png 852x480);
// positions/rotations/scales were measured by fitting each asset to those images, stored here as pixels in that frame.
// Desktop: objects are cropped at the bottom edge of the frame (as the flattened image was) but can be dragged anywhere across the visible footer area;
// mobile only crops the board to the frame; objects drag freely there too (touch), clipped only at the bottom edge. Nothing here is scroll-linked.
import { useRef } from "react";
import { motion } from "framer-motion";
import { useTactile, useInteractive } from "./useTactile";

const BASE = "/footer%20section%20image/";
const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const STAGE_ID = "hm-footer-stage";

type Obj = { key: string; src: string; aw: number; ah: number; cx: number; cy: number; s: number; rot: number };
type Layout = { w: number; h: number; board: { cx: number; cy: number; s: number; rot: number }; objects: Obj[]; hideWhen: string };

const BOARD = { src: "board.png", aw: 2086, ah: 769 };

// listed bottom to top (the START sign sits under the Nokia)
const LAYOUTS: Record<"desktop" | "mobile", Layout> = {
  desktop: {
    w: 2160, h: 800, hideWhen: "(max-width: 767px)",
    board: { cx: 1088, cy: 408, s: 1.035, rot: 0.5 },
    objects: [
      { key: "paper",    src: "paper.png",       aw: 718, ah: 531, cx: 533.9,  cy: 1008.2, s: 1.6,  rot: 6.63 },
      { key: "sign",     src: "sign.png",        aw: 308, ah: 308, cx: 629,    cy: 190.3,  s: 1.6,  rot: 14.9 },
      { key: "phone",    src: "phone.png",       aw: 457, ah: 674, cx: 367.6,  cy: 648.2,  s: 1.59, rot: -12.3 },
      { key: "unoback",  src: "uno back.png",    aw: 301, ah: 437, cx: 1730.3, cy: 358.7,  s: 1.6,  rot: -7.4 },
      { key: "unofront", src: "uno front.png",   aw: 294, ah: 437, cx: 1883.5, cy: 571.5,  s: 1.6,  rot: 11.7 },
      { key: "credit",   src: "credit text.png", aw: 431, ah: 71,  cx: 1080.2, cy: 520.7,  s: 1.6,  rot: 0 },
      { key: "logo",     src: "logo.png",        aw: 232, ah: 232, cx: 1080.5, cy: 349.5,  s: 0.97, rot: 0 },
    ],
  },
  // MOBILE_FOOTER: taller frame (852x720) with its own board scale and object poses, sized from each asset's VISIBLE art (phone ink is only ~51% of its image width, sign ~77%, uno ~90%).
  // Revert = restore the ORIGINAL mobile entry: h 480, board { cx: 548, cy: 348, s: 0.98 }, sign (272.3, 446.5, s .81, 15.2), phone (54.8, 364.1, s 1.1, -10), unofront (759.7, 395, s .62, 14), credit (457.5, 301.5, s .85, .6), logo (426, 206.7, s .49).
  mobile: {
    w: 852, h: 700, hideWhen: "(min-width: 768px)",   // REFINEMENT 2: was h 720, board s 0.95 at (440, 370); sign cy 610, phone cy 560, unofront cy 520, credit cy 360, logo cy 240
    board: { cx: 440, cy: 350, s: 0.9, rot: 0 },
    objects: [
      { key: "sign",     src: "sign.png",        aw: 308, ah: 308, cx: 335,   cy: 590, s: 1.1,  rot: 15.2 },
      { key: "phone",    src: "phone.png",       aw: 457, ah: 674, cx: 95,    cy: 540, s: 1.25, rot: -10 },
      { key: "unofront", src: "uno front.png",   aw: 294, ah: 437, cx: 735,   cy: 500, s: 1.0,  rot: 14 },
      { key: "credit",   src: "credit text.png", aw: 431, ah: 71,  cx: 450,   cy: 345, s: 0.9,  rot: 0.6 },
      { key: "logo",     src: "logo.png",        aw: 232, ah: 232, cx: 440,   cy: 228, s: 0.75, rot: 0 },
    ],
  },
};

function Layer({ o, L, interactive, canvasId }: { o: Obj; L: Layout; interactive: boolean; canvasId: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const hoverRef = useRef<HTMLElement | null>(null);
  const t = useTactile({ imgRef, hoverRef, rotDeg: o.rot, enabled: interactive, canvasId, passThrough: true, allowTouch: true });
  return (
    <div className="hm-hs-obj" style={{
      left: `${(o.cx / L.w) * 100}%`, top: `${(o.cy / L.h) * 100}%`, width: `${((o.aw * o.s) / L.w) * 100}%`,
      zIndex: t.held ? 50 : undefined,
    }}>
      <div className={`hm-hs-idle hm-idle-f-${o.key}`} data-held={t.held ? "1" : undefined}>
        <div ref={el => { hoverRef.current = el; }} className="hm-hs-hover" style={{ ["--tilt" as string]: `${o.rot < 0 ? -0.9 : 0.9}deg` }}>
          <motion.div
            className="hm-hs-drag" data-int={interactive ? "1" : undefined} data-cursor-kind={interactive ? "drag" : undefined} data-held={t.held ? "1" : undefined}
            style={{ x: t.dx, y: t.dy, rotate: t.rot, scale: t.lift }} {...t.handlers}
          >
            <picture className="hm-hs-pic">
              <source media={L.hideWhen} srcSet={BLANK} />
              <img ref={imgRef} src={`${BASE}${o.src}`} alt="" draggable={false}
                style={{ display: "block", width: "100%", height: "auto", transform: `rotate(${o.rot}deg)` }} />
            </picture>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Stage({ layout }: { layout: "desktop" | "mobile" }) {
  const L = LAYOUTS[layout];
  const interactive = useInteractive(true, true);   // mouse, trackpad and touch on both compositions
  const canvasId = layout === "desktop" ? STAGE_ID : `${STAGE_ID}-m`;
  const b = L.board;
  return (
    <div id={canvasId} className={`hm-hs-stage hm-fs-${layout}`} style={{ aspectRatio: `${L.w} / ${L.h}` }}>
      <div className={layout === "mobile" ? "hm-hs-boardclip" : undefined} style={layout === "mobile" ? undefined : { display: "contents" }}>
      <picture className="hm-hs-pic">
        <source media={L.hideWhen} srcSet={BLANK} />
        <img src={`${BASE}${BOARD.src}`} alt="" draggable={false}
          style={{ position: "absolute", left: `${(b.cx / L.w) * 100}%`, top: `${(b.cy / L.h) * 100}%`, width: `${((BOARD.aw * b.s) / L.w) * 100}%`, maxWidth: "none", height: "auto", transform: `translate(-50%, -50%) rotate(${b.rot}deg)`, display: "block" }} />
      </picture>
      </div>
      {L.objects.map(o => <Layer key={o.key} o={o} L={L} interactive={interactive} canvasId={canvasId} />)}
    </div>
  );
}

export default function FooterStage() {
  return (
    <>
      <div className="hm-fs-desktop-wrap"><div className="hm-fs-clip"><Stage layout="desktop" /></div></div>
      <div className="hm-fs-mobile-wrap"><div className="hm-fs-clip hm-fs-clip-m"><Stage layout="mobile" /></div></div>
    </>
  );
}
