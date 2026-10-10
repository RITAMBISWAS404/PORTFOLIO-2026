"use client";
// "You": the visitor's own pointer on the home page. The shared cursor silhouette in black with a matching black pill (white text) that reads "You"
// on ordinary areas and a short, context-specific phrase over eligible targets (semantic data-cursor-* attributes; the copy lives in lib/home/cursorCopy.ts).
//   - position:fixed, pointer-events:none, transform-only movement through one rAF (no React render per pointer move); the glyph tip is the hot spot
//   - state comes from event.target.closest(...) so nested children inside a card/button never flicker; label changes are debounced a few ms
//     (longer when falling back to "You") so crossing the gap between two nested elements does not flash
//   - fine, hover-capable pointers only (touch devices keep the native pointer); re-evaluated if the media query changes
//   - the native cursor is hidden only AFTER the first real mouse movement, so if anything fails to initialise the native cursor is still there;
//     over text fields / editable content the native text cursor shows and this one hides
//   - the pill flips left / above near the right and bottom viewport edges; prefers-reduced-motion removes the pill's transitions
// Independent of "Clippy" and "Restocker" (HeroActors.tsx), which use the same CursorBody but keep their own state.
import { useEffect, useRef } from "react";
import { CursorBody, setPill, snapPx } from "./Cursor";
import { cursorLabelFor, YOU, YOU_LABEL } from "@/lib/home/cursorCopy";

const TEXTUAL = 'input:not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable=""], [contenteditable="true"]';

export default function OrangeCursor() {
  const root = useRef<HTMLDivElement>(null), body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current, cur = body.current;
    if (!el || !cur) return;
    const html = document.documentElement, fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let raf = 0, x = 0, y = 0, live = false, label = YOU_LABEL, want = YOU_LABEL, pending: ReturnType<typeof setTimeout> | undefined, flipX = false, flipY = false;
    const pill = cur.querySelector<HTMLElement>(".hm-cur-pill")!;
    const apply = () => {
      raf = 0;
      el.style.transform = `translate(${snapPx(x)}px, ${snapPx(y)}px)`;
      const w = parseFloat(pill.style.width) || 60, fx = x + 13 + w + 8 > innerWidth, fy = y + 15 + 20 + 8 > innerHeight;
      if (fx !== flipX) { flipX = fx; cur.toggleAttribute("data-flip-x", fx); }
      if (fy !== flipY) { flipY = fy; cur.toggleAttribute("data-flip-y", fy); }
    };
    const commit = (next: string) => { pending = undefined; label = next; setPill(cur, next); if (!raf) raf = requestAnimationFrame(apply); };
    const request = (next: string) => {
      if (next === want) return;
      want = next;
      if (pending) clearTimeout(pending);
      if (next === label) { pending = undefined; return; }
      pending = setTimeout(() => commit(next), next === YOU_LABEL ? 110 : 45);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX; y = e.clientY;
      const t = e.target instanceof Element ? e.target : null, text = !!t?.closest(TEXTUAL);
      el.toggleAttribute("data-hide", text);
      request(text ? YOU_LABEL : cursorLabelFor(t) ?? YOU_LABEL);
      if (!live) { live = true; html.classList.add("hm-cursor-on"); }
      el.setAttribute("data-on", "");
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onLeave = () => { el.removeAttribute("data-on"); request(YOU_LABEL); };
    // A click can change the target's own state (a form starts sending, the email is copied) without the pointer moving: re-read it shortly after.
    const refreshTimers = new Set<ReturnType<typeof setTimeout>>();
    const refresh = () => {
      if (!live) return;
      const t = document.elementFromPoint(x, y);
      request(t?.closest(TEXTUAL) ? YOU_LABEL : cursorLabelFor(t) ?? YOU_LABEL);
    };
    // Scrolling moves content under a pointer that is not moving, and no pointer event follows: re-read the target once per frame so the pill never names what is no longer there.
    let scrollRaf = 0;
    const onScroll = () => { if (live && !scrollRaf) scrollRaf = requestAnimationFrame(() => { scrollRaf = 0; refresh(); }); };
    const onUp = () => { for (const ms of [140, 600]) { const id = setTimeout(() => { refreshTimers.delete(id); refresh(); }, ms); refreshTimers.add(id); } };
    const enable = () => {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      html.addEventListener("mouseleave", onLeave);
      window.addEventListener("blur", onLeave);
    };
    const disable = () => {
      window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerdown", onMove); window.removeEventListener("pointerup", onUp); window.removeEventListener("scroll", onScroll);
      if (scrollRaf) { cancelAnimationFrame(scrollRaf); scrollRaf = 0; }
      refreshTimers.forEach(clearTimeout); refreshTimers.clear();
      html.removeEventListener("mouseleave", onLeave); window.removeEventListener("blur", onLeave);
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      if (pending) { clearTimeout(pending); pending = undefined; }
      live = false; html.classList.remove("hm-cursor-on"); el.removeAttribute("data-on");
    };
    const sync = () => { try { if (fine.matches) enable(); else disable(); } catch { disable(); } };
    const onChange = () => { disable(); sync(); };
    sync();
    fine.addEventListener("change", onChange);
    return () => { fine.removeEventListener("change", onChange); disable(); };
  }, []);
  return <div ref={root} className="hm-oc" aria-hidden="true"><CursorBody ref={body} color={YOU.color} label={YOU_LABEL} /></div>;
}
