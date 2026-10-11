// What the landing page must have ready before it is revealed (consumed by components/readiness/ReadinessLoader via components/home/HomeGate.tsx).
//
// Images are NOT listed here: every rendered <img> the page mounts is discovered from the DOM (the first screen blocks the reveal, the rest gets a short grace and then keeps loading in the
// background), so a new image added to a section is covered without touching this file. This file holds only what the DOM cannot reveal:
//   manifest  images needed but not in the DOM yet. None today.
//   fonts     the typeface the page is set in (a Google Fonts variable font)
//
// The board's replacement pool (14 more PNGs, ~13.8 MB) is deliberately not required: the director loads each one on demand and never shows it before it is decoded.
//
// NONE of these bounds can hold the visitor: components/readiness/ReadinessLoader.tsx reveals the page unconditionally 5 s after the page was requested. They only decide how the tracker classifies
// assets for the progress bar and status text when it gets that far.
import type { ReadinessConfig } from "@/lib/readiness/tracker";

export const HOME_READINESS: Partial<ReadinessConfig> = {
  manifest: [],
  fonts: ['400 16px "Plus Jakarta Sans"', '600 16px "Plus Jakarta Sans"', '700 16px "Plus Jakarta Sans"'],
  perAssetMs: 15000,
  overallMs: 25000,
};
