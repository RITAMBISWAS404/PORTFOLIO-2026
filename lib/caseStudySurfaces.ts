// Flat light-card treatment for the case study pages (/zeno, /shopez, /new/zeno).
// The shared cards (components/CardV3, Card, IconCard) read these CSS variables and fall back to their existing look when a variable is not set, so a route that
// does not apply FLAT_CARD_VARS (the homepage, /new, /experience) renders exactly as before. To revert: remove the `style={...FLAT_CARD_VARS}` on the page roots.
import type { CSSProperties } from "react";

export const FLAT_CARD_VARS = {
  "--cs-card-border": "1px solid #E5E5E5",
  "--cs-card-shadow": "none",
} as CSSProperties;
