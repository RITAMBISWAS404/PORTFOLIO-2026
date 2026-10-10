// One central place for the cursor system's colours and microcopy (the home page only).
//
// IDENTITIES: the arrow and its pill always share ONE colour; the pill text is always white.
//
// USER PILL: "You" on ordinary areas, a short conversational phrase over a target that opts in with semantic attributes:
//     data-cursor-kind="project"       the interaction category (a key of KIND_LABEL below)
//     data-cursor-id="zeno"            optional: an individual override (a key of ID_LABEL below), for distinctive cards
//     data-cursor-state="busy"         optional: a live state of the target (a key of STATE_LABEL[kind]), e.g. a form that is submitting
//     data-cursor="Literal phrase"     optional: a one-off literal that beats everything else
//   Targets with no attributes fall back to what they are (an external link, an in-page anchor from ANCHOR_LABEL, any other real control).
//   Disabled controls and plain text get nothing, so the pill never claims something is clickable when it is not.
// VISITORS: Clippy and the Restockers have their own colours and vocabularies below; they never share state with the user's pill.
// Copy rules: two words ideally, three at most, warm and a little sarcastic, true to what the element does.

export type Identity = { color: string };

export const YOU_LABEL = "You";
// The ONE source of identity colours: the arrow fill and the pill background both read `color`, so they cannot drift apart. Pill text is always white.
export const YOU: Identity = { color: "#0D99FF" };               // Figma-style blue
export const CLIPPY_COLOR = "#ED7454";                           // the portfolio's brand orange
/** Green first, then complementary vibrant shades (each a touch deeper than its swatch so white pill text stays legible). Assigned by index, so a given Restocker always has the same colour. */
export const RESTOCKER_COLORS = ["#26A065", "#7A5FE6", "#EC6E66"] as const;   // green, violet, coral

// ── the user's pill ──
export type CursorKind =
  | "project" | "casestudy" | "external" | "nav" | "cta" | "about" | "experience" | "social" | "contact" | "submit" | "again"
  | "copy" | "drag" | "board" | "toolkit" | "link" | "control" | "info";

/** Category defaults. */
export const KIND_LABEL: Record<CursorKind, string> = {
  project: "Good taste",          // a selected-project card
  casestudy: "The details",       // a case study
  external: "Into the wild",      // any link that leaves the site
  nav: "Let's go",                // an in-page jump (see ANCHOR_LABEL for the specific ones)
  cta: "Say hello",
  about: "The lore",
  experience: "Character development",
  social: "Find me",
  contact: "Say hello",
  submit: "Make it happen",       // the contact form's send button
  again: "Go again",              // resets the contact form
  copy: "Borrow it",              // copies the email address
  drag: "Grab it",                // a pegboard object or a draggable sticker
  board: "Shake it",              // clicking the pegboard shakes it and re-stocks it
  toolkit: "Tool time",           // the toolkit marquee (it pauses under the pointer)
  link: "Into the wild",
  control: "Let's go",
  info: "Take note",              // a static information card (never clickable); each one names itself through ID_LABEL
};

/** Individual overrides for distinctive cards and links (data-cursor-id). Only claims the site already makes. */
export const ID_LABEL: Record<string, string> = {
  // case study + highlights
  zeno: "Charge ahead",                 // ZENO is the EV-charging case study
  "devi-paksha-site": "Plot twist",
  "devi-paksha-reel": "Roll the reel",
  // selected projects
  shopez: "Ring it up",                 // AI billing for kirana stores
  "smart-agri": "Field notes",          // smart agriculture IoT
  "ev-website": "Plug in",              // EV charging startup website
  manokamna: "Home sweet logo",         // interior-design brand identity
  // hero
  "hero-work": "Show me",
  "hero-talk": "Say hello",
  // about
  "about-photo": "That's me",
  "about-building": "Rizz.exe stopped working",   // the unannounced dating app
  "about-reading": "Down bad for fiction",      // Outside of Design
  // ZENO feature cards (information only)
  "zeno-design": "Make it make sense",
  "zeno-architecture": "Less friction",
  "zeno-system": "Consistent chaos",
  "zeno-users": "Quite a few",
  // experience (data/experiment-content.ts ids)
  bedr: "Current chapter",
  startup: "Origin story",
  gdg: "Brand era",
  statuscode2: "Hackathon arc",
  sukriya: "From scratch",
  "foss-kolkata": "Open source",
  "foss-iiitk": "Campus arc",
  // socials
  linkedin: "Suit and tie",
  x: "Short and sweet",
  instagram: "Snap happy",
};

/** Live states of a target (data-cursor-state), per category. The pill only changes when the state is real. */
export const STATE_LABEL: Partial<Record<CursorKind, Record<string, string>>> = {
  submit: { busy: "On it" },
  copy: { done: "All yours" },
  drag: { held: "Got it" },
};

