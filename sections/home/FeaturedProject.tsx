"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useReduceMotionSafe } from "@/lib/home/useReduceMotionSafe";
import { usePathname } from "next/navigation";
import { MdDesignServices, MdAccountTree, MdWidgets, MdGroups, MdVerified } from "react-icons/md";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import CardV3 from "@/components/home/CardV3";
import { zeno } from "@/data/home-content";
import { C, revealStyle, col } from "@/lib/home/tokensV2";

// Ownership -> product thinking -> systems thinking -> outcome. "10K+" matches the verified wording in data/experiment-content.ts
// ("live with 10,000+ registered users in Denmark"): stated as the product's reach during Ritam's ownership, not as an effect of the design.
const stats = [
  { id: "zeno-design",       label: "Product Design",          body: "End-to-end product design spanning research, information architecture, UX, UI and developer handoff.", icon: MdDesignServices },
  { id: "zeno-architecture", label: "Experience Architecture", body: "Structured the core onboarding, charging and dashboard experiences around the actions users actually came to the app for.", icon: MdAccountTree },
  { id: "zeno-system",       label: "Design System",           body: "A reusable component and variable-based system built to keep the product consistent and scalable as it evolved.", icon: MdWidgets },
  { id: "zeno-users",        label: "10K+ Users",              body: "Product experience designed through ZENO's launch and early growth to 10,000+ registered users in Denmark.", icon: MdGroups },
];

// ZENO visual: the production composition rebuilt from layers (bg, pattern, hand+phone) with real HTML text on top.
// Placement was measured against the flattened /images/16_9.png + 4_3.png (stage height = 100%): phone 88.9% tall, top 11.9%; pattern 98.5% tall, rotated 29deg.
// Motion is scroll-linked and fully reversible, no pinning: progress runs from "image top meets viewport bottom" to "image centre reaches ~60% down the viewport",
// then everything rests in the final composition. bg never moves; only transform + opacity are animated.
const R = (a: number, b: number) => [a, b];
function ZenoVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReduceMotionSafe();   // hydrates as "no preference" like the server, then switches (see the hook)
  const [small, setSmall] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 599px)");
    const upd = () => setSmall(mq.matches);
    upd(); mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "center 62%"] });
  const d = small ? 8 : 16;
  const patOp = useTransform(p, R(0, 0.35), R(0, 1));
  const phoneY = useTransform(p, R(0.05, 0.85), small ? [56, 0] : [90, 0]);
  const phoneOp = useTransform(p, R(0.05, 0.5), R(0.35, 1));
  const onScreen = useInView(ref, { amount: 0 });
  const tlX = useTransform(p, R(0.35, 0.8), [-d, 0]);
  const tlY = useTransform(p, R(0.35, 0.8), [-d / 2, 0]);
  const trX = useTransform(p, R(0.35, 0.8), [d, 0]);
  const topOp = useTransform(p, R(0.35, 0.8), R(0, 1));
  const blX = useTransform(p, R(0.5, 0.95), [-d, 0]);
  const brX = useTransform(p, R(0.5, 0.95), [d, 0]);
  const botY = useTransform(p, R(0.5, 0.95), [d, 0]);
  const botOp = useTransform(p, R(0.5, 0.95), R(0, 1));
  // Reduced motion: every overlay sits in its FINAL state. The values must be explicit: the server renders the scroll-driven starting values inline (opacity 0, offsets) and hydration never
  // removes inline styles, and framer-motion does not overwrite a scroll-driven value with a static one in place, so the text, pattern and phone stayed hidden / shifted for visitors with Reduce Motion on.
  const FINAL = { x: 0, y: 0, opacity: 1 };
  // Changing the key when the preference becomes known remounts these elements, so they start from the explicit final state instead of inheriting the server-rendered inline styles.
  const mk = reduce ? "static" : "live";
  const m = (style: Record<string, unknown>) => (reduce ? FINAL : style);
  return (
    <div ref={ref} className="hm-feature-img-wrap hm-zv" data-run={onScreen && !reduce ? "1" : undefined} style={{ borderRadius: 8, overflow: "hidden", width: "100%" }}>
      <img className="hm-zv-bg" src="/Zeno%20image/bg.png" alt="" loading="lazy" decoding="async" draggable={false} />
      <div className="hm-zv-pat">
        <div className="hm-zv-spin">
          <motion.img key={`pat-${mk}`} src="/Zeno%20image/patterns.png" alt="" loading="lazy" decoding="async" draggable={false}
            style={reduce ? { rotate: 29, opacity: 1 } : { rotate: 29, opacity: patOp }} />
        </div>
      </div>
      <div className="hm-zv-phone">
        {/* motion lives on the wrapper; the original asset is rendered as-is by a plain <img> */}
        <motion.div key={`phone-${mk}`} className="hm-zv-phone-in" style={m({ y: phoneY, opacity: phoneOp })}>
          <img src="/Zeno%20image/ZENO%20App.png" alt="ZENO app home screen held in a hand" width={1159} height={1200} decoding="async" draggable={false} />
        </motion.div>
      </div>
      <motion.div key={`tl-${mk}`} className="hm-zv-t hm-zv-tl" style={m({ x: tlX, y: tlY, opacity: topOp })}>
        <p className="hm-zv-h">Smarter charging.<br />Cheaper every time.</p>
        <p className="hm-zv-sub">Zeno charges your EV automatically at the cheapest electricity hour of the day, right from your phone.</p>
      </motion.div>
      <motion.div key={`tr-${mk}`} className="hm-zv-t hm-zv-tr" style={m({ x: trX, opacity: topOp })}>ZENO</motion.div>
      <motion.div key={`bl-${mk}`} className="hm-zv-t hm-zv-bl" style={m({ x: blX, y: botY, opacity: botOp })}>Driven by savings</motion.div>
      <motion.div key={`br-${mk}`} className="hm-zv-t hm-zv-br" style={m({ x: brX, y: botY, opacity: botOp })}>Designed for simplicity</motion.div>
    </div>
  );
}

