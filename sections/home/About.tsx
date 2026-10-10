"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useInView } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { MdConstruction, MdBook, MdSelfImprovement } from "react-icons/md";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import CardV3 from "@/components/home/CardV3";
import { C, revealStyle, col } from "@/lib/home/tokensV2";
import { stack, stackColors } from "@/data/home-content";
import { DESIGN_EXPERIENCE_START, formatDuration } from "@/lib/home/experienceDuration";

const EMAIL = "biswasritam404@gmail.com";

// Toolkit order for the marquee: design and prototyping tools lead, then research/AI, then build tools. Only tools already in the stack data.
const TOOL_ORDER = ["Figma", "Framer", "ProtoPie", "Miro", "Figr", "Notion", "Stitch", "v0", "Claude", "Gemini", "Claude Code", "VS Code"];
const tools = [...TOOL_ORDER.filter(n => stack.includes(n)), ...stack.filter(n => !TOOL_ORDER.includes(n))];

const info = [
  { label: "Designation", value: "Product Designer" },
  { label: "Experience",  value: "" },   // calculated from DESIGN_EXPERIENCE_START at runtime (see below)
  { label: "Location",    value: "Kolkata, WB" },
  { label: "Education",   value: "IIIT Kalyani '27" },
  { label: "Email",       value: EMAIL },
];

const cards = [
  { id: "about-building", title: "Currently Building", body: "Building a dating app. Fixing everyone's love life except mine.", icon: MdConstruction },
  { id: "about-reading",  title: "Outside of Design",  body: "Reading \"Before the Coffee Gets Cold.\" Coffee is clearly involved.", icon: MdBook },
];

const subscribeNever = () => () => {};
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
const keyToDate = (k: string) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m, d); };

