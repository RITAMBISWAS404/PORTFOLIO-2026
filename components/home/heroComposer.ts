// Coverage-first composition engine for the living Hero pegboard (the home page only). Pure functions: no DOM, no animation, seeded.
// Everything is in frame px (the stage layouts' coordinate system) unless a name ends in Px (CSS px on screen).
//
// Usable area   the visible stage region (stage ∩ viewport) ∩ the board artwork (alpha mask of the board image) minus the REAL UI exclusions only
//               (navbar, hero heading, CTAs: measured rects passed in by the director). Printed numbers, grid lines and other markings are
//               part of the board and are NOT protected: objects may sit on them.
// Footprints    each object has (a) an oriented collision box = visible bounds x `core`, and (b) an alpha occupancy grid of its VISIBLE pixels
//               (heroOcc.ts, generated from the PNGs). Coverage, overlap and gaps are measured on the real silhouette, not on bounding boxes or
//               transparent margins.
// Coverage      the usable board is rasterised into ~20px cells. Each cell is covered by an object silhouette or has a distance to the nearest one.
//               The planner repeatedly finds the biggest uncovered hole, picks an asset whose size fits that hole (its own size limits are never
//               exceeded), places it there with seeded jitter and rotation, and repeats until no conspicuous hole is left. Several seeded
//               candidate arrangements are built and scored as a whole; the best valid one wins. None valid: null (the caller keeps the board).
// Replacement   the removed object's silhouette is released, the same hole-filling runs on the freed space and elsewhere (largest holes first,
//               1 to 3 pieces sized to share the removed area), and one obstructing object may be nudged if the board is too crowded.
// Determinism   all randomness comes from one seed (mulberry32); the winning seed is returned so a composition can be reproduced.
import { ASSET_BY_ID, ROTATION_POOL, type HeroAsset } from "./heroObjects";
import { MEASURED, OCC_G } from "./heroOcc";

export type Rect = { l: number; r: number; t: number; b: number };
export type Region = Rect;
export type Placed = { asset: HeroAsset; cx: number; cy: number; w: number; rot: number };   // cx, cy = canvas centre; w = canvas width
export type Obb = { x: number; y: number; hw: number; hh: number; c: number; s: number };    // centre, half extents along the object's own axes, cos/sin of its rotation
export type Existing = { id: string; p: Placed; locked: boolean };                           // locked: held by the visitor or being carried; never moved
export type Move = { id: string; dx: number; dy: number };                                    // frame px
export type PlanStats = { reach: number; emptyLargest: number; minRegion: number; coverage: number; count: number };
export type Plan = { placed: Placed[]; moves: Move[]; score: number; seed: number; stats?: PlanStats };
// exclusions = HARD zones objects must not cover (heading, CTAs, the board's printed "Open to new opportunities" text);
// soft = the navbar: objects may sit partly under it (it is layered above them) but most of an object must stay visible and its centre clear.
export type Env = { region: Rect; s: number; onBoard?: (x: number, y: number) => boolean; exclusions?: Rect[]; soft?: Rect[]; topOverhang?: number };

