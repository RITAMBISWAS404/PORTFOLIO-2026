"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import ScrambleText from "./ScrambleText";
import { eyebrow, headingLg } from "@/lib/experiment/typography";

interface Props {
  num?: string;
  title: string;
  eyebrow?: string;
}

export default function SectionHeadingV3({ num, title, eyebrow: eyebrowText }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.22,1,.36,1)",
    }}>
      {eyebrowText && (
        <div style={{ ...eyebrow, marginBottom: 6 }}>
          <ScrambleText text={eyebrowText} active={inView} />
        </div>
      )}
      <h2 style={{ ...headingLg, margin: 0, paddingBottom: 20 }}>
        {num && <span style={{ color: "var(--color-text-3)" }}>{num} </span>}
        <span style={{ color: "var(--color-text-1)" }}>{title}</span>
      </h2>
      <div className="exp-heading-line" />
    </div>
  );
}
