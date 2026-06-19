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
      <motion.div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", transform }}>
        <div style={{ position: "absolute", inset: 0, background: "#ffffff" }} />
        <img src={egg ? "/images/happy-catto.gif" : "/images/avatar.png"} alt="Ritam Biswas"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
      </motion.div>
    </div>
  );
}

// ── Galaxy dot-matrix (canvas) ───────────────────────────────────────────────
// All animation state lives in refs — zero React re-renders per frame.
//
// Responsive height:
//   container < 700 px  →  4:3 aspect ratio  (mobile + tablet)
//   container ≥ 700 px  →  260 px fixed       (desktop)
//
// Effects:
//   Sinusoidal twinkle  — each dot oscillates independently (always on)
//   Sparks              — 1-4 random dots flash every 400-1200 ms (subtle)
//   Cursor glow         — radial brightness follows pointer (90 px radius)
//   Click / tap burst   — expanding ring from impact point

const CELL      = 12;
const DOT_R     = 4;    // radius → diameter = 8 px
const TRAIL_R   = 20;   // brush radius — 2×2 dot thickness
const TRAIL_DUR = 2200; // ms until a trail dot fully fades
const BURST_DUR = 700;
const BURST_MAX = 200;

function gridHeight(w: number): number {
  if (w < 700) return Math.round(w * 0.75);  // mobile + tablet: 4:3
  return 260;                                 // desktop: fixed
}

type Dot       = { base: number; amp: number; phase: number; freq: number; spk: number; spkT: number; spkD: number };
type Burst     = { x: number; y: number; t0: number };
type ShootStar = { x: number; y: number; dx: number; dy: number; spd: number; trail: number; peak: number; t0: number; dur: number };
type Ripple    = { x: number; y: number; maxR: number; peak: number; t0: number; dur: number };
type BoomStamp = { dots: Set<number>; t0: number };

const cull = <T extends { t0: number; dur: number }>(arr: T[], ts: number): T[] =>
  arr.filter(e => ts - e.t0 < e.dur);

// ── LED ticker ────────────────────────────────────────────────────────────────
type TickerState = {
  bitmap: boolean[][]; width: number;
  startRow: number; charH: number;
  startTs: number; speed: number; peak: number;
};

