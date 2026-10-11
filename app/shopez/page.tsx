"use client";
import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";
import {
  MdStorefront, MdAccountTree, MdTimer, MdInfo,
  MdFormatQuote, MdLightbulb, MdGroups, MdWarning, MdTranslate,
} from "react-icons/md";
import Footer from "@/sections/v3/Footer";
import GridLines from "@/components/GridLines";
import NavbarNew from "@/components/NavbarNew";
import { ThemeProvider } from "@/lib/ThemeContext";
import SectionHeadingV3 from "@/components/SectionHeadingV3";
import CardV3 from "@/components/CardV3";
import TwoColTable from "@/components/TwoColTable";
import ThreeColTable from "@/components/ThreeColTable";
import DecisionBase from "@/components/Decision";
import { C, col, revealStyle } from "@/lib/tokensV2";
import { FLAT_CARD_VARS } from "@/lib/caseStudySurfaces";
import OrangeCursor from "@/components/home/OrangeCursor";
import { shopezCursor } from "@/lib/caseStudyCursor";
import "../cursor.css";

/* ── Callout variants — thin wrappers around CardV3 (same pattern as /zeno) ───── */

function Perspective({ text }: { text: string }) {
  return <CardV3 icon={MdFormatQuote} label="Perspective" body={`“${text}”`} iconColor={BRAND} noHover cursorId="callout-quote" />;
}

function Insight({ text }: { text: string }) {
  return <CardV3 icon={MdLightbulb} label="Insight" body={text} iconColor={BRAND} noHover cursorId="callout-insight" />;
}

/* ── Scroll reveal wrapper ──────────────────────────────────────── */

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  return <div ref={ref} style={revealStyle(inView, delay)}>{children}</div>;
}

/* ── Decision block ─────────────────────────────────────────────── */

function Decision(props: { num: string; title: string; first?: boolean; cursorId: string; children: React.ReactNode }) {
  return <DecisionBase {...props} lineClassName="shop-decision-line" labelColor={BRAND} />;
}

/* ── Image block ────────────────────────────────────────────────── */

// Case-study images live in public/Shopez (capital S: paths are case-sensitive in production).
const IMG = "/Shopez/";
const BRAND = "#8B5CF6"; // ShopEZ purple, used for card icons and decision labels

// w/h are the file's intrinsic pixel size: they reserve the aspect ratio so nothing shifts on load.
// `hold` keeps an image out of the page until its source file has been corrected (see the notes at each use).
function ShopImg({ file, alt, w, h, caption, hold = false, cursorId }: { file: string; alt: string; w: number; h: number; caption?: string; hold?: boolean; cursorId?: string }) {
  // A file that is missing or fails to load would leave a collapsed, bordered strip (it reads as a stray doubled line): render nothing until the image exists.
  const [failed, setFailed] = useState(false);
  if (failed || hold) return null;
  return (
    <div data-cursor-id={cursorId} style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <img
        src={IMG + file} alt={alt} width={w} height={h} loading="lazy" decoding="async" onError={() => setFailed(true)}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: 8, border: `1px solid ${C.border}` }}
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
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const activeObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) activeObs.observe(el);
    });

    const overviewEl = document.getElementById("shop-overview");
    const footerEl = document.getElementById("shop-footer");
    let raf = 0;
    // The nav is shown from the moment the case study content begins (the overview reaches the upper 40% of the screen) until the footer reaches the nav's own bottom edge,
    // measured from the real elements, so it never overlaps the footer on any viewport height. It comes back as soon as the footer moves away again.
    const update = () => {
      raf = 0;
      const nav = navRef.current;
      if (!overviewEl || !nav) return;
      const started = overviewEl.getBoundingClientRect().top < window.innerHeight * 0.4;
      const footerReached = !!footerEl && footerEl.getBoundingClientRect().top <= nav.getBoundingClientRect().bottom;
      setVisible(started && !footerReached);
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);   // the page grows as images load: re-check against the new footer position
    ro.observe(document.body);

    return () => { activeObs.disconnect(); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); ro.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <nav ref={navRef} className="shop-page-nav" data-cursor-id="shop-page-nav" style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? "all" : "none", transition: "opacity 0.4s ease" }}>
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
  return <div style={{ width: "100%", height: 0, borderTop: "1px solid var(--color-border)" }} />;
}

