"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { MdSmartphone, MdAccountTree, MdWidgets, MdDirectionsRun, MdVerified } from "react-icons/md";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import CardV3 from "@/components/CardV3";
import { zeno } from "@/data/content";
import { C, revealStyle, col } from "@/lib/tokensV2";

const stats = [
  { label: "35+ High Fidelity Screens", body: "Covers every key user flow from onboarding through dashboard, analytics, and account settings.", icon: MdSmartphone },
  { label: "5 Complete User Flows",     body: "Onboarding, dashboard, charging session, analytics, and settings.", icon: MdAccountTree },
  { label: "40+ Reusable Components",   body: "A full design system built using Figma variables and design tokens for UI consistency.", icon: MdWidgets },
  { label: "2 Month Design Sprint",     body: "Blank file to production-ready designs, shipped end to end in just 2 months.", icon: MdDirectionsRun },
];

export default function FeaturedProject() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  return (
    <>
      <div id="featured" style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <SectionHeadingV3 title="Featured Project" eyebrow="NOT BAD, HONESTLY" icon={MdVerified} iconAfter={1} />
      </div>

      {/* Feature image */}
      <div style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <div className="feature-img-wrap" style={{ borderRadius: 8, overflow: "hidden", width: "100%" }}>
          <picture>
            <source media="(min-width: 768px)" srcSet="/images/16_9.png" />
            <img src="/images/4_3.png" alt="ZENO App"
              style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
          </picture>
        </div>
      </div>

      {/* ZENO detail */}
      <div ref={ref} style={{ ...col }} className="v3-section">
        <div className="el-gap" style={{ display: "flex", flexDirection: "column", ...revealStyle(inView) }}>

          {/* Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div className="v3-identity-logo" style={{ overflow: "hidden", flexShrink: 0 }}>
              <img src="/images/zeno logo.png" alt="ZENO" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div className="f16" style={{ fontWeight: 600, color: C.t1 }}>{zeno.name}</div>
              <div className="f16" style={{ fontWeight: 500, color: C.t2 }}>{zeno.sub}</div>
            </div>
          </div>

          {/* Description */}
          <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6 }}>
            ZENO{" "}
            <strong style={{ color: "var(--exp-hero-b, #222222)", fontWeight: 600 }}>
              turns a data-heavy EV charging app into a four-second experience
            </strong>
            . I owned the product end to end from a blank Figma file: user research, information
            architecture, wireframes, UI design, and developer handoff across 35+ screens and 5 user
            flows. The real challenge wasn&apos;t the interface, it was deciding what not to show,
            surfacing the one thing users actually opened the app for while letting everything else
            wait a tap away.
          </p>
        </div>

        {/* Stats — 2×2 grid */}
        <div className="stats-grid mt-el" style={{ display: "grid", gap: 16 }}>
          {stats.map((s, i) => (
            <CardV3 key={s.label} label={s.label} body={s.body} delay={i * 0.08} icon={s.icon} />
          ))}
        </div>

        {/* CTAs */}
        <div className="btn-row mt-el">
          <a href="/zeno" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: C.t1, color: C.bg, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "0.88"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.opacity = "1"; a.style.transform = ""; }}>
            Read Case Study
          </a>
          <a href="https://www.figma.com/design/HQiowSEZWtefmjVP5cqZuY/ZENO?node-id=0-1&p=f&t=ZuWU0JArTeGN7yjv-0" target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.05)", color: C.t1, padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
            border: "none",
            transition: "background 0.25s, transform 0.25s",
          }}
            onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(0,0,0,0.12)"; a.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.background = "rgba(0,0,0,0.05)"; a.style.transform = ""; }}>
            View in Figma
          </a>
        </div>
      </div>

      <style>{`
        .stats-grid { grid-template-columns: 1fr; }
        @media (min-width: 600px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
        .feature-img-wrap { aspect-ratio: 4 / 3; }
        @media (min-width: 768px) { .feature-img-wrap { aspect-ratio: 16 / 9; } }
        .v3-identity-logo { width: 48px; height: 48px; border-radius: 6px; }
        @media (min-width: 768px) { .v3-identity-logo { width: 64px; height: 64px; border-radius: 8px; } }
      `}</style>
    </>
  );
}
