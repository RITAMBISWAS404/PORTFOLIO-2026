"use client";
// The loading screen, driven by real asset readiness (lib/readiness/tracker.ts) instead of a fixed timer. Same look as components/LoadingScreen.tsx (logo, 1px bar, 3-digit counter, fade out):
// only what feeds the bar changed. Opt-in: nothing imports this except a page that mounts it (today: /experiment-live via components/experiment/ExperimentGate.tsx, and the landing page via components/home/HomeGate.tsx).
//
// PRIORITY ONE: a visitor is never trapped here. A hard deadline (HARD_TIMEOUT_MS, below) reveals the page whatever the assets are doing; real readiness is the normal, earlier way in.
//
// Timeline: the tracker discovers and loads the page's required assets while the page renders UNDER this overlay; the bar shows the real fraction ready; when the tracker reports "ready" (or
// "degraded": some assets failed or timed out, see the tracker for the bounds) the counter reads 100, a short beat later (the existing 320 ms, purely visual) the app is marked ready and the overlay fades.
// That beat is only a transition: it starts after readiness and never stands in for it.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppReady } from "@/lib/AppReadyContext";
import { ReadinessTracker, type ReadinessConfig, type Snapshot } from "@/lib/readiness/tracker";

type Props = { config?: Partial<ReadinessConfig>; label?: string; hardTimeoutMs?: number };

const STATUS: Record<Snapshot["phase"], string> = {
  discovering: "Finding what the page needs",
  loading: "Loading images and fonts",
  ready: "Everything is ready",
  degraded: "Ready. Some images could not be loaded",
};

/** The visitor is never held longer than this, whatever the assets are doing (ms from the start of the loading experience). */
export const HARD_TIMEOUT_MS = 5000;

