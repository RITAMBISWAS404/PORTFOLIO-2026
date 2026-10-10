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

/**
 * Variations on the category defaults. Every entry means the same thing as the default (it is still true to what the element does); the first one IS the default.
 * One variant is picked per element, the first time the pointer meets it, and then kept for that element's lifetime (see variantFor): the text never changes under a moving cursor,
 * and two cards of one kind do not say the same thing when the pool has an alternative. Picked in an event handler, never during render, so there is nothing to hydrate.
 */
export const KIND_POOL: Partial<Record<CursorKind, readonly string[]>> = {
  project: ["Good taste", "Pixels with purpose", "Smitten with spacing", "Please admire"],
  casestudy: ["The details", "Receipts included", "Show your work"],
  external: ["Into the wild", "Off we go", "Leaving politely"],
  nav: ["Let's go", "This way", "Scenic route"],
  cta: ["Say hello", "Don't be shy", "Make contact"],
  about: ["The lore", "Plot backstory", "Details obsessed"],
  experience: ["Character development", "Plot so far", "Lived experience"],
  social: ["Find me", "Come say hi", "Let's connect"],
  contact: ["Say hello", "Let's talk", "Say something nice"],
  submit: ["Make it happen", "Send it", "Do the thing"],
  again: ["Go again", "One more time", "Encore"],
  copy: ["Borrow it", "Take it", "Yours to keep"],
  drag: ["Grab it", "Pick me up", "Handle gently"],
  board: ["Shake it", "Give it a shake", "Press for chaos"],
  toolkit: ["Tool time", "Well equipped", "Handy things"],
  link: ["Into the wild", "Off we go", "Leaving politely"],
  control: ["Let's go", "Go on", "Press away"],
  info: ["Take note", "Worth noting", "Fun fact"],
};
/** Pools for individual targets that should vary too (data-cursor-id). An id here wins over ID_LABEL. */
export const ID_POOL: Record<string, readonly string[]> = {
  // The stealth EV startup entry: part of the work is confidential. Discreet and a little intriguing; claims nothing about the company or the product.
  startup: ["Let's talk privately", "Classified. Ask me", "Off the record"],
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
  startup: "Let's talk privately",     // (ID_POOL.startup varies it)
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

/** A few anchors vary too. Each says the same thing; the first is the default above. */
const ANCHOR_POOL: Record<string, readonly string[]> = {
  "#hero": ["Back up top", "Take me home"],
  "#projects": ["Show me", "Show and tell"],
  "#about": ["The lore", "Who's behind this"],
  "#experience": ["Plot so far", "The résumé, but fun"],
  "#contact": ["Say hello", "Let's talk"],
  "#socials": ["Find me", "Come say hi"],
};

const REAL_CONTROL = 'a[href], button:not(:disabled), [role="button"], [role="link"], summary, select';

const assigned = new WeakMap<Element, string>();
/** The variant this element keeps: chosen the first time it is hovered (never while rendering), then stable. */
function variantFor(host: Element, pool: readonly string[]): string {
  let v = assigned.get(host);
  if (!v || !pool.includes(v)) { v = pickFresh(pool); assigned.set(host, v); }
  return v;
}

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
      if (d.cursorId && ID_POOL[d.cursorId]) return variantFor(host, ID_POOL[d.cursorId]);
      if (d.cursorId && ID_LABEL[d.cursorId]) return ID_LABEL[d.cursorId];
      return KIND_POOL[kind] ? variantFor(host, KIND_POOL[kind]!) : KIND_LABEL[kind] || null;
    }
  }
  const ctl = target.closest<HTMLElement>(REAL_CONTROL);
  if (!ctl) return null;
  const href = ctl.getAttribute("href");
  if (href && ANCHOR_LABEL[href]) return ANCHOR_POOL[href] ? variantFor(ctl, ANCHOR_POOL[href]) : ANCHOR_LABEL[href];
  if (href && /^(https?:)?\/\//.test(href)) return variantFor(ctl, KIND_POOL.external!);
  return variantFor(ctl, KIND_POOL.control!);
}

// ── Clippy: mischievous and cheeky ──
const CLIPPY_STEAL = ["Yoink", "Mine now", "Heist time", "Finders keepers", "Nice find", "Strictly research", "Not stealing, curating", "Fell for this one"] as const;
const CLIPPY_APPROACH = ["Don't mind me", "Just browsing", "Nothing to see", "Casual stroll", "Totally normal", "Eyes on the prize"] as const;
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
  approach: (_asset?: string) => pickFresh(CLIPPY_APPROACH),
  /** Said at the moment it takes hold. Object-specific lines are used about half of the time so it never repeats one phrase. */
  steal: (asset?: string) => { const own = asset ? CLIPPY_BY_ASSET[asset] : undefined; return own && Math.random() < 0.5 ? pickFresh(own) : pickFresh(CLIPPY_STEAL); },
};

// ── Restockers: sarcastic but helpful. Numbered so they stay distinct; each leans on its own phrases but they share one tone ──
export type RestockerPersona = { name: string; color: string; carry: readonly string[]; placed: readonly string[] };
export const RESTOCKERS: readonly RestockerPersona[] = [
  { name: "Restocker 1", color: RESTOCKER_COLORS[0], carry: ["Fresh drop", "Special delivery", "Restock run"], placed: ["Back in stock", "Good as new", "Neatly placed"] },
  { name: "Restocker 2", color: RESTOCKER_COLORS[1], carry: ["Coming through", "Fresh drop", "Mind the gap"], placed: ["Crisis averted", "Inventory secured", "Order restored"] },
  { name: "Restocker 3", color: RESTOCKER_COLORS[2], carry: ["Special delivery", "Coming through", "Handle with care"], placed: ["You're welcome", "Back in stock", "Spacing: fixed"] },
];

export const pickOne = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

const recent: string[] = [];
/** A pick that avoids the last few lines ANY helper said (Clippy, the Restockers, the Courier, the user's pill), so two helpers do not repeat each other when the pool has an alternative. Only called from event handlers. */
export function pickFresh<T extends string>(pool: readonly T[]): T {
  const fresh = pool.filter(x => !recent.includes(x));
  const v = pickOne(fresh.length ? fresh : pool);
  recent.push(v); if (recent.length > 8) recent.shift();
  return v;
}

// ── The Courier: delivers each section heading's icon (components/experiment/Courier.tsx). It has NO colour of its own: it borrows from the same palette as the Hero helpers
// (Clippy's orange and the three Restocker colours), one colour per delivery, chosen from the heading's title so it is stable (not random, nothing changes mid-flight) and varied from heading to heading. ──
export const COURIER_PALETTE = [CLIPPY_COLOR, ...RESTOCKER_COLORS] as const;
let lastCourier = -1;
/** The colour for the delivery of `key` (the heading's title): a stable hash into the shared palette, never the same colour twice in a row. */
export function courierColor(key: string): string {
  let h = 2;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  let i = h % COURIER_PALETTE.length;
  if (i === lastCourier) i = (i + 1) % COURIER_PALETTE.length;
  lastCourier = i;
  return COURIER_PALETTE[i];
}
export const COURIER = {
  name: "Courier", color: COURIER_PALETTE[0] as string,
  /** Said once the icon is down. Short, warm, a little smug (and now and then a little smitten); the pick avoids whatever any helper said recently. */
  delivered: ["There you go", "Icon delivered", "All yours", "Made room", "Special delivery", "Handle with care", "Signed, sealed", "Admire responsibly", "Love at first icon", "Fresh from the studio", "Good taste, delivered", "Right on time"] as const,
};
