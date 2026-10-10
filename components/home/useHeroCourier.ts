"use client";
// Hero: the two inline icons are delivered by THE SAME Icon Courier as the section headings (courierController.ts), one after the other. This hook only does the Hero-specific
// bookkeeping the section-heading component does for itself: collapse each icon's slot before paint (so the heading is complete by default and only collapses when a delivery is
// really going to happen), reserve the heading's final height, start once the Hero is revealed AND on screen, and make sure every exit path opens the slots again.
import { useEffect, useLayoutEffect, type RefObject } from "react";
import { COURIER_ENABLED, deliver, delivered, type Delivery } from "./courierController";

type Args = { ready: boolean; h1: RefObject<HTMLElement | null>; wrap: RefObject<HTMLElement | null>; slots: RefObject<HTMLElement | null>[] };

const REVEAL_MS = 1300;   // the hero's word-by-word reveal takes about this long once the page is ready

export function useHeroCourier({ ready, h1, wrap, slots }: Args) {
  // collapse + reserve, before paint
  useLayoutEffect(() => {
    const heading = h1.current, els = slots.map(s => s.current);
    if (!COURIER_ENABLED || !heading || els.some(e => !e) || window.matchMedia("(prefers-reduced-motion: reduce)").matches || delivered.has("hero-1") && delivered.has("hero-2")) return;
    const reserve = () => {                                                       // the heading keeps its final height while the slots are collapsed
      els.forEach(e => e!.removeAttribute("data-slot")); heading.style.removeProperty("min-height"); heading.style.setProperty("min-height", `${heading.getBoundingClientRect().height}px`);
      els.forEach((e, i) => { if (!delivered.has(`hero-${i + 1}`)) e!.setAttribute("data-slot", "pending"); });
    };
    reserve();
    let raf = 0;
    const ro = new ResizeObserver(() => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (els.some(e => e!.getAttribute("data-slot") === "pending")) reserve(); }); });
    ro.observe(heading);
    return () => { ro.disconnect(); if (raf) cancelAnimationFrame(raf); els.forEach(e => e!.removeAttribute("data-slot")); heading.style.removeProperty("min-height"); };
  }, [h1, slots]);

  // deliver, once, when the Hero is revealed and on screen
  useEffect(() => {
    const heading = h1.current, box = wrap.current, els = slots.map(s => s.current);
    if (!ready || !COURIER_ENABLED || !heading || !box || els.some(e => !e) || !els.some(e => e!.getAttribute("data-slot") === "pending")) return;
    let alive = true, revealed = false, visible = false, started = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const finishIfAllDone = () => { if (els.every((_, i) => delivered.has(`hero-${i + 1}`))) heading.style.removeProperty("min-height"); };
    const jobs: Delivery[] = els.map((el, i) => ({
      host: heading, wrap: box, eyebrow: null, slotEl: el!, padBottom: 0, alive: () => alive,
      open: () => { if (el!.getAttribute("data-slot") === "pending") el!.setAttribute("data-slot", "open"); },
      done: () => { el!.removeAttribute("data-slot"); delivered.add(`hero-${i + 1}`); finishIfAllDone(); },
    }));
    const start = () => { if (started || !revealed || !visible || !alive) return; started = true; jobs.forEach(j => deliver(j)); };
    timers.push(setTimeout(() => { revealed = true; start(); }, REVEAL_MS));
    const io = new IntersectionObserver(([e]) => {
      if (!e || started) return;
      if (e.isIntersecting) { visible = true; start(); }
      else if (e.boundingClientRect.bottom < 0) { started = true; jobs.forEach(j => { j.open(); timers.push(setTimeout(() => { if (alive) j.done(); }, 450)); }); }   // loaded already scrolled past it
    }, { threshold: 0.05 });
    io.observe(box);
    return () => { alive = false; io.disconnect(); timers.forEach(clearTimeout); };
  }, [ready, h1, wrap, slots]);
}