// 3×5 — mobile
const FONT3x5: Record<string, number[][]> = {
  H: [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  E: [[1,1,1],[1,0,0],[1,1,1],[1,0,0],[1,1,1]],
  L: [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
  O: [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  D: [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
  R: [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  A: [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
  W: [[1,0,1],[1,0,1],[1,1,1],[1,1,1],[1,0,1]],
  Y: [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
  I: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  S: [[0,1,1],[1,0,0],[0,1,0],[0,0,1],[1,1,0]],
  T: [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
  G: [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
  N: [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  V: [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[0,1,0]],
  B: [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
  C: [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
  M: [[1,0,1],[1,1,1],[1,0,1],[1,0,1],[1,0,1]],
  U: [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
  P: [[1,1,0],[1,0,1],[1,1,0],[1,0,0],[1,0,0]],
  X: [[1,0,1],[1,0,1],[0,1,0],[1,0,1],[1,0,1]],
  F: [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
  K: [[1,0,1],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
  "!": [[0,1,0],[0,1,0],[0,1,0],[0,0,0],[0,1,0]],
  ",": [[0,0,0],[0,0,0],[0,0,0],[0,1,0],[1,0,0]],
  ".": [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,1,0]],
  "?": [[0,1,1],[0,0,1],[0,1,0],[0,0,0],[0,1,0]],
  "'": [[0,1,0],[0,1,0],[0,0,0],[0,0,0],[0,0,0]],
};
// 5×7 — desktop
const FONT5x7: Record<string, number[][]> = {
  H: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  E: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  L: [[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]],
  O: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  D: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  R: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  A: [[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
  W: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,0,1,0,1],[1,1,0,1,1],[0,1,0,1,0]],
  Y: [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  I: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[1,1,1,1,1]],
  S: [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]],
  T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  G: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  N: [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  V: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0]],
  B: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0]],
  C: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,1],[0,1,1,1,0]],
  M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  U: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
  P: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  X: [[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1],[1,0,0,0,1]],
  F: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0]],
  K: [[1,0,0,0,1],[1,0,0,1,0],[1,0,1,0,0],[1,1,0,0,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
  "!": [[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
  ",": [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,1,0,0,0]],
  ".": [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0]],
  "?": [[0,1,1,1,0],[1,0,0,0,1],[0,0,0,0,1],[0,0,1,1,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0]],
  "'": [[0,0,1,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]],
};

function buildTickerBitmap(
  text: string, font: Record<string, number[][]>,
  charW: number, charH: number, charGap: number, spaceW: number,
): { bitmap: boolean[][]; width: number } {
  const segs: boolean[][] = []; // segs[col][row]
  const blank = (): boolean[] => new Array(charH).fill(false);
  for (const ch of text.toUpperCase()) {
    if (ch === " ") { for (let i = 0; i < spaceW; i++) segs.push(blank()); continue; }
    const glyph = font[ch];
    if (!glyph)    { for (let i = 0; i < charGap;  i++) segs.push(blank()); continue; }
    for (let c = 0; c < charW; c++) segs.push(glyph.map(row => !!row[c]));
    for (let g = 0; g < charGap;  g++) segs.push(blank());
  }
  const width = segs.length;
  const bitmap: boolean[][] = Array.from({ length: charH }, (_, r) => segs.map(col => col[r]));
  return { bitmap, width };
}

// ── Boom words — add more here as needed ─────────────────────────────────────
const BOOM_WORDS = [
  "!!BOOM!!",
  "!KABOOM!",
  "!!BAM!!",
  "POW!",
  "!!BLAM!!",
] as const;

// ── Ticker phrases — add more here as needed ──────────────────────────────────
const TICKER_PHRASES = [
  "PIXEL PERFECT. EGO ALSO PERFECT.",
  "IT'S NOT A BUG, IT'S MY LAYOUT.",
  "TRUST THE PROCESS. ALSO TRUST ME.",
  "DESIGNED WITH LOVE. SHIPPED WITH ANXIETY.",
  "WAIT, I'M MOVING PIXELS RIGHT NOW.",
] as const;

function pickPhrase(): string {
  const last = sessionStorage.getItem("ticker_last") ?? "";
  let idx = Math.floor(Math.random() * TICKER_PHRASES.length);
  if (TICKER_PHRASES[idx] === last && TICKER_PHRASES.length > 1) {
    idx = (idx + 1) % TICKER_PHRASES.length;
  }
  const phrase = TICKER_PHRASES[idx];
  sessionStorage.setItem("ticker_last", phrase);
  return phrase;
}

const makeDot = (): Dot => ({
  base:  0.02 + Math.random() * 0.04,
  amp:   0.02 + Math.random() * 0.06,
  phase: Math.random() * Math.PI * 2,
  freq:  0.12 + Math.random() * 0.50,
  spk: 0, spkT: -1, spkD: 400,
});

function DotMatrix() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colsRef  = useRef(0);
  const rowsRef  = useRef(0);
  const cellWRef = useRef(CELL); // actual horizontal spacing — stretches to fill width
  const cellHRef = useRef(CELL); // actual vertical spacing   — stretches to fill height
  const dotsRef     = useRef<Dot[]>([]);
  const trailRef    = useRef<Map<number, { t0: number; peak: number }>>(new Map());
  const burstsRef  = useRef<Burst[]>([]);
  const starsRef   = useRef<ShootStar[]>([]);
  const ripsRef    = useRef<Ripple[]>([]);
  const nextSpkRef  = useRef(0);
  const nextStarRef = useRef(Infinity);
  const nextRipRef  = useRef(Infinity);
  const tickerRef = useRef<TickerState | null>(null);
  const boomStampRef = useRef<BoomStamp | null>(null);
  const dotRRef   = useRef(DOT_R);
  const { ready } = useAppReady();

  const resize = useCallback(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const w = wrap.offsetWidth, h = gridHeight(w);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width        = Math.round(w * dpr);
    canvas.height       = Math.round(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;
    const mobile = w < 700;
    dotRRef.current = DOT_R;
    const cellSize = CELL;
    const cols = Math.max(1, Math.floor(w / cellSize));
    const rows = Math.max(1, Math.floor(h / cellSize));
    colsRef.current = cols;
    rowsRef.current = rows;
    cellWRef.current = w / cols;
    cellHRef.current = h / rows;
    dotsRef.current  = Array.from({ length: cols * rows }, makeDot);
    trailRef.current.clear();
    tickerRef.current    = null;
    boomStampRef.current = null;
    starsRef.current = [];
    ripsRef.current  = [];
  }, []);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [resize]);

  // ── LED ticker: scrolls text right-to-left like a metro board ───────────────
  useEffect(() => {
    if (!ready) return;
    const cols = colsRef.current, rows = rowsRef.current;
    if (!cols || !rows) return;

    const large  = cols >= 30;
    const font   = large ? FONT5x7 : FONT3x5;
    const charW  = large ? 5 : 3;
    const charH  = large ? 7 : 5;
    const charGap = large ? 2 : 1;
    const spaceW  = large ? 4 : 3;

    const { bitmap, width } = buildTickerBitmap(
      pickPhrase(), font, charW, charH, charGap, spaceW,
    );

    tickerRef.current = {
      bitmap,
      width,
      startRow: Math.max(0, Math.floor((rows - charH) / 2)),
      charH,
      startTs: performance.now() + 600,
      speed:   large ? 0.014 : 0.010,
      peak:    0.90,
    };
  }, [ready]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let rafId: number;

    let firstFrame = true;

    const draw = (ts: number) => {
      if (firstFrame) {
        firstFrame = false;
        nextStarRef.current = ts + 300  + Math.random() * 400;   // 0.3–0.7 s wow
        nextRipRef.current  = ts + 6000 + Math.random() * 5000;  // 6–11 s
      }

      const dpr  = Math.min(window.devicePixelRatio || 1, 2);
      const cols = colsRef.current;
      const rows = rowsRef.current;
      const dots = dotsRef.current;
      if (!cols || !rows) { rafId = requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Sparks (subtle background twinkle) ──────────────────────────────────
      if (ts >= nextSpkRef.current) {
        nextSpkRef.current = ts + 400 + Math.random() * 800;
        const n = 1 + Math.floor(Math.random() * 4);
        for (let s = 0; s < n; s++) {
          const idx = Math.floor(Math.random() * dots.length);
          dots[idx].spk  = 0.40 + Math.random() * 0.45;
          dots[idx].spkT = ts;
          dots[idx].spkD = 300 + Math.random() * 600;
        }
      }

      // ── Shooting star ─────────────────────────────────────────────────────────
      if (ts >= nextStarRef.current) {
        nextStarRef.current = ts + 12000 + Math.random() * 8000;
        const W = colsRef.current * cellWRef.current, H = rowsRef.current * cellHRef.current;
        const angle = Math.PI * 0.25 + Math.random() * Math.PI * 0.5;
        const dx = Math.cos(angle), dy = Math.sin(angle);
        const spd = 0.22 + Math.random() * 0.18, trail = 55 + Math.random() * 55;
        starsRef.current.push({
          x: Math.random() * W, y: -trail - 10,
          dx, dy, spd, trail,
          peak: 0.75 + Math.random() * 0.20,
          t0: ts, dur: (H + trail * 2) / (spd * Math.max(0.15, dy)) + 400,
        });
      }

      // ── Ripple wave ───────────────────────────────────────────────────────────
      if (ts >= nextRipRef.current) {
        nextRipRef.current = ts + 10000 + Math.random() * 8000;
        const W = colsRef.current * cellWRef.current, H = rowsRef.current * cellHRef.current;
        ripsRef.current.push({
          x: Math.random() * W, y: Math.random() * H,
          maxR: 100 + Math.random() * 80,
          peak: 0.30 + Math.random() * 0.18,
          t0: ts, dur: 1400 + Math.random() * 600,
        });
      }

      // ── Cull expired events ───────────────────────────────────────────────────
      starsRef.current  = cull(starsRef.current, ts);
      ripsRef.current   = cull(ripsRef.current,  ts);
      burstsRef.current = burstsRef.current.filter(b => ts - b.t0 < BURST_DUR);

      // ── Draw ─────────────────────────────────────────────────────────────────
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i  = r * cols + c;
          if (i >= dots.length) continue;
          const d  = dots[i];
          const px = (c + 0.5) * cellWRef.current;
          const py = (r + 0.5) * cellHRef.current;

          // Continuous sinusoidal oscillation
          const osc = d.base + d.amp * (Math.sin(d.phase + (ts / 1000) * d.freq * Math.PI * 2) * 0.5 + 0.5);

          // Individual spark
          let spark = 0;
          if (d.spkT >= 0) {
            const age = ts - d.spkT;
            if (age < d.spkD) {
              const p = age / d.spkD;
              spark = d.spk * (p < 0.1 ? p / 0.1 : 1 - (p - 0.1) / 0.9);
            } else { d.spkT = -1; }
          }

          // Cursor trail — fade from t0 over TRAIL_DUR
          let cGlow = 0;
          const td = trailRef.current.get(i);
          if (td) {
            const age = ts - td.t0;
            if (age < TRAIL_DUR) {
              cGlow = td.peak * Math.pow(1 - age / TRAIL_DUR, 1.4);
            } else {
              trailRef.current.delete(i);
            }
          }

          // LED ticker glow
          let textGlow = 0;
          const ticker = tickerRef.current;
          if (ticker && ts >= ticker.startTs) {
            const scrolled    = (ts - ticker.startTs) * ticker.speed;
            const textLeftCol = cols - scrolled;          // grid col of bitmap col 0
            const bCol        = Math.round(c - textLeftCol);
            const bRow        = r - ticker.startRow;
            if (bRow >= 0 && bRow < ticker.charH && bCol >= 0 && bCol < ticker.width) {
              if (ticker.bitmap[bRow][bCol]) textGlow = ticker.peak;
            }
            // Play once — clear when fully off-screen
            if (c === 0 && r === 0 && scrolled >= cols + ticker.width) {
              tickerRef.current = null;
            }
          }

          // Shooting star
          let extra = 0;
          for (const s of starsRef.current) {
            const age   = ts - s.t0;
            const headX = s.x + s.dx * s.spd * age;
            const headY = s.y + s.dy * s.spd * age;
            const toX   = px - headX, toY = py - headY;
            const along = -(toX * s.dx + toY * s.dy);
            if (along >= 0 && along <= s.trail) {
              const perpX = toX + s.dx * along, perpY = toY + s.dy * along;
              const perp  = Math.hypot(perpX, perpY);
              if (perp < CELL * 0.9)
                extra = Math.max(extra, (1 - along / s.trail) * (1 - perp / (CELL * 0.9)) * s.peak);
            }
          }

          // Ripple wave
          for (const rp of ripsRef.current) {
            const prog  = (ts - rp.t0) / rp.dur;
            const ring  = prog * rp.maxR;
            const rw    = 18 + prog * 14;
            const dRing = Math.abs(Math.hypot(px - rp.x, py - rp.y) - ring);
            if (dRing < rw)
              extra = Math.max(extra, (1 - dRing / rw) * Math.pow(1 - prog, 0.7) * rp.peak);
          }

          // Click burst ring
          for (const b of burstsRef.current) {
            const prog  = (ts - b.t0) / BURST_DUR;
            const ring  = prog * BURST_MAX;
            const rw    = 28 + prog * 24;
            const dRing = Math.abs(Math.hypot(px - b.x, py - b.y) - ring);
            if (dRing < rw)
              extra = Math.max(extra, (1 - dRing / rw) * Math.pow(1 - prog, 0.55) * 0.95);
          }

          // Boom word glow — centered pixel stamp, fades with burst
          let boomGlow = 0;
          const boomStamp = boomStampRef.current;
          if (boomStamp && boomStamp.dots.has(i)) {
            const age = ts - boomStamp.t0;
            if (age < 80)          boomGlow = 0.95 * (age / 80);
            else if (age < 380)    boomGlow = 0.95;
            else if (age < BURST_DUR) boomGlow = 0.95 * (1 - (age - 380) / (BURST_DUR - 380));
          }
          if (r === 0 && c === 0 && boomStamp && ts - boomStamp.t0 >= BURST_DUR)
            boomStampRef.current = null;

          const alpha = Math.min(1, osc + spark + Math.max(cGlow, textGlow, boomGlow) + extra);
          const s = dotRRef.current * dpr;
          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fillRect(px * dpr - s, py * dpr - s, s * 2, s * 2);
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── Interaction handlers ──────────────────────────────────────────────────────
  const stampTrail = useCallback((mx: number, my: number) => {
    const cols  = colsRef.current,  rows  = rowsRef.current;
    const cellW = cellWRef.current, cellH = cellHRef.current;
    const now   = performance.now();
    const c0 = Math.max(0, Math.floor((mx - TRAIL_R) / cellW));
    const c1 = Math.min(cols - 1, Math.ceil((mx + TRAIL_R) / cellW));
    const r0 = Math.max(0, Math.floor((my - TRAIL_R) / cellH));
    const r1 = Math.min(rows - 1, Math.ceil((my + TRAIL_R) / cellH));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const dist = Math.hypot((c + 0.5) * cellW - mx, (r + 0.5) * cellH - my);
        if (dist < TRAIL_R) {
          const peak = 0.55 + (1 - dist / TRAIL_R) * 0.40; // 0.55–0.95
          trailRef.current.set(r * cols + c, { t0: now, peak });
        }
      }
    }
  }, []);

  const onMouseMove  = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current!.getBoundingClientRect();
    stampTrail(e.clientX - r.left, e.clientY - r.top);
  }, [stampTrail]);
  const onMouseLeave = useCallback(() => {}, []);

  const addBurst = useCallback((x: number, y: number) => {
    const t0 = performance.now();
    burstsRef.current.push({ x, y, t0 });

    // Stamp boom word as lit dots, centered in the grid
    const cols = colsRef.current, rows = rowsRef.current;
    if (!cols || !rows) return;
    const word  = BOOM_WORDS[Math.floor(Math.random() * BOOM_WORDS.length)];
    const large = cols >= 30;
    const font  = large ? FONT5x7 : FONT3x5;
    const charW = large ? 5 : 3, charH = large ? 7 : 5, charGap = large ? 2 : 1;
    const chars = [...word].filter(ch => !!font[ch]);
    const textW = chars.length * charW + Math.max(0, chars.length - 1) * charGap;
    const startC = Math.max(0, Math.floor((cols - textW) / 2));
    const startR = Math.max(0, Math.floor((rows - charH) / 2));
    const dots = new Set<number>();
    chars.forEach((ch, ci) => {
      const bmp = font[ch]; if (!bmp) return;
      const charC = startC + ci * (charW + charGap);
      for (let r = 0; r < charH; r++)
        for (let c = 0; c < charW; c++)
          if (bmp[r][c] && charC + c < cols && startR + r < rows)
            dots.add((startR + r) * cols + (charC + c));
    });
    boomStampRef.current = { dots, t0 };
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
    stampTrail(t.clientX - r.left, t.clientY - r.top);
  }, [stampTrail]);
  const onTouchEnd = useCallback(() => {}, []);

  return (
    <div
      ref={wrapRef}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ width: "100%", borderRadius: 8, overflow: "hidden", cursor: "crosshair", touchAction: "none" }}
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
            <div key={b.label} style={{ ...tagStyle, borderRadius: 8 }}
              onMouseEnter={e => tagHv(e, true)} onMouseLeave={e => tagHv(e, false)}>
              {b.icon} {b.label}
            </div>
          ))}
        </motion.div>

        {/* Copy */}
        <motion.div variants={item} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p className="f16" style={{ fontWeight: 500, color: C.t1, lineHeight: 1.4 }}>
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
            borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s, box-shadow 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.9"; a.style.transform = "translateY(-2px)"; a.style.boxShadow = "0 4px 16px rgba(0,0,0,0.6)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; a.style.boxShadow = ""; }}>
            <ArrowRight size={14} strokeWidth={2} /> View my Work
          </a>
          <a href="#contact" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.05)", color: C.t1, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none",
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
