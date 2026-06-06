"use client";
import { useRef, useState, useCallback } from "react";
import { useInView } from "framer-motion";
import {
  Zap, Target, Search, LayoutGrid, GitBranch,
  Smartphone, BookOpen, ArrowLeft, Lock, PenTool, FileText,
  MessageCircle, Lightbulb, User, Clock, Layers, Users, Briefcase,
  Eye, LucideIcon,
} from "lucide-react";
import SectionLabel from "@/components/SectionLabel";
import Footer from "@/sections/Footer";
import { C, col, tagStyle, tagHv, revealStyle } from "@/lib/tokens";

/* ── ZenoCard — the single card layout used throughout this page ─ */
/* [colored icon] [white label]                    [gray right]     */
/* gray body                                                         */

function ZenoCard({
  icon: Icon, iconColor, label, right, body, delay = 0,
}: {
  icon: LucideIcon; iconColor: string; label: string;
  right?: string; body: string; delay?: number;
}) {
  const ref  = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [glow,    setGlow]    = useState("");
  const [hovered, setHovered] = useState(false);

  return (
    <div ref={ref}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (((e.clientX - r.left) / r.width)  * 100).toFixed(1);
        const y = (((e.clientY - r.top)  / r.height) * 100).toFixed(1);
        setGlow(`radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.05) 0%, ${C.card} 65%)`);
      }}
      onMouseEnter={e => {
        setHovered(true);
        const el = e.currentTarget;
        el.style.borderColor = "rgba(255,255,255,0.12)";
        el.style.boxShadow   = "0 4px 20px rgba(0,0,0,0.5)";
        el.style.transform   = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        setHovered(false); setGlow("");
        const el = e.currentTarget;
        el.style.borderColor = C.border;
        el.style.boxShadow   = "";
        el.style.transform   = "translateY(0)";
      }}
      style={{
        background: glow || C.card,
        border: `1px solid ${C.border}`, borderRadius: 16, padding: 16,
        display: "flex", flexDirection: "column", gap: 8, cursor: "default",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, border-color 0.15s, box-shadow 0.15s, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={14} color={iconColor} strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>{label}</span>
        </div>
        {right && (
          <span style={{ fontSize: 12, fontWeight: 500, color: hovered ? C.t2 : C.t3, transition: "color 0.15s", flexShrink: 0, marginLeft: 8 }}>
            {right}
          </span>
        )}
      </div>
      <p className="f16" style={{ fontWeight: 400, color: C.t2, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

/* ── Callout variants — same layout, no glow (they're informational) */

function Quote({ text }: { text: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <MessageCircle size={14} color={C.accent} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>Perspective</span>
      </div>
      <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

function Lesson({ text }: { text: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <BookOpen size={14} color={C.blue} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>Lesson</span>
      </div>
      <p className="f16" style={{ color: C.t2, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Lightbulb size={14} color={C.yellow} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>Insight</span>
      </div>
      <p className="f16" style={{ color: C.t2, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

/* ── Scroll reveal wrapper ──────────────────────────────────────── */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  return <div ref={ref} style={revealStyle(inView, delay)}>{children}</div>;
}

/* ── Comparison table ───────────────────────────────────────────── */

function TwoColTable({ headers, rows }: { headers: [string, string]; rows: [string, string][] }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {headers.map((h, i) => (
          <div key={i} style={{
            padding: "10px 16px", fontSize: 12, fontWeight: 600,
            color: C.t1, letterSpacing: "0.08em",
            background: "rgba(255,255,255,0.03)",
            borderRight: i === 0 ? `1px solid ${C.border}` : "none",
          }}>{h}</div>
        ))}
      </div>
      {rows.map(([left, right], i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "12px 16px", fontSize: 14, color: C.t2, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, borderRight: `1px solid ${C.border}` }}>{left}</div>
          <div style={{ padding: "12px 16px", fontSize: 14, color: C.t1, lineHeight: 1.6, borderTop: `1px solid ${C.border}` }}>{right}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Decision block ─────────────────────────────────────────────── */

function Decision({ num, title, first = false, children }: {
  num: string; title: string; first?: boolean; children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-5% 0px" });
  return (
    <>
      {!first && <div style={{ height: 1, background: C.border, margin: "40px 0" }} />}
      <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 16, ...revealStyle(inView) }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: C.t3, letterSpacing: "0.12em" }}>DECISION {num}</span>
        <h3 className="f16" style={{ fontWeight: 500, color: C.t1, lineHeight: 1.5 }}>{title}</h3>
        {children}
      </div>
    </>
  );
}

/* ── Image placeholder ──────────────────────────────────────────── */

function ImgPlaceholder({ label }: { label: string }) {
  return (
    <div style={{
      width: "100%", aspectRatio: "16 / 9",
      background: C.card, border: `1px dashed ${C.border}`, borderRadius: 16,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
    }}>
      <Smartphone size={20} color={C.t3} strokeWidth={1.5} />
      <span style={{ fontSize: 11, fontWeight: 500, color: C.t3, letterSpacing: "0.1em" }}>{label}</span>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function ZenoPage() {
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const onDotMove  = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setCursor({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);
  const onDotLeave = useCallback(() => setCursor({ x: -999, y: -999 }), []);

  return (
    <main>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ ...col, padding: "48px 24px 0" }}>
        <Reveal>
          <a href="/"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, color: C.t3, textDecoration: "none", marginBottom: 32, transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = C.t2}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = C.t3}
          >
            <ArrowLeft size={14} strokeWidth={2} /> Back to Portfolio
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, overflow: "hidden", flexShrink: 0 }}>
              <img src="/images/zeno logo.png" alt="ZENO" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div className="f16" style={{ fontWeight: 500, color: C.t1 }}>ZENO</div>
              <div className="f16" style={{ fontWeight: 400, color: C.t2 }}>Smart EV Charging Management</div>
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 500, color: C.t1, lineHeight: 1.35, marginBottom: 24, fontFamily: "Poppins, sans-serif" }}>
            How I Turned a Data-Heavy EV App Into a Four-Second Experience.
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {[
              { label: "UX DESIGN",  icon: <PenTool  size={12} color={C.accent} strokeWidth={2} /> },
              { label: "EV APP",     icon: <Zap      size={12} color={C.yellow} strokeWidth={2} /> },
              { label: "CASE STUDY", icon: <FileText size={12} color={C.blue}   strokeWidth={2} /> },
            ].map(t => (
              <div key={t.label} style={tagStyle} onMouseEnter={e => tagHv(e, true)} onMouseLeave={e => tagHv(e, false)}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color={C.yellow} strokeWidth={2} />
              <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>Confidential Note</span>
            </div>
            <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.6 }}>
              Zeno is a portfolio-safe recreation of a product I designed for a Copenhagen-based EV startup. With the company&apos;s permission, I rebuilt it under a new brand. Every decision, constraint, and insight here is real. Only the branding changed.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── HERO IMAGE (dot pattern) ────────────────────────── */}
      <div className="zeno-dot-bg"
        onMouseMove={onDotMove}
        onMouseLeave={onDotLeave}
        style={{ position: "relative", marginTop: 32 }}>

        {/* Bright dot layer masked to cursor position */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          WebkitMaskImage: `radial-gradient(circle 140px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`,
          maskImage:        `radial-gradient(circle 140px at ${cursor.x}px ${cursor.y}px, black 0%, transparent 100%)`,
        }} />

        <div style={{ ...col, position: "relative", zIndex: 1 }}>
          <div className="zeno-hero-img-wrap" style={{ borderRadius: 16, overflow: "hidden", width: "100%" }}>
            <picture>
              <source media="(min-width: 768px)" srcSet="/images/16_9.png" />
              <img
                src="/images/4_3.png"
                alt="ZENO App"
                style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
              />
            </picture>
          </div>
        </div>
      </div>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section style={{ ...col, padding: "32px 24px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="zeno-stats-grid">
            <ZenoCard icon={Layers}    iconColor={C.accent} label="Screens Designed" right="35"  body="Every key user flow from onboarding through dashboard, analytics, and settings." delay={0}    />
            <ZenoCard icon={GitBranch} iconColor={C.blue}   label="Core User Flows"  right="05"  body="Onboarding, charging session, analytics, history, and account management."        delay={0.08} />
            <ZenoCard icon={Clock}     iconColor={C.yellow} label="MVP Timeline"      right="2M"  body="From blank Figma file to production-ready iOS and Android designs in two months."  delay={0.16} />
          </div>
        </div>
      </section>

      {/* ── 01 WHAT ZENO DOES ───────────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={Zap} label="WHAT ZENO DOES" num="01" iconColor={C.yellow} />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Electricity prices change every hour. Most EV owners charge at the wrong one. Zeno&apos;s algorithm monitors real-time prices, finds the cheapest window before your departure, and charges your car then. You set two things: when you need to leave, and how full you want the battery. The app handles everything else.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <Quote text="You set the departure time. You set the target charge. The algorithm finds the cheapest hour and does the rest." />
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ background: C.card, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <User size={14} color={C.accent} strokeWidth={2} />
                <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>My Role</span>
              </div>
              <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
                Sole designer from day one. No existing product, no design system, no prior work to inherit. Only a vision from the CEO and CTO and a blank Figma file. What I know now about design systems, component thinking, and stakeholder communication came directly from the pressure of this project. Everything here was built from scratch.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 02 THE PROBLEM ──────────────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={Target} label="THE PROBLEM" num="02" iconColor={C.red} />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <Insight text="Make a product built around a smart algorithm and dense real-time data feel effortless for someone who just wants their car ready in the morning." />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.6 }}>
              The dashboard had to surface a lot without overwhelming the user. Every item on screen needed a clear reason to be there.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <TwoColTable
              headers={["Must Show", "Why"]}
              rows={[
                ["Battery % + time remaining + ready-by", "Core reason users open the app"],
                ["Target State of Charge",                "The charge ceiling set by the user"],
                ["Departure time",                        "What the algorithm schedules around"],
                ["Auto Mode, On/Off, Cable Lock",         "The three primary controls"],
                ["Charger and vehicle selector",          "Context for multi-device users"],
                ["Connection status",                     "Confirms the system is live"],
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ── 03 RESEARCH ─────────────────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={Search} label="RESEARCH AND EARLY THINKING" num="03" iconColor={C.blue} />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.6 }}>
              Before designing a single screen, I audited the competitive landscape. Every existing EV app had the same three problems.
            </p>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ZenoCard icon={FileText} iconColor={C.blue}   label="Built for engineers"   right="01" body="Technical vocabulary with no softening. Everything assumed power-user knowledge." delay={0.06} />
            <ZenoCard icon={Eye}      iconColor={C.yellow}  label="Information overload"  right="02" body="Every metric visible at once. No hierarchy, no breathing room. Overwhelming to scan." delay={0.12} />
            <ZenoCard icon={Users}    iconColor={C.red}     label="Accessibility barrier" right="03" body="Older users hit a wall before trying a single feature. The learning curve was immediate." delay={0.18} />
          </div>
          <Reveal delay={0.12}>
            <ImgPlaceholder label="DESIGN REFERENCES" />
          </Reveal>
          <Reveal delay={0.16}>
            <Quote text="This product needed to feel like an assistant, not a control panel." />
          </Reveal>
        </div>
      </section>

      {/* ── 04 ONBOARDING FLOW ──────────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={Smartphone} label="ONBOARDING FLOW" num="04" iconColor={C.yellow} />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The onboarding needed to collect a lot from new users: email, password, charger license, serial number, battery size, and connection confirmation. One task per screen with clear conditional logic kept it from feeling heavy.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <Insight text="Six focused steps felt lighter than any single long form. Users always knew exactly what they were being asked to do." />
          </Reveal>
          <Reveal delay={0.12}>
            <ImgPlaceholder label="ONBOARDING WIREFRAMES" />
          </Reveal>
          <Reveal delay={0.16}>
            <ImgPlaceholder label="ONBOARDING SCREENS" />
          </Reveal>
        </div>
      </section>

      {/* ── 05 DASHBOARD EXPLORATION ────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={LayoutGrid} label="DASHBOARD EXPLORATION" num="05" iconColor={C.accent} />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.6 }}>
              Three concepts were explored before landing on the final direction.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <ImgPlaceholder label="CONCEPT SKETCHES" />
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: 480, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {[{ label: "Widget Set", color: C.t1 }, { label: "Minimal", color: C.t1 }, { label: "My Way", color: C.accent }].map((h, i) => (
                    <div key={h.label} style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: h.color, letterSpacing: "0.08em", background: "rgba(255,255,255,0.03)", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>{h.label}</div>
                  ))}
                </div>
                {/* Rows */}
                {[
                  ["Every metric in its own card.", "Stripped back, text-heavy.",     "Vehicle image anchors the screen."],
                  ["Felt like a cockpit.",           "Felt like a diagnostic report.", "Felt personal and immediate."],
                  ["Hard to scan at a glance.",      "Clean but emotionally cold.",    "Clear hierarchy from first sketch."],
                ].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                    {row.map((cell, j) => (
                      <div key={j} style={{ padding: "12px 16px", fontSize: 13, color: C.t2, lineHeight: 1.5, borderTop: `1px solid ${C.border}`, borderRight: j < 2 ? `1px solid ${C.border}` : "none" }}>{cell}</div>
                    ))}
                  </div>
                ))}
                {/* Verdict */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                  {[{ label: "REJECTED", color: C.red }, { label: "REJECTED", color: C.red }, { label: "CHOSEN", color: C.accent }].map((v, i) => (
                    <div key={i} style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: v.color, letterSpacing: "0.1em", padding: "3px 8px", border: `1px solid ${v.color}33`, background: `${v.color}11`, borderRadius: 9999, display: "inline-block" }}>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <Insight text="The vehicle image was not cosmetic. It told users immediately which car they were managing and made the experience feel personal rather than generic." />
          </Reveal>
        </div>
      </section>

      {/* ── 05 DECISION JOURNEY ─────────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={GitBranch} label="THE DECISION JOURNEY" num="06" iconColor={C.blue} />
        <div className="mt-section">

          <Decision num="01" title="From widgets to grouped components" first>
            <ImgPlaceholder label="DASHBOARD COMPARISON" />
            <TwoColTable
              headers={["Widget Concept", "Final Grouped Dashboard"]}
              rows={[
                ["Each metric isolated in its own card", "Related data sharing one visual block"],
                ["Controls scattered with no priority",  "Auto, On/Off, Lock in one unified row"],
                ["Required active reading",              "Scannable in under two seconds"],
              ]}
            />
            <Lesson text="Good design is often about deciding what not to show separately, not what to cut entirely." />
          </Decision>

          <Decision num="02" title="Defending white space">
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Stakeholders suggested reducing spacing around the charging indicator to fit more data. I pushed back with user reasoning, not preference. Older users reading a dense screen work harder to find what they need. White space was doing real usability work.
            </p>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              <strong style={{ color: C.t1, fontWeight: 500 }}>Resolution:</strong> Secondary controls moved to modals. White space stayed.
            </p>
            <Lesson text='"This looks cleaner" loses. "Here is what our user is doing at 7am" wins.' />
          </Decision>

          <Decision num="03" title="Target SoC and Departure Time hidden behind a tap">
            <ImgPlaceholder label="INTERACTION DETAIL" />
            <TwoColTable
              headers={["Problem with surface placement", "Solution"]}
              rows={[
                ["Too much vertical space consumed",       "Compact row with chevron showing current value"],
                ["Accidental touch risk while navigating", "Full controls open in a modal on tap"],
                ["Competed with primary charging info",    "Dashboard reserved for read-only data"],
              ]}
            />
            <Lesson text="When a setting controls something important, accidental input justifies removing it from the main surface." />
          </Decision>

          <Decision num="04" title="The vehicle image">
            <ImgPlaceholder label="VEHICLE INTEGRATION" />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The vehicle image was in the very first concept sketch, not a late addition. During design review, the CEO and I noticed how Tesla showed your actual car, not a generic icon. I proposed the same. Building it took time: vehicle APIs, custom assets, model cutouts. But the sketch shows I knew from the beginning this was the right direction.
            </p>
            <Lesson text="Sometimes the most impactful decision is not about layout. It is about making someone feel something about their product." />
          </Decision>

          <Decision num="05" title="What got cut, and where it went">
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Beta users opened the app, checked battery percentage, glanced at the ready-by time, and closed it. Four seconds. Everything else went unlooked at.
            </p>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div className="zeno-cut-grid">
                {["Stayed on Dashboard", "Moved to Analytics", "Moved to Settings"].map((h, i) => (
                  <div key={i} style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: C.t1, letterSpacing: "0.08em", background: "rgba(255,255,255,0.03)", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>{h}</div>
                ))}
              </div>
              <div className="zeno-cut-grid">
                {[
                  "Battery %, time remaining, ready-by\n\nAuto, On/Off, Cable Lock",
                  "Cost savings, energy usage, session history",
                  "Connection status, vehicle management\n\nAccount, language, security",
                ].map((cell, i) => (
                  <div key={i} style={{ padding: "12px 14px", fontSize: 13, color: C.t2, lineHeight: 1.6, borderTop: `1px solid ${C.border}`, borderRight: i < 2 ? `1px solid ${C.border}` : "none", whiteSpace: "pre-line" }}>{cell}</div>
                ))}
              </div>
            </div>
            <Insight text="A dashboard answers the most important question the user has right now. Everything else waits one tap away." />
          </Decision>

          <Decision num="06" title="The feature we built, shipped, and removed">
            <ImgPlaceholder label="USAGE ANALYTICS" />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              We designed a double-ring clock widget showing the algorithm&apos;s charging schedule. Inner ring for today, outer ring for the next day. Electricity price data in Denmark does not reset at midnight, so sessions could spill past 12am. The two rings solved that technically.
            </p>
            <TwoColTable
              headers={["What we assumed", "What users experienced"]}
              rows={[
                ["Two rings clearly separate today vs tomorrow", "Confusing with no obvious starting point"],
                ["Legend explains the color coding",             "Users did not read the legend first"],
                ["Showing the schedule builds trust",            "Complexity made them question the algorithm"],
              ]}
            />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Beta users found it mentally taxing. The deeper problem was not the visual. It was the concept. The algorithm&apos;s job is to remove decisions from the user, not explain its own logic to them. We removed the feature entirely. Trust came back when the complexity disappeared.
            </p>
            <Lesson text="A feature that requires explanation has already failed. The best interface for a smart system is one that makes the system feel invisible." />
          </Decision>

        </div>
      </section>

      {/* ── 06 FINAL PRODUCT ────────────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={Smartphone} label="THE FINAL PRODUCT" num="07" iconColor={C.accent} />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.6 }}>
              35 screens across 5 core flows: onboarding, dashboard, charging session, analytics, and settings. Designed for iOS and Android.
            </p>
          </Reveal>
          <Reveal delay={0.06}> <ImgPlaceholder label="ONBOARDING" /></Reveal>
          <Reveal delay={0.1}>  <ImgPlaceholder label="DASHBOARD"  /></Reveal>
          <Reveal delay={0.14}> <ImgPlaceholder label="ANALYTICS"  /></Reveal>
          <Reveal delay={0.18}> <ImgPlaceholder label="SETTINGS"   /></Reveal>
          <Reveal delay={0.22}>
            <div className="btn-row">
              <a href="https://www.figma.com/design/HQiowSEZWtefmjVP5cqZuY/ZENO?node-id=0-1&p=f&t=ZuWU0JArTeGN7yjv-0"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", color: C.t1, padding: "11px 22px", borderRadius: 9999, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "background 0.25s, transform 0.25s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
              >
                <PenTool size={14} strokeWidth={2} /> View in Figma
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 07 REFLECTION ───────────────────────────────────── */}
      <section style={{ ...col, padding: "64px 24px 0" }}>
        <SectionLabel icon={BookOpen} label="REFLECTION" num="08" iconColor={C.blue} />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="zeno-reflection-grid">
            <ZenoCard icon={Layers}   iconColor={C.accent} label="Build the design system first"      right="01" body="Manual component updates across 35+ screens for months. Design tokens and component libraries should be day one, not an afterthought." delay={0}    />
            <ZenoCard icon={Users}    iconColor={C.blue}   label="Test with real users earlier"        right="02" body="Decisions debated for days became obvious the first time a real user touched the screen."                                              delay={0.08} />
            <ZenoCard icon={FileText} iconColor={C.yellow} label="Document decisions as they happen"   right="03" body="One sentence per key decision, written at the time, would have made this case study significantly more accurate."                       delay={0.16} />
          </div>
          <Reveal delay={0.2}>
            <Quote text="Simplicity is not the absence of complexity. It is evidence that someone worked very hard to hide it in exactly the right places." />
          </Reveal>
          <Reveal delay={0.26}>
            <ImgPlaceholder label="FINAL HANDOFF" />
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div style={{ marginTop: 64 }}>
        <Footer />
      </div>

      <style>{`
        .zeno-hero-img-wrap { aspect-ratio: 4 / 3; }
        @media (min-width: 768px) { .zeno-hero-img-wrap { aspect-ratio: 16 / 9; } }
        .zeno-dot-bg { background-color: #0d0d0d; padding: 0 24px; }
        @media (min-width: 768px) {
          .zeno-dot-bg {
            background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
            background-size: 14px 14px;
            padding: 40px 24px;
          }
        }
        .zeno-stats-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .zeno-meta-grid  { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .zeno-concept-grid    { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .zeno-reflection-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .zeno-cut-grid        { display: grid; grid-template-columns: 1fr 1fr 1fr; }
        @media (min-width: 600px) {
          .zeno-concept-grid { grid-template-columns: 1fr 1fr 1fr; }
          .zeno-meta-grid    { grid-template-columns: 1fr 1fr 1fr; }
        }
        @media (min-width: 600px) {
          .zeno-stats-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
        @media (max-width: 540px) {
          .zeno-cut-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
