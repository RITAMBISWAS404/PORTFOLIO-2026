"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReduceMotionSafe } from "@/lib/home/useReduceMotionSafe";
import { usePathname } from "next/navigation";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import { C, revealStyle, col } from "@/lib/home/tokensV2";
import { headingLg } from "@/lib/home/typography";

const DEVI_PAKSHA_LOGO_SRC = "/images/Devi-paksha-logo.png";
// autoplay=true (not "on-scroll"): the iframe is only mounted once useInView below
// confirms the player is already on-screen, so Cloudinary's own scroll-based trigger
// would just add a second, redundant visibility check — a common source of autoplay
// silently never firing on slower mobile connections.
const DEVI_PAKSHA_REEL_EMBED_SRC = "https://player.cloudinary.com/embed/?cloud_name=homtmxwb&public_id=devipaksha-reel&controls=false&autoplay=true&muted=true&loop=true&fluid=true";
const REEL_URL = "https://www.instagram.com/reel/Db92efXoaLf/";
const WEBSITE_URL = "https://www.devipaksha.in/";

// target: numeric value to count up to; decimals: fixed decimal places to
// render throughout the animation (so "1.1K+" never jitters to "1K+" or "1.14K+").
const stats = [
  { target: 300, decimals: 0, suffix: "K+", label: "Reel views" },
  { target: 30,  decimals: 0, suffix: "K+", label: "Reel likes" },
  { target: 1.1, decimals: 1, suffix: "K+", label: "Shares" },
  { target: 150, decimals: 0, suffix: "K+", label: "Website visitors" },
];

const COUNT_UP_DURATION = 1000;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Counts up from 0 to `target` once `active` becomes true, then holds — never
// restarts on subsequent `active` toggles. Skips straight to `target` for
// prefers-reduced-motion. Driven by rAF rather than React state per frame of
// anything else, so it doesn't touch unrelated parts of the tree.
function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;

    const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    if (reduceMotion) {
      raf = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / COUNT_UP_DURATION, 1);
      setValue(target * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);

  return value;
}

function StatValue({ target, decimals, suffix, active }: { target: number; decimals: number; suffix: string; active: boolean }) {
  const value = useCountUp(target, active);
  return (
    <div className="hm-dp-stat-value" style={{ fontSize: `calc(${headingLg.fontSize} * 0.8)` }}>
      {value.toFixed(decimals)}{suffix}
    </div>
  );
}

function ReelPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  return (
    <div ref={ref} className="hm-dp-video-card">
      {inView && (
        <iframe
          className="hm-dp-video"
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
  const statsRef = useRef(null);
  const reduce = useReduceMotionSafe();   // hydrates as "no preference" like the server, then switches (see the hook)
  const introInView = useInView(introRef, { once: true, margin: "0px" }) || reduce;   // reduced motion: everything is shown immediately
  const cardInView = useInView(cardRef, { once: true, margin: "0px" }) || reduce;
  // Count-up trigger: watches the stats grid itself (not the whole section/card),
  // firing once roughly half of it is on-screen, so the animation is still running
  // when the user actually scrolls the numbers into view.
  const statsInView = useInView(statsRef, { once: true, amount: 0.5 });

  return (
    <section id="devi-paksha" style={{ ...col }} className="hm-v3-section">
      <SectionHeadingV3 title="More Than Expected" eyebrow="A RECENT FLEX" iconSrc="/images/Flex.png" iconAfter={2} />

      <p ref={introRef} className="hm-f16 hm-mt-section" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6, ...revealStyle(introInView) }}>
        It started with a chai conversation about{" "}
        <strong style={{ color: "var(--hm-hero-b, #222222)", fontWeight: 600 }}>viral playlist sites</strong>{" "}
        and one simple question: why not make one for Durga Puja? So we built{" "}
        <strong style={{ color: "var(--hm-hero-b, #222222)", fontWeight: 600 }}>Devi Paksha</strong>, a playful mix of
        Bengali culture, nostalgia and Mahalaya music. A casual &ldquo;why not?&rdquo; turned into something people actually used.
      </p>

      <div ref={cardRef} className="hm-dp-grid hm-mt-el">
        <div className="hm-dp-video-cell" style={{
          boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "var(--hm-media-shadow, 0px 2px 9px 0px rgba(0,0,0,0.05))",
          ...revealStyle(cardInView, 0.04),
        }}>
          <ReelPreview />
        </div>

        {/* Right column: two separate cards, the gap between them is the only separation */}
        <div className="hm-dp-info-cell" style={revealStyle(cardInView, 0.10)}>
          {/* Card 1: project overview */}
          <div className="hm-dp-card" style={{ boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "0px 2px 9px 0px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="hm-v3-identity-logo" style={{ overflow: "hidden", flexShrink: 0 }}>
                <img src={DEVI_PAKSHA_LOGO_SRC} alt="Devi Paksha" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
              <div>
                <div className="hm-f16" style={{ fontWeight: 600, color: "var(--hm-card-fg, #ffffff)" }}>Devi Paksha</div>
                <div className="hm-f16" style={{ fontWeight: 500, color: "var(--hm-about-muted, rgba(255,255,255,0.65))" }}>A Digital Ode to Puja</div>
              </div>
            </div>

            <p className="hm-dp-body" style={{ fontWeight: 500, color: "var(--hm-about-muted, rgba(255,255,255,0.65))", lineHeight: 1.6, marginTop: 16 }}>
              An interactive digital experience bringing together Bengali culture, nostalgic music, Mahalaya and the atmosphere of Durga Puja.
            </p>
          </div>

          {/* Card 2: performance + actions */}
          <div className="hm-dp-card hm-dp-card-stats" style={{ boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "0px 2px 9px 0px rgba(0,0,0,0.05)" }}>
          <div className="hm-dp-metrics">
            <div className="hm-dp-stats-eyebrow">In the first 2 days</div>
            <div ref={statsRef} className="hm-dp-stats-grid">
              {stats.map(s => (
                <div key={s.label}>
                  <StatValue target={s.target} decimals={s.decimals} suffix={s.suffix} active={statsInView} />
                  <div className="hm-dp-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom group: CTAs */}
          <div className="hm-dp-result-group">
            <div className="hm-btn-row">
              <a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" data-cursor-kind="external" data-cursor-id="devi-paksha-site" className="hm-dp-cta hm-dp-cta-primary" style={{ borderRadius: isNew ? 8 : 9999 }}>
                Visit Website
              </a>
              <a href={REEL_URL} target="_blank" rel="noopener noreferrer" data-cursor-kind="external" data-cursor-id="devi-paksha-reel" className="hm-dp-cta hm-dp-cta-secondary" style={{ borderRadius: isNew ? 8 : 9999 }}>
                Watch the Reel
              </a>
            </div>
          </div>
          </div>
        </div>
      </div>

      <style>{`
        .hm-dp-grid       { display: grid; gap: 16px; grid-template-columns: 1fr; }
        .hm-dp-video-cell { grid-column: 1; border-radius: 8px; overflow: hidden; background: var(--hm-card-bg, #222222); box-sizing: border-box; }
        .hm-dp-info-cell  { grid-column: 1; }

        .hm-dp-video-card {
          position: relative; overflow: hidden; border-radius: 8px;
          aspect-ratio: 9 / 16; width: 100%; height: 100%;
        }
        .hm-dp-video { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; display: block; border-radius: 8px; }

        .hm-dp-info-cell { display: flex; flex-direction: column; gap: 16px; min-width: 0; }   /* two cards, one gap */
        .hm-dp-card { border-radius: 8px; background: var(--hm-card-bg, #222222); padding: 16px; box-sizing: border-box; overflow: hidden; }
        .hm-dp-card-stats { flex: 1 1 auto; display: flex; flex-direction: column; }          /* fills what is left of the media height; the CTAs stay at its bottom */

        .hm-dp-body { font-size: 14px; }

        .hm-dp-stats-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--hm-card-heading, rgba(255,255,255,0.50)); }
        /* Rhythm (stats card): label -> 12 -> metrics (20 between rows) -> 24 -> CTAs */
        .hm-dp-metrics { margin: 0; padding: 0; }
        .hm-dp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px 16px; margin-top: 12px; }
        .hm-dp-stat-value { font-weight: 700; letter-spacing: -0.01em; color: #ED7454; line-height: 1.15; }
        .hm-dp-stat-label  { font-size: 11px; font-weight: 600; color: var(--hm-card-heading, rgba(255,255,255,0.50)); letter-spacing: 0.05em; margin-top: 4px; }

        .hm-dp-result-group { margin-top: auto; padding-top: 24px; }   /* anchored to the bottom; 24px is the minimum gap above it */

        /* CTAs: same shapes as before; hover lift, press state, clear focus ring */
        .hm-dp-cta { display: flex; align-items: center; justify-content: center; padding: 11px 22px; font-size: 14px; font-weight: 600; text-decoration: none; border: none; transition: opacity 0.25s, background 0.25s, border-color 0.25s, transform 0.2s cubic-bezier(.22,1,.36,1); }
        .hm-dp-cta-primary { background: #ffffff; color: #111111; }
        .hm-dp-cta-secondary { background: var(--hm-dark-fill, rgba(255,255,255,0.10)); color: var(--hm-card-fg, #ffffff); border: 1px solid var(--hm-dark-border, transparent); padding: var(--hm-dark-btn-pad, 11px 22px); }
        .hm-dp-cta:hover { transform: translateY(-2px); }
        .hm-dp-cta-primary:hover { opacity: 0.88; }
        .hm-dp-cta-secondary:hover { background: var(--hm-dark-fill-hover, rgba(255,255,255,0.16)); }
        .hm-dp-cta:active { transform: translateY(0) scale(0.98); transition-duration: 0.1s; }
        .hm-dp-cta:focus-visible { outline: 2px solid #ffffff; outline-offset: 3px; }

        /* Media: a very small, slow response to hover on fine pointers; the cell clips it, nothing else moves */
        .hm-dp-video-card { transition: transform 700ms cubic-bezier(.22,1,.36,1); }
        @media (hover: hover) and (pointer: fine) { .hm-dp-video-cell:hover .hm-dp-video-card { transform: scale(1.015); } }
        @media (prefers-reduced-motion: reduce) {
          .hm-dp-video-card { transition: none; }
          .hm-dp-video-cell:hover .hm-dp-video-card { transform: none; }
          .hm-dp-cta, .hm-dp-cta:hover, .hm-dp-cta:active { transition: none; transform: none; }
        }

        @media (min-width: 600px) {
          .hm-dp-grid       { grid-template-columns: 1fr 1.4fr; align-items: stretch; }
          .hm-dp-video-cell { grid-column: 1; grid-row: 1; }
          .hm-dp-info-cell  { grid-column: 2; grid-row: 1; }
                }
      `}</style>
    </section>
  );
}
