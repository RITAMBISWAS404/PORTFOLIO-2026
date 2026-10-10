"use client";
import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { C } from "@/lib/home/tokensV2";
import { useAppReady } from "@/lib/AppReadyContext";
import HeroStage from "@/components/home/HeroStage";
import HeroIcon from "@/components/home/HeroIcon";
import { useHeroCourier } from "@/components/home/useHeroCourier";

const HERO_HEAD_1_SRC = "/images/hero-head-1.png";
const HERO_HEAD_2_SRC = "/images/hero-head-2.png";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// Fast left-to-right word-by-word reveal for the hero heading.
const wordContainer = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const word = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1, x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function Hero() {
  const { ready } = useAppReady();
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");
  // The two heading icons are delivered by the Icon Courier (see useHeroCourier); they are not draggable any more.
  const h1Ref = useRef<HTMLHeadingElement>(null), wrapRef = useRef<HTMLDivElement>(null), s1 = useRef<HTMLSpanElement>(null), s2 = useRef<HTMLSpanElement>(null);
  const slots = useMemo(() => [s1, s2], []);
  useHeroCourier({ ready, h1: h1Ref, wrap: wrapRef, slots });

  const textColor = isNew ? "var(--hm-black, #222222)" : "var(--color-text-1)";

  return (
    <section id="hero" style={{ maxWidth: 768, margin: "0 auto", paddingTop: 0 }} className="hm-v3-section">
      <motion.div
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        className="hm-el-gap"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Hero art — breaks out full-bleed on mobile / 900px on desktop, sits above GridLines.
            Layered board + objects (idle motion; hover/drag on desktop). Mobile uses its own crop of the same assets. */}
        <motion.div variants={item} className="hm-hero-top-breakout">
          <div className="hm-hero-art-desktop"><HeroStage layout="desktop" /></div>
          <div className="hm-hero-art-mobile"><HeroStage layout="mobile" /></div>
        </motion.div>

        {/* Heading */}
        <motion.div ref={wrapRef} variants={item} style={{ position: "relative" }}>
          <motion.h1
            ref={h1Ref}
            variants={wordContainer}
            className="hm-hero-heading"
            style={{
              fontWeight: 650,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
            }}>
            <motion.span variants={word} style={{ color: textColor }}>Namaste</motion.span>
            <motion.span ref={s1} variants={word} className="hm-sh-slot">
              <HeroIcon src={HERO_HEAD_1_SRC} idle="icon1" />
            </motion.span>
            <motion.span variants={word} style={{ color: textColor }}>I&apos;m</motion.span>
            <motion.span variants={word} style={{ color: textColor }}>Ritam,</motion.span>
            <motion.span variants={word} style={{ color: textColor }}>a</motion.span>
            <motion.span variants={word} style={{ color: textColor }}>Product</motion.span>
            <motion.span variants={word} style={{ color: textColor }}>Designer</motion.span>
            <motion.span ref={s2} variants={word} className="hm-sh-slot">
              <HeroIcon src={HERO_HEAD_2_SRC} idle="icon2" />
            </motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>turning</motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>complexity</motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>into</motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>clarity.</motion.span>
          </motion.h1>
        </motion.div>

        {/* Body */}
        <motion.div variants={item}>
          <p className="hm-f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6 }}>
            Making digital products easier to use than the coffee machine in most offices.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="hm-btn-row">
          <a href="#projects" data-cursor-kind="cta" data-cursor-id="hero-work" className="hm-hero-cta hm-hero-cta-primary" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: C.t1, color: C.bg, padding: "11px 22px",
            borderRadius: isNew ? 0 : 9999, fontSize: 14, fontWeight: 600, textDecoration: "none",
          }}>
            View my Work
          </a>
          <a href="#contact" data-cursor-kind="cta" data-cursor-id="hero-talk" className="hm-hero-cta hm-hero-cta-secondary" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--hm-btn2-bg, rgba(0,0,0,0.08))", color: C.t1, padding: "var(--hm-btn2-pad, 11px 22px)",   // quiet tinted fill + hairline border; the 1px border is taken out of the padding, so the size is unchanged
            borderRadius: isNew ? 0 : 9999, fontSize: 14, fontWeight: 600, textDecoration: "none",
            border: "1px solid var(--hm-btn2-border, transparent)",
          }}>
            Let&apos;s Talk
          </a>
        </motion.div>
      </motion.div>

      <style>{`
        .hm-hero-top-breakout {
          position: relative;
          left: 50%;
          width: 100vw;
          margin-left: -50vw;
          margin-bottom: 4px;
          z-index: 1;
        }
        .hm-hero-art-desktop { display: none; }
        .hm-hero-art-mobile { overflow-x: clip; }
        .hm-v3-home { overflow-x: clip; }   /* characters and carried objects enter from off-screen; never let them widen the page */   /* objects may leave the board, never widen the page */
        @media (min-width: 768px) {
          .hm-hero-top-breakout {
            width: min(900px, 96vw);
            margin-left: calc(min(900px, 96vw) / -2);
            margin-bottom: -4px;
          }
          .hm-hero-art-desktop { display: block; }
          .hm-hero-art-mobile { display: none; }
        }
        .hm-hero-heading { font-size: clamp(28px, 4vw, 40px); }
        @media (min-width: 768px) {
          .hm-hero-heading { font-size: clamp(36px, 7vw, 54px); }
        }
      `}</style>
    </section>
  );
}
