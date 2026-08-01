"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { revealStyle } from "@/lib/tokensV2";
import { decisionLabel, decisionTitle } from "@/lib/typography";

interface Props {
  num: string; title: string; first?: boolean; children: React.ReactNode;
  lineClassName?: string;
}

export default function Decision({ num, title, first = false, children, lineClassName = "decision-line" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  return (
    <>
      {!first && <div className={lineClassName} />}
      <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 16, ...revealStyle(inView) }}>
        <span style={decisionLabel}>DECISION {num}</span>
        <h3 className="f16" style={decisionTitle}>{title}</h3>
        {children}
      </div>
    </>
  );
}
