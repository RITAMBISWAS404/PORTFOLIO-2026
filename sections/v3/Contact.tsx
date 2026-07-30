"use client";
import { useState, useRef } from "react";
import { Check } from "lucide-react";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import { C, inputBase, col } from "@/lib/tokensV2";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mredrnrp";
const REACH_OUT_OPTIONS = ["Product Design", "UX/UI Design", "Branding & Identity", "Design Systems", "Web Design"];
const CHIP_COLOR = "var(--pop-blue)";

type Status = "idle" | "sending" | "sent" | "error";

const lbl: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: C.t3, display: "block", marginBottom: 8,
};
const focusIn = (e: React.FocusEvent<HTMLElement>) => {
  e.target.style.borderColor = C.t3;
  e.target.style.transform = "translateY(-1px)";
};
const focusOut = (e: React.FocusEvent<HTMLElement>) => {
  e.target.style.borderColor = C.border;
  e.target.style.transform = "";
};

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [selected, setSelected] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const toggleOption = (opt: string) => {
    setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;
    const form = formRef.current!;
    const data = new FormData(form);
    if (!data.get("name") || !data.get("email") || !data.get("message")) return;
    if (selected.length > 0) data.set("reaching_out_for", selected.join(", "));
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST", body: data, headers: { Accept: "application/json" },
      });
      if (res.ok) { setStatus("sent"); form.reset(); setSelected([]); setTimeout(() => setStatus("idle"), 5000); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  const btnBg    = status === "sent" ? "#1a2a1a" : status === "error" ? "#2a1a1a" : C.t1;
  const btnCol   = status === "sent" ? C.accent  : status === "error" ? C.red     : C.bg;
  const btnLabel = status === "sent" ? "Sent!" : status === "error" ? "Try again" : status === "sending" ? "Sending…" : "Send Message";

  return (
    <section id="contact" style={{ ...col }} className="v3-section">
      <SectionHeadingV3 title="Let's Build Together" eyebrow="MIGHT AS WELL SAY HI" />

      {/* Subheading */}
      <p className="f16 mt-section" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6, marginBottom: 24 }}>
        Whether it&apos;s a collaboration, an opportunity, or just a conversation, I&apos;m always open. Tell me what&apos;s on your mind.
      </p>

      <form ref={formRef} onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Name + Email — side by side on desktop */}
        <div className="contact-name-email">
          <div>
            <label htmlFor="f-name" style={lbl}>Name</label>
            <input id="f-name" name="name" type="text" placeholder="Your name" required
              style={{ ...inputBase, height: 44, borderRadius: 12 }}
              onFocus={focusIn as React.FocusEventHandler}
              onBlur={focusOut as React.FocusEventHandler} />
          </div>
          <div>
            <label htmlFor="f-email" style={lbl}>Email</label>
            <input id="f-email" name="email" type="email" placeholder="you@company.com" required
              style={{ ...inputBase, height: 44, borderRadius: 12 }}
              onFocus={focusIn as React.FocusEventHandler}
              onBlur={focusOut as React.FocusEventHandler} />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="f-msg" style={lbl}>Project / Message</label>
          <textarea id="f-msg" name="message"
            placeholder="Tell me a bit about the project, role, or idea." required
            style={{ ...inputBase, height: 110, resize: "none", borderRadius: 12 }}
            onFocus={focusIn as React.FocusEventHandler}
            onBlur={focusOut as React.FocusEventHandler} />
        </div>

        {/* Checkbox pills */}
        <div>
          <label style={lbl}>What can I help you with?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REACH_OUT_OPTIONS.map(opt => {
              const active = selected.includes(opt);
              return (
                <button key={opt} type="button" onClick={() => toggleOption(opt)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 14px",
                    border: `1px solid ${active ? `var(--exp-chip-active-border, ${CHIP_COLOR})` : C.border}`,
                    borderRadius: 9999,
                    background: active ? `var(--exp-chip-active-bg, ${CHIP_COLOR})` : "transparent",
                    fontSize: 12, fontWeight: 600,
                    color: active ? "var(--exp-chip-active-text, #ffffff)" : C.t3,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "border-color 0.2s, background 0.2s, color 0.2s",
                  }}>
                  {active && <Check size={11} strokeWidth={2.5} color="var(--exp-chip-active-text, #ffffff)" />}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Honeypot */}
        <input type="text" name="_gotcha" style={{ display: "none" }} />

        {/* Submit */}
        <button type="submit" disabled={status === "sending" || status === "sent"}
          style={{
            height: 48, background: btnBg, color: btnCol,
            borderRadius: 12, border: "none",
            cursor: status === "sending" || status === "sent" ? "not-allowed" : "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 14, fontWeight: 600,
            transition: "opacity 0.25s, transform 0.25s",
            opacity: status === "sending" ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (status === "idle") { const b = e.currentTarget; b.style.opacity = "0.88"; b.style.transform = "translateY(-2px)"; }}}
          onMouseLeave={e => { const b = e.currentTarget; b.style.opacity = "1"; b.style.transform = ""; }}>
          {btnLabel}
        </button>
      </form>

      <style>{`
        .contact-name-email { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) {
          .contact-name-email { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
}
