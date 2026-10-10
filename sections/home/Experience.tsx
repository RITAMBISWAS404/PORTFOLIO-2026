"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { usePathname } from "next/navigation";
import { MdStyle } from "react-icons/md";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import GrassCard from "@/components/home/GrassCard";
import { experience } from "@/data/home-content";
import { revealStyle, col } from "@/lib/home/tokensV2";

// Figma: https://www.figma.com/design/bNFl0RkpGoTcFlRArpiUeI/portfolio-recreate?node-id=13-1747
// Logo (40x40, 4px radius) + company/role stacked, dark; date | mode | location line, gray, below.

function LogoIcon({ src, alt, fallback, fallbackBg }: { src?: string; alt: string; fallback?: string; fallbackBg?: string }) {
  if (src) {
    return (
      <div className="hm-v3-hm-logo" style={{ overflow: "hidden", flexShrink: 0, background: "#ffffff" }}>
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return (
    <div className="hm-v3-hm-logo" style={{
      flexShrink: 0, background: fallbackBg,
      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "#fff",
    }}>{fallback}</div>
  );
}

function ExperienceCard({ e, delay, isNew }: { e: typeof experience[0]; delay: number; isNew: boolean }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const [date, mode, location] = e.meta.split(' | ');
  const role = e.role.replace(/\s+at$/i, "");
  const logos = e.img ? (Array.isArray(e.img) ? e.img : [e.img]) : null;

  return (
    <div ref={ref} className="hm-hm-card hm-lift" data-cursor-kind="experience" data-cursor-id={e.id} style={{
      background: "var(--hm-light-card-bg, #ffffff)",
      border: "var(--hm-light-card-border, none)",
      boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "var(--hm-light-card-shadow, 0px 2px 9px 0px rgba(0,0,0,0.05))",
      borderRadius: 8,
      padding: 16,
      display: "flex", flexDirection: "column", gap: 8,
      overflow: "hidden",
      ...revealStyle(inView, delay),
      transition: `${revealStyle(inView, delay).transition}, translate 200ms cubic-bezier(.22,1,.36,1), box-shadow 200ms cubic-bezier(.22,1,.36,1), border-color 200ms cubic-bezier(.22,1,.36,1)`,
    }}>

      {/* Logo(s) + company name / role, stacked */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {logos
          ? logos.map((src, idx) => <LogoIcon key={idx} src={src} alt={e.company} />)
          : <LogoIcon alt={e.company} fallback={e.logo} fallbackBg={e.logoBg} />
        }
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="hm-f16" style={{ fontWeight: 600, color: "var(--hm-black, #222222)" }}>{e.company}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--hm-black, #222222)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{role}</span>
        </div>
      </div>

      {/* Date | mode | location */}
      <div style={{ fontSize: 12, fontWeight: 600, color: "#909090", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        <span className="hm-v3-hm-meta-compact">{date} | {location}</span>
        <span className="hm-v3-hm-meta-full">{date} | {mode} | {location}</span>
      </div>

      {/* Description — dropped on live per the Figma card layout, kept on /new */}
      {isNew && (
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--hm-black, #222222)", lineHeight: 1.6 }}>{e.desc}</p>
      )}

      {/* The EU startup entry is partly confidential. Pointer users get the cursor cue (ID_POOL.startup); this line is the same cue for screen readers and for touch, where there is no hover. */}
      {e.id === "startup" && (
        <span style={{ position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}>
          Part of this work is confidential. Get in touch to hear more.
        </span>
      )}
    </div>
  );
}

export default function Experience() {
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  return (
    <section id="experience" style={{ ...col }} className="hm-v3-section">
      <SectionHeadingV3 title="My Design Journey" eyebrow="SOMEHOW EMPLOYED" icon={MdStyle} iconSrc="/images/How%20i%20work-1.png" iconAfter={2} />
      <div className={isNew ? "hm-mt-section" : "hm-mt-section hm-hm-grid"} style={isNew ? { display: "flex", flexDirection: "column", gap: 16 } : undefined}>
        {experience.map((e, i) => (
          <ExperienceCard key={e.company} e={e} delay={i * 0.06} isNew={isNew} />
        ))}
        {!isNew && experience.length % 2 !== 0 && <GrassCard />}
      </div>
      <style>{`
        .hm-v3-hm-meta-full    { display: none; }
        .hm-v3-hm-meta-compact { display: inline; }
        .hm-v3-hm-logo { width: 32px; height: 32px; border-radius: 4px; font-size: 9px; }
        .hm-hm-grid { display: flex; flex-direction: column; gap: 16px; }
        .hm-hm-filler {
          display: none;
          background: var(--hm-light-card-bg, #ffffff);
          border: var(--hm-light-card-border, none);
          box-shadow: var(--hm-light-card-shadow, 0px 2px 9px 0px rgba(0,0,0,0.05));
          border-radius: 8px;
          padding: 16px;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .hm-hm-filler span {
          font-size: 12px; font-weight: 600; color: #909090;
          letter-spacing: 0.06em; text-transform: uppercase; line-height: 1.6;
        }
        @media (min-width: 600px) {
          .hm-hm-grid { display: grid; grid-template-columns: 1fr 1fr; }
          .hm-hm-filler { display: flex; }
        }
        @media (min-width: 768px) {
          .hm-v3-hm-meta-full    { display: inline; }
          .hm-v3-hm-meta-compact { display: none; }
          .hm-v3-hm-logo { width: 40px; height: 40px; font-size: 11px; }
        }
      `}</style>
    </section>
  );
}
