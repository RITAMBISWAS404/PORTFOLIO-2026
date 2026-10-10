"use client";
// ONE cursor identity for the home page: the same rounded pointer silhouette (recreated as a clean vector from the supplied reference) plus a
// small text pill at a fixed lower-right offset. The user's pointer ("You"), Clippy and the Restockers all render this component; they differ
// only in colour, label and behaviour, and each owns its own pill (no shared state).
// The origin of `.hm-cur` is the pointer's hot spot (the glyph's tip); the pill flips to the left / above when the cursor is near a viewport edge.
import { forwardRef, useLayoutEffect, useRef, type CSSProperties } from "react";

/** The silhouette: a rounded, slightly leaning arrowhead with a concave tail notch (512 x 512 reference, cropped to its bounds). */
// The box is a whole number of CSS px (15 x 18; the art is 319 x 382, a 0.2% difference that preserveAspectRatio absorbs), so the vector is rasterised
// on exact pixel boundaries instead of at fractional sizes. Fill only: no stroke, filter, mask or clip.
export const GLYPH_W = 15, GLYPH_H = 18;
export function CursorGlyph({ color }: { color: string }) {
  return (
    <svg className="hm-cur-glyph" width={GLYPH_W} height={GLYPH_H} viewBox="128 65 319 382" aria-hidden="true" shapeRendering="geometricPrecision" style={{ overflow: "visible" }}>
      <path
        d="M128 112 Q128 65 172 65 Q188 65 202 76 L432 262 Q447 275 447 295 Q447 335 407 335 L330 335 Q292 335 266 366 L214 430 Q200 447 180 447 Q143 447 141 405 Z"
        fill={color} />
    </svg>
  );
}

/** Snap a CSS-px coordinate to a whole DEVICE pixel, so a composited cursor layer is never resampled between pixels (that is what softens edges). */
export const snapPx = (v: number) => { const d = (typeof window !== "undefined" && window.devicePixelRatio) || 1; return Math.round(v * d) / d; };

const PAD = 16;                                   // pill horizontal padding (both sides) in px
const timers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

/** Measure a cursor body's pill for its current text and fix its width (used once, on mount). */
export function initPill(root: HTMLElement) {
  const pill = root.querySelector<HTMLElement>(".hm-cur-pill"), t = root.querySelector<HTMLElement>(".hm-cur-text"), svg = root.querySelector<SVGElement>(".hm-cur-glyph");
  if (svg) { svg.setAttribute("width", String(snapPx(GLYPH_W))); svg.setAttribute("height", String(snapPx(GLYPH_H))); }   // whole device pixels at any zoom / DPR
  if (!pill || !t) return;
  pill.style.width = `${snapPx(Math.ceil(t.getBoundingClientRect().width) + PAD)}px`;
}

/**
 * Change a pill's text smoothly: the text dips out, the width eases to the new text's width, the text dips back in. DOM only, no React render.
 * `unscale`: a pill that is measured while a CSS `scale` is on it (or on its cursor) reads narrower than it will be laid out, so its padding came out short; pass true to measure at
 * scale 1. Only the Courier (whose pill pops in with a scale) opts in, so the other cursors are measured exactly as before.
 */
export function setPill(root: HTMLElement, text: string, unscale = false) {
  const pill = root.querySelector<HTMLElement>(".hm-cur-pill"), t = root.querySelector<HTMLElement>(".hm-cur-text");
  if (!pill || !t || t.dataset.label === text) return;
  t.dataset.label = text;
  const prev = timers.get(root); if (prev) clearTimeout(prev);
  t.style.opacity = "0";
  timers.set(root, setTimeout(() => {
    t.textContent = text;
    let w = t.getBoundingClientRect().width;
    if (unscale) { const sc = (e: Element) => { const v = parseFloat(getComputedStyle(e).scale); return v > 0 ? v : 1; }; w /= sc(pill) * sc(root); }
    pill.style.width = `${snapPx(Math.ceil(w) + PAD)}px`;
    t.style.opacity = "1";
  }, 70));
}

export type CursorBodyProps = { color: string; label: string; className?: string; style?: CSSProperties };

/** The shared cursor body: glyph + pill in the SAME `color`, white pill text. Positioning (fixed for the user's pointer, absolute on the board for the visitors) is the parent's job. */
export const CursorBody = forwardRef<HTMLDivElement, CursorBodyProps>(function CursorBody({ color, label, className = "", style }, ref) {
  const own = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => { if (own.current) initPill(own.current); }, []);
  return (
    <div ref={el => { own.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }} className={`hm-cur ${className}`} style={style}>
      <CursorGlyph color={color} />
      <span className="hm-cur-pill" style={{ background: color }}><span className="hm-cur-text" data-label={label}>{label}</span></span>
    </div>
  );
});
