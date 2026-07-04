"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface Props {
  num?: string;
  title: string;
  eyebrow?: string;
}

export default function SectionHeadingV3({ num, title, eyebrow }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.22,1,.36,1)",
    }}>
      {eyebrow && (
        <div style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.08em",
          color: "var(--color-text-3)",
          marginBottom: 6,
        }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{
        fontSize: "clamp(28px, 4vw, 40px)",
        fontWeight: 550,
        letterSpacing: "-0.02em",
        lineHeight: 1.15,
        margin: 0,
        paddingBottom: 20,
      }}>
        {num && <span style={{ color: "var(--color-text-3)" }}>{num} </span>}
        <span style={{ color: "var(--color-text-1)" }}>{title}</span>
      </h2>
      <div className="v3-heading-line" />
    </div>
  );
}