/* ── Page ──────────────────────────────────────────────────────── */

export default function ShopEZPage() {
  return (
    <ThemeProvider defaultTheme="light">
      <OrangeCursor color={shopezCursor.color} labelFor={shopezCursor.labelFor} />
      <NavbarNew homePath="/" />
      <main style={{ position: "relative", ...FLAT_CARD_VARS }} className="v3-white-bg">
        <GridLines />
        <PageNav />

      {/* ── HERO ────────────────────────────────────────────── */}
      <section data-cursor-id="shop-hero" style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
              <img src={IMG + "shopez logo.png"} alt="ShopEZ app icon" width={185} height={185} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div>
              <div className="f16" style={{ fontWeight: 600, color: C.t1 }}>ShopEZ</div>
              <div className="f16" style={{ fontWeight: 500, color: C.t2 }}>AI-Powered Kirana Billing</div>
            </div>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 650, letterSpacing: "-0.02em", color: C.t1, lineHeight: 1.15, marginBottom: 24 }}>
            How I redesigned a hackathon billing app for the person actually standing behind the counter.
          </h1>

          <CardV3 icon={MdInfo} label="A Quick Note" cursorId="shop-note" iconColor={BRAND} noHover
            body="ShopEZ began as a team hackathon project and won the Best Innovation award. The core idea came from the team. At the hackathon I mainly shaped the UX and put together a basic UI under time pressure. Afterwards I redesigned the UI on my own, refined the UX, and contributed some Flutter front-end and UI refinement in code. The original was built with Flutter/Dart, Flask/Python, Supabase and YOLOv8-based item recognition through OpenCV. This page is about the redesign, and where something is a proposal or untested, I say so." />
        </Reveal>
      </section>

      {/* ── HERO IMAGE ──────────────────────────────────────── */}
      <div style={{ ...col, paddingBottom: 0 }} className="v3-section">
        <ShopImg file="hero.png" cursorId="shop-hero-image" w={4320} h={2160} alt="ShopEZ cover: the app icon, the title and the tagline Point. Scan. Bill., beside three phone screens showing scanning, bill review and customer selection." />
      </div>

      {/* ── STATS ───────────────────────────────────────────── */}
      <section data-cursor-id="shop-stats" style={{ ...col }} className="v3-section">
        <div className="shop-stats-grid">
          <CardV3 label="12M+ Kirana Stores" cursorId="shop-stat-kirana" body="Industry estimates for India's neighbourhood grocery shops. There is no official count." delay={0}    noHover iconColor={BRAND} icon={MdStorefront} />
          <CardV3 label="5 Core Areas" cursorId="shop-stat-areas"       body="Splash, onboarding, dashboard, scan-to-bill and credit management." delay={0.08} noHover iconColor={BRAND} icon={MdAccountTree} />
          <CardV3 label="~30 Second Bills" cursorId="shop-stat-time"   body="Best case in our own internal tests, not a validated result. Details in The Flow." delay={0.16} noHover iconColor={BRAND} icon={MdTimer} />
        </div>
      </section>

      <Divider />

      {/* ── 01 WHAT SHOPEZ DOES ──────────────────────────────── */}
      <section id="shop-overview" data-cursor-id="shop-overview" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What ShopEZ Does" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              Kirana stores are India&apos;s neighbourhood grocery shops. Industry estimates put them at 12 million or more, and many still track bills and customer credit by hand.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              At a busy counter, hands are full and time is short, so an app that needs a lot of typing, searching or menu-hopping is hard to use during a sale.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              ShopEZ starts with the camera: place the items in view, the app recognises them, and the bill builds itself. Recognition runs on YOLOv8 through OpenCV, with a Flutter app, a Flask backend and Supabase behind it. It was built as a hackathon prototype.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <Perspective text="At a busy counter the interface has to work around busy hands, not against them." />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 02 WHY IT MATTERS ────────────────────────────────── */}
      <section id="shop-why" data-cursor-id="shop-why" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Why It Matters" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <ShopImg
              file="sketch-before-after.png" cursorId="shop-why-image" w={3646} h={2647}
              alt="A handwritten bill in a paper notebook listing Tata Salt, Aashirvaad Atta and Parle-G for a total of 350, beside the same bill on the ShopEZ Bill Summary screen."
              caption="Why the paper system had to go. An illustration of one bill, written by hand and built in the app."
            />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              Here is what the problem rests on, and what it does not. I did not interview shopkeepers or run usability research. My understanding comes from watching a relative who runs a kirana store track transactions by hand, from web research, and from the team&apos;s own reasoning. Read it as one shop&apos;s view plus desk research, not as a study.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <TwoColTable
              headers={["What I saw and read", "What it costs"]}
              rows={[
                ["Bills written by hand",       "Slow, error-prone, hard to look back on"],
                ["Credit kept in a notebook",   "Easy to lose, hard to chase"],
                ["Reminders happen in person",  "Asking for payment feels awkward"],
              ]}
            />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 03 WHERE IT STARTED ──────────────────────────────── */}
      <section id="shop-started" data-cursor-id="shop-started" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Where It Started" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            {/* v1 and v2 are the two halves of the comparison (each carries its own heading), so they are stacked rather than merged into one file. */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ShopImg
                file="v1.png" cursorId="shop-v1" w={3414} h={2469}
                alt="Hackathon version: three phone screens showing the Scan Items screen with a photo and Scan button, the Checkout list with green quantity controls, and a customer list."
              />
              <ShopImg
                file="v2.png" cursorId="shop-v2" w={3414} h={2469}
                alt="Redesigned version: three phone screens showing Scan Items with per-item confidence scores, Review Bill with quantity controls and an Add item manually button, and Select Customer with a Walk-in Customer option."
              />
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The original app, built by the team over the hackathon, could scan items and generate a bill. That was roughly it. My part was the UX flow and a basic UI, drawn up quickly because the clock was running.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The home screen opened to a customer list with no business summary. Credit tracking was buried. The first screen asked users to choose between &ldquo;Retailer&rdquo; and &ldquo;Customer,&rdquo; a choice a shopkeeper-only tool never needed.
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              A year later I came back to it on my own: a full UI redesign, a second pass on the UX, and some Flutter front-end work to carry parts of it into code. The question I started from was simple:
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <Perspective text="What would this look like if it were designed properly for the person behind the counter?" />
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 04 WHAT CHANGED ──────────────────────────────────── */}
      <section id="shop-changed" data-cursor-id="shop-changed" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="What Changed" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <ShopImg
              file="dashboard-annotated.png" cursorId="shop-changed-image" w={3414} h={2469}
              alt="From splash to dashboard: the purple splash screen, the introduction screen reading Your shop, simplified. No more paper khata., and the dashboard showing today's sales, pending credit, low stock and recent transactions."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <ThreeColTable
              headers={["Area", "Hackathon build", "Redesign"]}
              rows={[
                ["First screen",    "Role selector: Retailer or Customer", "Single purpose, shopkeeper only"],
                ["Home",            "Customer list, no summary",            "Dashboard: sales, credit, stock alerts"],
                ["AI scan",         "Items detected, no feedback",          "Per-item confidence scores (from YOLOv8), colour coded"],
                ["Credit tracking", "Buried in customer detail",            "First-class feature on dashboard and ledger"],
                ["Payment",         "Not present",                          "Cash, UPI and credit options"],
                ["Copy",            "Generic app language",                 "“No more paper khata”"],
              ]}
            />
          </Reveal>
          <Reveal delay={0.14}>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The redesign is mainly a UI and UX redesign. I carried some of it into Flutter, and the rest lives in the designs. I have not marked each feature as built or not, so treat it as a design-stage concept with partial implementation.
            </p>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 05 THE DECISION JOURNEY ──────────────────────────── */}
      <section id="shop-decisions" data-cursor-id="shop-decisions" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="The Decision Journey" />
        <div className="mt-section">

          <Decision num="01" cursorId="shop-d1" title="Leading with the camera" first>
            <ShopImg
              file="sketch-billing-flow.png" cursorId="shop-d1-image" w={1774} h={887}
              alt="A line sketch in three steps: grocery items on a shop counter, a hand pointing a phone camera at them, and a phone screen listing the items with a total."
              caption="The camera-first idea, sketched: items on the counter, scan, bill."
            />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              At the counter the items are already in front of the shopkeeper. Searching a catalogue means typing and scrolling for every item, so the app starts from what is physically there: place the items in view, scan, and get a bill. In our tests we put several grocery items together and scanned them in one go.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The cost is that the whole flow depends on recognition. It worked best on packaged items and struggled with loose or unpackaged ones. That limit is why the next decision matters.
            </p>
          </Decision>

          <Decision num="02" cursorId="shop-d2" title="Making the AI visible, not invisible">
            <ShopImg
              file="scan-screen.png" cursorId="shop-d2-scan" w={2684} h={2469}
              alt="The Scan Items screen listing three detected items with confidence scores of 95%, 88% and 100%, beside four steps explaining that each detected item gets a score from the model and the shopkeeper reviews, edits and continues."
            />
            {/* sketch-ai-confidence.png (Review & Edit) is held back: its copy says "Swipe to remove" and "Scan More goes back to the camera without losing anything", neither of which is verified.
                Re-export it without those two lines, then delete `hold` to publish it. */}
            <ShopImg
              file="sketch-ai-confidence.png" cursorId="shop-d2-review" w={2684} h={2469} hold
              alt="The Review Bill screen with quantity controls, an Add item manually button and a Select Customer button, beside text explaining that the shopkeeper reviews every item before it becomes a bill."
            />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              YOLOv8 returns a confidence score for every item it detects. Rather than hide it, the concept shows it per item: a 95% detection reads green and an 88% one reads amber, so the shopkeeper can tell which to glance at twice.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              We tried a range of grocery items. Packaged goods were recognised more easily. Loose items were harder, and changed packaging could throw the model off. So every bill goes through a review step, and any item can be added manually, which also covers anything the model does not recognise.
            </p>
            <TwoColTable
              headers={["The shortcut", "What ShopEZ does"]}
              rows={[
                ["Hide the model’s confidence",            "Show a score per item"],
                ["Send detections straight to the bill",   "Review the items before billing"],
                ["Treat recognition as final",             "“Add manually” for misses and new packaging"],
              ]}
            />
            <Insight text="The review step costs seconds, and those seconds are part of the roughly 30-second runs in The Flow. I kept it because a wrong item becomes a wrong bill, and on a credit sale a wrong ledger entry. Trust is bought with speed here, and I would rather spend the speed." />
          </Decision>

          <Decision num="03" cursorId="shop-d3" title="The Walk-in Customer button">
            <ShopImg
              file="review-bill-select-customer.png" cursorId="shop-d3-image" w={2316} h={2469}
              alt="The Select Customer screen with Walk-in Customer, Add New Customer and recent customers, beside the Bill Summary screen with the item list and Cash, UPI and Credit payment options."
            />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The first version asked for a customer on every bill, as if each sale belonged to a registered customer.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              My assumption, from watching one store and not from data, was that plenty of sales are quick cash sales that do not need a customer record, and a lookup on every one is friction. So &ldquo;Walk-in Customer&rdquo; skips selection and goes straight to payment. Customers on credit still get the full flow, with recent customers at the top.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              Payment offers cash, UPI and credit. Those three came from our own product reasoning, not from a payment-methods study.
            </p>
          </Decision>

          <Decision num="04" cursorId="shop-d4" title="Words on a button">
            {/* No image: button-copy-comparison.png was never prepared, and the "Confirm Transaction" frame it needs does not exist in the supplied assets. */}
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              The bill summary screen originally ended with &ldquo;Confirm Transaction,&rdquo; which sounds formal and final, like a bank.
            </p>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              By that point the sale is already under way: it started a few screens earlier, when the camera scanned the first item. A confirmation step makes it feel like starting again. &ldquo;Continue to Bill&rdquo; says the work is nearly done. This was a judgement about wording, and I have not tested it with shopkeepers.
            </p>
          </Decision>

          <Decision num="05" cursorId="shop-d5" title="Digitising udhaar without making it awkward">
            {/* bill-summary-ledger.png is held back: it shows "Bill #1038Z" (typo), its copy claims disputed entries and "no proof of payment", which the case study does not establish,
                and Bill #1042 is red here but green on the dashboard. Fix those in the source, re-export, then delete `hold` to publish it. */}
            <ShopImg
              file="bill-summary-ledger.png" cursorId="shop-d5-ledger" w={2684} h={2469} hold
              alt="The customer ledger for Ramesh Kumar showing total credit, paid and credit amounts, a Receive Payment button, the transaction history and a Send Reminder button."
            />
            <ShopImg
              file="sketch-udhaar-cycle.png" cursorId="shop-d5-sketch" w={1774} h={887}
              alt="A line sketch in four steps: a customer leaves with a shopping bag, the amount is noted in a notebook ledger under the name Ramesh, a phone shows Payment received, and coins land in a hand."
              caption="The udhaar cycle, sketched: credit given, noted in the khata, payment received."
            />
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
              Udhaar is credit given on trust, usually written in a paper ledger called a khata. The shopkeeper often knows the customer personally, which makes asking for payment uncomfortable. The goal was to digitise those records and take some of that awkwardness out.
            </p>
            <ThreeColTable
              headers={["Feature", "What it shows", "Why it is there"]}
              rows={[
                ["Transaction timeline", "Every bill and payment in order",      "A full history to point to if a balance is questioned"],
                ["Running total",        "Paid in green, credit in red",         "One clear balance per customer"],
                ["Send Reminder",        "Composes an SMS or WhatsApp message",  "The shopkeeper does not have to raise it in person"],
              ]}
            />
            <Insight text="Reminders were not a finding from research. A judge at the hackathon suggested SMS and WhatsApp reminders, and we added them to the concept because they fit the problem." />
          </Decision>

        </div>
      </section>

      <Divider />

      {/* ── 06 THE FLOW ───────────────────────────────────────── */}
      <section id="shop-flow" data-cursor-id="shop-flow" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="The Flow" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Reveal>
            <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>The billing flow in one strip: scan, review, select a customer, and settle the payment.</p>
          </Reveal>
          <Reveal delay={0.06}>
            <ShopImg
              file="full-flow-strip.png" cursorId="shop-flow-image" w={4512} h={2469}
              alt="The full billing flow in four phone screens: Scan Items with confidence scores, Review Bill, Select Customer, and Bill Summary with payment options."
            />
          </Reveal>
          <Reveal delay={0.12}>
            <div data-cursor-id="shop-flow-note" style={{ background: "#ffffff", border: "var(--cs-card-border, none)", boxShadow: "var(--cs-card-shadow, 0px 2px 9px 0px rgba(0,0,0,0.05))", borderRadius: 8, padding: "20px 24px", textAlign: "center" }}>
              <p className="f16" style={{ fontWeight: 500, color: C.t2, lineHeight: 1.7 }}>
                In our internal tests, a bill for a small basket took around or under 30 seconds in the best case: place the items, scan, pick a customer, correct anything the model got wrong, and generate the bill. That is my own repeated testing, not a validated result, and it is not a promise for a real shop.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* ── 07 REFLECTION ────────────────────────────────────── */}
      <section id="shop-reflection" data-cursor-id="shop-reflection" style={{ ...col }} className="v3-section">
        <SectionHeadingV3 title="Reflection" />
        <div className="mt-section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="shop-reflection-grid">
            <CardV3 icon={MdGroups}   label="Test with real users earlier" cursorId="shop-reflect-users" body="My understanding came from watching one relative&apos;s store, web research and the team&apos;s reasoning. I ran no interviews or usability tests, so these decisions are informed hypotheses. Watching a shopkeeper use the scan screen would test the camera-first idea first." iconColor={BRAND} noHover delay={0}    />
            <CardV3 icon={MdWarning}  label="Design the failure states" cursorId="shop-reflect-failure"    body="Manual entry covers unrecognised items and changed packaging. What is still missing are dedicated states for camera failure and no internet connection." iconColor={BRAND} noHover delay={0.08} />
            <CardV3 icon={MdTranslate} label="Language toggle from day one" cursorId="shop-reflect-language" body="The app is in English. Some shopkeepers may be more comfortable in Hindi or a regional language, so language support should have been in the first frame of the Figma file." iconColor={BRAND} noHover delay={0.16} />
          </div>
        </div>
      </section>

      <Divider />

      {/* ── BACK TO TOP ─────────────────────────────────────── */}
      <div style={{ ...col, display: "flex", justifyContent: "flex-start" }} className="v3-section">
        <button data-cursor-id="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(0,0,0,0.07)", color: C.t1,
            border: "none", padding: "11px 22px",
            borderRadius: 9999, fontSize: 14, fontWeight: 600,
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
      <div id="shop-footer" style={{ marginTop: 48 }}>
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
        .shop-decision-line { height: 0; border-top: 1px solid var(--color-border); margin: 16px -16px; }
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
