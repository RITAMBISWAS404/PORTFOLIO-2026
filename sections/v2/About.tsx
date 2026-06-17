"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { User } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { C, revealStyle, col } from "@/lib/tokensV2";

const info = [
  { label: "Designation", value: "PRODUCT DESIGNER" },
  { label: "Experience",  value: "2 years 6 months"  },
  { label: "Email",       value: "biswasritam404@gmail.com" },
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
    body:  "Re-reading the same five sci-fi novels because I'm bad at finishing new ones\" beats \"I like reading.",
  },
];

export default function About() {
  const bioRef   = useRef(null);
  const cardRef  = useRef(null);
  const bioInView  = useInView(bioRef,  { once: true, margin: "-10% 0px" });
  const cardInView = useInView(cardRef, { once: true, margin: "-10% 0px" });

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

      {/* Photo + info card */}
      <div ref={cardRef} className="about-photo-card"
        style={{
          marginTop: 24,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden",
          background: C.card,
          ...revealStyle(cardInView, 0.08),
        }}>

        {/* Photo */}
        <div className="about-photo">
          <img
            src="/images/avatar.png"
            alt="Ritam Biswas"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* Info grid */}
        <div style={{ flex: 1, padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px", alignContent: "start" }}>
          {info.map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 500, color: C.t3, letterSpacing: "0.04em", marginBottom: 4 }}>
                {label}
              </div>
              <div className="f16" style={{ fontWeight: 500, color: C.t1 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two bottom cards */}
      <div className="about-cards" style={{ display: "grid", gap: 16, marginTop: 16 }}>
        {cards.map((card, i) => (
          <div key={card.title} style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 20,
            ...revealStyle(cardInView, 0.14 + i * 0.08),
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.t1, marginBottom: 10 }}>{card.title}</div>
            <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6 }}>{card.body}</p>
          </div>
        ))}
      </div>

      {/* CTA line */}
      <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, marginTop: 32, ...revealStyle(cardInView, 0.28) }}>
        Wanna get in touch for a cool project? Email me,{" "}
        <a href="mailto:biswasritam404@gmail.com"
          style={{ color: C.t1, fontWeight: 500, textDecoration: "underline", textUnderlineOffset: 3, textDecorationColor: C.border }}>
          biswasritam404@gmail.com
        </a>
      </p>

      <style>{`
        .about-photo-card { display: flex; flex-direction: column; }
        .about-photo      { width: 100%; aspect-ratio: 4 / 3; overflow: hidden; }
        .about-cards      { grid-template-columns: 1fr; }

        @media (min-width: 640px) {
          .about-photo-card { flex-direction: row; }
          .about-photo      { width: 180px; aspect-ratio: auto; flex-shrink: 0; }
          .about-cards      { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
}
