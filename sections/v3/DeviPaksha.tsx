"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { usePathname } from "next/navigation";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { C, revealStyle, col } from "@/lib/tokensV2";
import { headingLg } from "@/lib/typography";

const DEVI_PAKSHA_LOGO_SRC = "/images/Devi-paksha-logo.png";
// autoplay=true (not "on-scroll"): the iframe is only mounted once useInView below
// confirms the player is already on-screen, so Cloudinary's own scroll-based trigger
// would just add a second, redundant visibility check — a common source of autoplay
// silently never firing on slower mobile connections.
const DEVI_PAKSHA_REEL_EMBED_SRC = "https://player.cloudinary.com/embed/?cloud_name=homtmxwb&public_id=devipaksha-reel&controls=false&autoplay=true&muted=true&loop=true&fluid=true";
const REEL_URL = "https://www.instagram.com/reel/Db92efXoaLf/";
const WEBSITE_URL = "https://www.devipaksha.in/";

const stats = [
  { value: "300K+", label: "Reel views" },
  { value: "30K+",  label: "Reel likes" },
  { value: "1.1K+", label: "Shares" },
  { value: "150K+", label: "Website visitors" },
];

function ReelPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  return (
    <div ref={ref} className="dp-video-card">
      {inView && (
        <iframe
          className="dp-video"
          src={DEVI_PAKSHA_REEL_EMBED_SRC}
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          title="Devi Paksha reel"
        />
      )}
    </div>
  );
}

export default function DeviPaksha() {
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");
  const introRef = useRef(null);
  const cardRef = useRef(null);
  const introInView = useInView(introRef, { once: true, margin: "0px" });
  const cardInView = useInView(cardRef, { once: true, margin: "0px" });

  return (
    <section id="devi-paksha" style={{ ...col }} className="v3-section">
      <SectionHeadingV3 title="More Than Expected" eyebrow="A RECENT FLEX" iconSrc="/images/Flex.png" iconAfter={2} />

      <p ref={introRef} className="f16 mt-section" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6, ...revealStyle(introInView) }}>
        It started with a chai conversation about{" "}
        <strong style={{ color: "var(--exp-hero-b, #222222)", fontWeight: 600 }}>viral playlist sites</strong>,
        which led to one simple question: why not make one for Durga Puja? So we built{" "}
        <strong style={{ color: "var(--exp-hero-b, #222222)", fontWeight: 600 }}>Devi Paksha</strong>,
        blending Bengali culture, nostalgia, Mahalaya, music, and the feeling of Puja into one interactive
        experience. A casual &ldquo;why not?&rdquo; became something people are actually using.
      </p>

      <div ref={cardRef} className="dp-grid mt-el">
        <div className="dp-video-cell" style={{
          boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "0px 2px 9px 0px rgba(0,0,0,0.05)",
          ...revealStyle(cardInView, 0.04),
        }}>
          <ReelPreview />
        </div>

        <div className="dp-info-cell" style={{
          boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "0px 2px 9px 0px rgba(0,0,0,0.05)",
          ...revealStyle(cardInView, 0.10),
        }}>
          {/* Top group: project info + stats */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="v3-identity-logo" style={{ overflow: "hidden", flexShrink: 0 }}>
                <img src={DEVI_PAKSHA_LOGO_SRC} alt="Devi Paksha" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div className="f16" style={{ fontWeight: 600, color: "var(--exp-card-fg, #ffffff)" }}>Devi Paksha</div>
                <div className="f16" style={{ fontWeight: 500, color: "var(--exp-about-muted, rgba(255,255,255,0.65))" }}>A Digital Ode to Puja</div>
              </div>
            </div>

            <p className="dp-body" style={{ fontWeight: 500, color: "var(--exp-about-muted, rgba(255,255,255,0.65))", lineHeight: 1.6, marginTop: 16 }}>
              An interactive digital experience built around Durga Puja, bringing together nostalgic music, Mahalaya, Bengali culture, and a visual experience inspired by the atmosphere of Puja.
            </p>

            <p className="dp-body" style={{ fontWeight: 500, color: "var(--exp-about-muted, rgba(255,255,255,0.65))", lineHeight: 1.6, marginTop: 8 }}>
              The project went live, and these numbers capture what happened during its first{" "}
              <span style={{ color: "var(--exp-card-fg, #ffffff)" }}>2 days</span>.
            </p>

            <div className="dp-stats-grid">
              {stats.map(s => (
                <div key={s.label}>
                  <div className="dp-stat-value" style={{ fontSize: `calc(${headingLg.fontSize} * 0.65)` }}>{s.value}</div>
                  <div className="dp-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom group: CTAs */}
          <div className="dp-result-group">
            <div className="btn-row">
              <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#ffffff", color: "#111111", padding: "11px 22px",
                borderRadius: isNew ? 8 : 9999, fontSize: 14, fontWeight: 600, textDecoration: "none",
                transition: "opacity 0.25s, transform 0.25s",
              }}
                onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.88"; a.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; }}>
                Visit Website
              </a>
              <a href={REEL_URL} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.10)", color: "var(--exp-card-fg, #ffffff)", padding: "11px 22px",
                borderRadius: isNew ? 8 : 9999, fontSize: 14, fontWeight: 600, textDecoration: "none", border: "none",
                transition: "background 0.25s, transform 0.25s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.16)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.10)"; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}>
                Watch the Reel
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dp-grid       { display: grid; gap: 16px; grid-template-columns: 1fr; }
        .dp-video-cell { grid-column: 1; border-radius: 8px; overflow: hidden; background: var(--exp-card-bg, #222222); box-sizing: border-box; }
        .dp-info-cell  { grid-column: 1; }

        .dp-video-card {
          position: relative; overflow: hidden; border-radius: 8px;
          aspect-ratio: 9 / 16; width: 100%; height: 100%;
        }
        .dp-video { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; border-radius: 8px; }

        .dp-info-cell {
          border-radius: 8px;
          background: var(--exp-card-bg, #222222);
          padding: 16px;
          display: flex; flex-direction: column; justify-content: space-between;
          box-sizing: border-box; overflow: hidden;
        }

        .dp-body { font-size: 14px; }

        .dp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; }
        .dp-stat-value { font-weight: 700; letter-spacing: -0.01em; color: #ED7454; line-height: 1.15; }
        .dp-stat-label  { font-size: 11px; font-weight: 600; color: var(--exp-card-heading, rgba(255,255,255,0.50)); letter-spacing: 0.05em; margin-top: 4px; }

        .dp-result-group { margin-top: 24px; }

        @media (min-width: 600px) {
          .dp-grid       { grid-template-columns: 1fr 1.4fr; align-items: stretch; }
          .dp-video-cell { grid-column: 1; grid-row: 1; }
          .dp-info-cell  { grid-column: 2; grid-row: 1; }
          .dp-info-cell  { height: 100%; }
        }
      `}</style>
    </section>
  );
}
