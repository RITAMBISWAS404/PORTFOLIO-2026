"use client";

// Fixed vertical rails flanking the 768px content column.
// On screens narrower than 768px the lines collapse to the viewport edges.
export default function GridLines() {
  // The rails are 1px borders (see .hm-grid-rail in experiment.css), positioned on whole CSS pixels.
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <div className="hm-grid-rail hm-grid-rail-l" />
      <div className="hm-grid-rail hm-grid-rail-r" />
    </div>
  );
}
