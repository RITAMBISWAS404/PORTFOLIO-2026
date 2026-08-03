"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { usePathname } from "next/navigation";
import { MdStyle } from "react-icons/md";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { experience } from "@/data/content";
import { revealStyle, col } from "@/lib/tokensV2";

// Figma: https://www.figma.com/design/bNFl0RkpGoTcFlRArpiUeI/portfolio-recreate?node-id=13-1747
// Logo (40x40, 4px radius) + company/role stacked, dark; date | mode | location line, gray, below.

function LogoIcon({ src, alt, fallback, fallbackBg }: { src?: string; alt: string; fallback?: string; fallbackBg?: string }) {
  if (src) {
    return (
      <div className="v3-exp-logo" style={{ overflow: "hidden", flexShrink: 0, background: "#ffffff" }}>
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  return (
    <div className="v3-exp-logo" style={{
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
    <div ref={ref} style={{
      background: isNew ? "#ffffff" : "#f4f4f4",
      boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "none",
      borderRadius: isNew ? 8 : 0,
      padding: 16,
      display: "flex", flexDirection: "column", gap: 8,
      overflow: "hidden",
      ...revealStyle(inView, delay),
      transition: `${revealStyle(inView, delay).transition}, transform 0.2s cubic-bezier(.22,1,.36,1)`,
    }}
    onMouseEnter={ev => { ev.currentTarget.style.transform = "translateY(-4px)"; }}
    onMouseLeave={ev => { ev.currentTarget.style.transform = inView ? "translateY(0)" : "translateY(16px)"; }}>

      {/* Logo(s) + company name / role, stacked */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {logos
          ? logos.map((src, idx) => <LogoIcon key={idx} src={src} alt={e.company} />)
          : <LogoIcon alt={e.company} fallback={e.logo} fallbackBg={e.logoBg} />
        }
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="f16" style={{ fontWeight: 600, color: "var(--exp-black, #222222)" }}>{e.company}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--exp-black, #222222)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{role}</span>
        </div>
      </div>

      {/* Date | mode | location */}
      <div style={{ fontSize: 12, fontWeight: 600, color: "#909090", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        <span className="v3-exp-meta-compact">{date}</span>
        <span className="v3-exp-meta-full">{date} | {mode} | {location}</span>
      </div>

      {/* Description — dropped on live per the Figma card layout, kept on /new */}
      {isNew && (
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--exp-black, #222222)", lineHeight: 1.6 }}>{e.desc}</p>
      )}
    </div>
  );
}

export default function Experience() {
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  return (
    <section id="experience" style={{ ...col }} className="v3-section">
      <SectionHeadingV3 title="My Design Journey" eyebrow="SOMEHOW EMPLOYED" icon={MdStyle} iconSrc="/images/How%20i%20work-1.png" iconAfter={2} />
      <div className={isNew ? "mt-section" : "mt-section exp-grid"} style={isNew ? { display: "flex", flexDirection: "column", gap: 16 } : undefined}>
        {experience.map((e, i) => (
          <ExperienceCard key={e.company} e={e} delay={i * 0.06} isNew={isNew} />
        ))}
        {!isNew && experience.length % 2 !== 0 && (
          <div className="exp-filler">
            <span>Guess I should stop working<br />and touch some grass.</span>
          </div>
        )}
      </div>
      <style>{`
        .v3-exp-meta-full    { display: none; }
        .v3-exp-meta-compact { display: inline; }
        .v3-exp-logo { width: 32px; height: 32px; border-radius: ${isNew ? "4px" : "0"}; font-size: 9px; }
        .exp-grid { display: flex; flex-direction: column; gap: 16px; }
        .exp-filler {
          display: none;
          background: #f4f4f4;
          padding: 16px;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .exp-filler span {
          font-size: 12px; font-weight: 600; color: #909090;
          letter-spacing: 0.06em; text-transform: uppercase; line-height: 1.6;
        }
        @media (min-width: 600px) {
          .exp-grid { display: grid; grid-template-columns: 1fr 1fr; }
          .exp-filler { display: flex; }
        }
        @media (min-width: 768px) {
          .v3-exp-meta-full    { display: inline; }
          .v3-exp-meta-compact { display: none; }
          .v3-exp-logo { width: 40px; height: 40px; font-size: 11px; }
        }
      `}</style>
    </section>
  );
}
