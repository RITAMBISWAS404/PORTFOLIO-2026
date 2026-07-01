"use client";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle, Handshake, Calendar, Smartphone, Network } from "lucide-react";
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
      style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <motion.div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", transform }}>
        <div style={{ position: "absolute", inset: 0, background: "#ffffff" }} />
        <img src={egg ? "/images/happy-catto.gif" : "/images/avatar.png"} alt="Ritam Biswas"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }} />
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const { ready } = useAppReady();
  return (
    <section id="hero" style={{ maxWidth: 768, margin: "0 auto", padding: "48px 24px 0", textAlign: "center" }}>
      <motion.div
        variants={container}
        initial="hidden"
        animate={ready ? "show" : "hidden"}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
      >
        {/* Avatar */}
        <motion.div variants={item}>
          <Avatar />
        </motion.div>

        {/* Identity */}
        <motion.div variants={item} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.t1, letterSpacing: "0.01em" }}>Ritam Biswas</div>
          <div style={{ fontSize: 14, fontWeight: 400, color: C.t2 }}>Product &amp; UX/UI Designer</div>
        </motion.div>

        {/* Heading */}
        <motion.div variants={item}>
          <h1 style={{
            fontSize: "clamp(36px, 7vw, 54px)",
            fontWeight: 700,
            color: C.t1,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            fontFamily: "Poppins, sans-serif",
          }}>
            Complex data doesn&apos;t have to feel complex.
          </h1>
        </motion.div>

        {/* Body */}
        <motion.div variants={item}>
          <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, maxWidth: 520 }}>
            I turn information-heavy products into clean, minimal experiences. 2+ years building
            for startups, most recently a Copenhagen-based EV energy company.
          </p>
        </motion.div>

        {/* Badges */}
        <motion.div variants={item} style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {[
            { label: "OPEN TO COLLABORATIONS", icon: <Handshake  size={12} color="#fff" strokeWidth={2} />, bg: "var(--pop-green)" },
            { label: "2+ YEARS EXP",           icon: <Calendar   size={12} color="#fff" strokeWidth={2} />, bg: "var(--pop-orange)" },
            { label: "MOBILE + WEB UX",        icon: <Smartphone size={12} color="#fff" strokeWidth={2} />, bg: "var(--pop-blue)" },
            { label: "SYSTEMS THINKING",       icon: <Network    size={12} color="#fff" strokeWidth={2} />, bg: "var(--pop-pink)" },
          ].map(b => (
            <div key={b.label} style={{ ...tagStyle, borderRadius: 8, background: b.bg, border: "none", color: "#fff" }}>
              {b.icon} {b.label}
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="btn-row" style={{ justifyContent: "center" }}>
          <a href="#projects" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: C.t1, color: C.bg, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s, box-shadow 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.9"; a.style.transform = "translateY(-2px)"; a.style.boxShadow = "0 4px 16px rgba(0,0,0,0.18)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; a.style.boxShadow = ""; }}>
            <ArrowRight size={14} strokeWidth={2} /> View my Work
          </a>
          <a href="#contact" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "var(--color-hover-bg)", color: C.t1, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none",
            border: `1px solid ${C.border}`,
            transition: "background 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "var(--color-hover)"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "var(--color-hover-bg)"; a.style.transform = ""; }}>
            <MessageCircle size={14} strokeWidth={2} /> Let&apos;s Talk
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
