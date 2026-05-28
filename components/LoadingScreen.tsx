"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppReady } from "@/lib/AppReadyContext";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [done,     setDone]     = useState(false);
  const { setReady } = useAppReady();

  useEffect(() => {
    const DURATION = 1800; // 1.8s fill
    const start = performance.now();

    // Non-linear easing: fast start → slight hesitation mid → confident finish
    const ease = (t: number): number => {
      if (t < 0.55) return t * 1.45;           // fast 0→80%
      if (t < 0.78) return 0.7975 + (t - 0.55) * 0.44; // slow 80→90%
      return 0.9012 + (t - 0.78) * 0.474;      // fast 90→100%
    };

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      setProgress(Math.min(Math.round(ease(t) * 100), 100));
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => { setReady(true); setDone(true); }, 320);
      }
    };

    requestAnimationFrame(tick);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "#0d0d0d",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 36,
          }}
        >
          {/* Logo */}
          <motion.img
            src="/images/logo.png"
            alt="Ritam Biswas"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: 36, height: 36, objectFit: "contain" }}
          />

          {/* Bar + counter */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 140 }}>
            {/* Track */}
            <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "rgba(255,255,255,0.7)",
                borderRadius: 999,
                transition: "width 0.05s linear",
              }}/>
            </div>

            {/* Number */}
            <span style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: 10, fontWeight: 500,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.15em",
            }}>
              {String(progress).padStart(3, "0")}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
