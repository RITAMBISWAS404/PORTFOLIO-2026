"use client";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import {
  Store, GitBranch, Clock, PenTool, Smartphone, BookOpen,
  ArrowUp, Lock, FileText, MessageCircle, Lightbulb, Zap,
  LucideIcon,
} from "lucide-react";
import Footer from "@/sections/Footer";
import { C, col, tagStyle, tagHv, revealStyle } from "@/lib/tokens";

/* ── Stat card — icon prominent above number ────────────────────── */

function StatCard({
  icon: Icon, iconColor, stat, label, body, delay = 0,
}: {
  icon: LucideIcon; iconColor: string; stat: string;
  label: string; body: string; delay?: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [glow, setGlow] = useState("");

  return (
    <div ref={ref}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = (((e.clientX - r.left) / r.width)  * 100).toFixed(1);
        const y = (((e.clientY - r.top)  / r.height) * 100).toFixed(1);
        setGlow(`radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.05) 0%, ${C.card} 65%)`);
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.borderColor = "rgba(255,255,255,0.12)";
        el.style.boxShadow   = "0 4px 20px rgba(0,0,0,0.5)";
        el.style.transform   = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        setGlow("");
        const el = e.currentTarget;
        el.style.borderColor = C.border;
        el.style.boxShadow   = "";
        el.style.transform   = "translateY(0)";
      }}
      style={{
        background: glow || C.card,
        border: `1px solid ${C.border}`, borderRadius: 8, padding: 16,
        display: "flex", flexDirection: "column", gap: 10, cursor: "default",
        ...revealStyle(inView, delay),
        transition: `${revealStyle(inView, delay).transition}, border-color 0.15s, box-shadow 0.15s, transform 0.2s cubic-bezier(.22,1,.36,1)`,
      }}>
      <Icon size={16} color={iconColor} strokeWidth={2} />
      <div>
        <div style={{ fontSize: 22, fontWeight: 600, color: C.t1, fontFamily: "Poppins, sans-serif", lineHeight: 1.1 }}>{stat}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.t2, marginTop: 2 }}>{label}</div>
      </div>
      <p style={{ fontSize: 13, fontWeight: 400, color: C.t3, lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

/* ── Regular card — icon + label inline, used in Reflection ─────── */

function ShopCard({
  icon: Icon, iconColor, label, right, body, delay = 0,
}: {
  icon: LucideIcon; iconColor: string; label: string;
  right?: string; body: string; delay?: number;
}) {
  const ref    = useRef<HTMLDivElement>(null);
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
        border: `1px solid ${C.border}`, borderRadius: 8, padding: 16,
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

/* ── Callout variants ───────────────────────────────────────────── */

function Perspective({ text }: { text: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 8, padding: "16px 20px", border: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <MessageCircle size={14} color={C.accent} strokeWidth={2} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>Perspective</span>
      </div>
      <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>&ldquo;{text}&rdquo;</p>
    </div>
  );
}

function Lesson({ text }: { text: string }) {
  return (
    <div style={{ background: C.card, borderRadius: 8, padding: "16px 20px", border: `1px solid ${C.border}` }}>
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
    <div style={{ background: C.card, borderRadius: 8, padding: "16px 20px", border: `1px solid ${C.border}` }}>
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

/* ── Two-column comparison table ────────────────────────────────── */

function TwoColTable({ headers, rows }: { headers: [string, string]; rows: [string, string][] }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
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

/* ── Three-column table ─────────────────────────────────────────── */

function ThreeColTable({ headers, rows }: { headers: [string, string, string]; rows: [string, string, string][] }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", overflowX: "auto" }}>
      <div style={{ minWidth: 480, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
        {headers.map((h, i) => (
          <div key={i} style={{
            padding: "10px 16px", fontSize: 12, fontWeight: 600,
            color: C.t1, letterSpacing: "0.08em",
            background: "rgba(255,255,255,0.03)",
            borderRight: i < 2 ? `1px solid ${C.border}` : "none",
          }}>{h}</div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div key={i} style={{ minWidth: 480, display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
          {row.map((cell, j) => (
            <div key={j} style={{
              padding: "12px 16px", fontSize: 13, color: j === 0 ? C.t2 : C.t1,
              lineHeight: 1.6, borderTop: `1px solid ${C.border}`,
              borderRight: j < 2 ? `1px solid ${C.border}` : "none",
            }}>{cell}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Button copy comparison — inline visual for Decision 04 ─────── */

function ButtonComparison() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        {/* Before */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.t3, letterSpacing: "0.1em" }}>BEFORE</span>
          <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 8, border: `1px solid ${C.red}`, background: "rgba(244,63,94,0.06)", position: "relative" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: C.red, textDecoration: "line-through", textDecorationColor: C.red }}>Confirm Transaction</span>
          </div>
          <p style={{ marginTop: 6, fontSize: 12, color: C.t3, lineHeight: 1.5 }}>Sounds like a bank. Implies something formal and final.</p>
        </div>
        <div style={{ height: 1, background: C.border }} />
        {/* After */}
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.t3, letterSpacing: "0.1em" }}>AFTER</span>
          <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 8, border: `1px solid #7c3aed`, background: "rgba(124,58,237,0.08)" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#a78bfa" }}>Continue to Bill</span>
          </div>
          <p style={{ marginTop: 6, fontSize: 12, color: C.t3, lineHeight: 1.5 }}>Says the work is already done. You are finishing something, not beginning it.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Decision block ─────────────────────────────────────────────── */

function Decision({ num, title, first = false, children }: {
  num: string; title: string; first?: boolean; children: React.ReactNode;
}) {
  const ref    = useRef<HTMLDivElement>(null);
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

/* ── Image block ────────────────────────────────────────────────── */

function ShopImg({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <img
        src={src} alt={alt} loading="lazy"
        style={{ width: "100%", height: "auto", display: "block", borderRadius: 8, border: `1px solid ${C.border}` }}
      />
      {caption && (
        <p style={{ fontSize: 12, color: C.t3, textAlign: "center", lineHeight: 1.5 }}>{caption}</p>
      )}
    </div>
  );
}

/* ── Section heading ────────────────────────────────────────────── */

function SectionHeading({ label, num }: { label: string; num: string }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  return (
    <div ref={ref} className="shop-sh-wrap">
      <span className="shop-sh-num" style={{
        fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 500,
        color: C.t3, flexShrink: 0, letterSpacing: "0.02em",
        fontFamily: "Poppins, sans-serif",
        opacity: inView ? 1 : 0, transition: "opacity 0.6s ease 0.5s",
      }}>{num}</span>
      <h2 className="shop-sh-label" style={{
        fontSize: "clamp(20px, 3.5vw, 26px)", fontWeight: 500,
        color: C.t1, lineHeight: 1.2, letterSpacing: "0.02em",
        fontFamily: "Poppins, sans-serif", margin: 0, flexShrink: 0,
      }}>{label}</h2>
      <div className="shop-sh-line" style={{
        flex: 1, height: 1, background: C.border,
        transformOrigin: "left center",
        transform: inView ? "scaleX(1)" : "scaleX(0)",
        transition: "transform 0.9s cubic-bezier(.22,1,.36,1) 0.15s",
      }} />
    </div>
  );
}

/* ── Side nav — labels match section headings ───────────────────── */

const NAV_SECTIONS = [
  { id: "shop-overview",   label: "What ShopEZ Does" },
  { id: "shop-why",        label: "Why It Matters" },
  { id: "shop-started",    label: "Where It Started" },
  { id: "shop-changed",    label: "What Changed" },
  { id: "shop-decisions",  label: "Decisions" },
  { id: "shop-flow",       label: "The Flow" },
  { id: "shop-reflection", label: "Reflection" },
];

function PageNav() {
  const [active,  setActive]  = useState("shop-overview");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const activeObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) activeObs.observe(el);
    });

    const overviewEl = document.getElementById("shop-overview");
    const visObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { setVisible(true); }
        else { setVisible(e.boundingClientRect.top < 0); }
      });
    }, { rootMargin: "0px 0px -60% 0px" });
    if (overviewEl) visObs.observe(overviewEl);

    return () => { activeObs.disconnect(); visObs.disconnect(); };
  }, []);

  return (
    <nav className="shop-page-nav" style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "all" : "none", transition: "opacity 0.4s ease" }}>
      {NAV_SECTIONS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
            style={{
              background: "none", border: "none", cursor: "pointer", padding: 0,
              display: "flex", alignItems: "center", gap: 8, textAlign: "left",
              fontSize: 12, fontWeight: isActive ? 500 : 400,
              color: isActive ? C.t1 : C.t3,
              fontFamily: "Poppins, sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = C.t2}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = isActive ? C.t1 : C.t3}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function ShopEZPage() {
  return (
    <main>
      <PageNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ ...col, padding: "48px 24px 0" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 8, overflow: "hidden",
              flexShrink: 0, background: C.card, border: `1px solid ${C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Store size={28} color={C.accent} strokeWidth={1.5} />
            </div>
            <div>
              <div className="f16" style={{ fontWeight: 500, color: C.t1 }}>ShopEZ</div>
              <div className="f16" style={{ fontWeight: 400, color: C.t2 }}>AI-Powered Kirana Billing</div>
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 500, color: C.t1, lineHeight: 1.35, marginBottom: 24, fontFamily: "Poppins, sans-serif" }}>
            How I redesigned a hackathon billing app for the person actually standing behind the counter.
          </h1>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {[
              { label: "UX DESIGN",      icon: <PenTool    size={12} color={C.accent} strokeWidth={2} /> },
              { label: "AI INTEGRATION", icon: <Zap        size={12} color={C.yellow} strokeWidth={2} /> },
              { label: "MOBILE",         icon: <Smartphone size={12} color={C.blue}   strokeWidth={2} /> },
              { label: "INDIAN RETAIL",  icon: <Store      size={12} color={C.red}    strokeWidth={2} /> },
            ].map(t => (
              <div key={t.label} style={{ ...tagStyle, borderRadius: 8 }} onMouseEnter={e => tagHv(e, true)} onMouseLeave={e => tagHv(e, false)}>
                {t.icon} {t.label}
              </div>
            ))}
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={14} color={C.yellow} strokeWidth={2} />
              <span style={{ fontSize: 13, fontWeight: 500, color: C.t1 }}>A quick note</span>
            </div>
            <p style={{ fontSize: 13, color: C.t2, lineHeight: 1.6 }}>
              ShopEZ started at a hackathon. We built something rough, won the Open Innovation track, and moved on. A year later I came back to the same problem with fresh eyes. What you are reading is the redesign: same product idea, completely different level of thinking.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── HERO IMAGE ───────────────────────────────────────── */}
      <div style={{ ...col, padding: "32px 24px 0" }}>
        <div style={{ borderRadius: 8, overflow: "hidden", width: "100%", background: C.card, border: `1px solid ${C.border}` }}>
          <img
            src="/images/shopez/hero.png"
            alt="ShopEZ — Point. Scan. Bill."
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </div>

      {/* ── STATS — icon above number ────────────────────────── */}
      <section style={{ ...col, padding: "32px 24px 0" }}>
        <div className="shop-stats-grid">
          <StatCard icon={Store}     iconColor={C.accent} stat="12M+"  label="Kirana Stores" body="Neighbourhood grocery shops across India, most still running on paper."  delay={0}    />
          <StatCard icon={GitBranch} iconColor={C.blue}   stat="05"    label="Core Flows"    body="Splash, onboarding, dashboard, scan-to-bill, credit management."          delay={0.08} />
          <StatCard icon={Clock}     iconColor={C.yellow} stat="30s"   label="Per Bill"      body="Typical time from scan to payment confirmation for a 5-item bill."         delay={0.16} />
        </div>
      </section>

      {/* ── 01 WHAT SHOPEZ DOES ──────────────────────────────── */}
      <section id="shop-overview" style={{ ...col, padding: "64px 24px 0" }}>
        <SectionHeading label="WHAT SHOPEZ DOES" num="01" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              India has 12 million neighbourhood grocery stores. Most track bills by hand and manage customer credit in worn notebooks.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The apps that exist were built for people comfortable with technology. These shopkeepers are not. Their hands are full, the counter is busy, and they have no patience for a learning curve.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              ShopEZ starts with the camera. Point at products. The bill builds itself.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <Perspective text="The shopkeeper's hands are always full. The interface had to work around that, not against it." />
          </Reveal>
        </div>
      </section>

      {/* ── 02 WHY IT MATTERS ────────────────────────────────── */}
      <section id="shop-why" style={{ ...col, padding: "64px 24px 0" }}>
        <SectionHeading label="WHY IT MATTERS" num="02" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Sketch 02 only — Sketch 01 lives exclusively in Decision 01 */}
          <Reveal>
            <ShopImg
              src="/images/shopez/sketch-before-after.png"
              alt="Before vs after — paper system vs ShopEZ"
              caption="Why the paper system had to go."
            />
          </Reveal>
          {/* Connecting body text before the table */}
          <Reveal delay={0.08}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The kirana store problem is not a technology problem. It is a workflow problem. The existing tools ignored how shopkeepers actually work — hands full, counter busy, no time for menus or search bars. The table below shows the gap between what exists and what was actually happening.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <TwoColTable
              headers={["The Problem", "The Reality"]}
              rows={[
                ["Billing is done by hand",       "Errors, slow, no record"],
                ["Credit tracked in notebooks",   "Easy to lose, hard to chase"],
                ["No digital reminder system",    "Shopkeeper has to ask awkwardly"],
                ["Existing apps too complex",     "Steep learning curve, low adoption"],
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ── 03 WHERE IT STARTED ──────────────────────────────── */}
      <section id="shop-started" style={{ ...col, padding: "64px 24px 0" }}>
        <SectionHeading label="WHERE IT STARTED" num="03" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <ShopImg
              src="/images/shopez/v1-vs-v2.png"
              alt="Hackathon build 2024 vs Redesign 2025"
            />
          </Reveal>
          <Reveal delay={0.06}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The original app could scan items and generate a bill. That was roughly it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The home screen opened to a customer list with no business summary. Credit tracking was buried. The first screen asked shopkeepers to choose between &ldquo;Retailer&rdquo; and &ldquo;Customer,&rdquo; a decision that should never have existed.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              We won the hackathon with that version. Looking back a year later, the question became simple:
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <Perspective text="What would this look like if it was actually built for the person standing behind the counter?" />
          </Reveal>
        </div>
      </section>

      {/* ── 04 WHAT CHANGED ──────────────────────────────────── */}
      <section id="shop-changed" style={{ ...col, padding: "64px 24px 0" }}>
        <SectionHeading label="WHAT CHANGED" num="04" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <ShopImg src="/images/shopez/dashboard-annotated.png" alt="Dashboard with callout annotations" />
          </Reveal>
          <Reveal delay={0.1}>
            <ThreeColTable
              headers={["Area", "Hackathon Version", "Redesign"]}
              rows={[
                ["First screen",    "Role selector: Retailer or Customer", "Single purpose, shopkeeper only"],
                ["Home",            "Customer list, no summary",            "Dashboard: sales, credit, stock alerts"],
                ["AI scan",         "Items detected, no feedback",          "Confidence scores per item, colour coded"],
                ["Credit tracking", "Buried in customer detail",            "First-class feature on dashboard and ledger"],
                ["Payment",         "Not present",                          "Cash, UPI, Credit — the three that matter"],
                ["Copy",            "Generic app language",                 "“No more paper khata”"],
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ── 05 THE DECISION JOURNEY ──────────────────────────── */}
      <section id="shop-decisions" style={{ ...col, padding: "64px 24px 0" }}>
        <SectionHeading label="THE DECISION JOURNEY" num="05" />
        <div className="mt-section">

          {/* Decision 01 — Sketch 01 lives here exclusively */}
          <Decision num="01" title="Leading with the camera" first>
            <ShopImg
              src="/images/shopez/sketch-billing-flow.png"
              alt="The core interaction model, mapped out early"
              caption="The core interaction model, mapped out early."
            />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Every other billing app starts with a search bar or a product list. ShopEZ starts with the camera, because that is how the transaction actually happens. The product is already in the shopkeeper&apos;s hand. They should not need to look it up.
            </p>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              &ldquo;Point. Scan. Bill.&rdquo; is not just a tagline. It is the entire interaction model in three words.
            </p>
            <Insight text="The best interface for a busy person meets them exactly where they already are." />
            <Lesson text="If the interaction model can be described in three words, you have found the right one." />
          </Decision>

          <Decision num="02" title="Making the AI visible, not invisible">
            <ShopImg src="/images/shopez/scan-screen.png" alt="Scan screen with radar element and annotations" />
            <ShopImg src="/images/shopez/sketch-ai-confidence.png" alt="AI confidence decision logic doodle" />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Most AI features hide their uncertainty. ShopEZ shows it.
            </p>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Every detected item shows a confidence score. 95% in green. 88% in amber. The shopkeeper instantly knows which detections to trust and which to double-check.
            </p>
            <TwoColTable
              headers={["What we could have done", "What we did instead"]}
              rows={[
                ["Hide the model’s confidence",  "Show it per item, colour coded"],
                ["Auto-confirm all detections",       "Require shopkeeper review before billing"],
                ["Skip the manual edit step",         "Built “Add manually” for edge cases"],
              ]}
            />
            <Insight text="Showing uncertainty builds more trust than hiding it ever could." />
            <Lesson text="Transparency about AI confidence is a design feature, not a weakness." />
          </Decision>

          <Decision num="03" title="The Walk-in Customer button">
            <ShopImg src="/images/shopez/review-bill-select-customer.png" alt="Review Bill and Select Customer side by side" />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The first version of customer selection assumed every sale was tied to a registered customer.
            </p>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              It was not. Most kirana sales are quick anonymous cash transactions. Forcing a customer lookup for every bill added friction with no reason to exist.
            </p>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              One button fixed it. &ldquo;Walk-in Customer&rdquo; skips selection entirely, straight to payment. Registered credit customers still get the full flow, with recent customers surfaced at the top.
            </p>
            <Insight text="Design for the most common case first. The exception can still be handled, just not in the main path." />
            <Lesson text="One extra option at the right moment removes an entire unnecessary flow." />
          </Decision>

          <Decision num="04" title="Words on a button">
            <ButtonComparison />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              &ldquo;Confirm Transaction&rdquo; sounds like a bank. It implies something formal and final.
            </p>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              By the time the shopkeeper reaches the bill summary screen, the transaction started three screens ago when the camera scanned the first item. Calling it a confirmation made it feel like starting over.
            </p>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              &ldquo;Continue to Bill&rdquo; says the work is already done. You are finishing something, not beginning it.
            </p>
            <Insight text="The words on a button carry as much UX weight as the layout around it." />
            <Lesson text="Language is a design material. Treat it like one." />
          </Decision>

          <Decision num="05" title="Digitising udhaar without making it awkward">
            <ShopImg src="/images/shopez/bill-summary-ledger.png" alt="Bill Summary and Customer Ledger side by side" />
            <ShopImg src="/images/shopez/sketch-udhaar-cycle.png" alt="Udhaar credit cycle doodle" />
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              Credit in Indian retail is personal. The shopkeeper knows their customers by face, by family, by what they usually buy. Asking for payment can feel uncomfortable in that kind of relationship.
            </p>
            <ThreeColTable
              headers={["Feature", "What it shows", "Why it matters"]}
              rows={[
                ["Transaction timeline", "Every bill and payment in order", "Full history, no disputes"],
                ["Running total",        "Paid in green, credit in red",    "Both parties see the same number"],
                ["Send Reminder",        "Composes a WhatsApp message",     "Shopkeeper never has to make the call"],
              ]}
            />
            <Insight text="Sometimes the best UX decision is removing a human interaction nobody wanted to have." />
            <Lesson text="Digital tools work best when they handle the conversations people avoid." />
          </Decision>

        </div>
      </section>

      {/* ── 06 THE FLOW ──────────────────────────────────────── */}
      <section id="shop-flow" style={{ ...col, padding: "64px 24px 0" }}>
        <SectionHeading label="THE FLOW" num="06" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>The entire product in one strip.</p>
          </Reveal>
          <Reveal delay={0.06}>
            <ShopImg src="/images/shopez/full-flow-strip.png" alt="Full flow strip — all 8 screens with labels and arrows" />
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px", textAlign: "center" }}>
              <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
                &ldquo;A typical 5-item bill: under 30 seconds from scan to done.&rdquo;
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="btn-row">
              <a
                href="https://www.figma.com/design/WVfPLPULM7YOfAUxtPwx9M/ShopEZ-Portfolio-2026"
                target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", color: C.t1, padding: "11px 22px", borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "background 0.25s, transform 0.25s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.09)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLAnchorElement).style.transform = ""; }}
              >
                <PenTool size={14} strokeWidth={2} /> View Figma Prototype
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 07 REFLECTION ────────────────────────────────────── */}
      <section id="shop-reflection" style={{ ...col, padding: "64px 24px 0" }}>
        <SectionHeading label="REFLECTION" num="07" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="shop-reflection-grid">
            <ShopCard icon={FileText}   iconColor={C.accent} label="Test with real shopkeepers earlier" right="01" body="All design decisions here came from observation and research. One session watching an actual kirana owner use the scan screen would have caught the gap before it became a gap."   delay={0}    />
            <ShopCard icon={Lightbulb}  iconColor={C.blue}   label="Design the failure states"          right="02" body="Every happy path is designed. None of the error states are. Unrecognised items, camera failure, no internet. Those screens do not exist yet and they should."                 delay={0.08} />
            <ShopCard icon={Smartphone} iconColor={C.yellow} label="Add a language toggle from day one" right="03" body="The app is in English. A lot of shopkeepers who need this most are not comfortable in English. Hindi or regional language should have been in the first frame of the Figma file." delay={0.16} />
          </div>
        </div>
      </section>

      {/* ── CLOSING — separated by divider from reflection ────── */}
      <section style={{ ...col, padding: "0 24px 0" }}>
        <div style={{ height: 1, background: C.border, margin: "48px 0 48px" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The redesign took longer than building the original. Not because the screens are complicated. Understanding the person behind the counter took time.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              The most important decision in this whole project was also the smallest one: changing &ldquo;Confirm Transaction&rdquo; to &ldquo;Continue to Bill.&rdquo; Nobody would notice it in a design review. The shopkeeper using the app during a busy evening rush would feel it without knowing why.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="f16" style={{ color: C.t2, lineHeight: 1.7 }}>
              That is what this kind of design looks like. Not a big innovation. Just attention to the person on the other side of the screen.
            </p>
          </Reveal>
          <Reveal delay={0.16}>
            <Perspective text="Point. Scan. Bill. Three words. That is the whole product." />
          </Reveal>
        </div>
      </section>

      {/* ── BACK TO TOP ──────────────────────────────────────── */}
      <div style={{ ...col, padding: "48px 24px 0", display: "flex", justifyContent: "flex-start" }}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.05)", color: C.t1,
            border: "none", padding: "11px 22px",
            borderRadius: 8, fontSize: 14, fontWeight: 500,
            cursor: "pointer", fontFamily: "Poppins, sans-serif",
            transition: "opacity 0.25s, transform 0.25s",
          }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.opacity = "0.88"; b.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.opacity = "1"; b.style.transform = ""; }}
        >
          <ArrowUp size={14} strokeWidth={2} /> Back to top
        </button>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <Footer />
      </div>

      <style>{`
        .shop-sh-wrap  { display: flex; align-items: center; gap: 8px; }
        .shop-sh-num   { display: none; }
        .shop-sh-label { order: 1; }
        .shop-sh-line  { display: none; }
        @media (min-width: 768px) {
          .shop-sh-wrap  { gap: 16px; }
          .shop-sh-num   { display: block; order: 2; }
          .shop-sh-label { order: 0; }
          .shop-sh-line  { display: block; order: 1; }
        }
        .shop-page-nav {
          display: none;
          position: fixed;
          left: calc(50% + 408px);
          top: 50%;
          transform: translateY(-50%);
          flex-direction: column;
          gap: 14px;
          z-index: 100;
        }
        @media (min-width: 1200px) { .shop-page-nav { display: flex; } }
        .shop-stats-grid      { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .shop-reflection-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 600px) {
          .shop-stats-grid      { grid-template-columns: 1fr 1fr 1fr; }
          .shop-reflection-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
        .mt-section { margin-top: 32px; }
        .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
      `}</style>
    </main>
  );
}
