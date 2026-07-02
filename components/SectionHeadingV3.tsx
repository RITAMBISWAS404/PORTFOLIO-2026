"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface Props {
  num: string;
  title: string;
  accent?: string;
}

export default function SectionHeadingV3({ num, title, accent = "var(--pop-pink)" }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.22,1,.36,1)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-3)", letterSpacing: "0.04em", flexShrink: 0 }}>
          {num}
        </span>
        <h2 style={{
          fontSize: "clamp(22px, 3.5vw, 30px)",
          fontWeight: 700,
          color: "var(--color-text-1)",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          margin: 0,
        }}>
          {title}
        </h2>
      </div>
      <div style={{
        marginTop: 10,
        height: 2,
        width: inView ? 28 : 0,
        background: accent,
        borderRadius: 2,
        transition: "width 0.45s cubic-bezier(.22,1,.36,1) 0.25s",
      }} />
    </div>
  );
}
