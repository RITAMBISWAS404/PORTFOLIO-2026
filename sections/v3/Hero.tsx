"use client";
import { motion } from "framer-motion";
import { MdDirectionsRun, MdLocalCafe } from "react-icons/md";
import { C } from "@/lib/tokensV2";
import { useAppReady } from "@/lib/AppReadyContext";

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
  return (
    <section id="hero" style={{ maxWidth: 768, margin: "0 auto" }} className="v3-section">
      <motion.div
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        className="el-gap"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Currently Reading */}
        <motion.div variants={item} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "clamp(32px, 6vw, 48px)" }}>
          <div style={{ width: 4, alignSelf: "stretch", background: "#ED7454", flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#909090", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Currently Reading
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#222222" }}>The Lowland</div>
          </div>
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
            <motion.span variants={word} style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Namaste</motion.span>
            <motion.span variants={word} style={{ display: "inline-flex" }}>
              <MdDirectionsRun style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px" }} color="#222222" />
            </motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>I&apos;m</motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Ritam,</motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>a</motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Product</motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Designer</motion.span>
            <motion.span variants={word} style={{ display: "inline-flex" }}>
              <MdLocalCafe style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px" }} color="var(--exp-hero-b, #ED7454)" />
            </motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-b, #ED7454)" }}>turning</motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-b, #ED7454)" }}>complexity</motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-b, #ED7454)" }}>into</motion.span>
            <motion.span variants={word} style={{ color: "var(--exp-hero-b, #ED7454)" }}>clarity.</motion.span>
          </motion.h1>
        </motion.div>

        {/* Body */}
        <motion.div variants={item}>
          <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6 }}>
            I help startups simplify complex workflows through thoughtful product design, creating
            intuitive mobile and web experiences that people understand from the very first interaction.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="btn-row">
          <a href="#projects" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: C.t1, color: C.bg, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.88"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; }}>
            View my Work
          </a>
          <a href="#contact" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.05)", color: C.t1, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            border: "none",
            transition: "background 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(0,0,0,0.12)"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(0,0,0,0.05)"; a.style.transform = ""; }}>
            Let&apos;s Talk
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
