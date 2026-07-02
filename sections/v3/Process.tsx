"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import Card from "@/components/Card";
import { C, revealStyle, col } from "@/lib/tokensV2";

const steps = [
  { label: "Understand Deeply",   num: "01", body: "I dig into user needs, business goals, and constraints before opening Figma. The clearer the problem, the sharper everything that follows.",                                         bg: "var(--pop-green)"  },
  { label: "Wireframe & Iterate", num: "02", body: "I move fast through wireframes, testing structure before polish. No attachment to first drafts, only to landing on the version that actually works.",                               bg: "var(--pop-orange)" },
  { label: "Build the System",    num: "03", body: "Once the structure holds, I build it as a system: components, variables, design tokens, so every screen after the first one gets faster to design, not slower.",                    bg: "var(--pop-blue)"   },
  { label: "Ship & Test",         num: "04", body: "I hand off to developers early and test with real users once it's live. What gets shipped should match the original intent, not just the mockup.", bg: "var(--pop-pink)"  },
];

export default function Process() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <section id="process" style={{ ...col }} className="v3-section">
      <SectionHeadingV3 num="04" title="How I Work" />
      <p ref={ref} className="f16 mt-section" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, ...revealStyle(inView) }}>
        Good design doesn&apos;t happen by accident. I follow the same four-step rhythm on every
        project: understand the problem deeply, wireframe and iterate fast, build a system that
        scales, then ship and test with real usage in mind.
      </p>
      <div className="process-grid" style={{ gap: 16, marginTop: 24 }}>
        {steps.map((s, i) => (
          <Card key={s.label} label={s.label} num={s.num} body={s.body} delay={i * 0.08} bg={s.bg} />
        ))}
      </div>
      <style>{`
        .process-grid { display: grid; grid-template-columns: 1fr; }
        @media (min-width: 600px) { .process-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </section>
  );
}
