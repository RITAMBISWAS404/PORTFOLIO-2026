"use client";
import { motion } from "framer-motion";
import { MdDirectionsRun, MdLocalCafe } from "react-icons/md";
import { C, tagStyle } from "@/lib/tokensV2";
import { useAppReady } from "@/lib/AppReadyContext";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function Hero() {
  const { ready } = useAppReady();
  return (
    <section id="hero" style={{ maxWidth: 768, margin: "0 auto", paddingTop: "clamp(32px, 8vw, 48px)" }} className="v3-section">
      <motion.div
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        className="el-gap"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Badges */}
        <motion.div variants={item} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["OPEN TO COLLABORATIONS"].map(label => (
            <div key={label} style={{ ...tagStyle, border: "none", borderRadius: 9999, boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.05)", background: "#ffffff", color: "#222222" }}>
              {label}
            </div>
          ))}
        </motion.div>

        {/* Heading */}
        <motion.div variants={item}>
          <h1 style={{
            fontSize: "clamp(36px, 7vw, 54px)",
            fontWeight: 650,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Namaste</span>
            <MdDirectionsRun style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px" }} color="#222222" />
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>I&apos;m</span>
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Ritam,</span>
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>a</span>
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Product</span>
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Designer</span>
            <MdLocalCafe style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px" }} color="var(--exp-hero-b, #ED7454)" />
            <span style={{ color: "var(--exp-hero-b, #ED7454)" }}>turning</span>
            <span style={{ color: "var(--exp-hero-b, #ED7454)" }}>complexity</span>
            <span style={{ color: "var(--exp-hero-b, #ED7454)" }}>into</span>
            <span style={{ color: "var(--exp-hero-b, #ED7454)" }}>clarity.</span>
          </h1>
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
