"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MdSupervisedUserCircle } from "react-icons/md";
import SectionHeadingV3 from "@/components/home/SectionHeadingV3";
import { C, inputBase, col } from "@/lib/home/tokensV2";
import { eyebrow } from "@/lib/home/typography";

// Existing submission mechanism (unchanged): a Formspree form posted with fetch.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mredrnrp";

type Status = "idle" | "sending" | "sent" | "error";
type Field = "name" | "email" | "message";

const lbl: React.CSSProperties = {
  ...eyebrow, display: "block", marginBottom: 8, textTransform: "uppercase",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MESSAGES: Record<Field, string> = {
  name: "Please enter your name.",
  email: "Please enter a valid email.",
  message: "Tell me a little about the project.",
};
const check = (field: Field, value: string) => {
  const v = value.trim();
  if (field === "email") return EMAIL_RE.test(v);
  return v.length > 0;
};

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [touched, setTouched] = useState<Record<Field, boolean>>({ name: false, email: false, message: false });
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", message: "" });
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isNew = pathname === "/new" || pathname?.startsWith("/new/");

  // An error only shows once the user has interacted with that field (or tried to submit).
  const error = (f: Field) => (touched[f] && !check(f, values[f]) ? MESSAGES[f] : "");
  const setValue = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues(v => ({ ...v, [f]: e.target.value }));
  const markTouched = (f: Field) => () => setTouched(t => (t[f] ? t : { ...t, [f]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;           // no duplicate submissions
    setTouched({ name: true, email: true, message: true });
    const firstBad = (["name", "email", "message"] as Field[]).find(f => !check(f, values[f]));
    if (firstBad) { formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus(); return; }

    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST", body: new FormData(formRef.current!), headers: { Accept: "application/json" },
      });
      if (res.ok) setStatus("sent");
      else setStatus("error");                                        // values stay in the form
    } catch { setStatus("error"); }
  };

  // Move focus to the confirmation so keyboard and screen-reader users land on it.
  useEffect(() => { if (status === "sent") successRef.current?.focus(); }, [status]);
  // The controls are disabled while sending, which drops focus to the page; on failure put it back on the retry button.
  useEffect(() => { if (status === "error") formRef.current?.querySelector<HTMLElement>(".hm-contact-send")?.focus(); }, [status]);

  const reset = () => {
    setValues({ name: "", email: "", message: "" });
    setTouched({ name: false, email: false, message: false });
    setStatus("idle");
  };

  const sending = status === "sending";
  const fieldProps = (f: Field) => ({
    id: `f-${f}`, name: f, value: values[f], onChange: setValue(f), onBlur: markTouched(f),
    className: "hm-contact-field", "aria-invalid": error(f) ? true : undefined,
    "aria-describedby": error(f) ? `f-${f}-err` : undefined, disabled: sending, required: true,
  });
  const errEl = (f: Field) => (
    <div id={`f-${f}-err`} className="hm-contact-err" role={error(f) ? "alert" : undefined}>{error(f)}</div>
  );

  return (
    <section id="contact" style={{ ...col }} className="hm-v3-section">
      <SectionHeadingV3 title="Let's Build Together" eyebrow="MIGHT AS WELL SAY HI" icon={MdSupervisedUserCircle} iconSrc="/images/Work%20together.png" iconAfter={2} />

      {/* Subheading */}
      <p className="hm-f16 hm-mt-section" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.6, marginBottom: 24 }}>
        Whether it&apos;s a collaboration, an opportunity, or just a conversation, I&apos;m always open. Tell me what&apos;s on your mind.
      </p>

      {status === "sent" ? (
        <div ref={successRef} tabIndex={-1} role="status" className="hm-contact-success">
          <div style={{ fontSize: 16, fontWeight: 600, color: C.t1 }}>Message received.</div>
          <div className="hm-f16" style={{ fontWeight: 500, color: C.t2, marginTop: 4 }}>I&apos;ll get back to you soon.</div>
          <button type="button" data-cursor-kind="again" className="hm-contact-again" onClick={reset}>Send another message</button>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} noValidate aria-busy={sending}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Name + Email, side by side on desktop */}
          <div className="hm-contact-name-email">
            <div>
              <label htmlFor="f-name" style={lbl}>Name</label>
              <input {...fieldProps("name")} type="text" placeholder="Your name" autoComplete="name"
                style={{ ...inputBase, height: 44, borderRadius: 4 }} />
              {errEl("name")}
            </div>
            <div>
              <label htmlFor="f-email" style={lbl}>Email</label>
              <input {...fieldProps("email")} type="email" placeholder="you@company.com" autoComplete="email"
                style={{ ...inputBase, height: 44, borderRadius: 4 }} />
              {errEl("email")}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="f-message" style={lbl}>Project / Message</label>
            <textarea {...fieldProps("message")} placeholder="Tell me a bit about the project, role, or idea."
              style={{ ...inputBase, height: 110, resize: "none", borderRadius: 4 }} />
            {errEl("message")}
          </div>

          {/* Honeypot */}
          <input type="text" name="_gotcha" tabIndex={-1} aria-hidden="true" autoComplete="off" style={{ display: "none" }} />

          {/* Submit failure: plain language, entered values are kept, retry is the same button */}
          {status === "error" && (
            <div role="alert" className="hm-contact-fail">
              That didn&apos;t go through. Your message is still here, so please try again.
            </div>
          )}

          <button type="submit" disabled={sending} data-cursor-kind="submit" data-cursor-state={sending ? "busy" : undefined} className="hm-contact-send"
            style={{ borderRadius: isNew ? 8 : 9999 }}>
            {sending ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}

      <style>{`
        .hm-contact-name-email { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) {
          .hm-contact-name-email { grid-template-columns: 1fr 1fr; }
        }

        /* Fields: active field gets a darker border plus a 1px ring of the same colour (no size change, no glow). Keyboard focus looks the same. */
        .hm-contact-field:focus, .hm-contact-field:focus-visible { border-color: ${C.t1} !important; box-shadow: 0 0 0 1px ${C.t1}; outline: none; }
        .hm-contact-field[aria-invalid="true"] { border-color: ${C.red} !important; }
        .hm-contact-field[aria-invalid="true"]:focus { box-shadow: 0 0 0 1px ${C.red}; }
        .hm-contact-field:disabled { opacity: 0.7; cursor: not-allowed; }
        .hm-contact-err { font-size: 12px; font-weight: 600; color: ${C.red}; margin-top: 6px; min-height: 0; }
        .hm-contact-err:empty { display: none; }
        .hm-contact-fail { font-size: 13px; font-weight: 600; color: ${C.red}; line-height: 1.5; }

        /* Submit: hover, press, focus ring */
        .hm-contact-send { height: 48px; background: ${C.t1}; color: ${C.bg}; border: none; cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; font-weight: 600;
          transition: opacity 0.25s, transform 0.2s cubic-bezier(.22,1,.36,1); }
        .hm-contact-send:hover:not(:disabled) { opacity: 0.88; transform: translateY(-2px); }
        .hm-contact-send:active:not(:disabled) { transform: translateY(0) scale(0.99); transition-duration: 0.1s; }
        .hm-contact-send:focus-visible { outline: 2px solid ${C.t1}; outline-offset: 3px; }
        .hm-contact-send:disabled { opacity: 0.7; cursor: progress; }

        /* Success: quiet fade-in in place of the form */
        .hm-contact-success { padding: 24px 0 8px; outline: none; animation: hm-contact-in 0.45s cubic-bezier(.22,1,.36,1) both; }
        .hm-contact-again { margin-top: 16px; background: none; border: none; padding: 0; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 13px; font-weight: 600; color: ${C.t2}; text-decoration: underline; text-underline-offset: 3px; }
        .hm-contact-again:hover { color: ${C.t1}; }
        .hm-contact-again:focus-visible { outline: 2px solid ${C.t1}; outline-offset: 3px; border-radius: 4px; }
        @keyframes hm-contact-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        @media (prefers-reduced-motion: reduce) {
          .hm-contact-success { animation: none; }
          .hm-contact-field { transition: none !important; }   /* inline transition from inputBase */
          .hm-contact-send, .hm-contact-send:hover:not(:disabled), .hm-contact-send:active:not(:disabled) { transition: none; transform: none; }
        }
      `}</style>
    </section>
  );
}