export default function About() {
  const bioRef  = useRef(null);
  const bentRef = useRef(null);
  const bioInView  = useInView(bioRef,  { once: true, margin: "0px" });
  const bentInView = useInView(bentRef, { once: true, margin: "0px" });
  const [copied, setCopied] = useState(false);
  // Experience is derived from the start date and the visitor's current date. During hydration React uses the server's date;
  // useSyncExternalStore then swaps in the visitor's real current date, so a statically built page never shows a stale duration.
  const today = useSyncExternalStore(subscribeNever, todayKey, todayKey);
  const experience = formatDuration(DESIGN_EXPERIENCE_START, keyToDate(today));
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");
  const photoSrc = isNew ? "/images/ritam_new_light.png" : "/images/ritam_new.png";

  async function copyEmail() {
    let ok = false;
    try { await navigator.clipboard.writeText(EMAIL); ok = true; } catch {
      // clipboard API unavailable or blocked: fall back to a temporary selection
      try {
        const ta = document.createElement("textarea");
        ta.value = EMAIL; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); document.body.removeChild(ta);
      } catch { /* leave the address visible to copy by hand */ }
    }
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <section id="about" style={{ ...col }} className="hm-v3-section">
      <SectionHeadingV3 title="A Bit About Me" eyebrow="OBLIGATORY INTRODUCTION" icon={MdSelfImprovement} iconSrc="/images/About%20me.png" iconAfter={3} />

      {/* Bio */}
      <p ref={bioRef} className="hm-f16 hm-mt-section"
        style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7, ...revealStyle(bioInView) }}>
        Namaste!{" "}
        <strong style={{ color: "var(--hm-hero-b, #222222)", fontWeight: 600 }}>
          I&apos;m Ritam Biswas, a Product Designer with a CS background.
        </strong>{" "}
        I started out in graphic design and illustration, mostly chasing good visuals, until I realized that a
        beautiful interface means very little if nobody can use it. That shift from{" "}
        <strong style={{ color: "var(--hm-hero-b, #222222)", fontWeight: 600 }}>visual design to UX</strong>{" "}
        is what eventually led me to Product Design.
      </p>

      {/* Bento grid */}
      <div ref={bentRef} className="hm-about-bento hm-mt-el">

        {/* Image card */}
        <div className="hm-about-img-cell" data-cursor-kind="about" data-cursor-id="about-photo" style={{ ...revealStyle(bentInView, 0.04) }}>
          <div className="hm-about-img-inner" style={{
            borderRadius: 8,
            overflow: "hidden",
            background: "var(--hm-light-card-bg, var(--color-card))",
            border: "var(--hm-light-card-border, none)",
            boxSizing: "border-box",
            width: "100%",
            position: "relative",   // the photo is positioned inside this box (below), so its intrinsic size can never size the container
            boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "var(--hm-light-card-shadow, 0px 2px 9px 0px rgba(0,0,0,0.05))",
          }}>
            <img
              src={photoSrc}
              alt="Ritam Biswas"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
            />
          </div>
        </div>

        {/* Info card */}
        <div className="hm-about-info-cell" data-cursor-kind="about" style={{
          borderRadius: 8,
          background: "var(--hm-card-bg, #222222)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          minWidth: 0,
          overflow: "hidden",
          boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "0px 2px 9px 0px rgba(0,0,0,0.05)",
          ...revealStyle(bentInView, 0.10),
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 16px" }}>
            {info.map(({ label, value: rawValue }, i) => {
              const value = label === "Experience" ? experience : rawValue;
              const isLast = i === info.length - 1 && info.length % 2 !== 0;
              const isEmail = label === "Email";
              return (
                <div key={label} style={isLast ? { gridColumn: "1 / -1" } : {}}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--hm-card-heading, rgba(255,255,255,0.50))", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {label}
                  </div>
                  {isEmail ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="hm-f16" style={{ fontWeight: 600, color: "var(--hm-card-fg, #ffffff)" }}>{value}</div>
                      <button onClick={copyEmail} data-cursor-kind="copy" data-cursor-state={copied ? "done" : undefined} className="hm-about-copy" aria-label={copied ? "Email copied" : "Copy email address"} title="Copy email">
                        {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
                        <span className="hm-about-copy-msg" aria-live="polite">{copied ? "Copied" : ""}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="hm-f16" style={{ fontWeight: 600, color: "var(--hm-card-fg, #ffffff)" }} suppressHydrationWarning={label === "Experience"}>{value}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--hm-card-heading, rgba(255,255,255,0.50))", letterSpacing: "0.05em", marginBottom: 10 }}>
              My Toolkit
            </div>
            <div data-cursor-kind="toolkit" style={{ overflow: "hidden", position: "relative" }}>
              <div className="hm-tk-fade" style={{
                position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                background: `linear-gradient(to right, var(--hm-card-bg, #222222) 0%, transparent 18%, transparent 82%, var(--hm-card-bg, #222222) 100%)`,
              }} />
              <div className="hm-toolkit-track">
                {[...tools, ...tools].map((name, i) => {
                  const c = stackColors[name];
                  if (!c) return null;
                  const dup = i >= tools.length;
                  return (
                    <div key={i} title={name} aria-hidden={dup || undefined} className={dup ? "hm-tk-dup" : undefined} style={{
                      width: 44, height: 44, borderRadius: isNew ? 8 : 4, flexShrink: 0,
                      overflow: "hidden",
                      background: "var(--hm-about-item-bg, rgba(255,255,255,0.08))",
                    }}>
                      <img src={c.img} alt={dup ? "" : name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom cards row */}
        <div className="hm-about-cards-row">
          {cards.map((card, i) => (
            <CardV3 key={card.title} label={card.title} body={card.body} delay={0.16 + i * 0.08} icon={card.icon} cursorId={card.id} />
          ))}
        </div>
      </div>

      <style>{`
        .hm-about-bento       { display: grid; gap: 16px; grid-template-columns: 1fr; }
        .hm-about-img-cell    { grid-column: 1; }
        .hm-about-info-cell   { grid-column: 1; }
        .hm-about-cards-row   { grid-column: 1; display: grid; grid-template-columns: 1fr; gap: 16px; }
        .hm-about-img-inner   { aspect-ratio: 235 / 297; }   /* MOBILE_ABOUT_IMAGE: the desktop portrait box measures ~0.79 (235x297 at 1200px); was 1 / 1 */

        @media (min-width: 600px) {
          .hm-about-bento       { grid-template-columns: 1fr 2fr; }
          .hm-about-img-cell    { grid-column: 1; grid-row: 1; }
          .hm-about-info-cell   { grid-column: 2; grid-row: 1; }
          .hm-about-cards-row   { grid-column: 1 / -1; grid-row: 2; grid-template-columns: 1fr 1fr; }
          .hm-about-img-inner   { aspect-ratio: auto; height: 100%; }
        }

        .hm-toolkit-track {
          display: flex; gap: 8px; width: max-content;
          animation: toolkit-scroll 36s linear infinite;
        }
        .hm-toolkit-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .hm-toolkit-track { animation: none; width: auto; flex-wrap: wrap; }
          .hm-tk-dup, .hm-tk-fade { display: none !important; }
        }

        /* Email copy: clear hover / focus, small "Copied" confirmation */
        .hm-about-copy { background: none; border: none; cursor: pointer; padding: 4px 6px; display: flex; align-items: center; gap: 6px; flex-shrink: 0; border-radius: 8px;
          color: var(--hm-about-muted, rgba(255,255,255,0.45)); transition: color 0.2s, background 0.2s; }
        .hm-about-copy { position: relative; }
        .hm-about-copy::after { content: ""; position: absolute; inset: -11px -6px; }   /* invisible: grows the touch target to 44px tall */
        .hm-about-copy:hover { color: var(--hm-card-fg, #ffffff); background: rgba(255,255,255,0.10); }
        .hm-about-copy:focus-visible { outline: 2px solid #ffffff; outline-offset: 2px; color: var(--hm-card-fg, #ffffff); }
        .hm-about-copy[aria-label="Email copied"] { color: #4ade80; }
        .hm-about-copy-msg { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; }
        .hm-about-copy-msg:empty { display: none; }
        @keyframes toolkit-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
