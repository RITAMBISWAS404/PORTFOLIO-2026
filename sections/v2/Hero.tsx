"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle, Handshake, Calendar, Smartphone, Network } from "lucide-react";
import { C, tagStyle, tagHv } from "@/lib/tokensV2";
import { useAppReady } from "@/lib/AppReadyContext";

// ── Entry animation ──────────────────────────────────────────────────────────
const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar() {
  const ref = useRef<HTMLDivElement>(null);
  const rx  = useMotionValue(0);
  const ry  = useMotionValue(0);
  const sRx = useSpring(rx, { stiffness: 160, damping: 22 });
  const sRy = useSpring(ry, { stiffness: 160, damping: 22 });
  const transform = useTransform(
    [sRx, sRy], ([x, y]) => `perspective(400px) rotateX(${y}deg) rotateY(${x}deg)`,
  );
  const [egg, setEgg] = useState(false);
  const move  = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    rx.set(((e.clientX - r.left) / r.width  - 0.5) * 12);
    ry.set(-((e.clientY - r.top)  / r.height - 0.5) * 12);
  };
  const leave = () => { rx.set(0); ry.set(0); setEgg(false); };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} onMouseEnter={() => setEgg(true)}
      style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <motion.div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", transform }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "conic-gradient(from 0deg, #20d455, #4488ff, #ff2626, #ffc200, #20d455)",
          filter: "blur(8px)", animation: "aura 10s linear infinite",
        }} />
        <img src={egg ? "/images/happy-catto.gif" : "/images/avatar.png"} alt="Ritam Biswas"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }} />
      </motion.div>
    </div>
  );
}

// ── Galaxy dot-matrix (canvas) ───────────────────────────────────────────────
// Canvas-based, all animation state in refs → zero React re-renders during animation.
//
// Responsive height:
//   container < 480 px  →  1:1 square   (phone, fills full width)
//   container < 700 px  →  4:3           (tablet)
//   container ≥ 700 px  →  260 px fixed  (desktop wide-band)
//
// Idle animations (spontaneous, no interaction needed):
//   1. Random sparks         — 2-6 dots flash bright every 250-950 ms
//   2. Shooting star         — diagonal streak with bright head + fading trail (every 4-8 s)
//   3. Supernova             — single dot erupts then glow expands outward (every 8-14 s)
//   4. Ripple wave           — soft concentric ring from random point (every 3-7 s)
//   5. Nebula pulse          — cloud of ~40 nearby dots brightens together (every 5-10 s)
//   6. Constellation         — cluster of 5-10 dots flash sequentially (every 4-8 s)
//
// Interactions:
//   • Mouse / touch move     → radial glow follows pointer (CURSOR_R radius)
//   • Click / tap            → hard burst ring from impact point

const CELL      = 13;   // px, center-to-center spacing
const DOT_R     = 3;    // px, dot radius (diameter = 6 px)
const CURSOR_R  = 90;   // px, cursor glow radius
const BURST_DUR = 700;  // ms, click-burst lifetime
const BURST_MAX = 200;  // px, click-burst max ring radius

function gridHeight(w: number): number {
  if (w < 480) return w;
  if (w < 700) return Math.round(w * 0.75);
  return 260;
}

// Per-dot oscillation state
type Dot = {
  base:  number;   // resting brightness  0.04–0.14
  amp:   number;   // oscillation amp     0.02–0.09
  phase: number;   // initial phase       0–2π
  freq:  number;   // oscillation Hz      0.12–0.62
  spk:   number;   // spark peak opacity
  spkT:  number;   // spark start timestamp (-1 = inactive)
  spkD:  number;   // spark duration ms
};

// Spontaneous animation event types
type Burst      = { x: number; y: number; t0: number };
type ShootStar  = { x: number; y: number; dx: number; dy: number; spd: number; trail: number; peak: number; t0: number; dur: number };
type Supernova  = { x: number; y: number; maxR: number; peak: number; t0: number; dur: number };
type Ripple     = { x: number; y: number; maxR: number; peak: number; t0: number; dur: number };
type Nebula     = { x: number; y: number; r: number; peak: number; t0: number; dur: number };
// Constellation uses a Map<dotIndex, delayMs> for O(1) per-dot lookup
type Constell   = { stars: Map<number, number>; t0: number; spkD: number; totalD: number };

