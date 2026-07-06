"use client";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { revealStyle } from "@/lib/tokens";

interface Props { label: string; num: string; body: string; delay?: number; bg?: string; icon?: LucideIcon; iconColor?: string; textColor?: string; border?: string; noHover?: boolean; chipIcon?: boolean; }

export default function Card({ label, num, body, delay = 0, bg, iconColor = "#ffffff", textColor = "#ffffff", border, noHover = false, chipIcon = false }: Props) {
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
      onMouseEnter={noHover ? undefined : e => {
        setHovered(true);
        const el = e.currentTarget;
        el.style.transform = "translateY(-4px)";
        if (!isColored) el.style.borderColor = "var(--color-card-hover-border)";
      }}
      onMouseLeave={noHover ? undefined : e => {
        setHovered(false);
        setGlow("");
        const el = e.currentTarget;
        el.style.transform = inView ? "translateY(0)" : "translateY(16px)";
        if (!isColored) el.style.borderColor = "var(--color-border)";
      }}
      className="card-chip"
      style={{
        position: "relative",
        background: isColored ? (chipIcon ? "#ffffff" : `var(--exp-card-bg, ${bg})`) : (glow || "var(--color-card)"),
        border: isColored ? (border ?? (chipIcon ? "1px solid rgba(0,0,0,0.1)" : "none")) : "none",
        borderRadius: 8, padding: 16,
        display: "flex", flexDirection: "column", gap: 8, cursor: "default",
        overflow: "hidden",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, border-color 0.15s, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      {isColored && (
        <div style={{
          position: "absolute", inset: 0,
          background: "var(--exp-card-hover-overlay, rgba(0,0,0,0.10))",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s",
          pointerEvents: "none",
        }} />
      )}
      {isColored ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
            <span className="card-colored-heading" style={{ fontWeight: 500, color: chipIcon ? "#222222" : `var(--exp-card-heading, ${textColor})` }}>{label}</span>
            {num && <span className="card-colored-heading" style={{ fontWeight: 500, color: chipIcon ? "#222222" : `var(--exp-card-heading, ${textColor})`, opacity: 0.75, flexShrink: 0, marginLeft: 8 }}>{num}</span>}
          </div>
          <p className="card-colored-body" style={{ fontWeight: 400, color: "#999999", opacity: 1, lineHeight: 1.6, position: "relative", zIndex: 1 }}>{body}</p>
          <style>{`
            .card-colored-icon { width: 20px !important; height: 20px !important; }
            .card-colored-heading { font-size: 14px; }
            .card-colored-body { font-size: 14px; }
            @media (min-width: 768px) {
              .card-colored-icon { width: 24px !important; height: 24px !important; }
              .card-colored-heading { font-size: 16px; }
              .card-colored-body { font-size: 14px; }
            }
          `}</style>
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