type Rng = () => number;
export const makeRng = (seed: number): Rng => {          // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
export const newSeed = () => (Math.random() * 4294967296) >>> 0;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const CAT_W = { large: 3, medium: 2, small: 1 } as const;
const GAP_MIN_PX = 7;           // spacing the scorer rewards between a new object's collision box and its neighbours
const MAX_OVERLAP = 0.02;       // silhouette overlap ratio allowed (accidental overlap is essentially zero)
const INFLUENCE_PX = 44;        // a board cell within this distance of an object counts as "reached"
const CELL_PX = 20;             // coverage grid resolution

/** Recently used assets (module scope, runtime only) keep successive compositions from repeating themselves. */
const recent: string[] = [];
export const remember = (ids: string[]) => { recent.push(...ids); while (recent.length > 8) recent.shift(); };

// ── footprints and silhouettes ──
export function footprint(p: Placed): Obb {
  const a = p.asset, ch = p.w * (a.h / a.w);
  const vw = ((a.vis[2] - a.vis[0]) / a.w) * p.w, vh = ((a.vis[3] - a.vis[1]) / a.h) * ch;
  const ox = ((a.vis[0] + a.vis[2]) / 2 / a.w - 0.5) * p.w, oy = ((a.vis[1] + a.vis[3]) / 2 / a.h - 0.5) * ch;
  const t = (p.rot * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
  return { x: p.cx + ox * c - oy * s, y: p.cy + ox * s + oy * c, hw: (vw * a.core) / 2, hh: (vh * a.core) / 2, c, s };
}
export const extents = (o: Obb) => ({ ex: Math.abs(o.c) * o.hw + Math.abs(o.s) * o.hh, ey: Math.abs(o.s) * o.hw + Math.abs(o.c) * o.hh });
export const obbArea = (o: Obb) => 4 * o.hw * o.hh;
/** Visible-content area of a placed object (before the collision `core` shrink): what the eye reads as its size. */
export const visibleArea = (p: Placed) => { const a = p.asset; return (((a.vis[2] - a.vis[0]) / a.w) * p.w) * (((a.vis[3] - a.vis[1]) / a.w) * p.w); };

export type Shape = { p: Placed; o: Obb; vhw: number; vhh: number; ex: number; ey: number; occ: string };
const SOLID = "1".repeat(OCC_G * OCC_G);
function shapeOf(p: Placed): Shape {
  const o = footprint(p), core = p.asset.core, vhw = o.hw / core, vhh = o.hh / core;
  const ex = Math.abs(o.c) * vhw + Math.abs(o.s) * vhh, ey = Math.abs(o.s) * vhw + Math.abs(o.c) * vhh;
  return { p, o, vhw, vhh, ex, ey, occ: MEASURED[p.asset.id]?.occ ?? SOLID };
}
/** Is the world point on this object's opaque pixels (coarse alpha grid of its visible bounds)? */
function occHit(sh: Shape, x: number, y: number) {
  const dx = x - sh.o.x, dy = y - sh.o.y, lx = dx * sh.o.c + dy * sh.o.s, ly = -dx * sh.o.s + dy * sh.o.c;
  const u = (lx / sh.vhw + 1) / 2, v = (ly / sh.vhh + 1) / 2;
  if (u < 0 || u >= 1 || v < 0 || v >= 1) return false;
  return sh.occ.charCodeAt(Math.floor(v * OCC_G) * OCC_G + Math.floor(u * OCC_G)) === 49;
}
const cellCache = new Map<string, number[]>();
function occCells(occ: string): number[] {
  let c = cellCache.get(occ);
  if (!c) { c = []; for (let r = 0; r < OCC_G; r++) for (let k = 0; k < OCC_G; k++) if (occ.charCodeAt(r * OCC_G + k) === 49) c.push(((k + 0.5) / OCC_G) * 2 - 1, ((r + 0.5) / OCC_G) * 2 - 1); cellCache.set(occ, c); }
  return c;
}
function oneWayOverlap(a: Shape, b: Shape) {
  const cells = occCells(a.occ);
  let hit = 0;
  for (let i = 0; i < cells.length; i += 2) {
    const lx = cells[i] * a.vhw, ly = cells[i + 1] * a.vhh;
    if (occHit(b, a.o.x + lx * a.o.c - ly * a.o.s, a.o.y + lx * a.o.s + ly * a.o.c)) hit++;
  }
  return hit / Math.max(1, cells.length / 2);
}
/** Share of one silhouette lying on the other's opaque pixels (0 when the boxes do not even touch). */
export function silhouetteOverlap(a: Shape, b: Shape) {
  if (Math.abs(a.o.x - b.o.x) > a.ex + b.ex || Math.abs(a.o.y - b.o.y) > a.ey + b.ey) return 0;
  return Math.max(oneWayOverlap(a, b), oneWayOverlap(b, a));
}
export const shapeFor = shapeOf;
/** Largest separation along the four collision-box axes: > 0 is a clear gap (a lower bound of the real distance), <= 0 means the boxes overlap. */
export function separation(a: Obb, b: Obb) {
  let m = -Infinity;
  const dx = b.x - a.x, dy = b.y - a.y;
  for (const o of [a, b]) for (const ax of [[o.c, o.s], [-o.s, o.c]]) {
    const ra = Math.abs(a.hw * (a.c * ax[0] + a.s * ax[1])) + Math.abs(a.hh * (-a.s * ax[0] + a.c * ax[1]));
    const rb = Math.abs(b.hw * (b.c * ax[0] + b.s * ax[1])) + Math.abs(b.hh * (-b.s * ax[0] + b.c * ax[1]));
    m = Math.max(m, Math.abs(dx * ax[0] + dy * ax[1]) - ra - rb);
  }
  return m;
}

// ── region, board and exclusion tests ──
const inExcl = (x: number, y: number, ex?: Rect[]) => !!ex && ex.some(r => x >= r.l && x <= r.r && y >= r.t && y <= r.b);
/** Nine points of a footprint (centre, inset corners, inset edge midpoints) must mostly lie on the board artwork. */
const onBoardEnough = (o: Obb, board?: Env["onBoard"]) => {
  if (!board) return true;
  let hit = 0;
  for (const [u, v] of [[0, 0], [0.8, 0.8], [-0.8, 0.8], [0.8, -0.8], [-0.8, -0.8], [0.8, 0], [-0.8, 0], [0, 0.8], [0, -0.8]]) {
    const lx = u * o.hw, ly = v * o.hh, ok = board(o.x + lx * o.c - ly * o.s, o.y + lx * o.s + ly * o.c);
    if (u === 0 && v === 0 && !ok) return false;
    if (ok) hit++;
  }
  return hit >= 6;
};
const TOP_OVERHANG = 0.4;       // an object may reach this fraction of its height above the board's top edge (clipped there / hidden under the navbar)
const MIN_VISIBLE = 0.62;       // ...as long as this much of its silhouette stays visible
/** Share of an object's opaque pixels that fall inside any of the rects. */
export function shareIn(sh: Shape, rects: Rect[] | undefined) {
  if (!rects || !rects.length) return 0;
  if (!rects.some(r => sh.o.x + sh.ex > r.l && sh.o.x - sh.ex < r.r && sh.o.y + sh.ey > r.t && sh.o.y - sh.ey < r.b)) return 0;
  const cells = occCells(sh.occ);
  let hit = 0;
  for (let i = 0; i < cells.length; i += 2) {
    const lx = cells[i] * sh.vhw, ly = cells[i + 1] * sh.vhh, x = sh.o.x + lx * sh.o.c - ly * sh.o.s, y = sh.o.y + lx * sh.o.s + ly * sh.o.c;
    if (inExcl(x, y, rects)) hit++;
  }
  return hit / Math.max(1, cells.length / 2);
}
/**
 * A placement is valid when its centre is inside the visible region (the top edge may be overhung and is then clipped/obscured), at least 62% of
 * its silhouette is visible (not above the top edge, not under the navbar), it avoids the HARD exclusions, sits on the board artwork and has
 * (almost) no silhouette contact with its neighbours.
 */
export function validShape(sh: Shape, env: Env, others: Shape[]) {
  const rg = env.region, pad = 4 / env.s, over = (env.topOverhang ?? TOP_OVERHANG) * 2 * sh.ey;
  if (sh.o.x - sh.ex < rg.l + pad || sh.o.x + sh.ex > rg.r - pad || sh.o.y + sh.ey > rg.b - pad || sh.o.y - sh.ey < rg.t - over) return false;
  if (sh.o.y < rg.t + pad) return false;                                                       // the centre itself stays on the board
  if (inExcl(sh.o.x, sh.o.y, env.soft)) return false;                                         // never centred under the navbar
  if (shareIn(sh, env.exclusions) > 0.02) return false;                                       // hard zones stay clear
  if (sh.o.y - sh.ey < rg.t || env.soft?.length) {
    const cells = occCells(sh.occ);
    let seen = 0;
    for (let i = 0; i < cells.length; i += 2) {
      const lx = cells[i] * sh.vhw, ly = cells[i + 1] * sh.vhh, x = sh.o.x + lx * sh.o.c - ly * sh.o.s, y = sh.o.y + lx * sh.o.s + ly * sh.o.c;
      if (y >= rg.t && !inExcl(x, y, env.soft)) seen++;
    }
    if (seen / Math.max(1, cells.length / 2) < MIN_VISIBLE) return false;
  }
  if (!onBoardEnough(sh.o, env.onBoard)) return false;
  for (const ot of others) {
    const ov = silhouetteOverlap(sh, ot);
    if (ov > MAX_OVERLAP) return false;
    if (ov > 0 && separation(sh.o, ot.o) < 0) return false;
  }
  return true;
}

// ── sizing ──
const visFrac = (a: HeroAsset) => ({ w: (a.vis[2] - a.vis[0]) / a.w, h: (a.vis[3] - a.vis[1]) / a.h });
/** Board-area factor: 1 on the desktop board, smaller on a small board, a little larger on a tall one. */
export function areaFactor(region: Rect, s: number) {
  const w = (region.r - region.l) * s, h = (region.b - region.t) * s;
  return clamp(Math.sqrt((w * h) / (900 * 270)), 0.72, 1.1);
}
const canvasWidth = (a: HeroAsset, longPx: number, s: number) => { const v = visFrac(a); return longPx / Math.max(v.w, v.h * (a.h / a.w)) / s; };
const assetArea = (a: HeroAsset, f: number, s: number) => { const w = canvasWidth(a, a.long * f, s), v = visFrac(a); return v.w * w * v.h * w * (a.h / a.w); };
export const placedFrom = (id: string, cx: number, cy: number, w: number, rot: number): Placed => ({ asset: ASSET_BY_ID[id], cx, cy, w, rot });
/** Canvas centre that puts the footprint (measured with the canvas at the origin) at (fx, fy). */
const centreFor = (probe: Obb, fx: number, fy: number) => ({ cx: fx - probe.x, cy: fy - probe.y });

// ── coverage grid ──
type Grid = { cols: number; rows: number; usable: Uint8Array; nUse: number };
function makeGrid(env: Env): Grid {
  const rg = env.region, cs = CELL_PX / env.s, W = rg.r - rg.l, H = rg.b - rg.t;
  const cols = Math.max(1, Math.floor(W / cs)), rows = Math.max(1, Math.floor(H / cs)), usable = new Uint8Array(cols * rows);
  let nUse = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = rg.l + (c + 0.5) * (W / cols), y = rg.t + (r + 0.5) * (H / rows);
    if ((!env.onBoard || env.onBoard(x, y)) && !inExcl(x, y, env.exclusions)) { usable[r * cols + c] = 1; nUse++; }
  }
  return { cols, rows, usable, nUse: nUse || 1 };
}
const cellCentre = (g: Grid, env: Env, i: number) => { const rg = env.region, c = i % g.cols, r = Math.floor(i / g.cols); return { x: rg.l + (c + 0.5) * ((rg.r - rg.l) / g.cols), y: rg.t + (r + 0.5) * ((rg.b - rg.t) / g.rows) }; };
function raster(g: Grid, env: Env, shapes: Shape[]) {
  const cov = new Uint8Array(g.cols * g.rows), rg = env.region, cw = (rg.r - rg.l) / g.cols, ch = (rg.b - rg.t) / g.rows;
  for (const sh of shapes) {
    const c0 = Math.max(0, Math.floor((sh.o.x - sh.ex - rg.l) / cw)), c1 = Math.min(g.cols - 1, Math.floor((sh.o.x + sh.ex - rg.l) / cw));
    const r0 = Math.max(0, Math.floor((sh.o.y - sh.ey - rg.t) / ch)), r1 = Math.min(g.rows - 1, Math.floor((sh.o.y + sh.ey - rg.t) / ch));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (occHit(sh, rg.l + (c + 0.5) * cw, rg.t + (r + 0.5) * ch)) cov[r * g.cols + c] = 1;
  }
  return cov;
}
/** Chamfer distance (in cells) from every cell to the nearest source cell. */
function distanceTo(g: Grid, src: Uint8Array) {
  const INF = 1e6, d = new Float32Array(src.length);
  for (let i = 0; i < d.length; i++) d[i] = src[i] ? 0 : INF;
  const { cols, rows } = g;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c; let v = d[i];
    if (c > 0) v = Math.min(v, d[i - 1] + 1);
    if (r > 0) { v = Math.min(v, d[i - cols] + 1); if (c > 0) v = Math.min(v, d[i - cols - 1] + 1.414); if (c < cols - 1) v = Math.min(v, d[i - cols + 1] + 1.414); }
    d[i] = v;
  }
  for (let r = rows - 1; r >= 0; r--) for (let c = cols - 1; c >= 0; c--) {
    const i = r * cols + c; let v = d[i];
    if (c < cols - 1) v = Math.min(v, d[i + 1] + 1);
    if (r < rows - 1) { v = Math.min(v, d[i + cols] + 1); if (c < cols - 1) v = Math.min(v, d[i + cols + 1] + 1.414); if (c > 0) v = Math.min(v, d[i + cols - 1] + 1.414); }
    d[i] = v;
  }
  return d;
}

