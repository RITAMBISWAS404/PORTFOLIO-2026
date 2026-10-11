"use client";
import { useEffect, type MutableRefObject, type RefObject } from "react";

// The case-study navbar's (components/NavbarNew.tsx) auto-hide. It is the same behaviour and timing as the landing page navbar's own (components/home/NavbarNew.tsx): on desktop the floating navbar floats out on a deliberate downward scroll
// and back in on a deliberate upward one. Mobile is untouched: the effect below never runs there and the mobile header has no hook into it.
// Detection works on GESTURES: movement is accumulated only while the page keeps scrolling (a gesture ends after GESTURE_GAP_MS of stillness), a reversal restarts the count, and the
// two directions have different thresholds, so a navbar that has just appeared is not hidden by a nudge and one that has just hidden is not revealed by momentum or wobble.
const NAV_AUTOHIDE = true;
const HIDE_AFTER = 160;       // px: nothing hides above this scroll position
const HIDE_PX = 72;           // px of continuous DOWNWARD movement (one gesture) before it hides
const SHOW_PX = 48;           // px of continuous UPWARD movement (one gesture) before it reappears: coming back is cheaper than leaving
const JITTER_PX = 4;          // a counter-movement smaller than this (trackpad noise) neither switches nor resets the count
const GESTURE_GAP_MS = 140;   // stillness that ends a gesture (the accumulated distance is dropped)
const LOCK_MS = 380;          // after a switch, the opposite switch waits (about the length of the slide), so it can never fight its own transition
const HIDE_MS = 440, HIDE_EASE = "cubic-bezier(.4, 0, .2, 1)";      // a soft departure
const SHOW_MS = 500, SHOW_EASE = "cubic-bezier(.22, 1, .36, 1)";    // the portfolio's usual ease-out: a long, gentle landing (no overshoot)

/**
 * Desktop auto-hide for the floating navbar. `wrapRef` is the fixed wrapper around the nav (only its transform / opacity are animated, never its box);
 * `afterNav` is set by the navbar when an in-page link was just activated (see the onClickCapture on the wrapper). Does nothing on mobile.
 */
export function useNavAutoHide(wrapRef: RefObject<HTMLDivElement | null>, afterNav: MutableRefObject<boolean>, isMobile: boolean) {
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!NAV_AUTOHIDE || isMobile || !wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // only transform + opacity ever animate; the wrapper's box, and so the layout, never changes
    const slide = (h: boolean) => reduce.matches ? "none" : h ? `transform ${HIDE_MS}ms ${HIDE_EASE}, opacity ${HIDE_MS}ms ${HIDE_EASE}` : `transform ${SHOW_MS}ms ${SHOW_EASE}, opacity ${Math.round(SHOW_MS * 0.7)}ms ease-out`;
    let hidden = false, lastY = window.scrollY, acc = 0, raf = 0, lastSwitch = -1e9, gap: ReturnType<typeof setTimeout> | undefined, settle: ReturnType<typeof setTimeout> | undefined;
    const set = (h: boolean) => {
      if (h === hidden) return;
      hidden = h; lastSwitch = performance.now(); acc = 0;
      wrap.style.transition = slide(h);                                                   // set before the change, so THIS direction's timing is the one used
      wrap.style.transform = h ? "translateY(calc(-100% - 24px))" : "";                 // fully above the viewport: its 18px offset + its own height + a margin
      wrap.style.opacity = h ? "0" : "";
    };
    const focused = () => wrap.contains(document.activeElement);                           // a focused link keeps the navbar up
    const frame = () => {
      raf = 0;
      const y = window.scrollY, dy = y - lastY; lastY = y;
      if (y <= 10) { acc = 0; set(false); return; }                                        // at / near the top (and rubber-band overscroll): always visible
      if (dy === 0) return;
      if (acc !== 0 && Math.sign(dy) !== Math.sign(acc)) {
        if (Math.abs(dy) < JITTER_PX) return;                                              // noise against the gesture: ignored
        acc = 0;                                                                           // a real reversal starts a fresh measurement
      }
      acc += dy;
      if (performance.now() - lastSwitch < LOCK_MS) return;                                // the count keeps building during the lock, so a deliberate gesture responds the moment it ends
      if (acc >= HIDE_PX && y > HIDE_AFTER && !focused()) set(true);
      else if (acc <= -SHOW_PX) set(false);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
      if (gap) clearTimeout(gap);
      gap = setTimeout(() => { gap = undefined; acc = 0; }, GESTURE_GAP_MS);              // stillness ends the gesture: slow separate nudges never add up
      // after an in-page jump (a nav link, a CTA) has come to rest, float the navbar out so it does not sit over the destination heading
      if (settle) clearTimeout(settle);
      settle = setTimeout(() => { settle = undefined; if (afterNav.current) { afterNav.current = false; if (window.scrollY > HIDE_AFTER && !focused()) set(true); } }, 320);
    };
    const onFocusIn = () => set(false);
    const onMq = () => { wrap.style.transition = slide(hidden); };
    wrap.style.transition = slide(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    wrap.addEventListener("focusin", onFocusIn);
    reduce.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("scroll", onScroll); wrap.removeEventListener("focusin", onFocusIn); reduce.removeEventListener("change", onMq);
      if (raf) cancelAnimationFrame(raf); if (settle) clearTimeout(settle); if (gap) clearTimeout(gap);
      wrap.style.transform = ""; wrap.style.transition = ""; wrap.style.opacity = "";                               // leaving desktop (or reverting): never leave it hidden
    };
  }, [isMobile, wrapRef, afterNav]);
}