// THE HARD DEADLINE (the one rule that outranks everything else: nobody is ever trapped on this screen)
//   - It is its own timer. It does not read the tracker, discovery, promises, decoding, fonts or any per-asset bound, and nothing the tracker does can move it: it is set once, from a fixed point in
//     time (the start of the loading experience, below), and never re-armed. A change of reduced-motion state or of the tracker's config cannot touch it (it lives in its own effect with fixed deps).
//   - Start of the loading experience = the moment the page was requested. On a normal page load the loader is in the server-rendered HTML and an inline script (rendered below) records its own start and
//     enforces the same deadline BEFORE React has loaded, so even a stalled JavaScript bundle cannot keep the overlay up. When React takes over it reads that start and finishes the job. On a client-side
//     route change there is no page request, so the start is the moment the loader mounted.
//   - reveal() is idempotent (the first caller wins; readiness and the deadline may race), and it only marks the app ready and removes the overlay: assets that are still loading simply carry on,
//     and nothing is disabled or hidden while they do.
export default function ReadinessLoader({ config, label = "Loading portfolio", hardTimeoutMs = HARD_TIMEOUT_MS }: Props) {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [done, setDone] = useState(false);
  const { setReady } = useAppReady();
  const reduce = useReducedMotion();
  const reduceRef = useRef(false);
  useEffect(() => { reduceRef.current = !!reduce; }, [reduce]);
  const cfgKey = JSON.stringify(config ?? {});
  const cfg = useMemo(() => config, [cfgKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const raf = useRef(0);
  const revealed = useRef<{ reason: string; at: number } | null>(null);
  const reveal = useCallback((reason: "ready" | "timeout") => {
    if (revealed.current) return;                                                  // idempotent: whoever gets here first wins
    revealed.current = { reason, at: Math.round(performance.now()) };
    document.documentElement.setAttribute("data-readiness-revealed", `${reason}@${revealed.current.at}`);   // read by the inline deadline script, and a plain record of what happened
    setReady(true); setDone(true);
  }, [setReady]);

  // the hard deadline: independent of everything else in this file
  useEffect(() => {
    const root = document.documentElement, fromScript = Number(root.getAttribute("data-readiness-t0"));
    root.removeAttribute("data-readiness-t0");
    root.setAttribute("data-readiness-react", "");                                  // React is up: the inline script stands down and lets the normal fade run
    const start = Number.isFinite(fromScript) && root.hasAttribute("data-readiness-ssr") ? fromScript : performance.now();   // hard load: when the page was requested (script); route change: now
    const t = setTimeout(() => reveal("timeout"), Math.max(0, start + hardTimeoutMs - performance.now()));
    return () => { clearTimeout(t); root.removeAttribute("data-readiness-revealed"); root.removeAttribute("data-readiness-forced"); root.removeAttribute("data-readiness-react"); };
  }, [hardTimeoutMs, reveal]);

  // real asset readiness: the normal way in
  useEffect(() => {
    let alive = true, beat: ReturnType<typeof setTimeout> | undefined;
    let latest: Snapshot | null = null;
    const flush = () => { raf.current = 0; if (alive && latest) setSnap(latest); };      // a short timer, not rAF: a hidden tab does not run rAF, and the bar should still be right when it is shown again
    const q = new URLSearchParams(location.search), debug = q.has("readiness-debug");       // ?readiness-debug: keep a timeline, expose the tracker and allow other bounds, for testing only
    const num = (k: string) => { const v = Number(q.get(k)); return v > 0 ? v : undefined; };
    const over: Partial<ReadinessConfig> = debug ? Object.fromEntries(Object.entries({ perAssetMs: num("readiness-per"), overallMs: num("readiness-overall"), criticalViewports: num("readiness-critical"), discoveryMaxMs: num("readiness-discovery"), quietMs: num("readiness-quiet") }).filter(([, v]) => v !== undefined)) : {};
    const log: unknown[] = [];
    if (debug && q.has("readiness-hangfonts") && document.fonts) (document.fonts as unknown as { load: () => Promise<never> }).load = () => new Promise<never>(() => {});   // test only: font loads that never answer
    let tracker: ReadinessTracker | null = null;
    try {
      tracker = new ReadinessTracker({ ...cfg, ...over });
      const off = tracker.subscribe(s => {
        latest = s; if (!raf.current) raf.current = window.setTimeout(flush, 50);
        if (debug) log.push({ t: s.elapsed, nav: Math.round(performance.now()), p: s.progress, phase: s.phase, ready: s.ready, total: s.total, failed: s.failed, timedOut: s.timedOut });
      });
      tracker.whenDone(s => {
        latest = s; setSnap(s);
        beat = setTimeout(() => { if (alive) reveal("ready"); }, reduceRef.current ? 120 : 320);   // the existing visual beat, after (never instead of) readiness
      });
      if (debug) (window as unknown as { __readiness?: unknown }).__readiness = { snapshot: () => tracker!.snapshot(), config: tracker.config, log, revealedAt: () => revealed.current?.at ?? -1, reason: () => revealed.current?.reason ?? null };
      tracker.start();
      return () => { alive = false; off(); tracker!.destroy(); if (raf.current) clearTimeout(raf.current); if (beat) clearTimeout(beat); };
    } catch (e) {
      console.error("[readiness] tracker failed; the hard deadline still applies", e);
      return () => { alive = false; };
    }
  }, [cfg, reveal]);

  const progress = snap?.progress ?? 0, phase = snap?.phase ?? "discovering";
  return (
    <>
    {/* Runs as soon as the server-rendered HTML is parsed, before any bundle: records the start of the loading experience and, at the deadline, hides the overlay itself if nothing else has revealed the
        page by then, with a short fade and without ever blocking pointer events (React, once it is up, sees the start time and the revealed mark and carries on from there). */}
    <script dangerouslySetInnerHTML={{ __html: `(function(){var h=document.documentElement,n=performance.now();h.setAttribute("data-readiness-ssr","");h.setAttribute("data-readiness-t0",String(n));setTimeout(function(){if(h.getAttribute("data-readiness-revealed")||h.getAttribute("data-readiness-react"))return;var e=document.querySelector("[data-readiness-loader]");if(e){e.style.pointerEvents="none";e.style.transition="opacity .35s ease";e.style.opacity="0";setTimeout(function(){e.style.display="none"},400)}h.setAttribute("data-readiness-forced",String(Math.round(performance.now())))},Math.max(0,${hardTimeoutMs}-n))})();` }} />
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          data-readiness-loader=""
          data-readiness-ignore=""
          data-readiness-state={phase}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 10000,
            background: "#0d0d0d",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 36,
          }}
        >
          <motion.img
            src="/images/logo.png"
            alt="Ritam Biswas"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: 36, height: 36, objectFit: "contain" }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 140 }}>
            <div
              role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-valuetext={`${progress}%. ${STATUS[phase]}`}
              style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}
            >
              <div style={{ height: "100%", width: `${progress}%`, background: "rgba(255,255,255,0.7)", borderRadius: 8, transition: reduce ? "none" : "width 0.05s linear" }} />
            </div>
            <span aria-hidden="true" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>
              {String(progress).padStart(3, "0")}
            </span>
          </div>
          <span role="status" aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>{STATUS[phase]}</span>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
