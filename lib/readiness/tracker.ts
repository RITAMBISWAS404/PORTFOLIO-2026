// Asset-readiness tracker (framework-agnostic, no dependencies). It answers one question honestly: "are the visual assets this page needs actually ready to paint?"
//
// WHAT COUNTS AS A REQUIRED ASSET (the definition; videos, analytics and every other request are deliberately NOT in it)
//   image         every RENDERED <img> in the scan root, tracked on the ELEMENT the page itself renders, so the browser's own source selection (src / srcset / sizes -> currentSrc) is what is tracked and
//                 there is no second download. An <img> that is not rendered (display:none, e.g. the other of a desktop / mobile pair) is not required and is never promoted: it would be a download
//                 nobody sees. It is picked up if it becomes rendered while the loader is still running.
//   css-image     url(...) images in same-origin stylesheet rules whose selector matches something in the scan root, and inline style="...url(...)" backgrounds / masks
//   manifest      images the page needs but that are not in the DOM yet (JS-driven), listed explicitly in the config (loaded off-DOM and decoded; browser cache is shared with the page)
//   font          the font faces listed in the config, loaded with the browser's FontFaceSet API for the text actually on the page
// NOT required: <video> (and its poster), <source>, data:/blob: URLs, scripts, analytics, fetch/XHR, anything outside the scan root.
//
// TWO TIERS (so a slow link is not held hostage by pictures nobody can see yet)
//   critical      rendered images whose top is within `criticalViewports` viewport heights of the page top (default 1: the first screen), plus fonts, css images and the manifest. The reveal always waits for these (within the bounds).
//   deferred      rendered images further down. A native-lazy deferred image is NOT promoted at once (that would compete with the critical set for bandwidth): once the critical set has settled, deferred
//                 lazies are promoted nearest-first, `deferredConcurrency` at a time, and the reveal waits a short, bounded GRACE for them (until nothing has settled for `graceStallMs`, at most
//                 `graceMaxMs`). On a fast link that is long enough for everything, so nothing appears late on scroll; on a slow link whatever is not done by then is marked "background": it keeps
//                 loading after the reveal, is reported separately, and no longer counts toward progress or readiness.
//
// READY means: loaded AND decoded (HTMLImageElement.decode(); a rejected decode on an image that did load is counted ready but noted), so it can paint without a late decode hitch.
// FAILED means: the request errored or the image has no intrinsic size after loading. TIMEOUT means it did not settle within the bounded wait. Neither is ever counted as ready. A failed <img> is
// marked data-readiness-failed (and the mark is removed if it later loads), so a page can give it a graceful fallback in CSS.
//
// PROGRESS = ready / (counted - failed - timedOut), floor, never decreasing, held at 99 until discovery is sealed and every counted asset has settled ("counted" = not background). It is not a
//   function of elapsed time. A late-discovered asset grows the total; the displayed value then waits for the real fraction to catch up (it never goes backwards).
// DISCOVERY is sealed when no new asset has appeared for `quietMs` (and the document is parsed; NOT "load" has fired, which a hanging <video> can delay), or after `discoveryMaxMs`.
// BOUNDS: an asset is given up on after `perAssetMs` of loading with NOTHING settling anywhere in that time (so a slow link that keeps delivering is never cut short by it); the whole thing has
// `overallMs`, which is a hard stop that does not wait for any individual bound: at that moment every
// unsettled counted critical asset is recorded as a timeout (deferred ones become background) and the tracker finishes as "degraded". Nothing is retried. All configurable (DEFAULT_CONFIG).

export type AssetKind = "image" | "css-image" | "manifest" | "font";
export type AssetState = "pending" | "loading" | "ready" | "failed" | "timeout";
export type Phase = "discovering" | "loading" | "ready" | "degraded";
export type Tier = "critical" | "deferred";

