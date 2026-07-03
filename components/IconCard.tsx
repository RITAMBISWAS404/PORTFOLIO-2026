"use client";
import { useRef, useState } from "react";
import { useInView } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { revealStyle } from "@/lib/tokensV2";

interface Props {
  icon: LucideIcon; label: string; right?: string; body: string;
  bg: string; delay?: number;
}

export default function IconCard({ icon: Icon, label, right, body, bg, delay = 0 }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref}
      onMouseEnter={e => { setHovered(true); e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={e => { setHovered(false); e.currentTarget.style.transform = "translateY(0)"; }}
      style={{
        position: "relative", background: bg, borderRadius: 8, padding: 16,
        display: "flex", flexDirection: "column", gap: 8, cursor: "default", overflow: "hidden",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.10)",
        opacity: hovered ? 1 : 0, transition: "opacity 0.2s", pointerEvents: "none",
      }} />
      <Icon size={24} color="#ffffff" strokeWidth={2} style={{ position: "relative", zIndex: 1 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>{label}</span>
        {right && (
          <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.75)", flexShrink: 0, marginLeft: 8 }}>
            {right}
          </span>
        )}
      </div>
      <p style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.9)", lineHeight: 1.6, position: "relative", zIndex: 1 }}>{body}</p>
    </div>
  );
}
