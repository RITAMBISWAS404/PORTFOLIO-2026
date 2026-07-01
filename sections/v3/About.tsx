"use client";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { User, Copy, Check } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import Card from "@/components/Card";
import { C, revealStyle, col } from "@/lib/tokensV2";
import { stack, stackColors } from "@/data/content";

const EMAIL = "biswasritam404@gmail.com";

const info = [
  { label: "Designation", value: "Product Designer" },
  { label: "Experience",  value: "2 years 6 months" },
  { label: "Location",    value: "Kolkata, WB" },
  { label: "Education",   value: "IIIT Kalyani '27" },
  { label: "Email",       value: EMAIL },
];

const cards = [
  {
    title: "Currently Building",
    body:  "A dating app concept I'm not ready to talk about, except that it isn't another swipe deck. More soon.",
  },
  {
    title: "Outside of Design",
    body:  "You'll probably find me rereading Jhumpa Lahiri's books. New releases keep losing to old favorites.",
  },
];

export default function About() {
  const bioRef  = useRef(null);
  const bentRef = useRef(null);
  const bioInView  = useInView(bioRef,  { once: true, margin: "-10% 0px" });
  const bentInView = useInView(bentRef, { once: true, margin: "-10% 0px" });
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="about" style={{ ...col, padding: "64px 24px 0" }}>
      <SectionLabel icon={User} label="ABOUT ME" num="03" iconColor={C.accent} />

      {/* Bio */}
      <p ref={bioRef} className="f16"
        style={{ fontWeight: 400, color: C.t2, lineHeight: 1.7, marginTop: 24, ...revealStyle(bioInView) }}>
        Namaste!{" "}
        <strong style={{ color: C.t1, fontWeight: 500 }}>
          I&apos;m Ritam Biswas, a Product Designer with a CS background.
        </strong>{" "}
        I spent my early years as a graphic designer and illustrator, chasing good visuals, until I
        realized good visuals mean nothing if no one can use them.{" "}
        <strong style={{ color: C.t1, fontWeight: 500 }}>Graphic designer turned UX designer</strong>,
        that&apos;s the short version of how I got here. I&apos;m currently a Founding Product Designer for a
        Denmark-based EV energy startup, 2+ years into the role, with the app I designed live on the
        App Store and Play Store.
      </p>

      {/* Bento grid */}
      <div ref={bentRef} className="about-bento" style={{ marginTop: 24 }}>

        {/* Image card */}
        <div className="about-img-cell" style={{ ...revealStyle(bentInView, 0.04) }}>
          <div className="about-img-inner" style={{
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            overflow: "hidden",
            background: C.card,
            width: "100%",
          }}>
            <img
              src="/images/ritam.jpeg"
              alt="Ritam Biswas"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>

        {/* Info card */}
        <div className="about-info-cell" style={{
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          background: C.card,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          minWidth: 0,
          overflow: "hidden",
          ...revealStyle(bentInView, 0.10),
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 16px" }}>
            {info.map(({ label, value }, i) => {
              const isLast = i === info.length - 1 && info.length % 2 !== 0;
              const isEmail = label === "Email";
              return (
                <div key={label} style={isLast ? { gridColumn: "1 / -1" } : {}}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, letterSpacing: "0.05em", marginBottom: 4 }}>
                    {label}
                  </div>
                  {isEmail ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="f16" style={{ fontWeight: 500, color: C.t1 }}>{value}</div>
                      <button onClick={copyEmail} title="Copy email" style={{
                        background: "none", border: "none", cursor: "pointer", padding: 4,
                        color: copied ? C.accent : C.t3,
                        display: "flex", alignItems: "center",
                        borderRadius: 4,
                        transition: "color 0.2s",
                        flexShrink: 0,
                      }}>
                        {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
                      </button>
                    </div>
                  ) : (
                    <div className="f16" style={{ fontWeight: 500, color: C.t1 }}>{value}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, letterSpacing: "0.05em", marginBottom: 10 }}>
              My Toolkit
            </div>
            <div style={{ overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
                background: `linear-gradient(to right, ${C.card} 0%, transparent 18%, transparent 82%, ${C.card} 100%)`,
              }} />
              <div className="toolkit-track">
                {[...stack, ...stack].map((name, i) => {
                  const c = stackColors[name];
                  if (!c) return null;
                  return (
                    <div key={i} title={name} style={{
                      width: 44, height: 44, borderRadius: 4, flexShrink: 0,
                      overflow: "hidden", border: `1px solid ${C.border}`,
                      background: C.card,
                    }}>
                      <img src={c.img} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom cards row */}
        <div className="about-cards-row">
          {cards.map((card, i) => (
            <Card key={card.title} label={card.title} num="" body={card.body} delay={0.16 + i * 0.08} />
          ))}
        </div>
      </div>

      <style>{`
        .about-bento       { display: grid; gap: 16px; grid-template-columns: 1fr; }
        .about-img-cell    { grid-column: 1; }
        .about-info-cell   { grid-column: 1; }
        .about-cards-row   { grid-column: 1; display: grid; grid-template-columns: 1fr; gap: 16px; }
        .about-img-inner   { aspect-ratio: 1 / 1; }

        @media (min-width: 600px) {
          .about-bento       { grid-template-columns: 1fr 2fr; }
          .about-img-cell    { grid-column: 1; grid-row: 1; }
          .about-info-cell   { grid-column: 2; grid-row: 1; }
          .about-cards-row   { grid-column: 1 / -1; grid-row: 2; grid-template-columns: 1fr 1fr; }
          .about-img-inner   { aspect-ratio: auto; height: 100%; }
        }

        .toolkit-track {
          display: flex; gap: 8px; width: max-content;
          animation: toolkit-scroll 18s linear infinite;
        }
        .toolkit-track:hover { animation-play-state: paused; }
        @keyframes toolkit-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