// ── scoring a whole arrangement ──
function measure(g: Grid, env: Env, shapes: Shape[]): PlanStats {
  const cov = raster(g, env, shapes), dObj = distanceTo(g, cov);
  let reached = 0, covered = 0;
  const empty = new Uint8Array(cov.length);
  for (let i = 0; i < cov.length; i++) {
    if (!g.usable[i]) continue;
    if (cov[i]) covered++;
    if (dObj[i] * CELL_PX <= INFLUENCE_PX) reached++; else empty[i] = 1;
  }
  const seen = new Uint8Array(cov.length);
  let biggest = 0;                                              // largest connected empty pocket
  for (let i = 0; i < empty.length; i++) {
    if (!empty[i] || seen[i]) continue;
    let size = 0; const st = [i]; seen[i] = 1;
    while (st.length) {
      const k = st.pop()!; size++;
      const c = k % g.cols, r = Math.floor(k / g.cols);
      for (const [rr, cc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]]) {
        if (rr < 0 || rr >= g.rows || cc < 0 || cc >= g.cols) continue;
        const j = rr * g.cols + cc;
        if (empty[j] && !seen[j]) { seen[j] = 1; st.push(j); }
      }
    }
    biggest = Math.max(biggest, size);
  }
  // reach in a 3 x 2 grid of board regions (left/centre/right x upper/lower)
  const reg: { n: number; ok: number }[] = Array.from({ length: 6 }, () => ({ n: 0, ok: 0 }));
  for (let i = 0; i < cov.length; i++) {
    if (!g.usable[i]) continue;
    const c = i % g.cols, r = Math.floor(i / g.cols), k = Math.min(2, Math.floor((c / g.cols) * 3)) + 3 * Math.min(1, Math.floor((r / g.rows) * 2));
    reg[k].n++; if (!empty[i]) reg[k].ok++;
  }
  const minRegion = Math.min(1, ...reg.filter(x => x.n >= 0.12 * (g.nUse / 6)).map(x => x.ok / x.n));
  return { reach: reached / g.nUse, emptyLargest: biggest / g.nUse, minRegion, coverage: covered / g.nUse, count: shapes.length };
}
export function measureShapes(env: Env, placed: Placed[]) { return measure(makeGrid(env), env, placed.map(shapeOf)); }

