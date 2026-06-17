"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { User } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { C, revealStyle, col } from "@/lib/tokensV2";

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

        {/* Image card — always 1:1 */}
        <div className="about-img-cell" style={{ ...revealStyle(bentInView, 0.04) }}>
          <div style={{
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            overflow: "hidden",
            background: C.card,
            width: "100%",
            aspectRatio: "1 / 1",
          }}>
            <img
              src="/images/avatar.png"
              alt="Ritam Biswas"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </div>

        {/* Info card */}
        <div className="about-info-cell" style={{
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          background: C.card,
          padding: "20px 20px 24px",
          ...revealStyle(bentInView, 0.10),
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 16px" }}>
            {info.map(({ label, value }, i) => (
              <div key={label} style={i === info.length - 1 && info.length % 2 !== 0 ? { gridColumn: "1 / -1" } : {}}>
                <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, letterSpacing: "0.05em", marginBottom: 4 }}>
                  {label}
                </div>
                <div className="f16" style={{ fontWeight: 500, color: C.t1 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Two bottom cards */}
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

      {/* CTA */}
      <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, marginTop: 32, ...revealStyle(bentInView, 0.30) }}>
        Wanna get in touch for a cool project? Email me,{" "}
        <a href="mailto:biswasritam404@gmail.com"
          style={{ color: C.t1, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: C.border }}>
          biswasritam404@gmail.com
        </a>
      </p>

      <style>{`
        /* Mobile: single column, all cards full width */
        .about-bento {
          display: grid;
          gap: 16px;
          grid-template-columns: 1fr;
        }
        .about-img-cell  { grid-column: 1; }
        .about-info-cell { grid-column: 1; }

        /* Desktop: 2-col bento
           row 1: [image 1:1]  [info card]
           row 2: [card A]     [card B]     */
        @media (min-width: 600px) {
          .about-bento {
            grid-template-columns: 1fr 1fr;
          }
          .about-img-cell  { grid-column: 1; grid-row: 1; }
          .about-info-cell { grid-column: 2; grid-row: 1; }
        }
      `}</style>
    </section>
  );
}
