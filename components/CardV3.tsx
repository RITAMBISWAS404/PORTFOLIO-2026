"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { revealStyle } from "@/lib/tokensV2";

interface Props { label: string; body: string; delay?: number; icon: IconType; noHover?: boolean; }

// Card, icon + title row, description below.
// v3-only — does not touch the shared components/Card.tsx used by v2 and case studies.
export default function CardV3({ label, body, delay = 0, icon: Icon, noHover = false }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  return (
    <div ref={ref}
      onMouseEnter={noHover ? undefined : e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={noHover ? undefined : e => { e.currentTarget.style.transform = inView ? "translateY(0)" : "translateY(16px)"; }}
      style={{
        background: "#ffffff",
        boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "0px 2px 9px 0px rgba(0,0,0,0.05)",
        border: "none",
        borderRadius: 8,
        padding: "16px 16px 20px",
        display: "flex", flexDirection: "column", gap: 8, cursor: "default",
        overflow: "hidden",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon className="card-icon" color="var(--exp-black, #222222)" />
        <span className="card-heading" style={{ fontWeight: 600, color: "var(--exp-black, #222222)" }}>{label}</span>
      </div>
      <p className="card-body" style={{ fontWeight: 500, color: "#666666", lineHeight: 1.6 }}>{body}</p>
      <style>{`
        .card-icon { width: 20px !important; height: 20px !important; }
        .card-heading { font-size: 14px; line-height: 1.6; }
        .card-body { font-size: 14px; }
        @media (min-width: 768px) {
          .card-icon { width: 24px !important; height: 24px !important; }
          .card-heading { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