export interface ReadinessConfig {
  /** Where to look for images (default: document.body). */
  root?: ParentNode;
  /** Elements matching this (or inside one that does) are not tracked: the loader's own artwork, anything that must not block. */
  ignoreSelector: string;
  /** Images that are not in the DOM yet but must be ready (explicit; kept short). */
  manifest: string[];
  /** Font descriptors to load, e.g. `600 16px "Plus Jakarta Sans"`. */
  fonts: string[];
  /** Per-asset bound (ms): an asset is given up on after loading this long with no asset anywhere settling in that time. */
  perAssetMs: number;
  /** Overall bound (ms): the loader never holds the page longer than this, whatever the individual timers say. */
  overallMs: number;
  /** Discovery is sealed after this long without a new asset (ms)... */
  quietMs: number;
  /** ...or at the latest after this long. */
  discoveryMaxMs: number;
  /** Concurrent off-DOM (manifest / css) loads. DOM images are loaded by the browser, which already limits itself per host. */
  concurrency: number;
  /** An image whose top is within this many viewport heights of the page top is critical (the first screen); further down is deferred. */
  criticalViewports: number;
  /** Deferred native-lazy images promoted at a time, after the critical set has settled. */
  deferredConcurrency: number;
  /** The grace for deferred images ends when nothing has settled for this long (ms)... */
  graceStallMs: number;
  /** ...or after this long at the most (ms). */
  graceMaxMs: number;
}

export const DEFAULT_CONFIG: ReadinessConfig = {
  ignoreSelector: "[data-readiness-ignore]",
  manifest: [],
  fonts: [],
  perAssetMs: 15000,
  overallMs: 25000,
  quietMs: 500,
  discoveryMaxMs: 4000,
  concurrency: 4,
  criticalViewports: 1,
  deferredConcurrency: 6,
  graceStallMs: 800,
  graceMaxMs: 3000,
};

export interface AssetRecord {
  key: string;
  url: string;
  kind: AssetKind;
  tier: Tier;
  state: AssetState;
  background: boolean;        // not counted any more: it was still loading when the grace / overall bound ended, and continues after the reveal
  refs: number;               // how many places reference it (duplicates are ONE asset)
  promotedLazy: boolean;      // it was a native-lazy image that this tracker made eager
  note?: string;              // e.g. "decode rejected, image loaded", "no matching face", error text
  startedAt: number;          // ms since the tracker started (discovery)
  settledAt?: number;
}

export interface Snapshot {
  phase: Phase;
  sealed: boolean;
  total: number;              // counted assets discovered so far (critical + deferred, minus background)
  critical: number;
  ready: number;
  failed: number;
  timedOut: number;
  pending: number;            // counted, not settled yet
  background: number;         // still loading after the reveal, no longer counted
  progress: number;           // 0..100, the displayed value
  elapsed: number;
  assets: AssetRecord[];
}

type Entry = {
  rec: AssetRecord;
  els: Set<HTMLImageElement>;
  probe?: HTMLImageElement;
  armedAt?: number;               // when it started loading (ms, performance clock): the per-asset bound counts from here
  bound: Set<HTMLImageElement>;   // elements we attached load listeners to
  awaiting: boolean;              // a deferred native-lazy image waiting for its turn to be promoted
};

