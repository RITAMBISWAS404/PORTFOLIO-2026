"use client";
import { useState, useRef } from "react";
import { Icon } from "@iconify/react";
import SectionLabelV2 from "@/components/SectionLabelV2";
import { C, inputBase, col } from "@/lib/tokensV2";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mredrnrp";
const REACH_OUT_OPTIONS = ["Product Design", "UX/UI Design", "Branding & Identity", "Design Systems", "Web Design"];

type Status = "idle" | "sending" | "sent" | "error";

const lbl: React.CSSProperties = {
  fontSize: 14, fontWeight: 500, color: C.t3, display: "block", marginBottom: 8,
};
const focusIn = (e: React.FocusEvent<HTMLElement>) => {
  e.target.style.borderColor = C.t3;
  e.target.style.boxShadow = "0 0 0 3px rgba(255,255,255,0.04)";
  e.target.style.transform = "translateY(-1px)";
};
const focusOut = (e: React.FocusEvent<HTMLElement>) => {
  e.target.style.borderColor = C.border;
  e.target.style.boxShadow = "";
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
    <section id="contact" style={{ ...col, padding: "64px 24px 0" }}>
      <SectionLabelV2 icon="solar:letter-bold" label="LETS BUILD TOGETHER" num="07" iconColor={C.accent} />

      {/* Subheading */}
      <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6, marginTop: 24, marginBottom: 32 }}>
        Whether it&apos;s a collaboration, an opportunity, or just a conversation, I&apos;m always open. Tell me what&apos;s on your mind.
      </p>

      <form ref={formRef} onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Name + Email — side by side on desktop */}
        <div className="contact-name-email">
          <div>
            <label htmlFor="f-name" style={lbl}>Name</label>
            <input id="f-name" name="name" type="text" placeholder="Your name" required
              style={{ ...inputBase, height: 44 }}
              onFocus={focusIn as React.FocusEventHandler}
              onBlur={focusOut as React.FocusEventHandler} />
          </div>
          <div>
            <label htmlFor="f-email" style={lbl}>Email</label>
            <input id="f-email" name="email" type="email" placeholder="you@company.com" required
              style={{ ...inputBase, height: 44 }}
              onFocus={focusIn as React.FocusEventHandler}
              onBlur={focusOut as React.FocusEventHandler} />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="f-msg" style={lbl}>Project / Message</label>
          <textarea id="f-msg" name="message"
            placeholder="Tell me a bit about the project, role, or idea." required
            style={{ ...inputBase, height: 110, resize: "none" }}
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
                    border: `1px solid ${active ? "rgba(255,255,255,0.28)" : C.border}`,
                    borderRadius: 9999,
                    background: active ? "rgba(255,255,255,0.07)" : "transparent",
                    fontSize: 12, fontWeight: 500,
                    color: active ? C.t1 : C.t3,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    fontFamily: "Poppins, sans-serif",
                    transition: "border-color 0.2s, background 0.2s, color 0.2s",
                  }}>
                  {active && <Icon icon="solar:check-circle-bold" width={11} />}
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
            borderRadius: 9999, border: "none",
            cursor: status === "sending" || status === "sent" ? "not-allowed" : "pointer",
            fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 500,
            transition: "opacity 0.25s, transform 0.25s, box-shadow 0.25s",
            opacity: status === "sending" ? 0.7 : 1,
          }}
          onMouseEnter={e => { if (status === "idle") { const b = e.currentTarget; b.style.opacity = "0.88"; b.style.transform = "translateY(-2px)"; b.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4)"; }}}
          onMouseLeave={e => { const b = e.currentTarget; b.style.opacity = "1"; b.style.transform = ""; b.style.boxShadow = ""; }}>
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
