// Logo marquee between the Hero and Featured Project (the home page only).
// The assets are in public/Icon Row/. Their FILENAMES ARE NOT MEANINGFUL (Figma export names), so each entry below records what the file actually shows; the files are left as they are
// (renaming would only add risk) and this table is the mapping. Every asset was inspected (the folder was updated once: the BedR / GDG files were replaced by black versions and Sukriya / StatusCode2 re-exported; the table follows the files as they are NOW). All eight are transparent PNGs (no built-in background); only Sukriya still carries colour in the file. `box` is each file's
// visible-pixel bounding box [left, top, right, bottom] in native px (alpha > 24), measured so that transparent padding (WOC has ~13% on each side, BedR a few %) does not make a
// logo look smaller than its neighbours: the logo is drawn cropped to its ink box and sized from THAT aspect ratio.
// Sizing: every logo gets the shared basis height (MARQUEE_LOGO_H, 46px), except that a very wide logo is capped at MARQUEE_LOGO_MAX_W so it does not
// dominate the strip; its height shrinks to keep the aspect ratio. Gaps, the responsive scale (heights AND widths) and the speed live in the .hm-logo-marquee rules in experiment.css.

export const MARQUEE_LOGO_H = 46;        // px, the shared visible height (67 -> 52 -> 46)
export const MARQUEE_LOGO_MAX_W = 152;   // px, widest a logo may be at desktop size (scaled with the height)

export type MarqueeLogo = {
  id: string; name: string; src: string;
  nw: number; nh: number; box: [number, number, number, number];
  /** Optional per-asset opacity (default 0.28 in CSS). Always still fully grayscale: only used where a very light logo would otherwise disappear. */
  opacity?: number;
};

const DIR = "/Icon%20Row/";
export const MARQUEE_LOGOS: MarqueeLogo[] = [
  { id: "growth",       name: "Growth",                   src: DIR + "Frame%2049.png",                    nw: 1174, nh: 272, box: [0, 0, 1173, 271] },
  { id: "foss-united",  name: "FOSS United",              src: DIR + "fossunited%20logo.png",             nw: 283,  nh: 221, box: [0, 0, 282, 220] },
  { id: "woc",          name: "Winter of Code",           src: DIR + "Group%20314.png",                   nw: 752,  nh: 216, box: [97, 0, 654, 209] },
  { id: "gdg",          name: "Google Developer Groups",  src: DIR + "Frame%201000006349.png",            nw: 267,  nh: 139, box: [7, 7, 258, 130] },   // the GDG chevron mark (the file is now the mark alone, in black/gray)
  { id: "indiafoss",    name: "IndiaFOSS 2026",           src: DIR + "IndiaFOSS-2026-logo.png",           nw: 709,  nh: 228, box: [0, 0, 708, 227] },
  { id: "bedr",         name: "BedR",                     src: DIR + "Frame%201000006348.png",            nw: 557,  nh: 188, box: [3, 3, 548, 183] },
  { id: "sukriya",      name: "Sukriya",                  src: DIR + "Frame%201000006347.png",            nw: 822,  nh: 240, box: [0, 0, 811, 239] },   // its four shapes are still coloured in the file: grayscale is applied at render time
  { id: "statuscode2",  name: "StatusCode2",              src: DIR + "Group%2033.png",                    nw: 682,  nh: 408, box: [0, 90, 591, 317] },
];

/** Derived layout for one logo: its display box (w x h at desktop size) and how to place the full image inside it so only the ink box shows. */
export function logoLayout(l: MarqueeLogo) {
  const [bl, bt, br, bb] = l.box, bw = br - bl + 1, bh = bb - bt + 1, aspect = bw / bh;
  const h = Math.min(MARQUEE_LOGO_H, MARQUEE_LOGO_MAX_W / aspect), w = h * aspect;
  const fw = bw / l.nw, fh = bh / l.nh;                                   // the ink box as a share of the full image
  return { w: Math.round(w * 10) / 10, h: Math.round(h * 10) / 10, img: { width: `${100 / fw}%`, height: `${100 / fh}%`, left: `${-(bl / l.nw) / fw * 100}%`, top: `${-(bt / l.nh) / fh * 100}%` } };
}
