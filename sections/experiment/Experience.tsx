"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import SectionHeadingV3 from "@/components/experiment/SectionHeadingV3";
import { experience } from "@/data/experiment-content";
import { revealStyle, col } from "@/lib/experiment/tokensV2";

// Figma: https://www.figma.com/design/bNFl0RkpGoTcFlRArpiUeI/portfolio-recreate?node-id=13-1747
// Same card-chip family as the stat cards: white, no stroke, subtle shadow, 8px radius.

function LogoIcon({ src, alt, fallback, fallbackBg }: { src?: string; alt: string; fallback?: string; fallbackBg?: string }) {
  if (src) {
    return (
      <div style={{ width: 24, height: 24, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "#ffffff" }}>
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return (
    <div style={{
      width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: fallbackBg,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 600, color: "#fff",
    }}>{fallback}</div>
  );
}

function ExperienceCard({ e, delay }: { e: typeof experience[0]; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [date, mode, location] = e.meta.split(' | ');
  const role = e.role.replace(/\s+at$/i, "");
  const logos = e.img ? (Array.isArray(e.img) ? e.img : [e.img]) : null;

  return (
    <div ref={ref} style={{
      background: "#ffffff",
      boxShadow: "0px 2px 8px 0px rgba(0,0,0,0.05)",
      borderRadius: 8,
      padding: 16,
      display: "flex", flexDirection: "column", gap: 8,
      overflow: "hidden",
      ...revealStyle(inView, delay),
      transition: `${revealStyle(inView, delay).transition}, transform 0.2s cubic-bezier(.22,1,.36,1)`,
    }}
    onMouseEnter={ev => { ev.currentTarget.style.transform = "translateY(-4px)"; }}
    onMouseLeave={ev => { ev.currentTarget.style.transform = inView ? "translateY(0)" : "translateY(16px)"; }}>

      {/* Logo(s) + company */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {logos
          ? logos.map((src, idx) => <LogoIcon key={idx} src={src} alt={e.company} />)
          : <LogoIcon alt={e.company} fallback={e.logo} fallbackBg={e.logoBg} />
        }
        <span className="exp-f16" style={{ fontWeight: 600, color: "#222222" }}>{e.company}</span>
      </div>

      {/* Role — mode • location • dates */}
      <div className="exp-meta-row" style={{
        fontSize: 12, fontWeight: 600, color: "#909090", letterSpacing: "0.06em", textTransform: "uppercase",
      }}>
        <span>{role}</span>
        {/* Mobile: dates only. Desktop: mode • location • dates. */}
        <span className="exp-meta-compact">{date}</span>
        <span className="exp-meta-full">
          {mode} <span style={{ color: "rgba(144,144,144,0.5)" }}>&bull;</span> {location} <span style={{ color: "rgba(144,144,144,0.5)" }}>&bull;</span> {date}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, fontWeight: 500, color: "#222222", lineHeight: 1.6 }}>{e.desc}</p>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" style={{ ...col }} className="exp-v3-section">
      <SectionHeadingV3 title="Experience" eyebrow="SOMEHOW EMPLOYED" />
      <div className="exp-mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {experience.map((e, i) => (
          <ExperienceCard key={e.company} e={e} delay={i * 0.06} />
        ))}
      </div>
      <style>{`
        .exp-meta-row {
          display: flex; flex-direction: column; align-items: flex-start; gap: 4px;
        }
        .exp-meta-full    { display: none; }
        .exp-meta-compact { display: inline; }
        @media (min-width: 768px) {
          .exp-meta-row {
            flex-direction: row; flex-wrap: wrap; align-items: center; justify-content: space-between;
          }
          .exp-meta-full    { display: inline; }
          .exp-meta-compact { display: none; }
        }
      `}</style>
    </section>
  );
}
