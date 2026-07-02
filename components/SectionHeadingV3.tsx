"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface Props {
  num: string;
  title: string;
}

export default function SectionHeadingV3({ num, title }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <h2 ref={ref} style={{
      fontSize: "clamp(28px, 4vw, 40px)",
      fontWeight: 500,
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      margin: 0,
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.22,1,.36,1)",
    }}>
      <span style={{ color: "var(--color-text-3)" }}>{num} </span>
      <span style={{ color: "var(--color-text-1)" }}>{title}</span>
    </h2>
  );
}
