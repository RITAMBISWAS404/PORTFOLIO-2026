"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
      <motion.div style={{ width: 56, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,0,0,0.10)", transform }}>
        <div style={{ position: "absolute", inset: 0, background: "#ffffff" }} />
        <img src={egg ? "/images/happy-catto.gif" : "/images/avatar.png"} alt="Ritam Biswas"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} />
      </motion.div>
    </div>
  );
}

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
        {/* Identity — avatar + name side by side */}
        <motion.div variants={item} style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Avatar />
          <div>
            <div className="f16" style={{ fontWeight: 500, color: C.t1, letterSpacing: "0.01em" }}>Ritam Biswas</div>
            <div className="f16" style={{ fontWeight: 400, color: C.t2 }}>Product &amp; UX/UI Designer</div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div variants={item}>
          <h1 style={{
            fontSize: "clamp(36px, 7vw, 54px)",
            fontWeight: 550,
            color: C.t1,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            fontFamily: "Poppins, sans-serif",
          }}>
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>Complex data</span>{" "}
            <span style={{ color: "var(--exp-hero-b, var(--pop-blue))" }}>doesn&apos;t</span>
            <span style={{ color: "var(--exp-hero-b, var(--pop-blue))" }}> have to feel</span>{" "}
            <span style={{ color: "var(--exp-hero-a, var(--color-text-1))" }}>complex.</span>
          </h1>
        </motion.div>

        {/* Badges */}
        <motion.div variants={item} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["OPEN TO COLLABORATIONS", "2+ YEARS EXP", "MOBILE + WEB UX"].map(label => (
            <div key={label} style={{ ...tagStyle, padding: "5px 12px", borderRadius: 9999, background: "#ffffff", border: "1px solid rgba(0,0,0,0.10)", color: "#222222" }}>
              {label}
            </div>
          ))}
        </motion.div>

        {/* Body */}
        <motion.div variants={item}>
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
            transition: "opacity 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.88"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; }}>
            View my Work
          </a>
          <a href="#contact" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.05)", color: C.t1, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none",
            border: "1px solid rgba(0,0,0,0.05)",
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
