// Single source of truth for text styling (size / weight / color / hierarchy)
// across the landing page and every case study. Change a value here and it
// applies everywhere that role is used — no more hunting through per-page copies.
import { C } from "./tokensV2";

export const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: C.t3,
};

export const headingLg: React.CSSProperties = {
  fontSize: "clamp(28px, 4vw, 40px)",
  fontWeight: 650,
  letterSpacing: "-0.02em",
  lineHeight: 1.15,
  color: C.t1,
};

export const heroHeading: React.CSSProperties = {
  fontSize: "clamp(36px, 7vw, 54px)",
  fontWeight: 650,
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
  color: C.t1,
};

// Pair with the "f16" utility class (14px mobile / 16px desktop) for size.
export const body = (lineHeight: number = 1.6): React.CSSProperties => ({
  fontWeight: 500,
  color: C.t2,
  lineHeight,
});

export const caption: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: C.t3,
  lineHeight: 1.5,
};

export const decisionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: C.t3,
  letterSpacing: "0.12em",
};

export const decisionTitle: React.CSSProperties = {
  fontWeight: 600,
  color: C.t1,
  lineHeight: 1.5,
};

export const tagPill: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
};

// ── Comparison-table roles ──────────────────────────────────────────
export const tableHeader: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: C.t1,
  letterSpacing: "0.08em",
  background: "#ffffff",
};

export const tableCellMuted: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: C.t2,
  lineHeight: 1.6,
};

export const tableCellStrong: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: C.t1,
  lineHeight: 1.6,
};
