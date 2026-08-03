"use client";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import {
  Store, GitBranch, Clock,
  BookOpen, Lock, FileText,
  Quote as QuoteIcon, Lightbulb, Smartphone,
} from "lucide-react";
import Footer from "@/sections/v3/Footer";
import GridLines from "@/components/GridLines";
import NavbarNew from "@/components/NavbarNew";
import { ThemeProvider } from "@/lib/ThemeContext";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import Card from "@/components/Card";
import IconCard from "@/components/IconCard";
import TwoColTable from "@/components/TwoColTable";
import ThreeColTable from "@/components/ThreeColTable";
import DecisionBase from "@/components/Decision";
import { C, col, revealStyle } from "@/lib/tokensV2";

/* ── Callout variants — thin wrappers around IconCard ────────────── */

function Perspective({ text }: { text: string }) {
  return <IconCard icon={QuoteIcon} label="Perspective" body={`“${text}”`} bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover />;
}

function Lesson({ text }: { text: string }) {
  return <IconCard icon={BookOpen} label="Lesson" body={text} bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover />;
}

function Insight({ text }: { text: string }) {
  return <IconCard icon={Lightbulb} label="Insight" body={text} bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover />;
}

/* ── Scroll reveal wrapper ──────────────────────────────────────── */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  return <div ref={ref} style={revealStyle(inView, delay)}>{children}</div>;
}

/* ── Decision block ─────────────────────────────────────────────── */

function Decision(props: { num: string; title: string; first?: boolean; children: React.ReactNode }) {
  return <DecisionBase {...props} lineClassName="shop-decision-line" />;
}

/* ── Image block ────────────────────────────────────────────────── */

function ShopImg({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <img
        src={src} alt={alt} loading="lazy"
        style={{ width: "100%", height: "auto", display: "block", borderRadius: 0, border: `1px solid ${C.border}` }}
      />
      {caption && (
        <p style={{ fontSize: 12, fontWeight: 500, color: C.t3, textAlign: "center", lineHeight: 1.5 }}>{caption}</p>
      )}
    </div>
  );
}

/* ── Page-level section navigator ────────────────────────────────── */

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
              fontSize: 12, fontWeight: isActive ? 600 : 500,
              color: isActive ? C.t1 : C.t3,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
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

