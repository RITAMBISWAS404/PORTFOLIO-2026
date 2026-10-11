// Cursor identity + copy for the case-study pages (/zeno, /shopez). They reuse the landing page's cursor (components/home/OrangeCursor.tsx) and differ only in
// the brand colour (arrow and pill share it, pill text is white) and in the phrases, which live here.
//
// A target opts in with `data-cursor-id="<key>"` (a section, a card, an image or a decision). The nearest such ancestor wins, so a card's own phrase beats its section's,
// and unlabelled text inside a section inherits the section's phrase. Links and buttons without an id fall back to what they do (see `controlLabel`).
// Copy rules match the landing page: two words ideally, three at most, warm, true to what the element is.
import { ANCHOR_LABEL, KIND_LABEL } from "@/lib/home/cursorCopy";

export const ZENO_COLOR = "#36A1E1";
export const SHOPEZ_COLOR = "#8B5CF6";

type Labels = Record<string, string>;
export type CaseCursor = { color: string; labelFor: (target: Element | null) => string | null };

const REAL_CONTROL = 'a[href], button:not(:disabled), [role="button"], [role="link"], summary, select';

/** What a link or button does when it carries no id. The navbar's "/#about" style links reuse the landing page's anchor phrases. */
function controlLabel(ctl: HTMLElement): string {
  const href = ctl.getAttribute("href");
  if (href) {
    const hash = href.replace(/^\/(?=#)/, "");
    if (ANCHOR_LABEL[hash]) return ANCHOR_LABEL[hash];
    if (/^mailto:/.test(href)) return KIND_LABEL.cta;
    if (/^(https?:)?\/\//.test(href)) return KIND_LABEL.external;
  }
  return KIND_LABEL.control;
}

function make(color: string, labels: Labels): CaseCursor {
  return {
    color,
    labelFor(target) {
      if (!target) return null;
      const host = target.closest<HTMLElement>("[data-cursor-id]");
      const own = host?.dataset.cursorId && labels[host.dataset.cursorId];
      if (own) return own;
      const ctl = target.closest<HTMLElement>(REAL_CONTROL);
      return ctl ? controlLabel(ctl) : null;
    },
  };
}

// ── ZENO ─────────────────────────────────────────────────────────────────
const ZENO_LABELS: Labels = {
  // callouts (shared by every Quote / Lesson / Insight card)
  "callout-quote": "Quotable",
  "callout-lesson": "Worth keeping",
  "callout-insight": "Take note",
  // hero
  "zeno-hero": "Four seconds, tops",
  "zeno-confidential": "Real work, new name",
  "zeno-hero-image": "Meet Zeno",
  // stat cards
  "zeno-stat-screens": "Every flow, covered",
  "zeno-stat-flows": "Five flows",
  "zeno-stat-components": "Built to reuse",
  "zeno-stat-sprint": "Two-month sprint",
  // sections
  "zeno-overview": "Set it, forget it",
  "zeno-role": "Sole designer",
  "zeno-problem": "The brief",
  "zeno-research": "Competitor gaps",
  "zeno-research-card": "The pattern",
  "zeno-references": "Reference board",
  "zeno-onboarding": "One task per screen",
  "zeno-wireframes": "Early wireframes",
  "zeno-onboarding-screens": "Six steps in",
  "zeno-dashboard": "Three concepts",
  "zeno-sketches": "Pen before pixels",
  // decisions (the heading and everything in it), then their images
  "zeno-d1": "Widgets to groups",
  "zeno-d1-image": "Before and after",
  "zeno-d2": "Hold the white space",
  "zeno-d3": "Hidden behind a tap",
  "zeno-d3-image": "Modal on tap",
  "zeno-d4": "Show their car",
  "zeno-d4-image": "Their actual car",
  "zeno-d5": "Cut and relocated",
  "zeno-d6": "Built, then removed",
  "zeno-d6-image": "The analytics view",
  // final product
  "zeno-product": "The finished set",
  "zeno-final-onboarding": "Onboarding, done",
  "zeno-final-dashboard": "One screen",
  "zeno-final-analytics": "Everything cut",
  "zeno-final-settings": "Assembly, not invention",
  // reflection
  "zeno-reflection": "Looking back",
  "zeno-reflect-system": "Systems first",
  "zeno-reflect-test": "Test sooner",
  "zeno-reflect-doc": "Write it down",
  // controls
  "zeno-page-nav": "Jump ahead",
  "back-to-top": "Back up top",
};

// ── ShopEZ ───────────────────────────────────────────────────────────────
const SHOPEZ_LABELS: Labels = {
  "callout-quote": "Quotable",
  "callout-insight": "Take note",
  // hero
  "shop-hero": "Counter first",
  "shop-note": "The honest note",
  "shop-hero-image": "Meet ShopEZ",
  // stat cards
  "shop-stat-kirana": "Kirana country",
  "shop-stat-areas": "Five areas",
  "shop-stat-time": "Best case only",
  // sections
  "shop-overview": "Camera first",
  "shop-why": "Paper vs phone",
  "shop-why-image": "Paper vs phone",
  "shop-started": "Where it began",
  "shop-v1": "Hackathon build",
  "shop-v2": "The redesign",
  "shop-changed": "What changed",
  "shop-changed-image": "Splash to dashboard",
  "shop-stats": "The short version",
  // decisions
  "shop-decisions": "Five decisions",
  "shop-d1":"Counter to bill",
  "shop-d1-image": "Place, scan, bill",
  "shop-d2": "Scores, shown",
  "shop-d2-scan": "Detected, with scores",
  "shop-d2-review": "You decide",
  "shop-d3": "Walk-ins welcome",
  "shop-d3-image": "Next billing step",
  "shop-d4": "Words matter",
  "shop-d5": "Udhaar, gently",
  "shop-d5-ledger": "Digital khata",
  "shop-d5-sketch": "The udhaar loop",
  // flow
  "shop-flow": "Scan to settle",
  "shop-flow-image": "Scan to settle",
  "shop-flow-note": "Best case, honestly",
  // reflection
  "shop-reflection": "Looking back",
  "shop-reflect-users": "Test sooner",
  "shop-reflect-failure": "Fail gracefully",
  "shop-reflect-language": "Language first",
  // controls
  "shop-page-nav": "Jump ahead",
  "back-to-top": "Back up top",
};

export const zenoCursor = make(ZENO_COLOR, ZENO_LABELS);
export const shopezCursor = make(SHOPEZ_COLOR, SHOPEZ_LABELS);
