"use client";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { revealStyle } from "@/lib/tokens";

interface Props { label: string; num: string; body: string; delay?: number; }

export default function Card({ label, num, body, delay = 0 }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [glow, setGlow] = useState("");
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
        const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
        setGlow(`radial-gradient(circle at ${x}% ${y}%, var(--color-card-glow) 0%, var(--color-card) 65%)`);
      }}
      onMouseEnter={e => {
        setHovered(true);
        const el = e.currentTarget;
        el.style.borderColor = "var(--color-card-hover-border)";
        el.style.boxShadow = "var(--shadow-card-hover)";
        el.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        setHovered(false);
        setGlow("");
        const el = e.currentTarget;
        el.style.borderColor = "var(--color-border)";
        el.style.boxShadow = "";
        el.style.transform = inView ? "translateY(0)" : "translateY(16px)";
      }}
      className="card-chip"
      style={{
        background: glow || "var(--color-card)",
        border: "1px solid var(--color-border)", borderRadius: 8, padding: 16,
        display: "flex", flexDirection: "column", gap: 8, cursor: "default",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, border-color 0.15s, box-shadow 0.15s, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-1)", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: hovered ? "var(--color-text-2)" : "var(--color-text-3)", transition: "color 0.15s" }}>{num}</span>
      </div>
      <p className="card-body" style={{ fontWeight: 400, color: "var(--color-text-2)", lineHeight: 1.6 }}>{body}</p>
      <style>{`.card-body{font-size:14px}@media(min-width:768px){.card-body{font-size:16px}}`}</style>
    </div>
  );
}