function scoreComposition(g: Grid, env: Env, shapes: Shape[], newFrom: number) {
  const m = measure(g, env, shapes);
  let minGapPx = 1e9;
  for (let i = newFrom; i < shapes.length; i++) for (let j = 0; j < shapes.length; j++) if (i !== j) minGapPx = Math.min(minGapPx, separation(shapes[i].o, shapes[j].o) * env.s);
  const spacing = minGapPx === 1e9 ? 1 : Math.min(1, Math.max(0, minGapPx + GAP_MIN_PX) / 40);
  const cats = new Set(shapes.map(x => x.p.asset.cat)).size, areas = shapes.map(x => 4 * x.vhw * x.vhh), mean = areas.reduce((s, a) => s + a, 0) / (areas.length || 1);
  const cv = Math.sqrt(areas.reduce((s, a) => s + (a - mean) ** 2, 0) / (areas.length || 1)) / (mean || 1);
  const variety = Math.min(1, (cats - 1) / 2) * 0.6 + Math.min(1, cv / 0.6) * 0.4;
  const band = m.coverage < 0.24 ? 0.24 - m.coverage : m.coverage > 0.5 ? m.coverage - 0.5 : 0;   // natural occupancy, not packed edge to edge
  const score = 5 * m.reach - 12 * m.emptyLargest - 18 * Math.max(0, m.emptyLargest - 0.06) ** 2 + 3 * m.minRegion - 10 * band + 1.2 * variety + 1.0 * spacing;
  return { score, stats: m };
}

