"use client";
// Shared "physical object" behaviour for the Hero (objects + decorative heading icons), the home page only:
//   - hover = picking the object up: when the pointer is over its opaque pixels it gets data-hover (small lift, tiny scale/tilt, soft shadow; CSS, no shake)
//   - press-and-hold drag anywhere inside the Hero canvas, transform-only, pointer captured, grab offset preserved
//   - on release a restrained spring brings it back to its exact rest position (small overshoot + tiny wobble)
// Mouse/pen everywhere; touch only where a stage opts in (allowTouch). A touch drag starts only when the finger lands on an opaque pixel of an object,
// and only until release does a non-passive touchmove cancel page scroll, so scrolling is untouched everywhere else. No React render per pointer move (motion values).
import { useEffect, useRef, useState, type RefObject } from "react";
import { animate, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";

/** True on hover-capable fine pointers (mouse/trackpad) when the user hasn't asked for reduced motion. */
export function useInteractive(enabled = true, touch = false) {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const upd = () => setFine(mq.matches);
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  // hover-capable fine pointers always; touch screens only where the caller opts in (the Hero / Footer object stages)
  return enabled && !reduce && (fine || touch);
}

// ── alpha hit-test: only the opaque pixels of an object react ──
const alphaMaps = new WeakMap<HTMLImageElement, { ctx: CanvasRenderingContext2D; w: number; h: number }>();
export function opaqueAt(img: HTMLImageElement, clientX: number, clientY: number, rotDeg: number): boolean {
  if (!img.naturalWidth) return false;
  let m = alphaMaps.get(img);
  if (!m) {
    const w = 160, h = Math.max(1, Math.round((160 * img.naturalHeight) / img.naturalWidth));
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d", { willReadFrequently: true });
    if (!ctx) return true;
    ctx.drawImage(img, 0, 0, w, h);
    m = { ctx, w, h };
    alphaMaps.set(img, m);
  }
  const r = img.getBoundingClientRect();
  const a = (-rotDeg * Math.PI) / 180, dx = clientX - (r.left + r.width / 2), dy = clientY - (r.top + r.height / 2);
  const lx = dx * Math.cos(a) - dy * Math.sin(a), ly = dx * Math.sin(a) + dy * Math.cos(a);
  const u = Math.round((lx / img.offsetWidth + 0.5) * m.w), v = Math.round((ly / img.offsetHeight + 0.5) * m.h);
  const x0 = Math.max(0, u - 2), y0 = Math.max(0, v - 2), x1 = Math.min(m.w, u + 3), y1 = Math.min(m.h, v + 3);
  if (x1 <= x0 || y1 <= y0) return false;
  const d = m.ctx.getImageData(x0, y0, x1 - x0, y1 - y0).data;   // ±2px tolerance so thin frames are easy to catch
  for (let i = 3; i < d.length; i += 4) if (d[i] > 40) return true;
  return false;
}

/** The interaction canvas in viewport px. Default: the Hero (full width, below the fixed navbar). Pass another element id (e.g. the Footer stage) to confine dragging to that element's box. */
function heroCanvas(canvasId = "hero") {
  if (canvasId !== "hero") {
    // Other canvases (Footer): the whole visible viewport width and height, not the element's own box. The only hard edge is the bottom of
    // that element (the end of the page), so objects can travel across the surroundings but never leave the visible window.
    const el = document.getElementById(canvasId)?.getBoundingClientRect();
    if (el) return { left: 8, right: window.innerWidth - 8, top: 80, bottom: Math.min(el.bottom, window.innerHeight - 8) };
  }
  const r = document.getElementById("hero")?.getBoundingClientRect();
  return {
    left: 8, right: window.innerWidth - 8,
    top: Math.max(r ? r.top : 0, 80),
    bottom: Math.min(r ? r.bottom : window.innerHeight, window.innerHeight - 8),
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
type DragState = { id: number; sx: number; sy: number; ox: number; oy: number; minX: number; maxX: number; minY: number; maxY: number };

export function useTactile({ imgRef, hoverRef, rotDeg = 0, enabled, onHeld, canvasId, passThrough = false, allowTouch = false, initial }: {
  imgRef: RefObject<HTMLImageElement | null>; hoverRef: RefObject<HTMLElement | null>;
  rotDeg?: number; enabled: boolean; onHeld?: (held: boolean) => void; canvasId?: string;
  /** Overlapping objects (Footer): when the pointer is on this object's transparent pixels, hand the event to the object underneath instead of swallowing it. */
  passThrough?: boolean;
  /** Let a finger pick the object up (Pointer Events); a touch that does not start on the object still scrolls the page. */
  allowTouch?: boolean;
  /** Starting offset in px (Hero director: an object that is carried in begins away from its resting spot). */
  initial?: { x: number; y: number };
}) {
  const dx = useMotionValue(initial?.x ?? 0), dy = useMotionValue(initial?.y ?? 0), rot = useMotionValue(0), lift = useMotionValue(1);
  const [held, setHeld] = useState(false);
  const drag = useRef<DragState | null>(null);
  const inside = useRef(false), lastCheck = useRef(0);
  const anims = useRef<AnimationPlaybackControls[]>([]);

  const stop = () => { anims.current.forEach(a => a.stop()); anims.current = []; };

  const isMouse = (e: React.PointerEvent) => e.pointerType === "mouse" || e.pointerType === "pen";
  const canGrab = (e: React.PointerEvent) => isMouse(e) || (allowTouch && e.pointerType === "touch");

  // While a finger holds an object the page must not scroll; this listener exists only for the duration of that drag.
  const blockScroll = useRef((ev: TouchEvent) => { if (ev.cancelable) ev.preventDefault(); });
  const stopBlock = () => window.removeEventListener("touchmove", blockScroll.current);
  useEffect(() => () => { stop(); stopBlock(); }, []);
  const over = (e: React.PointerEvent) => !!imgRef.current && opaqueAt(imgRef.current, e.clientX, e.clientY, rotDeg);

  const setHover = (on: boolean) => {
    const el = hoverRef.current;
    if (!el) return;
    if (on) el.setAttribute("data-hover", "1"); else el.removeAttribute("data-hover");
  };

  // Hand a pointer event to the next draggable object under the pointer (its own alpha test then decides whether it is hit).
  const forwardBelow = (e: React.PointerEvent<HTMLElement>) => {
    if (!passThrough) return;
    const stack = document.elementsFromPoint(e.clientX, e.clientY).filter(n => n.classList.contains("hm-hs-drag"));
    const i = stack.indexOf(e.currentTarget);
    const next = i >= 0 ? stack[i + 1] : undefined;
    if (!next) return;
    next.dispatchEvent(new PointerEvent(e.type, {
      bubbles: true, cancelable: true, pointerId: e.pointerId, pointerType: e.pointerType, isPrimary: e.isPrimary,
      button: e.button, buttons: e.buttons, clientX: e.clientX, clientY: e.clientY,
    }));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (!enabled || !canGrab(e) || e.button !== 0 || !imgRef.current) return;
    if (!over(e)) { forwardBelow(e); return; }
    e.preventDefault();
    stop();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not an active pointer (e.g. synthetic): window-level moves still reach us via bubbling */ }
    const r = imgRef.current.getBoundingClientRect(), c = heroCanvas(canvasId), ox = dx.get(), oy = dy.get();
    drag.current = {
      id: e.pointerId, sx: e.clientX, sy: e.clientY, ox, oy,
      // total offset range that keeps the object's visual box inside the Hero canvas; always includes rest (0)
      minX: Math.min(0, ox + (c.left - r.left)), maxX: Math.max(0, ox + (c.right - r.right)),
      minY: Math.min(0, oy + (c.top - r.top)), maxY: Math.max(0, oy + (c.bottom - r.bottom)),
    };
    setHover(false);
    if (e.pointerType === "touch") window.addEventListener("touchmove", blockScroll.current, { passive: false });
    setHeld(true); onHeld?.(true);
    anims.current = [animate(lift, 1.025, { duration: 0.12, ease: "easeOut" })];
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (d) {
      if (e.pointerId !== d.id) return;
      dx.set(clamp(d.ox + e.clientX - d.sx, d.minX, d.maxX));
      dy.set(clamp(d.oy + e.clientY - d.sy, d.minY, d.maxY));
      return;
    }
    if (!enabled || !isMouse(e)) return;
    const now = performance.now();
    if (now - lastCheck.current < 40) return;
    lastCheck.current = now;
    const now2 = over(e);
    if (now2 !== inside.current) { inside.current = now2; setHover(now2); }
    if (!now2) forwardBelow(e);
  };

  /** End a drag without the spring home: the object stays exactly where it is (a shake scatters it from there). The pointer-up that follows is ignored. */
  const cancelDrag = () => {
    if (!drag.current) return;
    drag.current = null;
    stopBlock(); stop();
    setHeld(false); onHeld?.(false);
    anims.current = [animate(lift, 1, { duration: 0.15, ease: "easeOut" })];
  };

  const onPointerUp = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    stopBlock();
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    setHeld(false); onHeld?.(false);
    inside.current = over(e);           // still on the object: it goes straight back to its hovered (picked-up) look
    setHover(inside.current);
    // quick return, ~10% overshoot, then a small rotation wobble; every spring starts from zero velocity so a flick can't overshoot the canvas.
    rot.jump(rot.get() + clamp(dx.get() / 40, -2.5, 2.5));   // from the current rotation, never reset to zero
    // overshoot is capped at ~8px however far it was dragged: damping ratio is derived from the drag distance (>=0.55, so short drags keep the playful ~10% overshoot)
    const dist = Math.hypot(dx.get(), dy.get()), f = clamp(8 / Math.max(dist, 1), 0.01, 0.13), lf = Math.log(f);
    const zeta = -lf / Math.sqrt(Math.PI * Math.PI + lf * lf);
    const home = { type: "spring" as const, stiffness: 380, damping: 2 * zeta * Math.sqrt(380 * 0.8), mass: 0.8, velocity: 0 };
    anims.current = [
      animate(dx, 0, { ...home, onComplete: () => dx.set(0) }),
      animate(dy, 0, { ...home, onComplete: () => dy.set(0) }),
      animate(rot, 0, { type: "spring", stiffness: 240, damping: 9, mass: 0.8, velocity: 0, onComplete: () => rot.set(0) }),
      animate(lift, 1, { type: "spring", stiffness: 420, damping: 26, velocity: 0 }),
    ];
  };

  return {
    dx, dy, rot, lift, held, cancelDrag,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onPointerLeave: () => { inside.current = false; setHover(false); } },
  };
}
