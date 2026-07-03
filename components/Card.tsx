"use client";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { revealStyle } from "@/lib/tokens";

interface Props { label: string; num: string; body: string; delay?: number; bg?: string; icon?: LucideIcon; }

export default function Card({ label, num, body, delay = 0, bg, icon: Icon }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [glow, setGlow] = useState("");
  const [hovered, setHovered] = useState(false);
  const isColored = !!bg;

  return (
    <div ref={ref}
      onMouseMove={isColored ? undefined : e => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (((e.clientX - r.left) / r.width) * 100).toFixed(1);
        const y = (((e.clientY - r.top) / r.height) * 100).toFixed(1);
        setGlow(`radial-gradient(circle at ${x}% ${y}%, var(--color-card-glow) 0%, var(--color-card) 65%)`);
      }}
      onMouseEnter={e => {
        setHovered(true);
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        if (!isColored) el.style.borderColor = "var(--color-card-hover-border)";
      }}
      onMouseLeave={e => {
        setHovered(false);
        setGlow("");
        const el = e.currentTarget;
        el.style.transform = inView ? "translateY(0)" : "translateY(16px)";
        if (!isColored) el.style.borderColor = "var(--color-border)";
      }}
      className="card-chip"
      style={{
        position: "relative",
        background: isColored ? bg : (glow || "var(--color-card)"),
        border: "none",
        borderRadius: 8, padding: 16,
        display: "flex", flexDirection: "column", gap: 8, cursor: "default",
        overflow: "hidden",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, border-color 0.15s, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      {isColored && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.10)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }} />
      )}
      {isColored ? (
        <>
          {Icon && <Icon size={24} color="#ffffff" strokeWidth={2} style={{ position: "relative", zIndex: 1 }} />}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#ffffff" }}>{label}</span>
            {num && <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.75)", flexShrink: 0, marginLeft: 8 }}>{num}</span>}
          </div>
          <p style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.9)", lineHeight: 1.6, position: "relative", zIndex: 1 }}>{body}</p>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-1)", letterSpacing: "0.08em" }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: hovered ? "var(--color-text-2)" : "var(--color-text-3)", transition: "color 0.15s" }}>{num}</span>
          </div>
          <p className="card-body" style={{ fontWeight: 400, color: "var(--color-text-2)", lineHeight: 1.6, position: "relative", zIndex: 1 }}>{body}</p>
          <style>{`.card-body{font-size:14px}@media(min-width:768px){.card-body{font-size:16px}}`}</style>
        </>
      )}
    </div>
  );
}
