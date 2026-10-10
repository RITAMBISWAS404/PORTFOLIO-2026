"use client";
import { useLayoutEffect, useRef } from "react";
import { useInView } from "framer-motion";
import { IconType } from "react-icons";
import ScrambleText from "./ScrambleText";
import { eyebrow, headingLg } from "@/lib/home/typography";
import { COURIER_ENABLED, deliver, delivered } from "./courierController";

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
  const h2Ref = useRef<HTMLHeadingElement>(null), eyebrowRef = useRef<HTMLDivElement>(null);

  const words = title.split(" ");
  const hasIcon = (Icon || iconSrc) && iconAfter !== undefined && iconAfter > 0 && iconAfter < words.length;
  // Each heading gets its own variant, cycle length and phase (derived from its title) so the icons never move in sync.
  const seed = Array.from(title).reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const idleStyle = { animationDuration: `${(4.2 + (seed % 5) * 0.45).toFixed(2)}s`, animationDelay: `-${(seed % 37) / 10}s` };
  const before = hasIcon ? words.slice(0, iconAfter).join(" ") : title;
  const after = hasIcon ? words.slice(iconAfter).join(" ") : "";

  // THE COURIER (experiment; off with COURIER_ENABLED = false). The icon slot is expanded in the markup, so the heading is complete by default. Only when a delivery is going to
  // happen does this collapse the slot (data-courier="pending", before paint) and reserve the heading's final height; the Courier opens it, and every exit path restores it.
  useLayoutEffect(() => {
    const h2 = h2Ref.current, wrap = ref.current as HTMLElement | null;
    if (!COURIER_ENABLED || !hasIcon || !h2 || !wrap || delivered.has(title) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true, started = false, delay: ReturnType<typeof setTimeout> | undefined, raf = 0;
    const reserve = () => { h2.removeAttribute("data-courier"); h2.style.minHeight = ""; h2.style.minHeight = `${h2.getBoundingClientRect().height}px`; h2.setAttribute("data-courier", "pending"); };
    reserve();
    // the reserved height must follow the layout it reserves for: re-measure when the heading's width changes, and once the fonts are in
    const onResize = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (alive && h2.getAttribute("data-courier") === "pending") reserve(); }); };
    const ro = new ResizeObserver(onResize); ro.observe(wrap);
    document.fonts?.ready.then(onResize);
    let settle: ReturnType<typeof setTimeout> | undefined;
    const stop = () => { ro.disconnect(); window.removeEventListener("scroll", onScroll); if (settle) clearTimeout(settle); };
    const finish = () => { delivered.add(title); h2.removeAttribute("data-courier"); h2.style.minHeight = ""; stop(); };
    const job = {
      host: h2, wrap, eyebrow: eyebrowRef.current, alive: () => alive,
      open: () => { if (h2.getAttribute("data-courier") === "pending") h2.setAttribute("data-courier", "open"); },
      done: finish,
    };
    // A heading that was scrolled straight past never intersects, so the observer says nothing: once scrolling settles, any pending heading that is above the screen just opens.
    const onScroll = () => {
      if (settle) clearTimeout(settle);
      settle = setTimeout(() => { settle = undefined; if (alive && !started && wrap.getBoundingClientRect().bottom < 0) { started = true; io.disconnect(); job.open(); setTimeout(() => { if (alive) finish(); }, 450); } }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => {
      if (started || !e) return;
      if (e.isIntersecting) { started = true; io.disconnect(); delay = setTimeout(() => { delay = undefined; if (alive) deliver(job); }, 120 + Math.random() * 200); }
      else if (e.boundingClientRect.bottom < 0) { started = true; io.disconnect(); job.open(); setTimeout(() => { if (alive) finish(); }, 450); }   // already scrolled past: just open it
    }, { rootMargin: "0px 0px -14% 0px", threshold: 0.05 });
    io.observe(wrap);
    return () => {
      alive = false; io.disconnect(); stop(); if (delay) clearTimeout(delay); if (raf) cancelAnimationFrame(raf);
      h2.removeAttribute("data-courier"); h2.style.minHeight = "";
    };
  }, [hasIcon, title, ref]);

  return (
    <>
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "none" : "translateY(14px)",
      transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(.22,1,.36,1)",
    }}>
      {eyebrowText && (
        <div ref={eyebrowRef} style={{ ...eyebrow, marginBottom: 6, ...(eyebrowColor ? { color: eyebrowColor } : {}) }}>
          <ScrambleText text={eyebrowText} active={inView} />
        </div>
      )}
      <h2 ref={h2Ref} style={{
        ...headingLg, margin: 0, paddingBottom: 20,
        ...(hasIcon ? { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 } : {}),
      }}>
        {num && <span style={{ color: "var(--color-text-3)" }}>{num} </span>}
        <span style={{ color: "var(--color-text-1)" }}>{before}</span>
        {hasIcon && (
          <>
            {/* The motion lives on this wrapper (transform only), so the icon's size, margins and position in the line never change. */}
            <span className="hm-sh-slot" aria-hidden="true">
              <span className={`hm-sh-icon hm-sh-idle-${seed % 3}`} style={idleStyle}>
                {iconSrc
                  ? <img src={iconSrc} alt="" style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px", objectFit: "contain" }} />
                  : Icon && <Icon style={{ width: "1.2em", height: "1.2em", margin: "0 -1.5px" }} color="#ED7454" />}
              </span>
            </span>
            <span style={{ color: "var(--color-text-1)" }}>{after}</span>
          </>
        )}
      </h2>
    </div>
    {/* the underline is outside the moving wrapper: a structural line is never inside a transformed (composited, fractionally offset) layer */}
    <div className="hm-v3-heading-line" style={{ opacity: inView ? 1 : 0, transition: "opacity 0.55s ease" }} />
    </>
  );
}
