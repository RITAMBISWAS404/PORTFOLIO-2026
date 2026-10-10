"use client";
import { useRef, type ReactNode } from "react";
import { useInView } from "framer-motion";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { revealStyle } from "@/lib/home/tokensV2";

interface Props { label: string; body: ReactNode; delay?: number; icon: IconType; noHover?: boolean; cursorId?: string; }

// Card, icon + title row, description below.
// v3-only — does not touch the shared components/Card.tsx used by v2 and case studies.
export default function CardV3({ label, body, delay = 0, icon: Icon, noHover = false, cursorId }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  return (
    <div ref={ref} className={noHover ? undefined : "hm-lift"} data-cursor-kind={cursorId ? "info" : undefined} data-cursor-id={cursorId}   // opt-in: the custom cursor names this (non-clickable) card
      style={{
        background: "var(--hm-light-card-bg, #ffffff)",
        boxShadow: isNew ? "0px 2px 8px 0px rgba(0,0,0,0.05)" : "var(--hm-light-card-shadow, 0px 2px 9px 0px rgba(0,0,0,0.05))",
        border: "var(--hm-light-card-border, none)",
        borderRadius: 8,
        padding: "16px 16px 20px",
        display: "flex", flexDirection: "column", gap: 8, cursor: "default",
        overflow: "hidden",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, translate 200ms cubic-bezier(.22,1,.36,1), box-shadow 200ms cubic-bezier(.22,1,.36,1), border-color 200ms cubic-bezier(.22,1,.36,1)`,
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon className="hm-card-icon" color="var(--hm-black, #222222)" />
        <span className="hm-card-heading" style={{ fontWeight: 600, color: "var(--hm-black, #222222)" }}>{label}</span>
      </div>
      <p className="hm-card-body" style={{ fontWeight: 500, color: "#666666", lineHeight: 1.6 }}>{body}</p>
      <style>{`
        .hm-card-icon { width: 20px !important; height: 20px !important; }
        .hm-card-heading { font-size: 14px; line-height: 1.6; }
        .hm-card-body { font-size: 14px; }
        @media (min-width: 768px) {
          .hm-card-icon { width: 24px !important; height: 24px !important; }
          .hm-card-heading { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
