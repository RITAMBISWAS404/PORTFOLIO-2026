"use client";
import { useState } from "react";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import { socials } from "@/data/home-content";
import { C, col } from "@/lib/home/tokensV2";

// Every row is a full-width hover band with the name on the left and its destination / action on the right. LinkedIn and Resume are links; Email is a button that copies the address.
const bandStyle: React.CSSProperties = {
  display: "block", textDecoration: "none", color: "inherit",
  /* Full-width hover */
  marginLeft: "calc(-50vw + 50%)",
  marginRight: "calc(-50vw + 50%)",
  paddingLeft: "calc(50vw - 50%)",
  paddingRight: "calc(50vw - 50%)",
  transition: "background 0.25s",
};
const hoverOn = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = C.hover; };
const hoverOff = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.background = ""; };

export default function Socials() {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch {
      // clipboard API unavailable or blocked: fall back to a temporary selection
      try {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); ok = document.execCommand("copy"); document.body.removeChild(ta);
      } catch { /* leave the address visible to copy by hand */ }
    }
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <section id="socials" style={{ ...col, paddingBottom: 0 }} className="hm-v3-section">
      <SectionHeadingV3 title="Find me online" eyebrow="ELSEWHERE ON THE INTERNET" iconSrc="/images/Globe.png" iconAfter={2} />
      <div className="hm-mt-section-card" style={{ marginTop: 0 }}>
        {socials.map((s, i) => {
          const isEmail = s.name === "Email", isResume = s.name === "Resume";
          const row = (
            <div style={{ ...col }}>
              {i !== 0 && <div className="hm-v3-heading-line" />}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, height: 58 }}>
                <span className="hm-f16" style={{ fontWeight: 500, color: C.t1 }}>{s.name}</span>
                <span className="hm-f16 hm-soc-right" style={{ fontWeight: 500, color: isEmail && copied ? C.t1 : C.t3, transition: "color 0.25s", textAlign: "right", overflowWrap: "anywhere" }}
                  onMouseEnter={e => { if (!(isEmail && copied)) e.currentTarget.style.color = C.t2; }}
                  onMouseLeave={e => { if (!(isEmail && copied)) e.currentTarget.style.color = C.t3; }}>
                  {isEmail && copied ? "Copied" : s.handle}
                </span>
              </div>
            </div>
          );
          return isEmail ? (
            <button key={s.name} type="button" onClick={() => copy(s.handle)} aria-label={`Email, ${s.handle}. Copy address`}
              data-cursor-kind="copy" data-cursor-state={copied ? "done" : undefined} className="hm-soc-row hm-soc-btn"
              style={bandStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              {row}
              <span className="hm-soc-sr" role="status" aria-live="polite">{copied ? "Email address copied" : ""}</span>
            </button>
          ) : (
            <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="hm-soc-row"
              {...(isResume ? { "data-cursor-kind": "cta", "data-cursor-id": "hero-resume" } : { "data-cursor-kind": "social", "data-cursor-id": s.name.toLowerCase() })}
              style={bandStyle} onMouseEnter={hoverOn} onMouseLeave={hoverOff}>
              {row}
            </a>
          );
        })}
        <div style={{ ...col }}>
          <div className="hm-v3-heading-line" />
        </div>
      </div>
      <style>{`
        .hm-soc-btn { box-sizing: border-box; width: calc(100% + 2 * (50vw - 50%)); border: 0; background: none; font: inherit; text-align: left; cursor: pointer; }
        .hm-soc-row:focus-visible { outline: 2px solid ${C.t1}; outline-offset: -2px; background: ${C.hover}; }
        .hm-soc-sr { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
        @media (prefers-reduced-motion: reduce) { .hm-soc-row, .hm-soc-right { transition: none !important; } }
      `}</style>
    </section>
  );
}
