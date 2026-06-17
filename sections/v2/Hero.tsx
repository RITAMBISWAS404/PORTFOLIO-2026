"use client";
import { useRef, useState, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle, Handshake, Calendar, Smartphone, Network } from "lucide-react";
import { C, tagStyle, tagHv } from "@/lib/tokensV2";
import { useAppReady } from "@/lib/AppReadyContext";

// ── Stagger entry animation ──────────────────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ── Avatar (parallax tilt + easter egg) ─────────────────────────────────────
function Avatar() {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sRx = useSpring(rx, { stiffness: 160, damping: 22 });
  const sRy = useSpring(ry, { stiffness: 160, damping: 22 });
  const transform = useTransform(
    [sRx, sRy], ([x, y]) => `perspective(400px) rotateX(${y}deg) rotateY(${x}deg)`,
  );
  const [egg, setEgg] = useState(false);
  const move = (e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    rx.set(((e.clientX - r.left) / r.width - 0.5) * 12);
    ry.set(-((e.clientY - r.top) / r.height - 0.5) * 12);
  };
  const leave = () => { rx.set(0); ry.set(0); setEgg(false); };
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave} onMouseEnter={() => setEgg(true)}
      style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <motion.div style={{ width: 56, height: 56, borderRadius: 14, overflow: "hidden", transform }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "conic-gradient(from 0deg, #20d455, #4488ff, #ff2626, #ffc200, #20d455)",
          filter: "blur(8px)",
          animation: "aura 10s linear infinite",
        }} />
        <img
          src={egg ? "/images/happy-catto.gif" : "/images/avatar.png"}
          alt="Ritam Biswas"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 14 }}
        />
      </motion.div>
    </div>
  );
}

// ── Dot-matrix grid ──────────────────────────────────────────────────────────
// Inspired by Nothing Phone's Glyph Matrix: a dense monochrome dot field
// where a deliberate shape glows at full brightness while surrounding dots
// fade out at base opacity. Single color (text-1), varying opacity only.
//
// To swap in a different glyph, pass your own `shape` prop:
//   <DotMatrix shape={MY_SHAPE} />
// where MY_SHAPE is [row, col][] with row 0 = top, col 0 = left.
// You never need to touch layout code — only the coordinate bitmap changes.

const CELL = 10;   // px, center-to-center spacing (dot + gap)
const DOT  = 3;    // px, dot diameter
const ROWS = 26;
const COLS = 72;   // 72 × 10 = 720 px — fills the 768 column after 24 px padding each side

// Default glyph: a plus/cross centered at (row 12, col 36).
const CR = 12, CC = 36;
const DEFAULT_SHAPE: [number, number][] = [
  // vertical arm — 11 dots tall
  ...Array.from({ length: 11 }, (_, i): [number, number] => [CR - 5 + i, CC]),
  // horizontal arm — 10 dots (center already covered by vertical)
  ...[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map(dc => [CR, CC + dc] as [number, number]),
];

function buildBrightnessMap(
  shape: [number, number][],
  rows: number,
  cols: number,
  glowRadius = 5,
): Float32Array {
  const map = new Float32Array(rows * cols);
  const shapeSet = new Set(shape.map(([r, c]) => r * cols + c));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (shapeSet.has(idx)) { map[idx] = 1.0; continue; }
      let minDist = Infinity;
      for (const [sr, sc] of shape) {
        const d = Math.sqrt((r - sr) ** 2 + (c - sc) ** 2);
        if (d < minDist) minDist = d;
      }
      if (minDist < glowRadius) {
        map[idx] = (1 - minDist / glowRadius) * 0.45;
      }
    }
  }
  return map;
}

function DotMatrix({ shape = DEFAULT_SHAPE }: { shape?: [number, number][] }) {
  const brightness = useMemo(() => buildBrightnessMap(shape, ROWS, COLS), [shape]);
  return (
    <div style={{ overflow: "hidden", width: "100%", borderRadius: 8 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`,
        width: COLS * CELL,
      }}>
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const g = brightness[i];
          return (
            <div key={i} style={{ width: CELL, height: CELL, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: DOT, height: DOT, borderRadius: "50%",
                backgroundColor: "var(--color-text-1)",
                opacity: 0.1 + g * 0.7,
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Hero section ─────────────────────────────────────────────────────────────
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

        {/* Dot-matrix */}
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