// ── choosing assets ──
function pickWeighted<T>(items: T[], weight: (t: T) => number, rng: Rng): T | undefined {
  const ws = items.map(weight), sum = ws.reduce((a, b) => a + b, 0);
  if (sum <= 0) return undefined;
  let r = rng() * sum;
  for (let i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}

export type PlanOpts = {
  env: Env; existing: Existing[];
  maxNew: number; minNew?: number; present: Set<string>;
  areaTarget?: number; wantNew?: number;     // replacement: visible area to restore and the number of pieces it should become
  avoid?: Obb;                               // where the removed object was: the first piece should not simply reuse that spot
  attempts?: number; seed?: number;
};

/** One coverage-first arrangement: keep filling the biggest uncovered hole with an asset sized to it. */
function build(o: PlanOpts, g: Grid, f: number, existingShapes: Shape[], rng: Rng): { placed: Placed[]; shapes: Shape[] } | null {
  const shapes = [...existingShapes], placed: Placed[] = [], used = new Set(o.present), blocked = new Uint8Array(g.cols * g.rows);
  const stopPx = 36 * f, minNew = o.minNew ?? 1;
  let cum = 0;
  for (let guard = 0; guard < 60 && placed.length < o.maxNew; guard++) {
    const cov = raster(g, o.env, shapes), dObj = distanceTo(g, cov);
    const srcClear = new Uint8Array(cov.length);
    for (let i = 0; i < srcClear.length; i++) srcClear[i] = cov[i] | (g.usable[i] ? 0 : 1);
    const dClear = distanceTo(g, srcClear);
    // candidate hole centres: usable, unblocked cells ranked by distance to the nearest object (capped), clearance as a tiebreak
    const cells: { i: number; h: number }[] = [];
    for (let i = 0; i < cov.length; i++) {
      if (!g.usable[i] || blocked[i]) continue;
      cells.push({ i, h: Math.min(dObj[i], 14) + 0.35 * Math.min(dClear[i], 14) });
    }
    if (!cells.length) break;
    cells.sort((a, b) => b.h - a.h);
    const top = cells.slice(0, 10), best = top[0].h || 1;
    const holePx = Math.min(dObj[top[0].i], 14) * CELL_PX;
    if (placed.length >= minNew && holePx < stopPx) break;                                       // no conspicuous hole left
    // replacement: the area-matched number of pieces first; more (up to maxNew) only while a big hole is still open somewhere on the board
    if (o.wantNew !== undefined && placed.length >= o.wantNew && holePx < 56 * f) break;
    const nearRemoved = (i: number) => { if (!o.avoid || placed.length) return false; const c = cellCentre(g, o.env, i); return Math.abs(c.x - o.avoid.x) < o.avoid.hw * 0.4 && Math.abs(c.y - o.avoid.y) < o.avoid.hh * 0.4; };
    const pick = pickWeighted(top, c => (c.h / best) ** 3 * (nearRemoved(c.i) ? 0.3 : 1), rng);
    if (!pick) break;                                                                           // every usable cell is covered or blocked
    const centre = cellCentre(g, o.env, pick.i), clearPx = Math.max(CELL_PX, Math.min(dClear[pick.i], dObj[pick.i]) * CELL_PX);
    // asset: size fits the hole (never enlarged past its own limits); big holes prefer big assets, narrow gaps small ones
    const remaining = o.areaTarget !== undefined ? o.areaTarget - cum : undefined;
    // nothing larger than ~90% of the board height is ever brought in (a large object must not dominate the board)
    const maxLong = 0.9 * (o.env.region.b - o.env.region.t) * o.env.s;
    const pool = ROTATION_POOL.filter(a => !used.has(a.id) && a.long * f <= maxLong * ((a.capH ?? 0.9) / 0.9)), tried = new Set<string>();
    let ok = false;
    for (let t = 0; t < 7 && !ok; t++) {
      const a = pickWeighted(pool.filter(x => !tried.has(x.id)), x => {
        const q = (x.long * f) / 2 / (clearPx * 1.35 + 1);
        let w = CAT_W[x.cat] * x.weight * (recent.includes(x.id) ? 0.25 : 1) * Math.exp(-(Math.log(q) ** 2) / 0.55);
        if (q > 1.5) w *= 0.03;
        if (remaining !== undefined && remaining > 0) { const ideal = remaining / Math.max(1, (o.wantNew ?? 1) - placed.length), l = Math.log(assetArea(x, f, o.env.s) / ideal); w *= 0.2 + Math.exp(-(l * l) / 1.2); }
        return w;
      }, rng);
      if (!a) break;
      tried.add(a.id);
      for (let attempt = 0; attempt < 8 && !ok; attempt++) {
        const k = attempt < 4 ? a.range[0] + rng() * (a.range[1] - a.range[0]) : a.range[0];
        const w = canvasWidth(a, a.long * f * k, o.env.s), rot = (rng() < 0.5 ? -1 : 1) * (0.15 + 0.85 * rng()) * a.rot;
        const probe = footprint({ asset: a, cx: 0, cy: 0, w, rot }), jr = (0.3 * clearPx) / o.env.s;
        const p: Placed = { asset: a, w, rot, ...centreFor(probe, centre.x + (rng() - 0.5) * 2 * jr, centre.y + (rng() - 0.5) * 2 * jr) }, sh = shapeOf(p);
        if (validShape(sh, o.env, shapes)) { placed.push(p); shapes.push(sh); used.add(a.id); cum += visibleArea(p); ok = true; }
      }
    }
    if (!ok) blocked[pick.i] = 1;                                                              // nothing fits here: try the next hole
  }
  return placed.length ? { placed, shapes } : null;
}

/** Plan new objects around `existing`. Best of several seeded coverage-first arrangements, scored as a whole. null = no valid arrangement. */
export function planAdd(o: PlanOpts): Plan | null {
  const seed = o.seed ?? newSeed(), K = o.attempts ?? 24, f = areaFactor(o.env.region, o.env.s), g = makeGrid(o.env);
  const existingShapes = o.existing.map(e => shapeOf(e.p));
  let best: Plan | null = null;
  for (let k = 0; k < K; k++) {
    const sd = (seed + k * 7919) >>> 0, res = build(o, g, f, existingShapes, makeRng(sd));
    if (!res) continue;
    const { score, stats } = scoreComposition(g, o.env, res.shapes, existingShapes.length);
    if (!best || score > best.score) best = { placed: res.placed, moves: [], score, seed: sd, stats };
  }
  return best;
}

/** Make room by moving ONE movable object gently, then place a small object in the freed pocket. */
export function planNudge(o: PlanOpts): Plan | null {
  const seed = o.seed ?? newSeed(), f = areaFactor(o.env.region, o.env.s), rng = makeRng((seed ^ 0x9e3779b9) >>> 0);
  const rg = o.env.region, pad = 6 / o.env.s;
  const small = ROTATION_POOL.filter(a => !o.present.has(a.id) && a.cat === "small");
  if (!small.length) return null;
  const shapes = o.existing.map(e => shapeOf(e.p));
  for (let n = 0; n < 60; n++) {
    const asset = small[Math.floor(rng() * small.length)];
    const w = canvasWidth(asset, asset.long * f * asset.range[0], o.env.s), rot = (rng() < 0.5 ? -1 : 1) * rng() * asset.rot * 0.7;
    const probe = footprint({ asset, cx: 0, cy: 0, w, rot }), ex = extents(probe);
    const x = rg.l + ex.ex + pad + rng() * (rg.r - rg.l - 2 * ex.ex - 2 * pad), y = rg.t + ex.ey + pad + rng() * (rg.b - rg.t - 2 * ex.ey - 2 * pad);
    const p: Placed = { asset, w, rot, ...centreFor(probe, x, y) }, sh = shapeOf(p);
    const blockers = shapes.map((_, i) => i).filter(i => silhouetteOverlap(sh, shapes[i]) > MAX_OVERLAP);
    if (blockers.length !== 1 || o.existing[blockers[0]].locked) continue;
    const bi = blockers[0], b = shapes[bi], bext = Math.max(b.o.hw, b.o.hh), others = shapes.filter((_, i) => i !== bi);
    if (!validShape(sh, o.env, others)) continue;
    for (const dist of [0.35, 0.6, 0.9, 1.2]) for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2, dx = Math.cos(ang) * bext * dist, dy = Math.sin(ang) * bext * dist;
      const ms = shapeOf({ ...b.p, cx: b.p.cx + dx, cy: b.p.cy + dy });
      if (validShape(ms, o.env, [...others, sh])) return { placed: [p], moves: [{ id: o.existing[bi].id, dx, dy }], score: 0, seed };
    }
  }
  return null;
}