/** Navbar / in-page anchors, keyed by their hash. Used when an anchor carries no attributes (the shared navbar component). */
export const ANCHOR_LABEL: Record<string, string> = {
  "#hero": "Back up top",
  "#featured": "The good stuff",
  "#projects": "Show me",
  "#devi-paksha": "Cue the reel",
  "#about": "The lore",
  "#experience": "Plot so far",
  "#contact": "Say hello",
  "#socials": "Find me",
};

const REAL_CONTROL = 'a[href], button:not(:disabled), [role="button"], [role="link"], summary, select';

/** The phrase for the hovered element, or null when it is not an eligible target (the pill then stays on "You"). */
export function cursorLabelFor(target: Element | null): string | null {
  if (!target) return null;
  const host = target.closest<HTMLElement>("[data-cursor-kind], [data-cursor]");
  if (host) {
    const d = host.dataset;
    if (d.cursor) return d.cursor;
    const kind = d.cursorKind as CursorKind | undefined;
    if (kind) {
      const st = d.cursorState || (host.hasAttribute("data-held") ? "held" : ""), live = st ? STATE_LABEL[kind]?.[st] : undefined;
      if (live) return live;
      if (host.matches(":disabled")) return null;            // a disabled control is not an invitation
      return (d.cursorId && ID_LABEL[d.cursorId]) || KIND_LABEL[kind] || null;
    }
  }
  const ctl = target.closest<HTMLElement>(REAL_CONTROL);
  if (!ctl) return null;
  const href = ctl.getAttribute("href");
  if (href && ANCHOR_LABEL[href]) return ANCHOR_LABEL[href];
  if (href && /^(https?:)?\/\//.test(href)) return KIND_LABEL.external;
  return KIND_LABEL.control;
}

// ── Clippy: mischievous and cheeky ──
const CLIPPY_STEAL = ["Yoink", "Mine now", "Heist time", "Finders keepers", "Nice find"] as const;
const CLIPPY_APPROACH = ["Don't mind me", "Just browsing", "Nothing to see"] as const;
/** Object-specific lines (asset ids from heroObjects.ts); anything else draws from the general pools. */
const CLIPPY_BY_ASSET: Record<string, readonly string[]> = {
  coffee: ["Needed this", "Caffeine, mine"],
  bread: ["Snack acquired", "Toast of the town"],
  duck: ["Quack, mine", "Duck heist"],
  bill: ["Receipts, mine", "Paper trail"],
  glasses: ["Looking sharp", "Eyes on you"],
  flowers: ["Fresh flowers", "Nice bouquet"],
};
export const CLIPPY = {
  name: "Clippy", color: CLIPPY_COLOR,
  /** Heading for the object: said as it walks up to it. */
  approach: (_asset?: string) => pickOne(CLIPPY_APPROACH),
  /** Said at the moment it takes hold. Object-specific lines are used about half of the time so it never repeats one phrase. */
  steal: (asset?: string) => { const own = asset ? CLIPPY_BY_ASSET[asset] : undefined; return own && Math.random() < 0.5 ? pickOne(own) : pickOne(CLIPPY_STEAL); },
};

// ── Restockers: sarcastic but helpful. Numbered so they stay distinct; each leans on its own phrases but they share one tone ──
export type RestockerPersona = { name: string; color: string; carry: readonly string[]; placed: readonly string[] };
export const RESTOCKERS: readonly RestockerPersona[] = [
  { name: "Restocker 1", color: RESTOCKER_COLORS[0], carry: ["Fresh drop", "Special delivery"], placed: ["Back in stock", "Good as new"] },
  { name: "Restocker 2", color: RESTOCKER_COLORS[1], carry: ["Coming through", "Fresh drop"], placed: ["Crisis averted", "Inventory secured"] },
  { name: "Restocker 3", color: RESTOCKER_COLORS[2], carry: ["Special delivery", "Coming through"], placed: ["You're welcome", "Back in stock"] },
];

export const pickOne = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

// ── The Courier: delivers each section heading's icon (components/experiment/Courier.tsx). Vermilion, so it is clearly its own character beside Clippy's orange, the Restockers and "You". ──
export const COURIER_COLOR = "#F24E1E";   // Figma-style vermilion; clearly apart from Clippy's orange (#ED7454) and the coral Restocker (#EC6E66)
export const COURIER = {
  name: "Courier", color: COURIER_COLOR,
  /** Said once the icon is down. Short, warm, a little smug; the pick never repeats the previous one. */
  delivered: ["There you go", "Icon delivered", "All yours", "Made room", "Special delivery", "Handle with care", "Signed, sealed"] as const,
};
