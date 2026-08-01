"use client";
import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DURATION = 1200; // ms

interface Props {
  text: string;
  active: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function ScrambleText({ text, active, className, style }: Props) {
  const [display, setDisplay] = useState(text);
  const played = useRef(false);

  useEffect(() => {
    if (!active || played.current) return;
    played.current = true;

    const isLetter = (ch: string) => /[a-zA-Z]/.test(ch);
    const lockTimes = text.split("").map((ch, i) =>
      isLetter(ch) ? (i / Math.max(text.length - 1, 1)) * (DURATION * 0.65) + Math.random() * (DURATION * 0.2) : 0
    );

    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= DURATION) {
        setDisplay(text);
        return;
      }
      const next = text
        .split("")
        .map((ch, i) => {
          if (!isLetter(ch)) return ch;
          if (elapsed >= lockTimes[i]) return ch;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");
      setDisplay(next);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, text]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}
