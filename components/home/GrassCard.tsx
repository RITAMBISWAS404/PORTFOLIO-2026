"use client";
// The last card of the Experience grid: a caption, a continuous row of grass across the whole bottom edge that sways in a light breeze and bends away from the
// pointer, and one or (now and then) two small bees that fly through the air ABOVE it. Stacking is explicit: grass (z1) < bees (z2) < caption (z3), all inside an isolated card.
//  - wind: CSS keyframes per grass instance (own amplitude / duration / phase), rotating about the blade roots
//  - pointer: LOCAL pointer events on the card; one rAF per move writes a bounded --bend on each instance (CSS `rotate`, so it adds to the keyframed wind)
//  - bees: a tiny steering engine on plain objects (no React state): waypoint flights with darts, hovers and altitude changes, kept clear of the caption and out of the grass.
//    It runs only while the card is on screen and the tab is visible; everything is cleaned up on unmount
//  - reduced motion: static grass, one static bee, no loops
import { useEffect, useRef, useState } from "react";
import { BEE, BEES, canopyProfile, layoutGrass, type GrassBlade } from "@/lib/home/grassScene";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const MAX_BEND = 9;   // degrees

type Geo = { W: number; H: number; cap: { l: number; t: number; r: number; b: number } };
type BeeState = {
  el: HTMLDivElement; size: number; x: number; y: number; hd: number; sp: number; spT: number; mode: "cruise" | "dart" | "pause" | "spiral"; mt: number;
  bias: number; biasT: number; f1: number; f2: number; ph: number; live: boolean; leaving: boolean; flip: boolean; tilt: number;
};

const angDiff = (a: number, b: number) => ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;

