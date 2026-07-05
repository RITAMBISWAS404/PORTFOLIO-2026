"use client";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { revealStyle } from "@/lib/tokensV2";

interface Props {
  icon: LucideIcon; label: string; right?: string; body: string;
  bg: string; delay?: number; iconColor?: string; textColor?: string; border?: string; noHover?: boolean;
}

export default function IconCard({ icon: Icon, label, right, body, bg, delay = 0, iconColor = "#ffffff", textColor = "#ffffff", border, noHover = false }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref}
      onMouseEnter={noHover ? undefined : e => { setHovered(true); e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={noHover ? undefined : e => { setHovered(false); e.currentTarget.style.transform = "translateY(0)"; }}
      style={{
        position: "relative", background: `var(--exp-card-bg, ${bg})`, border: border ?? "none", borderRadius: 8, padding: 16,
        display: "flex", flexDirection: "column", gap: 8, cursor: "default", overflow: "hidden",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.10)",
        opacity: hovered ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none",
      }} />
      <Icon size={24} className="card-colored-icon" color={`var(--exp-card-fg, ${iconColor})`} strokeWidth={2} style={{ position: "relative", zIndex: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <span className="card-colored-heading" style={{ fontWeight: 500, color: `var(--exp-card-heading, ${textColor})` }}>{label}</span>
        {right && (
          <span className="card-colored-heading" style={{ fontWeight: 500, color: `var(--exp-card-heading, ${textColor})`, opacity: 0.75, flexShrink: 0, marginLeft: 8 }}>
            {right}
          </span>
        )}
      </div>
      <p className="card-colored-body" style={{ fontWeight: 400, color: `var(--exp-card-fg, ${textColor})`, opacity: 0.9, lineHeight: 1.6, position: "relative", zIndex: 1 }}>{body}</p>
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
    </div>
  );
}
