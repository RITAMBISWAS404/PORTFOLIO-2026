"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { IconType } from "react-icons";
import ScrambleText from "./ScrambleText";
import { eyebrow, headingLg } from "@/lib/typography";

interface Props {
  num?: string;
  title: string;
  eyebrow?: string;
  eyebrowColor?: string;
  /** Icon dropped mid-title. Word-split, so it must land strictly between two words. */
  icon?: IconType;
  /** Square image dropped mid-title instead of `icon`, when provided. */
  iconSrc?: string;
  /** Number of leading words before the icon (1 = after the 1st word, etc). */
  iconAfter?: number;
}

export default function SectionHeadingV3({ num, title, eyebrow: eyebrowText, eyebrowColor, icon: Icon, iconSrc, iconAfter }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  const words = title.split(" ");
  const hasIcon = (Icon || iconSrc) && iconAfter !== undefined && iconAfter > 0 && iconAfter < words.length;
  const before = hasIcon ? words.slice(0, iconAfter).join(" ") : title;
  const after = hasIcon ? words.slice(iconAfter).join(" ") : "";

  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.22,1,.36,1)",
    }}>
      {eyebrowText && (
        <div style={{ ...eyebrow, marginBottom: 6, ...(eyebrowColor ? { color: eyebrowColor } : {}) }}>
          <ScrambleText text={eyebrowText} active={inView} />
        </div>
      )}
      <h2 style={{
        ...headingLg, margin: 0, paddingBottom: 20,
        ...(hasIcon ? { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 } : {}),
      }}>
        {num && <span style={{ color: "var(--color-text-3)" }}>{num} </span>}
        <span style={{ color: "var(--color-text-1)" }}>{before}</span>
        {hasIcon && (
          <>
            {iconSrc
              ? <img src={iconSrc} alt="" style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px", objectFit: "contain" }} />
              : Icon && <Icon style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px" }} color="#ED7454" />}
            <span style={{ color: "var(--color-text-1)" }}>{after}</span>
          </>
        )}
      </h2>
      <div className="v3-heading-line" />
    </div>
  );
}
