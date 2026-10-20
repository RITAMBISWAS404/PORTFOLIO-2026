"use client";
// Wall of Portfolios "Featured" badge: a fixed bottom-right badge (desktop only) that opens the official silver 2026 badge, by itself, over a blurred backdrop.
// Self-contained experiment: remove this file, WopBadge.css, public/wop/ and the <WopBadge /> line in app/page.tsx to undo it.
// The kit ships only static artwork (no link or hover effect), so the badge is not a link; hover lifts it like the site buttons.
import { useEffect, useRef, useState } from "react";
import "./WopBadge.css";

// FORMAT picks the artwork: "png" (transparent kit PNGs; the silver pill is cropped and masked to the pill from the kit PNG) or "svg" (the SVG fallback, files kept alongside).
const FORMAT: "png" | "svg" = "svg";
const ASSETS = {
  png: { white: "/wop/WOP_Featured_Badge_White.png", black: "/wop/WOP_Featured_Badge_Black.png", silver: "/wop/WOP_Silver_Badge_2026_2x.png",
         silverSet: "/wop/WOP_Silver_Badge_2026_1x.png 400w, /wop/WOP_Silver_Badge_2026_2x.png 800w, /wop/WOP_Silver_Badge_2026_3x.png 1200w" },
  svg: { white: "/wop/WOP_Featured_Badge_White.svg", black: "/wop/WOP_Featured_Badge_Black.svg", silver: "/wop/WOP_Silver_Badge_2026.svg", silverSet: undefined },
}[FORMAT];
const WHITE = ASSETS.white, SILVER = ASSETS.silver;
const ALT = "Featured on Wall of Portfolios";
const EXIT_MS = 200;

// Burst objects: the supplied cut-outs in public/Random item (natural pixel sizes kept for the aspect ratio; transparency untouched).
const R = "/Random%20item/";
// Visual hierarchy, not literal scale: tier L (large), M (medium) or S (small), then a [min, max] longest-side range in px on a large screen. Each instance picks inside its range.
// The duck, toast and the Snoopy-with-flower sticker clearly outsize the stamp, while the glasses stay wide and short because only the longest side is sized.
type Tier = "L" | "M" | "S";
const POOL: { src: string; w: number; h: number; tier: Tier; size: [number, number] }[] = [
  { src: R + "RUBBER%20DUCK.png", w: 674, h: 594, tier: "L", size: [150, 176] }, { src: R + "BREAD.png", w: 1119, h: 1087, tier: "L", size: [160, 186] },
  { src: R + "FLOWERS.png", w: 702, h: 800, tier: "L", size: [150, 176] }, { src: R + "LOTUS.png", w: 1103, h: 1104, tier: "L", size: [138, 162] },
  { src: R + "EYES.png", w: 770, h: 1067, tier: "M", size: [112, 132] }, { src: R + "COFFEE.png", w: 1049, h: 1046, tier: "M", size: [106, 126] },
  { src: R + "CANHEAD.png", w: 707, h: 684, tier: "M", size: [90, 106] }, { src: R + "HEAL.png", w: 852, h: 791, tier: "M", size: [94, 110] },
  { src: R + "STAR.png", w: 1104, h: 953, tier: "M", size: [94, 110] }, { src: R + "flame.png", w: 179, h: 252, tier: "M", size: [92, 108] },
  { src: R + "HER.png", w: 1104, h: 1104, tier: "M", size: [96, 112] }, { src: R + "download%20%286%29%201.png", w: 453, h: 425, tier: "M", size: [84, 98] },
  { src: R + "glasses.png", w: 605, h: 200, tier: "S", size: [102, 122] }, { src: R + "earphones.png", w: 456, h: 526, tier: "S", size: [68, 82] },
  { src: R + "PAPER.png", w: 725, h: 588, tier: "S", size: [68, 82] }, { src: R + "STAMP.png", w: 660, h: 608, tier: "S", size: [62, 74] },
  { src: R + "ok.png", w: 147, h: 81, tier: "S", size: [58, 70] },
];
const MAX_ACTIVE = 72;
const GRAVITY = 2300;   // px/s^2 at an 800px-tall viewport (scaled with the viewport height)
type Particle = { d: number; life: number; el: HTMLDivElement; x0: number; y0: number; vx: number; vy: number; g: number; r0: number; vr: number; start: number; half: number };

let preloaded = false;
const preloadAll = () => { if (preloaded) return; preloaded = true; POOL.forEach(o => { const im = new Image(); im.src = o.src; }); };

