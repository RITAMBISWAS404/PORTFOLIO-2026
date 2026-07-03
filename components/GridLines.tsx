"use client";

// Fixed vertical rails flanking the 768px content column.
// On screens narrower than 768px the lines collapse to the viewport edges.
export default function GridLines() {
  const lineStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    background: "#222222",
    pointerEvents: "none",
  };
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div style={{ ...lineStyle, left:  "max(8px, calc(50% - 384px))" }} />
      <div style={{ ...lineStyle, right: "max(8px, calc(50% - 384px))" }} />
    </div>
  );
}
