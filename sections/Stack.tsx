"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { Layers } from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import { stack, stackColors, stackTag } from "@/data/content";
import { C, revealStyle, col } from "@/lib/tokens";

function StackCard({ name, delay }: { name: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const c = stackColors[name];

  return (
    <div ref={ref}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(255,255,255,0.12)";
        el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
        el.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.borderColor = C.border;
        el.style.boxShadow = "";
        el.style.transform = inView ? "translateY(0)" : "translateY(16px)";
      }}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16, padding: 16,
        display: "flex", alignItems: "center", gap: 12,
        cursor: "default",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, border-color 0.15s, box-shadow 0.15s, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, overflow: "hidden", flexShrink: 0 }}>
        <img src={c.img} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: C.t1, flex: 1 }}>{name}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: C.t3, letterSpacing: "0.06em", flexShrink: 0 }}>{stackTag[name]}</span>
    </div>
  );
}

export default function Stack() {
  return (
    <section id="stack" style={{ ...col, padding: "64px 24px 0" }}>
      <SectionLabel icon={Layers} label="MY TECH STACK" num="06" iconColor="#6c57f0" />
      <div className="stack-grid mt-section">
        {stack.map((name, i) => (
          <StackCard key={name} name={name} delay={i * 0.05} />
        ))}
      </div>
      <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, marginTop: 24 }}>
        Using the right mix of tools, systems, and rapid iteration to turn complex ideas into clean and usable digital experiences.
      </p>
      <style>{`
        .stack-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 768px) { .stack-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </section>
  );
}