/** Replacement for removed objects: pieces count follows the area removed and the free room (1 to 3, never above the cap). Falls back to a nudge. */
export function planReplacement(o: { env: Env; existing: Existing[]; removed: Obb; removedArea: number; present: Set<string>; maxCount: number; seed?: number }): Plan | null {
  const rg = o.env.region, f = areaFactor(o.env.region, o.env.s);
  const free = (rg.r - rg.l) * (rg.b - rg.t) - o.existing.reduce((s, e) => s + visibleArea(e.p), 0);
  const target = Math.min(0.85 * o.removedArea, 0.55 * free);
  const maxNew = Math.max(0, Math.min(3, o.maxCount - o.existing.length));
  if (!maxNew) return null;
  const areas = ROTATION_POOL.map(a => assetArea(a, f, o.env.s)).sort((x, y) => x - y), median = areas[Math.floor(areas.length / 2)];
  const wantNew = clamp(Math.round(target / median), 1, maxNew);
  const opts: PlanOpts = { env: o.env, existing: o.existing, maxNew, minNew: 1, wantNew, present: o.present, areaTarget: target, avoid: o.removed, attempts: 26, seed: o.seed };
  return planAdd(opts) ?? planNudge(opts);
}

/** A whole new composition for an emptied board: coverage-first fill, at least `count` objects, never more than `maxCount`. */
export function planFull(o: { env: Env; count: number; maxCount: number; present: Set<string>; seed?: number }): Plan | null {
  return planAdd({ env: o.env, existing: [], maxNew: o.maxCount, minNew: o.count, present: o.present, attempts: 20, seed: o.seed });
}