export default function GrassCard() {
  const card = useRef<HTMLDivElement>(null), bee1 = useRef<HTMLDivElement>(null), bee2 = useRef<HTMLDivElement>(null), cap = useRef<HTMLSpanElement>(null);
  const [blades, setBlades] = useState<GrassBlade[]>([]);
  const prof = useRef<{ tip: Float32Array; res: number } | null>(null);   // the canopy's top edge per column: the bees' lower limit

  // ── grass layout: recomputed only when the card's size really changes ──
  useEffect(() => {
    const el = card.current; if (!el) return;
    let w = 0, h = 0;
    const ro = new ResizeObserver(([e]) => {
      const nw = Math.round(e.contentRect.width), nh = Math.round(e.contentRect.height);
      if (Math.abs(nw - w) < 2 && Math.abs(nh - h) < 2) return;
      w = nw; h = nh; const bl = layoutGrass(nw, nh); prof.current = canopyProfile(bl, nw, nh); setBlades(bl);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── wind is CSS; this effect is the pointer + the bees ──
  useEffect(() => {
    const el = card.current, c = cap.current, e1 = bee1.current, e2 = bee2.current;
    if (!el || !c || !e1 || !e2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const geo: Geo = { W: 0, H: 0, cap: { l: 0, t: 0, r: 0, b: 0 } };
    const measure = () => {
      const r = el.getBoundingClientRect(), cr = c.getBoundingClientRect();
      geo.W = r.width; geo.H = r.height; geo.cap = { l: cr.left - r.left, t: cr.top - r.top, r: cr.right - r.left, b: cr.bottom - r.top };
    };
    const mkBee = (node: HTMLDivElement): BeeState => ({
      el: node, size: 0, x: 0, y: 0, hd: 0, sp: 0, spT: 50, mode: "cruise", mt: 0, bias: 0, biasT: 0, f1: rnd(1.1, 2.1), f2: rnd(0.5, 1.1), ph: rnd(0, 6.28),
      live: false, leaving: false, flip: false, tilt: 0,
    });
    const bees = [mkBee(e1), mkBee(e2)];
    const sizeBees = () => bees.forEach((b, i) => { b.size = geo.H * BEES.size[i]; b.el.style.height = `${b.size}px`; });
    const hw = (b: BeeState) => b.size * (BEE.w / BEE.h) * 0.5;      // half the rendered width
    const hh = (b: BeeState) => b.size * 0.5;                        // half the rendered height
    // The flight zone, in the card's own coordinates: a bee's visible body must stay inside the card (top) and above the tallest grass under it (bottom), with clearance.
    // The canopy line is the tallest blade tip over the bee's whole width (+ margin), and sway only moves tips sideways/down, so it stays above the moving grass too.
    const band = (b: BeeState, x: number) => {
      const p = prof.current, w = hw(b) + 6; let m = geo.H;
      if (p) { const i0 = clamp(Math.floor((x - w) / p.res), 0, p.tip.length - 1), i1 = clamp(Math.ceil((x + w) / p.res), 0, p.tip.length - 1); m = p.tip[i0]; for (let i = i0 + 1; i <= i1; i++) if (p.tip[i] < m) m = p.tip[i]; }
      const lo = hh(b) + 3; return { lo, hi: Math.max(lo, m - BEES.clearance - hh(b)) };
    };

    if (reduce.matches) {                                          // one static bee, nothing else moves
      measure(); sizeBees();
      const b = bees[0]; b.el.style.opacity = "1"; const bd = band(b, geo.W * 0.82); b.el.style.translate = `${geo.W * 0.82 - hw(b)}px ${(bd.lo + bd.hi) / 2 - hh(b)}px`;
      return;
    }

    let visible = false, raf = 0, last = 0, started = false, bendRaf = 0, px = 0, py = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => { const t = setTimeout(() => { timers.delete(t); fn(); }, ms); timers.add(t); };

    // Flight: a heading + a speed. The heading is turned by a smooth wandering rate (two slow sines) plus a per-mode bias, so the path is made of curves;
    // modes (cruise / dart / pause / spiral) change speed and bias for short, bounded stretches. Nothing is ever re-randomised per frame.
    const nextMode = (b: BeeState, now: number) => {
      const r = Math.random();
      b.bias = 0; b.biasT = 0;
      if (r < 0.28) { b.mode = "dart"; b.mt = now + rnd(260, 520); b.spT = rnd(150, 215); b.bias = (Math.random() < 0.5 ? -1 : 1) * rnd(0.6, 1.5) / 0.14; b.biasT = now + 140; }
      else if (r < 0.46) { b.mode = "pause"; b.mt = now + rnd(380, 1000); b.spT = rnd(0, 7); }
      else if (r < 0.72) { b.mode = "spiral"; b.mt = now + rnd(900, 1800); b.spT = rnd(34, 52); const bd = band(b, b.x), rad = clamp((bd.hi - bd.lo) * 0.38, 3.5, 9); b.bias = (Math.random() < 0.5 ? -1 : 1) * b.spT / rad; b.biasT = b.mt; }
      else { b.mode = "cruise"; b.mt = now + rnd(1200, 2800); b.spT = rnd(42, 85); }
    };
    const spawn = (b: BeeState, now: number) => {
      const left = Math.random() < 0.5, w = hw(b);
      b.x = left ? -w : geo.W + w; const bd = band(b, b.x); b.y = rnd(bd.lo, bd.hi); b.hd = (left ? 0 : Math.PI) + rnd(-0.4, 0.4);
      b.sp = 60; b.live = true; b.leaving = false; b.flip = Math.cos(b.hd) > 0; b.el.style.opacity = "1"; nextMode(b, now);
    };
    const leave = (b: BeeState) => { b.leaving = true; };

    const step = (b: BeeState, dt: number, now: number) => {
      if (!b.live) return;
      const t = now / 1000, w = hw(b), h = hh(b);
      if (now >= b.mt) nextMode(b, now);
      if (b.biasT && now > b.biasT) { b.bias = 0; b.biasT = 0; }
      let turn = b.bias + (Math.sin(t * b.f1 + b.ph) * 1.0 + Math.sin(t * b.f2 + b.ph * 2) * 0.6) * (b.mode === "pause" ? 0.5 : b.mode === "spiral" ? 0.15 : 1);
      let spT = b.spT;
      if (b.leaving) {                                             // head for the nearest edge and go out through it
        const out = b.x < geo.W / 2 ? Math.PI : 0;
        turn += angDiff(b.hd, out) * 4; spT = 80;
      } else {                                                     // soft keep-out around the caption: steer away and keep moving
        const mg = Math.max(w, h) + 8, l = geo.cap.l - mg, tp = geo.cap.t - mg, r = geo.cap.r + mg, bt = geo.cap.b + mg;
        const nx = clamp(b.x, l, r), ny = clamp(b.y, tp, bt), ddx = b.x - nx, ddy = b.y - ny, d = Math.hypot(ddx, ddy);
        if (d < 22) {
          const away = d === 0 ? Math.atan2(b.y - (tp + bt) / 2, b.x - (l + r) / 2) : Math.atan2(ddy, ddx), k = 1 - d / 22;
          turn += angDiff(b.hd, away) * 7 * k; spT = Math.max(spT, 60);
          if (d === 0) { b.x += Math.cos(away) * 90 * dt; b.y += Math.sin(away) * 90 * dt; }
        }
      }
      {                                                            // stay inside the flight zone: ease away from the limits ahead of time
        const ah = band(b, b.x + Math.cos(b.hd) * (b.sp * 0.5 + 10)), zone = Math.max(6, (ah.hi - ah.lo) * 0.3), dirX = Math.cos(b.hd) >= 0 ? 1 : -1;
        if (b.y > ah.hi - zone) turn += angDiff(b.hd, Math.atan2(-1, 1.2 * dirX)) * 7 * clamp((b.y - (ah.hi - zone)) / zone, 0, 1);
        else if (b.y < ah.lo + zone) turn += angDiff(b.hd, Math.atan2(1, 1.2 * dirX)) * 7 * clamp((ah.lo + zone - b.y) / zone, 0, 1);
      }
      b.hd += turn * dt;
      b.sp += (spT - b.sp) * (1 - Math.exp(-dt * (b.mode === "dart" ? 9 : 3)));
      const vx = Math.cos(b.hd) * b.sp, vy = Math.sin(b.hd) * b.sp + Math.sin(t * 3.1 + b.ph) * 9;   // a gentle bob on top of the heading
      b.x += vx * dt; b.y += vy * dt;
      {                                                            // last resort: mirror off the limit (heading reflected, position folded back in), so nothing is ever pinned to it
        const bd = band(b, b.x);
        if (b.y < bd.lo) { b.y = 2 * bd.lo - b.y; b.hd = -b.hd; } else if (b.y > bd.hi) { b.y = 2 * bd.hi - b.y; b.hd = -b.hd; }
        b.y = clamp(b.y, bd.lo, bd.hi);
      }
      if (b.leaving) { if (b.x < -w || b.x > geo.W + w || b.y < -h || b.y > geo.H + h) { b.live = false; b.el.style.opacity = "0"; return; } }
      else {                                                       // wrap sideways: out through one side, in through the other, velocity and heading untouched (never vertically: the grass is below, the card top above)
        const ww = geo.W + 2 * w;
        if (b.x > geo.W + w) b.x -= ww; else if (b.x < -w) b.x += ww;
        const bw = band(b, b.x); b.y = clamp(b.y, bw.lo, bw.hi);      // the wrap happens fully outside the card, so fitting y to the new column is invisible
      }
      if (Math.abs(vx) > 12) b.flip = vx > 0;                      // the artwork faces left
      const pitch = Math.atan2(vy, Math.max(Math.abs(vx), 20)) * (180 / Math.PI) * 0.45 * (vx > 0 ? 1 : -1);
      b.tilt += (clamp(pitch, -24, 24) - b.tilt) * (1 - Math.exp(-dt * 8));
      const bx = Math.sin(t * 31 + b.ph) * 0.7, by = Math.cos(t * 27 + b.ph) * 0.7;   // wing-beat buzz
      b.el.style.translate = `${(b.x - w + bx).toFixed(1)}px ${(b.y - h + by).toFixed(1)}px`;
      b.el.style.rotate = `${b.tilt.toFixed(1)}deg`;
      b.el.style.scale = b.flip ? "-1 1" : "1 1";
    };
    const frame = (nowMs: number) => {
      raf = 0;
      if (!visible || document.hidden) { last = 0; return; }
      const dt = last ? clamp((nowMs - last) / 1000, 0, 0.05) : 0.016; last = nowMs;
      bees.forEach(b => step(b, dt, nowMs));
      raf = requestAnimationFrame(frame);
    };
    const run = () => { if (!raf && visible && !document.hidden && bees.some(b => b.live)) raf = requestAnimationFrame(frame); };

    // second bee: an occasional visitor
    const scheduleSecond = () => later(() => {
      if (!visible || document.hidden) { scheduleSecond(); return; }
      measure(); sizeBees(); spawn(bees[1], performance.now()); run();
      later(() => { if (bees[1].live) leave(bees[1]); scheduleSecond(); }, rnd(BEES.secondStays[0], BEES.secondStays[1]));
    }, rnd(BEES.secondEvery[0], BEES.secondEvery[1]));

    const ro = new ResizeObserver(() => { measure(); sizeBees(); });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e && e.isIntersecting;
      el.toggleAttribute("data-active", visible);
      if (visible) {
        measure(); sizeBees();
        if (!started) { started = true; later(() => { measure(); sizeBees(); spawn(bees[0], performance.now()); run(); scheduleSecond(); }, BEES.firstDelay); }
        else run();
      } else if (raf) { cancelAnimationFrame(raf); raf = 0; last = 0; }
    }, { threshold: 0.3 });
    io.observe(el);
    const vis = () => { if (!document.hidden) { last = 0; run(); } };
    document.addEventListener("visibilitychange", vis);

    // ── the pointer ──
    const blade = (g: HTMLElement) => {
      const r = g.getBoundingClientRect();
      const d = (r.left + r.width / 2 - px) / r.width;             // > 0: the pointer is left of this blade cluster -> it leans right (clockwise)
      const near = Math.exp(-(d * d) / 0.5);                        // local: only the neighbours react
      const low = clamp((py - (r.top - 0.35 * r.height)) / (r.height * 1.35), 0, 1);   // a hand above the tips barely touches the grass
      g.style.setProperty("--bend", (clamp(d * 2.8, -1, 1) * near * low * MAX_BEND).toFixed(2));
    };
    const applyBend = () => { bendRaf = 0; el.querySelectorAll<HTMLElement>(".hm-gr-g").forEach(blade); };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;                        // touch keeps the page's gestures; wind only
      px = e.clientX; py = e.clientY; el.setAttribute("data-hover", "");
      if (!bendRaf) bendRaf = requestAnimationFrame(applyBend);
    };
    const out = () => {
      el.removeAttribute("data-hover");
      if (bendRaf) { cancelAnimationFrame(bendRaf); bendRaf = 0; }
      el.querySelectorAll<HTMLElement>(".hm-gr-g").forEach(g => g.style.setProperty("--bend", "0"));   // springs back through the CSS transition
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", out);

    return () => {
      ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", vis);
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", out);
      timers.forEach(clearTimeout); timers.clear();
      if (raf) cancelAnimationFrame(raf); if (bendRaf) cancelAnimationFrame(bendRaf);
    };
  }, []);

  return (
    <div ref={card} className="hm-hm-filler hm-gr-card">
      <span ref={cap} className="hm-gr-caption">Before the pixels,<br />there was grass.</span>
      <div className="hm-gr-grass" aria-hidden="true">
        {blades.map(g => (
          <div key={g.key} className="hm-gr-g"
            style={{ ["--gh" as string]: `${g.h.toFixed(1)}px`, ["--gp" as string]: g.img.padBottom, ["--gs" as string]: `${g.sink.toFixed(1)}px`, ["--gl" as string]: `${g.left.toFixed(1)}px`, ["--ga" as string]: `${g.amp.toFixed(2)}deg`, ["--gr" as string]: `${g.rot.toFixed(2)}deg`,
              ["--gd" as string]: `${g.dur.toFixed(2)}s`, ["--gdl" as string]: `${g.delay.toFixed(2)}s`, zIndex: g.z, aspectRatio: `${g.img.w} / ${g.img.h}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.img.src} alt="" width={g.img.w} height={g.img.h} draggable={false} data-asset={g.img.id} style={g.flip ? { transform: "scaleX(-1)" } : undefined} />
          </div>
        ))}
      </div>
      <div className="hm-gr-bees" aria-hidden="true">
        <div ref={bee1} className="hm-gr-bee">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BEE.src} alt="" width={BEE.w} height={BEE.h} draggable={false} data-asset="bee" />
        </div>
        <div ref={bee2} className="hm-gr-bee">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BEE.src} alt="" width={BEE.w} height={BEE.h} draggable={false} data-asset="bee" />
        </div>
      </div>
    </div>
  );
}
