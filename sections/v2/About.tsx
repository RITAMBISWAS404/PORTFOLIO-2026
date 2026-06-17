"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { User } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { C, revealStyle, col } from "@/lib/tokensV2";
import { stack, stackColors } from "@/data/content";

const info = [
  { label: "Designation", value: "PRODUCT DESIGNER" },
  { label: "Experience",  value: "2 years 6 months" },
  { label: "Location",    value: "Kolkata, WB" },
  { label: "Education",   value: "IIIT KALYANI '27" },
  { label: "Status",      value: "Open to Collaboration" },
];

const cards = [
  {
    title: "Currently Building",
    body:  "Outside the day job, I'm building [X], because [real reason].",
  },
  {
    title: "Outside of Design",
    body:  "Re-reading the same five sci-fi novels because I'm bad at finishing new ones.",
  },
];

export default function About() {
  const bioRef  = useRef(null);
  const bentRef = useRef(null);
  const bioInView  = useInView(bioRef,  { once: true, margin: "-10% 0px" });
  const bentInView = useInView(bentRef, { once: true, margin: "-10% 0px" });

  return (
    <section id="about" style={{ ...col, padding: "64px 24px 0" }}>
      <SectionLabel icon={User} label="ABOUT ME" num="05" iconColor={C.accent} />

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
        that&apos;s the short version of how I got here. Now I build a Denmark-based startup&apos;s EV
        charging app from the ground up, live on the App Store and Play Store. ZENO below is that story
        in detail.
      </p>

      {/* Bento grid */}
      <div ref={bentRef} className="about-bento" style={{ marginTop: 24 }}>

        {/* Image card — 1:1 on mobile, fills row height on desktop */}
        <div className="about-img-cell" style={{ ...revealStyle(bentInView, 0.04) }}>
          <div className="about-img-inner" style={{
            border: `1px solid ${C.border}`,
            borderRadius: 16,
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

        {/* Info card — flex-column, hugs content */}
        <div className="about-info-cell" style={{
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          background: C.card,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          minWidth: 0,
          overflow: "hidden",
          ...revealStyle(bentInView, 0.10),
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 16px" }}>
            {info.map(({ label, value }, i) => (
              <div key={label} style={i === info.length - 1 && info.length % 2 !== 0 ? { gridColumn: "1 / -1" } : {}}>
                <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, letterSpacing: "0.05em", marginBottom: 4 }}>
                  {label}
                </div>
                <div className="f16" style={{ fontWeight: 500, color: C.t1 }}>{value}</div>
              </div>
            ))}
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
                      width: 44, height: 44, borderRadius: 11, flexShrink: 0,
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

        {/* Bottom cards row — always 50/50 regardless of top grid ratio */}
        <div className="about-cards-row">
          {cards.map((card, i) => (
            <div key={card.title} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: 20,
              ...revealStyle(bentInView, 0.16 + i * 0.08),
            }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.t1, marginBottom: 10 }}>{card.title}</div>
              <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, margin: 0 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, marginTop: 32, ...revealStyle(bentInView, 0.30) }}>
        Wanna get in touch for a cool project? Email me,{" "}
        <a href="mailto:biswasritam404@gmail.com"
          style={{ color: C.t1, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: C.border }}>
          biswasritam404@gmail.com
        </a>
      </p>

      <style>{`
        /* Mobile: single column stack */
        .about-bento       { display: grid; gap: 16px; grid-template-columns: 1fr; }
        .about-img-cell    { grid-column: 1; }
        .about-info-cell   { grid-column: 1; }
        .about-cards-row   { grid-column: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Mobile image is 1:1 */
        .about-img-inner   { aspect-ratio: 1 / 1; }

        /* Desktop: 3-column feel — image 1fr, info 2fr, cards row spans full */
        @media (min-width: 600px) {
          .about-bento       { grid-template-columns: 1fr 2fr; }
          .about-img-cell    { grid-column: 1; grid-row: 1; }
          .about-info-cell   { grid-column: 2; grid-row: 1; }
          .about-cards-row   { grid-column: 1 / -1; grid-row: 2; }
          /* Image fills the row height instead of staying 1:1 */
          .about-img-inner   { aspect-ratio: auto; height: 100%; }
        }

        .toolkit-track {
          display: flex;
          gap: 8px;
          width: max-content;
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