export default function WopBadge() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);
  const parts = useRef<Particle[]>([]);
  const loop = useRef(0);
  const tilt = useRef({ tx: 0, ty: 0, x: 0, y: 0, raf: 0 });

  const openOverlay = () => { preloadAll(); setOpen(true); };

  const clearBurst = () => {
    cancelAnimationFrame(loop.current); loop.current = 0;
    parts.current.forEach(p => p.el.remove()); parts.current = [];
  };

  // Projectile motion, integrated per frame from real elapsed time: each object leaves the badge's edge with an upward-and-outward velocity, rises to a peak, then falls under gravity.
  const frame = (now: number) => {
    const vh = window.innerHeight, keep: Particle[] = [];
    for (const p of parts.current) {
      const s = (now - p.start) / 1000;
      if (s < 0) { keep.push(p); continue; }
      const x = p.x0 + p.vx * (1 - Math.exp(-p.d * s)) / p.d, y = p.y0 + p.vy * s + 0.5 * p.g * s * s, r = p.r0 + p.vr * s;
      const fadeAt = p.life - 0.35;
      p.el.style.opacity = s > fadeAt ? Math.max(0, (p.life - s) / 0.35).toFixed(2) : "1";
      p.el.style.transform = `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px)) rotate(${r.toFixed(1)}deg)`;
      if (s >= p.life || y > vh / 2 + p.half + 20) { p.el.remove(); continue; }   // faded out, or fell out of view
      keep.push(p);
    }
    parts.current = keep;
    loop.current = keep.length ? requestAnimationFrame(frame) : 0;
  };

  const burst = () => {
    const host = burstRef.current, el = tiltRef.current; if (!host || !el) return;
    const vw = window.innerWidth, vh = window.innerHeight, small = vw < 640, k = vh / 800;
    const bw = el.getBoundingClientRect().width, reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = performance.now(), n = reduce ? 6 : small ? 9 + Math.floor(Math.random() * 6) : 15 + Math.floor(Math.random() * 11);   // 15 to 25 objects (fewer on small screens)
    const scale = small ? 0.58 : vw < 1100 ? 0.82 : 1;   // viewport-responsive size
    const power = 0.85 + Math.random() * 0.4, spread = 90 + Math.random() * 260, duration = 1.2 + Math.random() * 1.8;   // each click has its own strength, stagger window and length (1.2 to 3s)
    // tiered selection: a few large, a good share of medium, the rest small, each tier shuffled, so every burst has a clear hierarchy but a different cast
    const tier = (tr: Tier) => { const a = POOL.filter(o => o.tier === tr); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const nL = Math.max(2, Math.round(n * (0.17 + Math.random() * 0.07))), nM = Math.round(n * (0.42 + Math.random() * 0.08)), nS = n - nL - nM;
    const L = tier("L"), M = tier("M"), S = tier("S");
    const cast = [...Array.from({ length: nL }, (_, i) => L[i % L.length]), ...Array.from({ length: nM }, (_, i) => M[i % M.length]), ...Array.from({ length: nS }, (_, i) => S[i % S.length])];
    for (let i = cast.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cast[i], cast[j]] = [cast[j], cast[i]]; }   // launch order is mixed
    let side = Math.random() < 0.5 ? -1 : 1;
    while (parts.current.length + n > MAX_ACTIVE) { parts.current.shift()?.el.remove(); }
    cast.forEach((o, i) => {
      const heft = o.tier === "L" ? 0.82 : o.tier === "M" ? 1 : 1.12;   // big objects are launched a little less hard, small ones a little harder, so the cluster keeps depth
      const long = (o.size[0] + Math.random() * (o.size[1] - o.size[0])) * scale, w = long * o.w / Math.max(o.w, o.h), h = long * o.h / Math.max(o.w, o.h);
      side = Math.random() < 0.65 ? -side : side;   // mostly alternating sides, with repeats so it never reads as a pattern
      const div = document.createElement("div"); div.className = "wop-obj";
      const im = document.createElement("img"); im.src = o.src; im.width = Math.round(w); im.height = Math.round(h); im.alt = ""; im.draggable = false;
      div.appendChild(im); div.addEventListener("click", e => e.stopPropagation()); host.appendChild(div);
      if (reduce) {   // simplified burst: a short fade and scale at a spot beside the pill
        div.style.transform = `translate(calc(-50% + ${(side * (bw * 0.5 + long * 0.35)).toFixed(0)}px), calc(-50% + ${((Math.random() - 0.5) * bw * 0.9).toFixed(0)}px)) rotate(${((Math.random() - 0.5) * 24).toFixed(0)}deg)`;
        const a = div.animate([{ opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, offset: 0.3 }, { opacity: 1, scale: 1, offset: 0.7 }, { opacity: 0, scale: 0.95 }], { duration: 1100, delay: i * 60, fill: "both" });
        a.onfinish = () => div.remove();
        return;
      }
      const shot = Math.random() < 0.3 ? 1.2 + Math.random() * 0.25 : 0.62 + Math.random() * 0.5;   // some shoot high and far, others take shorter, lower arcs
      const g = GRAVITY * k * (0.9 + Math.random() * 0.3), vy = -(1000 + Math.random() * 500) * k * power * shot * heft * Math.sqrt(scale);
      parts.current.push({
        el: div, x0: side * bw * (0.28 + Math.random() * 0.18), y0: (Math.random() - 0.35) * bw * 0.8,   // starts well inside the pill's edge, so it emerges from behind it
        vx: side * (520 + Math.random() * 620) * power * shot * Math.min(1, scale + 0.2), vy, g, d: 0.55 + Math.random() * 0.6,
        r0: (Math.random() - 0.5) * 40, vr: side * (70 + Math.random() * 330) * (o.tier === "L" ? 0.55 : 1) * (Math.random() < 0.3 ? -1 : 1), start: now + i * (spread / n) + Math.random() * 25, half: long / 2,
        life: duration * (0.55 + Math.random() * 0.45) + 0.5,
      });
    });
    if (!loop.current && parts.current.length) loop.current = requestAnimationFrame(frame);
  };

  const close = () => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(() => { setOpen(false); setClosing(false); }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : EXIT_MS);
  };

  // Eased tilt on the large badge, composed with a short click recoil: a damped spring (scale dip, a few px of push-back, a hair of twist) that settles back to rest.
  // Both are written into the one transform, so the recoil never overwrites the cursor-following skew.
  const kick = useRef({ s: 0, vs: 0, x: 0, vx: 0, y: 0, vy: 0, z: 0, vz: 0, last: 0 });
  const step = (now: number) => {
    const s = tilt.current, k = kick.current, el = tiltRef.current;
    const dt = Math.min(0.032, Math.max(0.001, (now - (k.last || now - 16)) / 1000)); k.last = now;
    s.x += (s.tx - s.x) * 0.16; s.y += (s.ty - s.y) * 0.16;
    for (const key of ["s", "x", "y", "z"] as const) { const v = ("v" + key) as "vs" | "vx" | "vy" | "vz"; k[v] += (-420 * k[key] - 26 * k[v]) * dt; k[key] += k[v] * dt; }
    if (el) el.style.transform = `translate(${k.x.toFixed(2)}px, ${k.y.toFixed(2)}px) rotateX(${s.x.toFixed(2)}deg) rotateY(${s.y.toFixed(2)}deg) rotateZ(${k.z.toFixed(2)}deg) scale(${(1 + k.s).toFixed(4)})`;
    const moving = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.01 || Math.abs(k.s) + Math.abs(k.vs) + Math.abs(k.x) + Math.abs(k.vx) + Math.abs(k.y) + Math.abs(k.vy) + Math.abs(k.z) + Math.abs(k.vz) > 0.01;
    s.raf = moving ? requestAnimationFrame(step) : 0;
    if (!moving) { k.last = 0; if (el) el.style.transform = `rotateX(${s.x.toFixed(2)}deg) rotateY(${s.y.toFixed(2)}deg)`; }
  };
  const aim = (tx: number, ty: number) => { const s = tilt.current; s.tx = tx; s.ty = ty; if (!s.raf) s.raf = requestAnimationFrame(step); };
  const press = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const k = kick.current, ang = Math.random() * Math.PI * 2;
    k.vs -= 1.05 + Math.random() * 0.3;                       // pressed back
    k.vx += Math.cos(ang) * (120 + Math.random() * 60); k.vy += Math.sin(ang) * (120 + Math.random() * 60);   // recoil in a different direction each click
    k.vz += (Math.random() < 0.5 ? -1 : 1) * (16 + Math.random() * 10);
    if (!tilt.current.raf) tilt.current.raf = requestAnimationFrame(step);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    aim(-((e.clientY - r.top) / r.height - 0.5) * 20, ((e.clientX - r.left) / r.width - 0.5) * 20);
  };
  useEffect(() => () => { cancelAnimationFrame(tilt.current.raf); clearBurst(); }, []);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") { e.preventDefault(); closeRef.current?.focus(); }   // the close button is the only focusable control, so focus stays inside
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearBurst();
      trigger?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, closing]);

  return (
    <>
      <button ref={triggerRef} type="button" className="wop-badge" onClick={openOverlay} onPointerEnter={preloadAll} onFocus={preloadAll} aria-haspopup="dialog" aria-label={`${ALT}: view larger`}>
        <img className="wop-badge-white" src={WHITE} alt="" width={94} height={44} draggable={false} />
      </button>
      {open && (
        <div className={`wop-overlay${closing ? " is-closing" : ""}`} onClick={close}>
          <button ref={closeRef} type="button" className="wop-close" onClick={close} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </button>
          <div className="wop-stage" role="dialog" aria-modal="true" aria-label={`${ALT} 2026`}>
            <div ref={burstRef} className="wop-burst" aria-hidden="true" />
            <div ref={tiltRef} className={`wop-silver is-${FORMAT}`} data-cursor="Hey, it's my badge" onClick={e => { e.stopPropagation(); press(); burst(); }} onPointerMove={onMove} onPointerLeave={() => aim(0, 0)}>
              <img src={SILVER} srcSet={ASSETS.silverSet} sizes="(max-width: 460px) 86vw, 400px" alt={`${ALT}, 2026. Welcome to the wall. Keep growing and inspiring.`} draggable={false} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