function Divider() {
  return <div style={{ width: "100%", height: 1, background: "var(--color-border)" }} />;
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function ShopEZPage() {
  return (
    <ThemeProvider defaultTheme="light">
      <NavbarNew homePath="/" />
      <main style={{ position: "relative" }} className="v3-white-bg">
        <GridLines />
        <PageNav />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 0, overflow: "hidden", flexShrink: 0 }}>
              <img src="/images/shopez logo.png" alt="ShopEZ" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div className="f16" style={{ fontWeight: 600, color: C.t1 }}>ShopEZ</div>
              <div className="f16" style={{ fontWeight: 500, color: C.t2 }}>AI-Powered Kirana Billing</div>
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 650, letterSpacing: "-0.02em", color: C.t1, lineHeight: 1.15, marginBottom: 24 }}>
            How I redesigned a hackathon billing app for the person actually standing behind the counter.
          </h1>

          <IconCard icon={Lock} label="A Quick Note" bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover
            body="ShopEZ started at a hackathon. We built something rough, won the Open Innovation track, and moved on. A year later I came back to the same problem with fresh eyes. What you are reading is the redesign: same product idea, completely different level of thinking." />
        </Reveal>
      </section>

      {/* ── HERO IMAGE ──────────────────────────────────────── */}
      <div style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <div style={{ borderRadius: 0, overflow: "hidden", width: "100%" }}>
          <img
            src="/images/shopez/hero.png"
            alt="ShopEZ — Point. Scan. Bill."
            style={{ width: "100%", height: "auto", display: "block", border: `1px solid ${C.border}`, borderRadius: 0 }}
          />
        </div>
      </div>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section style={{ ...col }} className="v3-section">
        <div className="shop-stats-grid">
          <Card label="12M+ Kirana Stores" num="" body="Neighbourhood grocery shops across India, most still running on paper." delay={0}    bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover icon={Store} />
          <Card label="5 Core Flows"       num="" body="Splash, onboarding, dashboard, scan-to-bill, credit management." delay={0.08} bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover icon={GitBranch} />
          <Card label="30 Second Bills"    num="" body="Typical time from scan to payment confirmation for a 5-item bill." delay={0.16} bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover icon={Clock} />
        </div>
      </section>

      <Divider />

      {/* ── 01 WHAT SHOPEZ DOES ──────────────────────────────── */}
      <section id="shop-overview" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What ShopEZ Does" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              India has 12 million neighbourhood grocery stores. Most track bills by hand and manage customer credit in worn notebooks.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The apps that exist were built for people comfortable with technology. These shopkeepers are not. Their hands are full, the counter is busy, and they have no patience for a learning curve.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              ShopEZ starts with the camera. Point at products. The bill builds itself.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <Perspective text="The shopkeeper's hands are always full. The interface had to work around that, not against it." />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 02 WHY IT MATTERS ────────────────────────────────── */}
      <section id="shop-why" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Why It Matters" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <ShopImg
              src="/images/shopez/sketch-before-after.png"
              alt="Before vs after — paper system vs ShopEZ"
              caption="Why the paper system had to go."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
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

      <Divider />

      {/* ── 03 WHERE IT STARTED ──────────────────────────────── */}
      <section id="shop-started" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Where It Started" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <ShopImg
              src="/images/shopez/v1-vs-v2.png"
              alt="Hackathon build 2024 vs Redesign 2025"
            />
          </Reveal>
          <Reveal delay={0.06}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The original app could scan items and generate a bill. That was roughly it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The home screen opened to a customer list with no business summary. Credit tracking was buried. The first screen asked shopkeepers to choose between &ldquo;Retailer&rdquo; and &ldquo;Customer,&rdquo; a decision that should never have existed.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              We won the hackathon with that version. Looking back a year later, the question became simple:
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <Perspective text="What would this look like if it was actually built for the person standing behind the counter?" />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 04 WHAT CHANGED ──────────────────────────────────── */}
      <section id="shop-changed" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What Changed" />
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

      <Divider />

      {/* ── 05 THE DECISION JOURNEY ──────────────────────────── */}
      <section id="shop-decisions" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="The Decision Journey" />
        <div className="mt-section">

          <Decision num="01" title="Leading with the camera" first>
            <ShopImg
              src="/images/shopez/sketch-billing-flow.png"
              alt="The core interaction model, mapped out early"
              caption="The core interaction model, mapped out early."
            />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              Every other billing app starts with a search bar or a product list. ShopEZ starts with the camera, because that is how the transaction actually happens. The product is already in the shopkeeper&apos;s hand. They should not need to look it up.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              &ldquo;Point. Scan. Bill.&rdquo; is not just a tagline. It is the entire interaction model in three words.
            </p>
            <Insight text="The best interface for a busy person meets them exactly where they already are." />
            <Lesson text="If the interaction model can be described in three words, you have found the right one." />
          </Decision>

          <Decision num="02" title="Making the AI visible, not invisible">
            <ShopImg src="/images/shopez/scan-screen.png" alt="Scan screen with radar element and annotations" />
            <ShopImg src="/images/shopez/sketch-ai-confidence.png" alt="AI confidence decision logic doodle" />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              Most AI features hide their uncertainty. ShopEZ shows it.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
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
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The first version of customer selection assumed every sale was tied to a registered customer.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              It was not. Most kirana sales are quick anonymous cash transactions. Forcing a customer lookup for every bill added friction with no reason to exist.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              One button fixed it. &ldquo;Walk-in Customer&rdquo; skips selection entirely, straight to payment. Registered credit customers still get the full flow, with recent customers surfaced at the top.
            </p>
            <Insight text="Design for the most common case first. The exception can still be handled, just not in the main path." />
            <Lesson text="One extra option at the right moment removes an entire unnecessary flow." />
          </Decision>

          <Decision num="04" title="Words on a button">
            <ShopImg src="/images/shopez/button-copy-comparison.png" alt="Confirm Transaction vs Continue to Bill button comparison" />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              &ldquo;Confirm Transaction&rdquo; sounds like a bank. It implies something formal and final.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              By the time the shopkeeper reaches the bill summary screen, the transaction started three screens ago when the camera scanned the first item. Calling it a confirmation made it feel like starting over.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              &ldquo;Continue to Bill&rdquo; says the work is already done. You are finishing something, not beginning it.
            </p>
            <Insight text="The words on a button carry as much UX weight as the layout around it." />
            <Lesson text="Language is a design material. Treat it like one." />
          </Decision>

          <Decision num="05" title="Digitising udhaar without making it awkward">
            <ShopImg src="/images/shopez/bill-summary-ledger.png" alt="Bill Summary and Customer Ledger side by side" />
            <ShopImg src="/images/shopez/sketch-udhaar-cycle.png" alt="Udhaar credit cycle doodle" />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
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

      <Divider />

      {/* ── 06 THE FLOW ───────────────────────────────────────── */}
      <section id="shop-flow" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="The Flow" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>The entire product in one strip.</p>
          </Reveal>
          <Reveal delay={0.06}>
            <ShopImg src="/images/shopez/full-flow-strip.png" alt="Full flow strip — all 8 screens with labels and arrows" />
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ background: "#f4f4f4", borderRadius: 0, padding: "20px 24px", textAlign: "center" }}>
              <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
                &ldquo;A typical 5-item bill: under 30 seconds from scan to done.&rdquo;
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 07 REFLECTION ────────────────────────────────────── */}
      <section id="shop-reflection" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Reflection" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="shop-reflection-grid">
            <IconCard icon={FileText}   label="Test with real users earlier" body="All design decisions here came from observation and research. One session watching an actual kirana owner use the scan screen would have caught the gap before it became a gap." bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover delay={0}    />
            <IconCard icon={Lightbulb}  label="Design the failure states"    body="Every happy path is designed. None of the error states are. Unrecognised items, camera failure, no internet. Those screens do not exist yet and they should." bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover delay={0.08} />
            <IconCard icon={Smartphone} label="Language toggle from day one" body="The app is in English. A lot of shopkeepers who need this most are not comfortable in English. Hindi or regional language should have been in the first frame of the Figma file." bg="#f4f4f4" iconColor="#36A2E1" textColor="#222222" noHover delay={0.16} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ── BACK TO TOP ─────────────────────────────────────── */}
      <div style={{ ...col, display: "flex", justifyContent: "flex-start" }} className="v3-section">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.04)", color: C.t1,
            border: "none", padding: "11px 22px",
            borderRadius: 0, fontSize: 14, fontWeight: 600,
            cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: "opacity 0.25s, transform 0.25s",
          }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.opacity = "0.88"; b.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.opacity = "1"; b.style.transform = ""; }}
        >
          Back to top
        </button>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <Footer />
      </div>

      <style>{`
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
        .shop-decision-line { height: 1px; background: var(--color-border); margin: 16px -16px; }
        @media (min-width: 768px) { .shop-decision-line { margin: 24px -24px; } }
        .shop-stats-grid      { display: grid; grid-template-columns: 1fr; gap: 16px; }
        .shop-reflection-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 600px) {
          .shop-stats-grid { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>
      </main>
    </ThemeProvider>
  );
}