const IMG_EXT = /\.(png|jpe?g|webp|gif|avif|svg|bmp|ico)(\?|#|$)/i;
const isReady = (s: AssetState) => s === "ready";
const settled = (s: AssetState) => s === "ready" || s === "failed" || s === "timeout";

export class ReadinessTracker {
  private cfg: ReadinessConfig;
  private entries = new Map<string, Entry>();
  private elKey = new WeakMap<HTMLImageElement, string>();
  private watched = new WeakSet<HTMLImageElement>();
  private subs = new Set<(s: Snapshot) => void>();
  private t0 = 0;
  private lastNew = 0;
  private sealed = false;
  private released = false;           // the critical set has settled: deferred images may start
  private releasedAt = 0;
  private lastSettle = 0;
  private finished: Phase | null = null;
  private endedAt = 0;
  private shown = 0;
  private mo: MutationObserver | null = null;
  private tick: ReturnType<typeof setInterval> | null = null;
  private overall: ReturnType<typeof setTimeout> | null = null;
  private scanRaf = 0;
  private queue: string[] = [];
  private active = 0;
  private started = false;
  private destroyed = false;
  private onDone: Array<(s: Snapshot) => void> = [];

  constructor(cfg: Partial<ReadinessConfig> = {}) { this.cfg = { ...DEFAULT_CONFIG, ...cfg }; }

  // ── public ──
  subscribe(fn: (s: Snapshot) => void) { this.subs.add(fn); return () => { this.subs.delete(fn); }; }
  whenDone(fn: (s: Snapshot) => void) { if (this.finished) fn(this.snapshot()); else this.onDone.push(fn); }
  get config() { return this.cfg; }

  start() {
    if (this.started || this.destroyed || typeof document === "undefined") return;
    this.started = true; this.t0 = this.lastNew = this.lastSettle = performance.now();
    const root = this.cfg.root ?? document.body;
    this.scan();
    this.cfg.manifest.forEach(u => this.addManifest(u));
    this.loadFonts();
    this.mo = new MutationObserver(() => this.scheduleScan());
    this.mo.observe(root instanceof Node ? root : document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "srcset", "loading", "style"] });
    this.tick = setInterval(() => this.check(), 100);
    this.overall = setTimeout(() => this.expire(), this.cfg.overallMs);
    this.check();
  }

  destroy() {
    this.destroyed = true;
    this.mo?.disconnect(); this.mo = null;
    if (this.tick) clearInterval(this.tick);
    if (this.overall) clearTimeout(this.overall);
    if (this.scanRaf) cancelAnimationFrame(this.scanRaf);
    this.entries.forEach(e => { if (e.probe) e.probe.onload = e.probe.onerror = null; });
    this.subs.clear(); this.onDone = [];
  }

  snapshot(): Snapshot {
    const now = this.endedAt || performance.now();
    let rdy = 0, fail = 0, to = 0, pend = 0, bg = 0, crit = 0, total = 0;
    const assets: AssetRecord[] = [];
    this.entries.forEach(e => {
      assets.push({ ...e.rec });
      if (e.rec.background) { bg++; return; }
      total++; if (e.rec.tier === "critical") crit++;
      if (isReady(e.rec.state)) rdy++; else if (e.rec.state === "failed") fail++; else if (e.rec.state === "timeout") to++; else pend++;
    });
    const phase: Phase = this.finished ?? (!this.sealed ? "discovering" : "loading");
    const usable = total - fail - to;
    const calc = this.finished ? 100 : Math.min(99, Math.floor((usable > 0 ? rdy / usable : 0) * 100));
    this.shown = Math.max(this.shown, calc);            // never backwards: a late-discovered asset only makes the bar wait
    return { phase, sealed: this.sealed, total, critical: crit, ready: rdy, failed: fail, timedOut: to, pending: pend, background: bg, progress: this.finished ? 100 : this.shown, elapsed: Math.round(now - this.t0), assets };
  }

  // ── discovery ──
  private abs(u: string) { try { return new URL(u, document.baseURI).href; } catch { return u; } }
  private ignored(el: Element) { return !!this.cfg.ignoreSelector && !!el.closest(this.cfg.ignoreSelector); }
  private scheduleScan() { if (this.scanRaf || this.destroyed) return; this.scanRaf = requestAnimationFrame(() => { this.scanRaf = 0; if (!this.destroyed) { this.scan(); this.check(); } }); }

  private scan() {
    const root = this.cfg.root ?? document.body;
    root.querySelectorAll("img").forEach(el => { if (!this.ignored(el)) this.registerImg(el); });
    root.querySelectorAll<HTMLElement>("[style*='url(']").forEach(el => { if (!this.ignored(el)) this.cssUrls(el.getAttribute("style") ?? "", document.baseURI); });
    this.scanSheets(root);
  }

  private entry(key: string, url: string, kind: AssetKind, tier: Tier): Entry {
    let e = this.entries.get(key);
    if (!e) {
      e = { rec: { key, url, kind, tier, state: "pending", background: false, refs: 0, promotedLazy: false, startedAt: Math.round(performance.now() - this.t0) }, els: new Set(), bound: new Set(), awaiting: false };
      this.entries.set(key, e); this.lastNew = performance.now();
      this.emit();
    }
    return e;
  }

  /** An asset has started loading (not merely discovered): the per-asset bound counts from here. */
  private arm(_key: string, e: Entry) { if (e.armedAt === undefined && !settled(e.rec.state)) e.armedAt = performance.now(); }

  private registerImg(el: HTMLImageElement) {
    const raw = el.currentSrc || el.getAttribute("src") || "";
    if (!raw && !el.srcset) return;
    if (/^(data|blob):/i.test(raw)) return;
    const prev = this.elKey.get(el);
    if (!prev && el.getClientRects().length === 0) return;               // not rendered: not required (see the header)
    const url = raw ? this.abs(raw) : `srcset:${el.srcset}`, key = url;
    if (prev === key) return;
    if (prev) this.detach(prev, el);
    this.elKey.set(el, key);
    const tier: Tier = el.getBoundingClientRect().top + scrollY < innerHeight * this.cfg.criticalViewports ? "critical" : "deferred";
    const e = this.entry(key, url, "image", tier);
    if (tier === "critical" && e.rec.tier === "deferred" && !settled(e.rec.state)) e.rec.tier = "critical";   // one critical use makes the asset critical
    e.els.add(el); e.rec.refs = e.els.size;
    this.watch(el);
    const lazyIdle = el.loading === "lazy" && !el.complete;
    if (settled(e.rec.state)) { if (lazyIdle && isReady(e.rec.state)) el.loading = "eager"; return; }     // another element already loaded this URL: this one just takes it from the cache, no tracking needed
    if (lazyIdle && e.rec.tier === "deferred" && !e.rec.background) { e.awaiting = true; return; }   // its turn comes after the critical set (pumpDeferred)
    this.promote(key, e, el);
  }

  /** Make a lazy image eager (it is requested now) and start tracking its load. */
  private promote(key: string, e: Entry, el: HTMLImageElement) {
    for (const x of e.els) if (x.loading === "lazy" && !x.complete) { x.loading = "eager"; e.rec.promotedLazy = true; }     // every element of this URL (duplicates share one download)
    e.awaiting = false;
    this.bindImg(key, e, el);
  }

  private watch(el: HTMLImageElement) {
    if (this.watched.has(el)) return;
    this.watched.add(el);
    el.addEventListener("error", () => { if (el.getAttribute("src") || el.currentSrc) el.setAttribute("data-readiness-failed", ""); });
    el.addEventListener("load", () => el.removeAttribute("data-readiness-failed"));
    if (el.complete && el.naturalWidth === 0 && (el.getAttribute("src") || el.currentSrc)) el.setAttribute("data-readiness-failed", "");
  }

  private detach(key: string, el: HTMLImageElement) {
    const old = this.entries.get(key); if (!old) return;
    old.els.delete(el); old.bound.delete(el); old.rec.refs = old.els.size;
    this.dropIfOrphaned(key, old);
  }

  private dropIfOrphaned(key: string, e: Entry) {
    if (e.rec.kind === "image" && e.els.size === 0 && !settled(e.rec.state)) this.entries.delete(key);   // its element was removed or re-pointed: nothing left to wait for
  }

  private bindImg(key: string, e: Entry, el: HTMLImageElement) {
    if (e.rec.state === "pending") e.rec.state = "loading";
    this.arm(key, e);
    if (e.bound.has(el)) return;
    e.bound.add(el);
    const onLoad = () => this.afterLoad(key, e, el);
    const onError = () => { if ([...e.els].every(x => x === el || (x.complete && x.naturalWidth === 0))) this.settle(key, "failed", "image request failed"); };
    el.addEventListener("load", onLoad, { once: true }); el.addEventListener("error", onError, { once: true });
    if (el.complete) { if (el.naturalWidth > 0) onLoad(); else if (el.currentSrc || el.getAttribute("src")) onError(); }
  }

  private afterLoad(key: string, e: Entry, el: HTMLImageElement) {
    if (settled(e.rec.state) || this.destroyed) return;
    if (!(el.naturalWidth > 0)) { this.settle(key, "failed", "loaded without an intrinsic size"); return; }
    const cur = el.currentSrc;
    if (cur && this.abs(cur) !== key) e.rec.note = `browser selected ${this.abs(cur)}`;       // srcset: the browser's actual choice is what was loaded
    el.decode().then(
      () => this.settle(key, "ready"),
      () => { if (el.naturalWidth > 0) this.settle(key, "ready", "decode rejected, image loaded"); else this.settle(key, "failed", "decode failed"); },
    );
  }

  private addManifest(u: string) {
    const url = this.abs(u), e = this.entry(url, url, "manifest", "critical");
    if (settled(e.rec.state) || e.probe || this.queue.includes(url)) return;
    if (e.rec.state === "pending") this.queue.push(url);
    this.pump();
  }

  private pump() {
    while (this.active < this.cfg.concurrency && this.queue.length && !this.destroyed) {
      const url = this.queue.shift()!, e = this.entries.get(url);
      if (!e || settled(e.rec.state)) continue;
      this.active++; e.rec.state = "loading"; this.arm(url, e);
      const im = new Image(); e.probe = im; im.decoding = "async";
      const done = () => { this.active--; this.pump(); };
      im.onerror = () => { this.settle(url, "failed", "image request failed"); done(); };
      im.src = url;
      im.decode().then(() => { this.settle(url, "ready"); done(); }, () => { if (im.naturalWidth > 0) this.settle(url, "ready", "decode rejected, image loaded"); else this.settle(url, "failed", "decode failed"); done(); });
    }
  }

  private cssUrls(text: string, base: string) {
    for (const m of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) {
      const raw = m[2]; if (!raw || /^(data|blob|#)/i.test(raw) || !IMG_EXT.test(raw)) continue;
      let url: string; try { url = new URL(raw, base).href; } catch { continue; }
      const had = this.entries.has(url), e = this.entry(url, url, "css-image", "critical");
      e.rec.refs++;
      if (!had && e.rec.state === "pending" && !this.queue.includes(url)) { this.queue.push(url); this.pump(); }
    }
  }

  private scanSheets(root: ParentNode) {
    const walk = (rules: CSSRuleList, base: string) => {
      for (const r of Array.from(rules)) {
        if (r instanceof CSSStyleRule) {
          const css = r.style.cssText; if (!css.includes("url(")) continue;
          const sel = r.selectorText.replace(/::?[a-z-]+(\([^)]*\))?/gi, "").trim() || "*";   // pseudo-classes / elements dropped: the base element is what must exist
          let hit = false; try { hit = !!root.querySelector(sel); } catch { hit = false; }
          if (hit) this.cssUrls(css, base);
        } else if (r instanceof CSSMediaRule) { if (window.matchMedia(r.conditionText).matches) walk(r.cssRules, base); }
        else if (r instanceof CSSSupportsRule) walk(r.cssRules, base);
      }
    };
    for (const sh of Array.from(document.styleSheets)) {
      try { if (sh.href && new URL(sh.href).origin !== location.origin) continue; walk(sh.cssRules, sh.href ?? document.baseURI); } catch { /* cross-origin sheet: not inspectable */ }
    }
  }

  private loadFonts() {
    if (!document.fonts || !this.cfg.fonts.length) return;
    const text = (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 3000) || "Aa";
    this.cfg.fonts.forEach(desc => {
      const key = `font:${desc}`, e = this.entry(key, desc, "font", "critical"); e.rec.state = "loading"; this.arm(key, e);
      document.fonts.load(desc, text).then(
        faces => this.settle(key, "ready", faces.length ? undefined : "no matching face needed loading"),
        () => this.settle(key, "failed", "font load failed"),
      );
    });
  }

  // ── lifecycle ──
  private settle(key: string, state: AssetState, note?: string) {
    const e = this.entries.get(key);
    if (!e || settled(e.rec.state) || this.destroyed) return;
    e.rec.state = state; e.rec.settledAt = Math.round(performance.now() - this.t0); if (note) e.rec.note = note;
    if (state !== "timeout") this.lastSettle = performance.now();       // a timeout is not progress: it must not buy the others more time
    if (e.probe) e.probe.onerror = null;
    this.pumpDeferred();
    this.emit(); this.check();
  }

  /** After the critical set has settled: promote deferred lazy images, nearest first, a few at a time (continues in the background after the reveal). */
  private pumpDeferred() {
    if (!this.released || this.destroyed) return;
    let inflight = 0; const waiting: Array<[string, Entry, number]> = [];
    this.entries.forEach((e, k) => {
      if (e.rec.kind !== "image" || settled(e.rec.state)) return;
      if (e.awaiting) { const el = [...e.els][0]; waiting.push([k, e, el ? el.getBoundingClientRect().top + scrollY : 0]); }
      else if (e.rec.promotedLazy) inflight++;
    });
    waiting.sort((a, b) => a[2] - b[2]);
    for (const [k, e] of waiting) {
      if (inflight >= this.cfg.deferredConcurrency) break;
      const el = [...e.els].find(x => x.isConnected) ?? [...e.els][0]; if (!el) continue;
      this.promote(k, e, el); inflight++;
    }
  }

  private expire() {
    if (this.finished || this.destroyed) return;
    this.sealed = true; this.released = true;
    this.entries.forEach((e, k) => {
      if (settled(e.rec.state) || e.rec.background) return;
      if (e.rec.tier === "critical") this.settle(k, "timeout", "overall bound reached");
      else { e.rec.background = true; e.rec.note = "continues after the reveal (overall bound reached)"; }
    });
    this.pumpDeferred(); this.check();
  }

  private check() {
    if (this.destroyed || !this.started) return;
    if (this.finished) return;
    const now = performance.now();
    // elements that left the page while we waited: nothing to wait for
    this.entries.forEach((e, k) => { if (e.rec.kind === "image") { e.els.forEach(el => { if (!el.isConnected) { e.els.delete(el); e.bound.delete(el); } }); e.rec.refs = e.els.size; this.dropIfOrphaned(k, e); } });
    // per-asset bound: an asset that has been loading for perAssetMs AND with nothing at all settling in that time is given up on (a slow link that keeps delivering never trips it; overallMs is the hard stop)
    const ref = this.lastSettle;
    this.entries.forEach((e, k) => {
      if (e.rec.background || settled(e.rec.state) || e.armedAt === undefined || now - Math.max(e.armedAt, ref) < this.cfg.perAssetMs) return;
      if (e.rec.tier === "deferred") { e.rec.background = true; e.rec.note = "continues after the reveal (per-asset bound)"; }
      else this.settle(k, "timeout", "no progress within the per-asset bound");
    });
    if (!this.sealed && ((now - this.lastNew >= this.cfg.quietMs && document.readyState !== "loading") || now - this.t0 >= this.cfg.discoveryMaxMs)) { this.sealed = true; this.scan(); }
    const counted = [...this.entries.values()].filter(e => !e.rec.background);
    const critOpen = counted.some(e => e.rec.tier === "critical" && !settled(e.rec.state));
    if (this.sealed && !this.released && !critOpen) { this.released = true; this.releasedAt = this.lastSettle = now; this.pumpDeferred(); }
    if (this.sealed && this.released) {
      const defOpen = counted.filter(e => e.rec.tier === "deferred" && !settled(e.rec.state));
      if (defOpen.length && (now - this.lastSettle >= this.cfg.graceStallMs || now - this.releasedAt >= this.cfg.graceMaxMs)) {
        defOpen.forEach(e => { e.rec.background = true; e.rec.note = "continues after the reveal (grace ended)"; });
      }
    }
    const gating = [...this.entries.values()].filter(e => !e.rec.background);
    if (this.sealed && this.released && gating.every(e => settled(e.rec.state))) {
      const bad = gating.some(e => !isReady(e.rec.state));
      this.finished = bad ? "degraded" : "ready"; this.endedAt = now;
      if (this.tick) { clearInterval(this.tick); this.tick = null; }
      if (this.overall) { clearTimeout(this.overall); this.overall = null; }
      this.mo?.disconnect(); this.mo = null;
      const snap = this.snapshot(); this.subs.forEach(f => f(snap)); const cbs = this.onDone; this.onDone = []; cbs.forEach(f => f(snap));
      return;
    }
    this.emit();
  }

  private emit() { if (!this.subs.size) return; const s = this.snapshot(); this.subs.forEach(f => f(s)); }
}
