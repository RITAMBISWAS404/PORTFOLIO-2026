"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { C } from "@/lib/tokensV2";
import { useAppReady } from "@/lib/AppReadyContext";

const HERO_TOP_SRC = "/images/hero-top.png";
const HERO_TOP_MOBILE_SRC = "/images/hero-top-mobile.png";
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

  return (
    <section id="hero" style={{ maxWidth: 768, margin: "0 auto", paddingTop: 0 }} className="v3-section">
      <motion.div
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        className="el-gap"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Hero top image — breaks out full-bleed on mobile / 900px on desktop, sits above GridLines */}
        <motion.div variants={item} className="hero-top-breakout">
          <picture>
            <source media="(min-width: 768px)" srcSet={HERO_TOP_SRC} />
            <img src={HERO_TOP_MOBILE_SRC} alt="" style={{ display: "block", width: "100%", height: "auto" }} />
          </picture>
        </motion.div>

        {/* Heading */}
        <motion.div variants={item}>
          <motion.h1
            variants={wordContainer}
            style={{
              fontSize: "clamp(36px, 7vw, 54px)",
              fontWeight: 650,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
            }}>
            <motion.span variants={word} style={{ color: isNew ? "var(--exp-black, #222222)" : "var(--color-text-1)" }}>Namaste</motion.span>
            <motion.span variants={word} style={{ display: "inline-flex" }}>
              <img src={HERO_HEAD_1_SRC} alt="" style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px", objectFit: "contain" }} />
            </motion.span>
            <motion.span variants={word} style={{ color: isNew ? "var(--exp-black, #222222)" : "var(--color-text-1)" }}>I&apos;m</motion.span>
            <motion.span variants={word} style={{ color: isNew ? "var(--exp-black, #222222)" : "var(--color-text-1)" }}>Ritam,</motion.span>
            <motion.span variants={word} style={{ color: isNew ? "var(--exp-black, #222222)" : "var(--color-text-1)" }}>a</motion.span>
            <motion.span variants={word} style={{ color: isNew ? "var(--exp-black, #222222)" : "var(--color-text-1)" }}>Product</motion.span>
            <motion.span variants={word} style={{ color: isNew ? "var(--exp-black, #222222)" : "var(--color-text-1)" }}>Designer</motion.span>
            <motion.span variants={word} style={{ display: "inline-flex" }}>
              <img src={HERO_HEAD_2_SRC} alt="" style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px", objectFit: "contain" }} />
            </motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>turning</motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>complexity</motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>into</motion.span>
            <motion.span variants={word} style={{ color: "#ED7454" }}>clarity.</motion.span>
          </motion.h1>
        </motion.div>

        {/* Body */}
        <motion.div variants={item}>
          <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6 }}>
            Making digital products easier to use than the coffee machine in most offices.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="btn-row">
          <a href="#projects" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: C.t1, color: C.bg, padding: "11px 22px",
            borderRadius: 0, fontSize: 14, fontWeight: 600, textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.88"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; }}>
            View my Work
          </a>
          <a href="#contact" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.05)", color: C.t1, padding: "11px 22px",
            borderRadius: 0, fontSize: 14, fontWeight: 600, textDecoration: "none",
            border: "none",
            transition: "background 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(0,0,0,0.12)"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(0,0,0,0.05)"; a.style.transform = ""; }}>
            Let&apos;s Talk
          </a>
        </motion.div>
      </motion.div>

      <style>{`
        .hero-top-breakout {
          position: relative;
          left: 50%;
          width: 100vw;
          margin-left: -50vw;
          margin-bottom: 4px;
          z-index: 1;
        }
        @media (min-width: 768px) {
          .hero-top-breakout {
            width: min(900px, 96vw);
            margin-left: calc(min(900px, 96vw) / -2);
            margin-bottom: -4px;
          }
        }
      `}</style>
    </section>
  );
}
