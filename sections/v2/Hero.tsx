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
// Inspired by Nothing Phone Glyph Matrix + starfield.
// All state lives in refs — zero React re-renders during animation.
//
// Responsive height:
//   container < 480 px  →  1:1  (square, fills phone width)
//   container < 700 px  →  4:3  (tablet)
//   container ≥ 700 px  →  260 px fixed (desktop wide-band)
//
// Interactions:
//   • Cursor moves over grid  → radial glow follows pointer
//   • Click / tap             → expanding ring burst from impact point
//   • Idle                    → slow sinusoidal twinkle per dot + random sparks

const CELL       = 13;   // px, center-to-center spacing
const DOT_R      = 3;    // px, dot radius  (diameter = 6 px)
const CURSOR_R   = 90;   // px, cursor glow radius
const BURST_DUR  = 700;  // ms, burst lifetime
const BURST_MAX  = 200;  // px, max ring radius at end of burst

function gridHeight(w: number): number {
  if (w < 480) return w;
  if (w < 700) return Math.round(w * 0.75);
  return 260;
}

type Dot = {
  base:  number;  // resting brightness    0.04–0.14
  amp:   number;  // oscillation amplitude  0.02–0.08
  phase: number;  // initial phase          0–2π
  freq:  number;  // oscillation Hz         0.12–0.62
  spk:   number;  // spark peak opacity (0 = inactive)
  spkT:  number;  // timestamp when spark started (-1 = none)
  spkD:  number;  // spark duration ms
};

type Burst = { x: number; y: number; t0: number };

const makeDot = (): Dot => ({
  base:  0.04 + Math.random() * 0.10,
  amp:   0.02 + Math.random() * 0.07,
  phase: Math.random() * Math.PI * 2,
  freq:  0.12 + Math.random() * 0.50,
  spk: 0, spkT: -1, spkD: 400,
});

function DotMatrix() {
  const wrapRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const colsRef    = useRef(0);
  const rowsRef    = useRef(0);
  const dotsRef    = useRef<Dot[]>([]);
  const curRef     = useRef({ x: -1, y: -1, on: false });
  const burstsRef  = useRef<Burst[]>([]);
  const nextSpkRef = useRef(0); // rAF timestamp for next spark batch

  // Measure container → set canvas size → rebuild dot array
  const resize = useCallback(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const w   = wrap.offsetWidth;
    const h   = gridHeight(w);
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
  }, []);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  // rAF animation loop — reads all state from refs, never triggers re-renders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let rafId: number;

    const draw = (ts: number) => {
      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const dots = dotsRef.current;
      if (!cols || !rows) { rafId = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Random spark bursts (galaxy twinkle events)
      if (ts >= nextSpkRef.current) {
        nextSpkRef.current = ts + 250 + Math.random() * 700;
        const n = 2 + Math.floor(Math.random() * 5);
        for (let s = 0; s < n; s++) {
          const idx = Math.floor(Math.random() * dots.length);
          dots[idx].spk  = 0.45 + Math.random() * 0.50;   // peak opacity 0.45–0.95
          dots[idx].spkT = ts;
          dots[idx].spkD = 250 + Math.random() * 550;
        }
      }

      // ── Cull expired bursts
      burstsRef.current = burstsRef.current.filter(b => ts - b.t0 < BURST_DUR);

      const cur = curRef.current;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i  = r * cols + c;
          if (i >= dots.length) continue;
          const d  = dots[i];

          // CSS-pixel center of this dot
          const px = (c + 0.5) * CELL;
          const py = (r + 0.5) * CELL;

          // Continuous galaxy oscillation (unique phase + freq per dot)
          const osc = d.base + d.amp * (Math.sin(d.phase + (ts / 1000) * d.freq * Math.PI * 2) * 0.5 + 0.5);

          // Spark: fast rise (10% of dur) → slow decay
          let spark = 0;
          if (d.spkT >= 0) {
            const age = ts - d.spkT;
            if (age < d.spkD) {
              const p = age / d.spkD;
              spark = d.spk * (p < 0.1 ? p / 0.1 : 1 - (p - 0.1) / 0.9);
            } else {
              d.spkT = -1;
            }
          }

          // Cursor glow — quadratic falloff inside CURSOR_R
          let cGlow = 0;
          if (cur.on) {
            const dist = Math.hypot(px - cur.x, py - cur.y);
            if (dist < CURSOR_R) cGlow = Math.pow(1 - dist / CURSOR_R, 1.6) * 0.82;
          }

          // Burst ring — expands outward, ring widens, fades with progress
          let bGlow = 0;
          for (const b of burstsRef.current) {
            const age  = ts - b.t0;
            const prog = age / BURST_DUR;                     // 0 → 1
            const ring = prog * BURST_MAX;                    // expanding radius
            const rw   = 28 + prog * 24;                      // ring width grows
            const dist = Math.hypot(px - b.x, py - b.y);
            const dRing = Math.abs(dist - ring);
            if (dRing < rw) {
              bGlow = Math.max(bGlow, (1 - dRing / rw) * Math.pow(1 - prog, 0.55) * 0.95);
            }
          }

          const alpha = Math.min(1, osc + spark + cGlow + bGlow);
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

  // ── Interaction handlers
  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current!.getBoundingClientRect();
    curRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, on: true };
  }, []);

  const onMouseLeave = useCallback(() => {
    curRef.current = { x: -1, y: -1, on: false };
  }, []);

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

  const onTouchEnd = useCallback(() => {
    curRef.current = { x: -1, y: -1, on: false };
  }, []);

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
            <div className="f16" style={{ fontWeight: 500, color: C.t1, letterSpacing: "0.01em" }}>
              Ritam Biswas
            </div>
            <div className="f16" style={{ fontWeight: 400, color: C.t2 }}>
              Product &amp; UX/UI Designer
            </div>
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