export default function FeaturedProject() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  return (
    <>
      <div id="featured" style={{ ...col, paddingBottom: 0 }} className="hm-v3-section">
        <SectionHeadingV3 title="Featured Project" eyebrow="NOT BAD, HONESTLY" icon={MdVerified} iconSrc="/images/Feature%20project.png" iconAfter={1} />
      </div>

      {/* Feature image */}
      <div style={{ ...col, paddingBottom: 0 }} className="hm-v3-section">
        <ZenoVisual />
      </div>

      {/* ZENO detail */}
      <div ref={ref} style={{ ...col }} className="hm-v3-section">
        <div className="hm-el-gap" style={{ display: "flex", flexDirection: "column", ...revealStyle(inView) }}>

          {/* Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="hm-v3-identity-logo" style={{ overflow: "hidden", flexShrink: 0 }}>
              <img src="/images/zeno logo.png" alt="ZENO" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div className="hm-f16" style={{ fontWeight: 600, color: C.t1 }}>{zeno.name}</div>
              <div className="hm-f16" style={{ fontWeight: 500, color: C.t2 }}>{zeno.sub}</div>
            </div>
          </div>

          {/* Description */}
          <p className="hm-f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6 }}>
            ZENO{" "}
            <strong style={{ color: "var(--hm-hero-b, #222222)", fontWeight: 600 }}>
              turns a data-heavy EV charging app into a four-second experience
            </strong>
            . The work spanned research, information architecture, UX, UI and developer handoff, with a
            focus on deciding what deserved attention, what could wait, and how to make the core
            charging experience feel effortless.
          </p>
        </div>

        {/* Product work — 2×2 grid */}
        <div className="hm-stats-grid hm-mt-el" style={{ display: "grid", gap: 16 }}>
          {stats.map((s, i) => (
            <CardV3 key={s.label} label={s.label} body={s.body} delay={i * 0.08} icon={s.icon} cursorId={s.id} />
          ))}
        </div>

        {/* CTAs */}
        <div className="hm-btn-row hm-mt-el">
          <a href="/zeno" target="_blank" rel="noopener noreferrer" data-cursor-kind="casestudy" data-cursor-id="zeno" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: C.t1, color: C.bg, padding: "11px 22px",
            borderRadius: isNew ? 8 : 9999, fontSize: 14, fontWeight: 600, textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.88"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; }}>
            Read Case Study
          </a>
        </div>
      </div>

      <style>{`
        .hm-stats-grid { grid-template-columns: 1fr; }
        @media (min-width: 600px) { .hm-stats-grid { grid-template-columns: 1fr 1fr; } }
        .hm-feature-img-wrap { aspect-ratio: 4 / 3; }
        .hm-zv { position: relative; container-type: inline-size; }
        .hm-zv-bg { position: absolute; inset: 0; width: 100%; height: 100%; max-width: none; object-fit: cover; display: block; }
        .hm-zv-pat { position: absolute; left: 50%; top: 50%; height: 98.5%; aspect-ratio: 1 / 1; transform: translate(-50%, -50%); pointer-events: none; }
        .hm-zv-spin { width: 100%; height: 100%; animation: hm-zv-turn 48s linear infinite; animation-play-state: paused; will-change: transform; }
        .hm-zv[data-run] .hm-zv-spin { animation-play-state: running; }
        @keyframes hm-zv-turn { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .hm-zv-spin { animation: none; } }
        .hm-zv-pat img { width: 100%; height: 100%; max-width: none; display: block; will-change: transform; }
        .hm-zv-phone { position: absolute; left: 0; right: 0; top: 11.94%; height: 88.89%; display: flex; justify-content: center; pointer-events: none; }
        .hm-zv-phone-in { height: 100%; aspect-ratio: 1159 / 1200; }
        .hm-zv-phone-in img { width: 100%; height: 100%; max-width: none; display: block; }
        .hm-zv-t { position: absolute; color: #fff; font-weight: 600; letter-spacing: -0.01em; line-height: 1.25; pointer-events: none; will-change: transform, opacity; }
        .hm-zv-tl { left: 5%; top: 8.5%; width: 30%; }
        .hm-zv-h { margin: 0; font-size: clamp(10px, 2.3cqw, 18px); font-weight: 600; line-height: 1.3; }
        .hm-zv-sub { margin: 0.9em 0 0; font-size: clamp(8px, 1.3cqw, 11px); font-weight: 500; line-height: 1.45; opacity: 0.92; }
        .hm-zv-tr { right: 5%; top: 8%; font-size: clamp(18px, 5.8cqw, 44px); font-weight: 650; letter-spacing: 0.01em; line-height: 1; }
        .hm-zv-bl, .hm-zv-br { bottom: 6.5%; font-size: clamp(10px, 2.2cqw, 17px); font-weight: 600; }
        .hm-zv-bl { left: 5%; }
        .hm-zv-br { right: 5%; }
        @media (max-width: 599px) {
          .hm-zv-sub { display: none; }
          .hm-zv-tl { left: 4.5%; top: 6%; width: 36%; }
          .hm-zv-tr { right: 4.5%; top: 6%; }
          .hm-zv-bl { display: none; }   /* MOBILE_FEATURED_PROJECT: no bottom-left "Driven by savings" on phones (delete this line to restore it) */
          .hm-zv-br { right: 4.5%; bottom: 5%; width: 26%; text-align: right; }
        }
        @media (min-width: 768px) { .hm-feature-img-wrap { aspect-ratio: 16 / 9; } }
        .hm-v3-identity-logo { width: 48px; height: 48px; border-radius: ${isNew ? "6px" : "8px"}; }
        @media (min-width: 768px) { .hm-v3-identity-logo { width: 64px; height: 64px; border-radius: 8px; } }
      `}</style>
    </>
  );
}
