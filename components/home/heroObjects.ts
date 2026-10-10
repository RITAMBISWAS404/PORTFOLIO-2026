// Object manifest for the living Hero pegboard (the home page only). Every entry is a real RGBA PNG that exists in public/ today; nothing is
// renamed, re-encoded or cropped. To add an asset: put the PNG in public/Random item, add it to the scratch measuring script's file list
// (it regenerates heroOcc.ts), then add ONE line below with its id, source, size in GRID CELLS, category and tilt.
//
// SIZING MODEL (visual size is NOT image size)
//   Canvas size, visible bounds and the alpha occupancy grid are MEASURED from the files (heroOcc.ts, alpha > 24) and never typed by hand.
//   The board's printed grid is the ruler: one large printed cell is ~337 px of the 2592 px board artwork, which renders as REF_CELL_PX = 117 CSS px
//   on the 900 px desktop board. `cells` is the length of the VISIBLE object's longer side in those cells. (A visual ruler for believable
//   proportions, not a claim about real centimetres.) The composer turns cells into a canvas width through the measured visible bounds, so an
//   image with big transparent margins (glasses: 20% visible) is not drawn bigger than one without; resolution plays no part (a 2120 px receipt
//   and a 147 px patch are sized by what they are). A board-area factor shrinks the whole hierarchy on smaller stages; each asset only ever varies
//   inside its own `range` (+-8%), and nothing is ever enlarged to fill a gap.
//   Hierarchy: large 1.6-2.3 cells (never above ~85% of the board height), medium 1.1-1.55, small 0.7-0.9. The four approved objects keep exactly
//   the sizes of the approved composition (3.72 / 3.05 / 1.41 / 0.90 cells).
//   core      0..1 shrink applied to the visible bounds for the collision box (thin or irregular objects are less than their bounding box)
//   rot       max tilt in degrees for placed replacements
//   weight    selection weight multiplier (the three multi-MB files are rare so a visitor rarely downloads them)
//   ambient   may be stolen by Clippy
import { MEASURED } from "./heroOcc";

/** One large printed grid cell in CSS px on the 900 px desktop board (337 board-art px x 900/2592 x the 1.0 stage scale). */
export const REF_CELL_PX = 117;

export type HeroAsset = {
  id: string; src: string; w: number; h: number;
  vis: [number, number, number, number];
  visRatio: number;
  cells: number;                    // visible long side in printed grid cells (the sizing source of truth)
  long: number;                     // = cells x REF_CELL_PX: the same length in CSS px on the reference board
  range: [number, number];
  capH?: number;                    // largest visible long side as a fraction of the board height (default 0.9; the tall receipt may reach 1.15)
  cat: "large" | "medium" | "small";
  kind: "object" | "graphic";
  core: number;
  rot: number; rotation: boolean; ambient: boolean; weight: number; heavy?: boolean;
};

const R = "/Random%20item/";
const H = "/hero%20section%20image/";   // the four approved objects live here

type Opt = Partial<Pick<HeroAsset, "range" | "rot" | "rotation" | "ambient" | "heavy" | "core" | "weight" | "capH">>;
const a = (id: string, src: string, cells: number, cat: HeroAsset["cat"], kind: HeroAsset["kind"], o: Opt = {}): HeroAsset => {
  const m = MEASURED[id];
  return { id, src, w: m.w, h: m.h, vis: m.vis, visRatio: m.visRatio, cells, long: cells * REF_CELL_PX, cat, kind, range: [0.92, 1.08], core: 0.9, rot: 12, rotation: true, ambient: true, weight: 1, ...o };
};

export const HERO_ASSETS: HeroAsset[] = [
  // approved composition (sizes fixed: they must stay exactly as approved)
  a("glasses", `${H}glasses.png`, 3.718, "large", "object", { rot: 17, range: [1, 1], core: 0.62 }),
  a("earphones", `${H}earphones.png`, 3.051, "large", "object", { rot: 4, range: [1, 1], core: 0.7 }),
  a("flame", `${H}flame.png`, 1.41, "medium", "graphic", { rot: 5, range: [1, 1] }),
  a("ok", `${H}ok.png`, 0.897, "small", "graphic", { rot: 20, range: [1, 1], core: 0.95 }),
  // large objects
  a("bill", `${R}BILL.png`, 3.4, "large", "object", { rot: 6, weight: 0.35, heavy: true, capH: 1.35 }),     // receipt: 1.88 -> 2.31 -> 2.9 -> 3.4 cells (+17%; capH scaled with it so it stays eligible on the same boards; it may overhang the top edge)
  a("coffee", `${R}COFFEE.png`, 1.58, "large", "object", { rot: 10, weight: 0.5, heavy: true }),
  // medium objects and stickers
  a("bread", `${R}BREAD.png`, 2.1, "large", "object", { rot: 12, weight: 0.5, heavy: true }),                  // bread: 1.45 -> 2.1 cells (a large, prominent cutout)
  a("eyes", `${R}EYES.png`, 1.54, "medium", "graphic", { rot: 8 }),
  a("flowers", `${R}FLOWERS.png`, 1.41, "medium", "graphic"),
  a("paper", `${R}PAPER.png`, 1.37, "medium", "object", { rot: 14 }),
  a("her", `${R}HER.png`, 1.28, "medium", "object", { core: 0.8, rot: 14 }),
  a("lotus", `${R}LOTUS.png`, 1.45, "medium", "object", { core: 0.85, rot: 14 }),                  // lotus: 1.28 -> 1.45 cells (stronger presence)
  a("duck", `${R}RUBBER%20DUCK.png`, 1.1, "medium", "object", { core: 0.85 }),                       // duck: 1.24 -> 1.10 cells (better balanced)
  a("heal", `${R}HEAL.png`, 1.07, "medium", "graphic", { rot: 14 }),
  // small accents
  a("stamp", `${R}STAMP.png`, 0.85, "small", "graphic"),                                          // postage stamp: 1.11 -> 0.85 cells (a small paper collectible)
  a("star", `${R}STAR.png`, 0.85, "small", "graphic", { core: 0.85, rot: 14 }),
  a("star-fold", `${R}download%20%286%29%201.png`, 0.81, "small", "object", { core: 0.85, rot: 14 }),
  a("canhead", `${R}CANHEAD.png`, 0.73, "small", "object", { core: 0.88, rot: 16 }),
];

export const ASSET_BY_ID: Record<string, HeroAsset> = Object.fromEntries(HERO_ASSETS.map(x => [x.id, x]));

/** Assets that may be brought in as replacements. */
export const ROTATION_POOL = HERO_ASSETS.filter(x => x.rotation);
