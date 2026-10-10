// The grass scene on the last Experience card (the home page). Assets live in public/Grass (served locally). Sizes below were MEASURED from the files
// (alpha > 24 bounds), so the composition is driven by the visible illustration, not by the image canvas.
//   grass 1.png  610 x 498, visible x 7-598, y 8-475   (23 px of empty canvas under the blades, 8 above)
//   grass 2.png  506 x 497, visible x 8-495, y 21-479  (18 px under, 21 above)
//   bee          211 x 224, visible x 8-207, y 3-221    (faces LEFT)
export type SceneImage = { id: string; src: string; w: number; h: number; padBottom: number; visW: number; visH: number };

export const GRASS_ONE: SceneImage = { id: "grass-1", src: "/Grass/grass%201.png", w: 610, h: 498, padBottom: (498 - 475) / 498, visW: 591 / 610, visH: 467 / 498 };
export const GRASS_TWO: SceneImage = { id: "grass-2", src: "/Grass/grass%202.png", w: 506, h: 497, padBottom: (497 - 479) / 497, visW: 487 / 506, visH: 458 / 497 };
export const BEE: SceneImage = { id: "bee", src: "/Grass/Super%20Fun%20Easter%20Party%20Games%20For%20Kids%20-%20The%20Busy%20Bee%20At%20Kimberlys%201.png", w: 211, h: 224, padBottom: 0, visW: 199 / 211, visH: 218 / 224 };

export type GrassBlade = {
  key: string; img: SceneImage; h: number; left: number; sink: number; rot: number; flip: boolean;
  amp: number; dur: number; delay: number; z: number;
  v: number; vx: number; vw: number;             // visible height above the card's bottom edge, and the visible horizontal extent (px, card coordinates)
};

/** A small deterministic generator, so the patch looks the same on every load (and on every re-layout at the same size). */
function mulberry32(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/**
 * A seeded patch of the two grass cut-outs across the whole width of a card (w x h px). Two overlapping layers (a taller back layer, a shorter front layer), each
 * a continuous run from left of the left edge to past the right edge. Which image and which orientation (original / mirrored) each instance gets is drawn from a
 * shuffled "bag" of all four combinations, so the mix is balanced but has no rhythm (a third identical orientation in a row is never allowed). Heights follow a smooth +
 * noisy envelope, spacing is jittered (with the odd wider step that the other layer covers), rotation and sway are per instance, and a few instances catch the breeze harder.
 * Every instance is sunk below the card's bottom edge (the card clips it) by enough that the widest wind + pointer rotation about its roots can never lift its bottom edge.
 */
export function layoutGrass(w: number, h: number): GrassBlade[] {
  const rnd = mulberry32(60113), out: GrassBlade[] = [];
  const layers = [{ lo: 0.38, hi: 0.58, z: 1, step: [0.28, 0.66] }, { lo: 0.27, hi: 0.45, z: 2, step: [0.3, 0.72] }];
  const combos = [[GRASS_ONE, false], [GRASS_ONE, true], [GRASS_TWO, false], [GRASS_TWO, true]] as const;
  layers.forEach((L, li) => {
    const p1 = rnd() * 6.28, p2 = rnd() * 6.28;
    let bag: (readonly [SceneImage, boolean])[] = [], lastFlips: boolean[] = [];
    const draw = () => {
      if (!bag.length) { bag = [...combos]; for (let k = bag.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [bag[k], bag[j]] = [bag[j], bag[k]]; } }
      let k = bag.length - 1;
      if (lastFlips.length >= 2 && lastFlips[0] === lastFlips[1] && bag[k][1] === lastFlips[0]) { const alt = bag.findIndex(c => c[1] !== lastFlips[0]); if (alt >= 0) k = alt; }
      const [pick] = bag.splice(k, 1); lastFlips = [pick[1], lastFlips[0]].filter(x => x !== undefined) as boolean[]; return pick;
    };
    let x = -0.16 * w - rnd() * 0.06 * w, i = 0;
    while (x < w * 1.08 && i < 30) {
      const [img, flip] = draw();
      const xf = Math.max(0, Math.min(1, x / w));
      const env = Math.max(0, Math.min(1, 0.5 + 0.26 * Math.sin(xf * 5.3 + p1) + 0.2 * Math.sin(xf * 12.1 + p2) + (rnd() - 0.5) * 0.7));
      const v = h * (L.lo + (L.hi - L.lo) * env);                              // VISIBLE height of this instance above the card's bottom edge
      const sink = Math.max(10, v * 0.22 + 8);                                 // how far its roots sit below the bottom edge
      const gh = (v + sink) / img.visH;                                        // rendered image height
      const iw = gh * (img.w / img.h), vis = iw * img.visW;
      const strong = rnd() < 0.15;                                             // an occasional clump that catches the breeze harder
      out.push({
        key: `${li}-${i}-${img.id}`, img, h: gh, sink, left: x - (iw - vis) / 2, rot: (rnd() - 0.5) * 8, flip,
        amp: (0.7 + rnd() * 1.3) * (strong ? 1.5 : 1), dur: 5.2 + (rnd() - 0.5) * 2.2, delay: -2 * 6 * (xf * 0.45 + rnd() * 0.1), z: L.z + (rnd() < 0.2 ? 1 : 0),
        v, vx: x, vw: vis,
      });
      x += vis * (L.step[0] + rnd() * (L.step[1] - L.step[0])) * (rnd() < 0.1 ? 1.25 : 1);
      i++;
    }
  });
  return out;
}

/**
 * The canopy's top edge: for every `res` px column of the card, the y (card coordinates, down) of the tallest blade tip covering it. Each blade counts across its whole
 * visible width plus a margin on both sides (so sway, which only moves a tip sideways and downward, can never put a tip above this line) and 3px of headroom.
 */
export function canopyProfile(blades: GrassBlade[], w: number, h: number, res = 2) {
  const n = Math.ceil(w / res) + 1, tip = new Float32Array(n).fill(h);
  for (const b of blades) {
    const top = h - b.v - 3, i0 = Math.max(0, Math.floor((b.vx - 8) / res)), i1 = Math.min(n - 1, Math.ceil((b.vx + b.vw + 8) / res));
    for (let i = i0; i <= i1; i++) if (top < tip[i]) tip[i] = top;
  }
  // a bee can only climb or dive so steeply: let every tall tip cast a 40-degree ramp onto its neighbours, so the limit it follows never jumps
  const slope = 0.85;
  for (let i = 1; i < n; i++) tip[i] = Math.min(tip[i], tip[i - 1] + slope * res);
  for (let i = n - 2; i >= 0; i--) tip[i] = Math.min(tip[i], tip[i + 1] + slope * res);
  return { tip, res };
}

/** Bee behaviour. One bee stays; a second visits now and then. */
export const BEES = {
  size: [0.2, 0.17],                 // bee height as a share of the card height: bee 1, bee 2
  secondEvery: [12000, 26000],       // ms between visits of the second bee
  secondStays: [10000, 18000],       // ms
  firstDelay: 900,                   // ms after the card is first on screen
  clearance: 4,                      // px kept between a bee's lowest visible pixel and the canopy
} as const;