const makeDot = (): Dot => ({
  base:  0.04 + Math.random() * 0.10,
  amp:   0.02 + Math.random() * 0.07,
  phase: Math.random() * Math.PI * 2,
  freq:  0.12 + Math.random() * 0.50,
  spk: 0, spkT: -1, spkD: 400,
});

// Generic cull helper — removes events whose lifetime has elapsed
const cull = <T extends { t0: number; dur: number }>(arr: T[], ts: number): T[] =>
  arr.filter(e => ts - e.t0 < e.dur);

function DotMatrix() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const colsRef    = useRef(0);
  const rowsRef    = useRef(0);
  const dotsRef    = useRef<Dot[]>([]);
  const curRef     = useRef({ x: -1, y: -1, on: false });

  // Active animation event pools
  const burstsRef  = useRef<Burst[]>([]);
  const starsRef   = useRef<ShootStar[]>([]);
  const novasRef   = useRef<Supernova[]>([]);
  const ripsRef    = useRef<Ripple[]>([]);
  const nebsRef    = useRef<Nebula[]>([]);
  const constsRef  = useRef<Constell[]>([]);

  // Next-trigger timestamps (set to Infinity; first frame initialises them)
  const nextSpkRef  = useRef(0);         // existing random sparks — fire immediately
  const nextStarRef = useRef(Infinity);
  const nextNovaRef = useRef(Infinity);
  const nextRipRef  = useRef(Infinity);
  const nextNebRef  = useRef(Infinity);
  const nextConRef  = useRef(Infinity);

  // Measure container → set canvas size → rebuild dot array
  const resize = useCallback(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const w = wrap.offsetWidth, h = gridHeight(w);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width        = Math.round(w * dpr);
    canvas.height       = Math.round(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    const cols = Math.max(1, Math.floor(w / CELL));
    const rows = Math.max(1, Math.floor(h / CELL));
    colsRef.current = cols;
    rowsRef.current = rows;
    dotsRef.current = Array.from({ length: cols * rows }, makeDot);
    // Clear positional events on resize (stale canvas coords)
    starsRef.current = []; novasRef.current = []; ripsRef.current = [];
    nebsRef.current  = []; constsRef.current = [];
  }, []);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  // rAF loop — reads everything from refs, no React state touched
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let rafId: number;
    let firstFrame = true;

    const draw = (ts: number) => {
      // ── Stagger new-animation timers on first frame
      if (firstFrame) {
        firstFrame = false;
        nextStarRef.current = ts + 3000 + Math.random() * 2000;
        nextNovaRef.current = ts + 7000 + Math.random() * 4000;
        nextRipRef.current  = ts + 1800 + Math.random() * 1500;
        nextNebRef.current  = ts + 4000 + Math.random() * 2500;
        nextConRef.current  = ts + 2500 + Math.random() * 2000;
      }

      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const dots = dotsRef.current;
      if (!cols || !rows) { rafId = requestAnimationFrame(draw); return; }

      const W = cols * CELL, H = rows * CELL;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── 1. Random sparks ────────────────────────────────────────────────────
      if (ts >= nextSpkRef.current) {
        nextSpkRef.current = ts + 250 + Math.random() * 700;
        const n = 2 + Math.floor(Math.random() * 5);
        for (let s = 0; s < n; s++) {
          const idx = Math.floor(Math.random() * dots.length);
          dots[idx].spk  = 0.45 + Math.random() * 0.50;
          dots[idx].spkT = ts;
          dots[idx].spkD = 250 + Math.random() * 550;
        }
      }

      // ── 2. Shooting star ────────────────────────────────────────────────────
      if (ts >= nextStarRef.current) {
        nextStarRef.current = ts + 4000 + Math.random() * 4000;
        // Diagonal downward: angle between π/4 (↘) and 3π/4 (↙)
        const angle = Math.PI * 0.25 + Math.random() * Math.PI * 0.5;
        const dx    = Math.cos(angle);
        const dy    = Math.sin(angle); // always > 0 (downward)
        const spd   = 0.22 + Math.random() * 0.18;  // px/ms
        const trail = 55 + Math.random() * 55;       // px
        starsRef.current.push({
          x: Math.random() * W, y: -trail - 10,
          dx, dy, spd, trail,
          peak: 0.75 + Math.random() * 0.20,
          t0:  ts,
          dur: (H + trail * 2) / (spd * Math.max(0.15, dy)) + 400,
        });
      }

      // ── 3. Supernova ─────────────────────────────────────────────────────────
      if (ts >= nextNovaRef.current) {
        nextNovaRef.current = ts + 8000 + Math.random() * 6000;
        novasRef.current.push({
          x:    CELL + Math.random() * (W - CELL * 2),
          y:    CELL + Math.random() * (H - CELL * 2),
          maxR: 50 + Math.random() * 40,
          peak: 0.80 + Math.random() * 0.18,
          t0: ts, dur: 1400 + Math.random() * 600,
        });
      }

      // ── 4. Ripple wave ───────────────────────────────────────────────────────
      if (ts >= nextRipRef.current) {
        nextRipRef.current = ts + 3000 + Math.random() * 4000;
        ripsRef.current.push({
          x:    Math.random() * W,
          y:    Math.random() * H,
          maxR: 100 + Math.random() * 80,
          peak: 0.30 + Math.random() * 0.18,
          t0: ts, dur: 1400 + Math.random() * 600,
        });
      }

      // ── 5. Nebula pulse ──────────────────────────────────────────────────────
      if (ts >= nextNebRef.current) {
        nextNebRef.current = ts + 5000 + Math.random() * 5000;
        nebsRef.current.push({
          x:    CELL * 2 + Math.random() * (W - CELL * 4),
          y:    CELL * 2 + Math.random() * (H - CELL * 4),
          r:    45 + Math.random() * 40,
          peak: 0.38 + Math.random() * 0.22,
          t0: ts, dur: 1600 + Math.random() * 800,
        });
      }

      // ── 6. Constellation flash ───────────────────────────────────────────────
      if (ts >= nextConRef.current) {
        nextConRef.current = ts + 4000 + Math.random() * 4000;
        const cc  = 2 + Math.floor(Math.random() * Math.max(1, cols - 4));
        const cr  = 2 + Math.floor(Math.random() * Math.max(1, rows - 4));
        const rad = 3 + Math.floor(Math.random() * 4);
        const n   = 5 + Math.floor(Math.random() * 6);
        const cands: Array<[number, number]> = [];
        for (let dr = -rad; dr <= rad; dr++) {
          for (let dc = -rad; dc <= rad; dc++) {
            const r2 = cr + dr, c2 = cc + dc;
            if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) continue;
            if (Math.hypot(dr, dc) > rad) continue;
            cands.push([r2, c2]);
          }
        }
        // Fisher-Yates shuffle
        for (let k = cands.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [cands[k], cands[j]] = [cands[j], cands[k]];
        }
        const spkD = 450 + Math.random() * 300;
        const picked = cands.slice(0, Math.min(n, cands.length));
        const starMap = new Map<number, number>();
        picked.forEach(([r2, c2], idx) => starMap.set(r2 * cols + c2, idx * 90));
        constsRef.current.push({
          starMap, t0: ts, spkD,
          totalD: picked.length * 90 + spkD + 200,
        });
      }

      // ── Cull expired events
      starsRef.current  = cull(starsRef.current,  ts);
      novasRef.current  = cull(novasRef.current,  ts);
      ripsRef.current   = cull(ripsRef.current,   ts);
      nebsRef.current   = cull(nebsRef.current,   ts);
      burstsRef.current = burstsRef.current.filter(b => ts - b.t0 < BURST_DUR);
      constsRef.current = constsRef.current.filter(c => ts - c.t0 < c.totalD);

      const cur = curRef.current;

      // ── Draw every dot ───────────────────────────────────────────────────────
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i  = r * cols + c;
          if (i >= dots.length) continue;
          const d  = dots[i];
          const px = (c + 0.5) * CELL;   // CSS-pixel center
          const py = (r + 0.5) * CELL;

          // Continuous sinusoidal galaxy oscillation
          const osc = d.base + d.amp * (Math.sin(d.phase + (ts / 1000) * d.freq * Math.PI * 2) * 0.5 + 0.5);

          // Random spark: fast rise (10%) → slow decay
          let spark = 0;
          if (d.spkT >= 0) {
            const age = ts - d.spkT;
            if (age < d.spkD) {
              const p = age / d.spkD;
              spark = d.spk * (p < 0.1 ? p / 0.1 : 1 - (p - 0.1) / 0.9);
            } else { d.spkT = -1; }
          }

          // Cursor glow
          let cGlow = 0;
          if (cur.on) {
            const dist = Math.hypot(px - cur.x, py - cur.y);
            if (dist < CURSOR_R) cGlow = Math.pow(1 - dist / CURSOR_R, 1.6) * 0.82;
          }

          // All spontaneous + click effects accumulate here
          let extra = 0;

          // Click / tap burst ring
          for (const b of burstsRef.current) {
            const prog  = (ts - b.t0) / BURST_DUR;
            const ring  = prog * BURST_MAX;
            const rw    = 28 + prog * 24;
            const dRing = Math.abs(Math.hypot(px - b.x, py - b.y) - ring);
            if (dRing < rw)
              extra = Math.max(extra, (1 - dRing / rw) * Math.pow(1 - prog, 0.55) * 0.95);
          }

          // Shooting star — bright head with fading trail
          for (const s of starsRef.current) {
            const age   = ts - s.t0;
            const headX = s.x + s.dx * s.spd * age;
            const headY = s.y + s.dy * s.spd * age;
            // Project onto trail axis (head = 0, tail-end = trail)
            const toX   = px - headX, toY = py - headY;
            const along = -(toX * s.dx + toY * s.dy);
            if (along >= 0 && along <= s.trail) {
              const perpX = toX + s.dx * along, perpY = toY + s.dy * along;
              const perp  = Math.hypot(perpX, perpY);
              if (perp < CELL * 0.9)
                extra = Math.max(extra,
                  (1 - along / s.trail) * (1 - perp / (CELL * 0.9)) * s.peak);
            }
          }

          // Supernova — single bright dot that expands into a soft glow
          for (const n of novasRef.current) {
            const prog  = (ts - n.t0) / n.dur;
            const curR  = Math.min(1, prog / 0.15) * n.maxR;  // expands quickly then holds
            const fade  = prog < 0.5 ? 1 : 1 - (prog - 0.5) / 0.5;
            const dist  = Math.hypot(px - n.x, py - n.y);
            if (dist < curR)
              extra = Math.max(extra, Math.pow(1 - dist / curR, 0.55) * fade * n.peak);
          }

          // Ripple wave — gentle expanding ring from a random point
          for (const rp of ripsRef.current) {
            const prog  = (ts - rp.t0) / rp.dur;
            const ring  = prog * rp.maxR;
            const rw    = 18 + prog * 14;
            const dRing = Math.abs(Math.hypot(px - rp.x, py - rp.y) - ring);
            if (dRing < rw)
              extra = Math.max(extra, (1 - dRing / rw) * Math.pow(1 - prog, 0.7) * rp.peak);
          }

          // Nebula pulse — cloud of dots brightening together
          for (const nb of nebsRef.current) {
            const prog = (ts - nb.t0) / nb.dur;
            const env  = prog < 0.3 ? prog / 0.3 : prog < 0.7 ? 1 : 1 - (prog - 0.7) / 0.3;
            const dist = Math.hypot(px - nb.x, py - nb.y);
            if (dist < nb.r)
              extra = Math.max(extra, Math.pow(1 - dist / nb.r, 0.65) * env * nb.peak);
          }

          // Constellation — sequential dot flashing within a local cluster
          for (const con of constsRef.current) {
            const delay = con.starMap.get(i);
            if (delay !== undefined) {
              const starAge = ts - con.t0 - delay;
              if (starAge > 0 && starAge < con.spkD) {
                const p = starAge / con.spkD;
                extra = Math.max(extra, (p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8) * 0.88);
              }
            }
          }

          const alpha = Math.min(1, osc + spark + cGlow + extra);
          ctx.beginPath();
          ctx.arc(px * dpr, py * dpr, DOT_R * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── Interaction handlers ─────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current!.getBoundingClientRect();
    curRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, on: true };
  }, []);
  const onMouseLeave = useCallback(() => { curRef.current = { x: -1, y: -1, on: false }; }, []);

  const addBurst = useCallback((x: number, y: number) => {
    burstsRef.current.push({ x, y, t0: performance.now() });
  }, []);

  const onClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current!.getBoundingClientRect();
    addBurst(e.clientX - r.left, e.clientY - r.top);
  }, [addBurst]);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const t = e.touches[0];
    addBurst(t.clientX - r.left, t.clientY - r.top);
  }, [addBurst]);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const t = e.touches[0];
    curRef.current = { x: t.clientX - r.left, y: t.clientY - r.top, on: true };
  }, []);

  const onTouchEnd = useCallback(() => { curRef.current = { x: -1, y: -1, on: false }; }, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ width: "100%", borderRadius: 12, overflow: "hidden", cursor: "crosshair", touchAction: "none" }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const { ready } = useAppReady();
  return (
    <section id="hero" style={{ maxWidth: 768, margin: "0 auto", padding: "32px 24px 0" }}>
      <motion.div
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        {/* Identity */}
        <motion.div variants={item} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar />
          <div>
            <div className="f16" style={{ fontWeight: 500, color: C.t1, letterSpacing: "0.01em" }}>Ritam Biswas</div>
            <div className="f16" style={{ fontWeight: 400, color: C.t2 }}>Product &amp; UX/UI Designer</div>
          </div>
        </motion.div>

        {/* Galaxy dot-matrix */}
        <motion.div variants={item}>
          <DotMatrix />
        </motion.div>

        {/* Badges */}
        <motion.div variants={item} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "OPEN TO COLLABORATIONS", icon: <Handshake  size={12} color={C.accent} strokeWidth={2} /> },
            { label: "2+ YEARS EXP",           icon: <Calendar   size={12} color={C.yellow} strokeWidth={2} /> },
            { label: "MOBILE + WEB UX",        icon: <Smartphone size={12} color={C.blue}   strokeWidth={2} /> },
            { label: "SYSTEMS THINKING",       icon: <Network    size={12} color={C.red}     strokeWidth={2} /> },
          ].map(b => (
            <div key={b.label} style={tagStyle}
              onMouseEnter={e => tagHv(e, true)} onMouseLeave={e => tagHv(e, false)}>
              {b.icon} {b.label}
            </div>
          ))}
        </motion.div>

        {/* Copy */}
        <motion.div variants={item} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p className="f16" style={{ fontWeight: 600, color: C.t1, lineHeight: 1.4 }}>
            Complex data doesn&apos;t have to feel complex.
          </p>
          <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6 }}>
            I turn information-heavy products into clean, minimal experiences. 2+ years building
            for startups, most recently a Copenhagen-based EV energy company.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="btn-row">
          <a href="#projects" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: C.t1, color: C.bg, padding: "11px 22px",
            borderRadius: 9999, fontSize: 14, fontWeight: 500, textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s, box-shadow 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.9"; a.style.transform = "translateY(-2px)"; a.style.boxShadow = "0 4px 16px rgba(0,0,0,0.6)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; a.style.boxShadow = ""; }}>
            <ArrowRight size={14} strokeWidth={2} /> View my Work
          </a>
          <a href="#contact" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.05)", color: C.t1, padding: "11px 22px",
            borderRadius: 9999, fontSize: 14, fontWeight: 500, textDecoration: "none",
            transition: "background 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(255,255,255,0.09)"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(255,255,255,0.05)"; a.style.transform = ""; }}>
            <MessageCircle size={14} strokeWidth={2} /> Let&apos;s Talk
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
