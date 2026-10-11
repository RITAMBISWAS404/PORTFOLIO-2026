// What is under a screen point on a Hero stage (the home page only): an OBJECT (an opaque pixel of a draggable object), the BOARD (an opaque pixel of the green board artwork) or NONE (a transparent
// part of an object's box or of the board image's box, which belongs to nothing). The stage registers its own test here; the custom cursor and the board's click handling both ask it, so the label
// the cursor shows and what a click does are decided by the same rule (a label can never promise something the click will ignore).
export type Hit = "object" | "board" | "none";
const tests = new Map<HTMLElement, (x: number, y: number) => Hit>();
export function registerHeroHit(stage: HTMLElement, test: (x: number, y: number) => Hit) { tests.set(stage, test); return () => { if (tests.get(stage) === test) tests.delete(stage); }; }
/** The hit for a point inside a visible stage, or null when the point is not over any registered stage. */
export function heroHitAt(x: number, y: number): Hit | null {
  for (const [stage, test] of tests) {
    const r = stage.getBoundingClientRect();
    if (r.width > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return test(x, y);
  }
  return null;
}