// ── scatter ──
/** Distinct outward trajectories for the visitor-triggered scatter, relaxed so scattered objects do not overlap each other. Offsets in frame px. */
export function planScatter(o: { env: Env; items: { id: string; p: Placed }[]; frame: { w: number; h: number }; seed?: number }) {
  const rng = makeRng(o.seed ?? newSeed()), rg = o.env.region, pad = 6 / o.env.s, gap = 10 / o.env.s;
  const cx0 = o.frame.w / 2, cy0 = o.frame.h / 2;
  const objs = o.items.map(it => {
    const base = footprint(it.p), ang = Math.atan2(base.y - cy0, base.x - cx0) + (rng() - 0.5) * 1.2, dist = (0.07 + rng() * 0.08) * o.frame.w;
    let dr = (rng() < 0.5 ? -1 : 1) * (25 + rng() * 50), t = ((it.p.rot + dr) * Math.PI) / 180;
    let ob: Obb = { ...base, c: Math.cos(t), s: Math.sin(t), x: base.x + Math.cos(ang) * dist, y: base.y + Math.sin(ang) * dist };
    for (let k = 0; k < 4; k++) {                               // a long object is turned less if it would not fit the visible stage
      const e = extents(ob);
      if (2 * e.ey <= rg.b - rg.t - 2 * pad && 2 * e.ex <= rg.r - rg.l - 2 * pad) break;
      dr *= 0.5; t = ((it.p.rot + dr) * Math.PI) / 180; ob = { ...ob, c: Math.cos(t), s: Math.sin(t) };
    }
    return { id: it.id, base, ob, dr };
  });
  const keep = (ob: Obb) => {
    const e = extents(ob);
    // never scatter onto a hard zone (the printed text, headline, CTAs): step out by the smallest move that stays on the stage
    for (const x of o.env.exclusions ?? []) {
      if (!(ob.x + e.ex > x.l && ob.x - e.ex < x.r && ob.y + e.ey > x.t && ob.y - e.ey < x.b)) continue;
      const opts = [
        { x: ob.x, y: x.t - e.ey - pad }, { x: ob.x, y: x.b + e.ey + pad }, { x: x.l - e.ex - pad, y: ob.y }, { x: x.r + e.ex + pad, y: ob.y },
      ].filter(c => c.x - e.ex >= rg.l && c.x + e.ex <= rg.r && c.y - e.ey >= rg.t && c.y + e.ey <= rg.b).sort((p, q) => Math.hypot(p.x - ob.x, p.y - ob.y) - Math.hypot(q.x - ob.x, q.y - ob.y));
      if (opts.length) { ob.x = opts[0].x; ob.y = opts[0].y; }
    }
    ob.x = rg.r - rg.l > 2 * (e.ex + pad) ? clamp(ob.x, rg.l + e.ex + pad, rg.r - e.ex - pad) : (rg.l + rg.r) / 2;
    ob.y = rg.b - rg.t > 2 * (e.ey + pad) ? clamp(ob.y, rg.t + e.ey + pad, rg.b - e.ey - pad) : rg.b - e.ey - pad;   // taller than the stage: sit on its bottom edge, spill upward
  };
  objs.forEach(a => keep(a.ob));
  for (let it = 0; it < 24; it++) {                              // push overlapping neighbours apart, then keep them recoverable
    let moved = false;
    for (let i = 0; i < objs.length; i++) for (let j = i + 1; j < objs.length; j++) {
      const sp = separation(objs[i].ob, objs[j].ob);
      if (sp >= gap) continue;
      let dx = objs[j].ob.x - objs[i].ob.x, dy = objs[j].ob.y - objs[i].ob.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      const push = (gap - sp) / 2 + 1;
      objs[i].ob.x -= dx * push; objs[i].ob.y -= dy * push; objs[j].ob.x += dx * push; objs[j].ob.y += dy * push;
      moved = true;
    }
    objs.forEach(a => keep(a.ob));
    if (!moved) break;
  }
  return objs.map(a => ({ id: a.id, dx: a.ob.x - a.base.x, dy: a.ob.y - a.base.y, dr: a.dr }));
}

/** Board mask: is a frame point on the board artwork? Built once from the board image (alpha > 40), no per-point DOM work. */
export function makeBoardMask(img: HTMLImageElement, board: { cx: number; cy: number; w: number }): ((x: number, y: number) => boolean) | undefined {
  if (!img.naturalWidth) return undefined;
  const W = 160, H = Math.max(1, Math.round((160 * img.naturalHeight) / img.naturalWidth));
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d", { willReadFrequently: true });
  if (!g) return undefined;
  g.drawImage(img, 0, 0, W, H);
  const d = g.getImageData(0, 0, W, H).data, bh = (board.w * img.naturalHeight) / img.naturalWidth;
  return (x, y) => {
    const u = Math.floor(((x - board.cx) / board.w + 0.5) * W), v = Math.floor(((y - board.cy) / bh + 0.5) * H);
    if (u < 0 || v < 0 || u >= W || v >= H) return false;
    return d[(v * W + u) * 4 + 3] > 40;
  };
}
