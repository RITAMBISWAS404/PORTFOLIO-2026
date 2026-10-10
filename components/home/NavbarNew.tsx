"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnimate, stagger } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/data/home-content";
import { useAppReady } from "@/lib/AppReadyContext";

// EXPERIMENT (revert: set NAV_AUTOHIDE to false, or `git checkout components/experiment/NavbarNew.tsx`): on desktop the floating navbar floats out on a deliberate downward scroll
// and back in on a deliberate upward one. Mobile is untouched: the effect below never runs there and the mobile header has no hook into it.
// Detection works on GESTURES: movement is accumulated only while the page keeps scrolling (a gesture ends after GESTURE_GAP_MS of stillness), a reversal restarts the count, and the
// two directions have different thresholds, so a navbar that has just appeared is not hidden by a nudge and one that has just hidden is not revealed by momentum or wobble.
const NAV_AUTOHIDE = true;
const HIDE_AFTER = 160;       // px: nothing hides above this scroll position
const HIDE_PX = 72;           // px of continuous DOWNWARD movement (one gesture) before it hides
const SHOW_PX = 48;           // px of continuous UPWARD movement (one gesture) before it reappears: coming back is cheaper than leaving
const JITTER_PX = 4;          // a counter-movement smaller than this (trackpad noise) neither switches nor resets the count
const GESTURE_GAP_MS = 140;   // stillness that ends a gesture (the accumulated distance is dropped)
const LOCK_MS = 380;          // after a switch, the opposite switch waits (about the length of the slide), so it can never fight its own transition
const HIDE_MS = 440, HIDE_EASE = "cubic-bezier(.4, 0, .2, 1)";      // a soft departure
const SHOW_MS = 500, SHOW_EASE = "cubic-bezier(.22, 1, .36, 1)";    // the portfolio's usual ease-out: a long, gentle landing (no overshoot)

export default function NavbarNew({ homePath = "/" }: { homePath?: string }) {
  const [active,   setActive]   = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scope, animate] = useAnimate();
  const animated = useRef(false);
  const { ready } = useAppReady();
  const pathname = usePathname();
  const isHome = pathname === homePath || (homePath !== "/" && pathname?.startsWith(`${homePath}/`));
  // Squared-off corners are the live/case-study treatment — /new and /new/zeno keep the rounded pill.
  const isLiveHome = pathname === "/";
  const resolveHref = (href: string) => isHome ? href : `${homePath}${href}`;
  const logoSrc = "/images/logo_light.png";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const upd = () => setIsMobile(mq.matches);
    upd(); mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  useEffect(() => {
    const ids = ["hero","featured","about","process","experience","contact","socials"];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("hm-menu-open", menuOpen);
    return () => document.body.classList.remove("hm-menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (isMobile) { animated.current = false; return; }                  // the desktop pill is unmounted on mobile: its intro has to play again when it comes back, or it would stay collapsed above the viewport
    if (animated.current || !scope.current || !ready) return;
    animated.current = true;
    const run = async () => {
      // the pill can be unmounted between steps (the mobile breakpoint, a remount): each step re-checks, or the chain throws on a null scope
      if (!scope.current) return;
      await animate(scope.current, { y: 0 },      { duration: 0.55, ease: [0.22,1,0.36,1] });
      if (!scope.current) return;
      await animate(scope.current, { width: 720 }, { duration: 0.9,  ease: [0.16,1,0.3,1] });
      if (!scope.current) return;
      animate(".hm-nav-link-new", { opacity: 1, filter: "blur(0px)" }, { duration: 0.3, delay: stagger(0.07) });
    };
    run();
  }, [isMobile, ready, scope.current]);

  // ─── desktop auto-hide (transform on the fixed wrapper; the nav's own framer transform is not touched) ───
  const wrapRef = useRef<HTMLDivElement>(null), afterNav = useRef(false);   // afterNav: a nav link / anchor was just activated
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!NAV_AUTOHIDE || isMobile || !wrap) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // only transform + opacity ever animate; the wrapper's box, and so the layout, never changes
    const slide = (h: boolean) => reduce.matches ? "none" : h ? `transform ${HIDE_MS}ms ${HIDE_EASE}, opacity ${HIDE_MS}ms ${HIDE_EASE}` : `transform ${SHOW_MS}ms ${SHOW_EASE}, opacity ${Math.round(SHOW_MS * 0.7)}ms ease-out`;
    let hidden = false, lastY = window.scrollY, acc = 0, raf = 0, lastSwitch = -1e9, gap: ReturnType<typeof setTimeout> | undefined, settle: ReturnType<typeof setTimeout> | undefined;
    const set = (h: boolean) => {
      if (h === hidden) return;
      hidden = h; lastSwitch = performance.now(); acc = 0;
      wrap.style.transition = slide(h);                                                   // set before the change, so THIS direction's timing is the one used
      wrap.style.transform = h ? "translateY(calc(-100% - 24px))" : "";                 // fully above the viewport: its 18px offset + its own height + a margin
      wrap.style.opacity = h ? "0" : "";
    };
    const focused = () => wrap.contains(document.activeElement);                           // a focused link keeps the navbar up
    const frame = () => {
      raf = 0;
      const y = window.scrollY, dy = y - lastY; lastY = y;
      if (y <= 10) { acc = 0; set(false); return; }                                        // at / near the top (and rubber-band overscroll): always visible
      if (dy === 0) return;
      if (acc !== 0 && Math.sign(dy) !== Math.sign(acc)) {
        if (Math.abs(dy) < JITTER_PX) return;                                              // noise against the gesture: ignored
        acc = 0;                                                                           // a real reversal starts a fresh measurement
      }
      acc += dy;
      if (performance.now() - lastSwitch < LOCK_MS) return;                                // the count keeps building during the lock, so a deliberate gesture responds the moment it ends
      if (acc >= HIDE_PX && y > HIDE_AFTER && !focused()) set(true);
      else if (acc <= -SHOW_PX) set(false);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(frame);
      if (gap) clearTimeout(gap);
      gap = setTimeout(() => { gap = undefined; acc = 0; }, GESTURE_GAP_MS);              // stillness ends the gesture: slow separate nudges never add up
      // after an in-page jump (a nav link, a CTA) has come to rest, float the navbar out so it does not sit over the destination heading
      if (settle) clearTimeout(settle);
      settle = setTimeout(() => { settle = undefined; if (afterNav.current) { afterNav.current = false; if (window.scrollY > HIDE_AFTER && !focused()) set(true); } }, 320);
    };
    const onFocusIn = () => set(false);
    const onMq = () => { wrap.style.transition = slide(hidden); };
    wrap.style.transition = slide(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    wrap.addEventListener("focusin", onFocusIn);
    reduce.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("scroll", onScroll); wrap.removeEventListener("focusin", onFocusIn); reduce.removeEventListener("change", onMq);
      if (raf) cancelAnimationFrame(raf); if (settle) clearTimeout(settle); if (gap) clearTimeout(gap);
      wrap.style.transform = ""; wrap.style.transition = ""; wrap.style.opacity = "";                               // leaving desktop (or reverting): never leave it hidden
    };
  }, [isMobile]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // ─── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          height: 56,
          background: "var(--nav-bg, #222222)",
          backdropFilter: "var(--nav-blur, none)",
          WebkitBackdropFilter: "var(--nav-blur, none)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
        }}>
          <a href={resolveHref("#hero")} onClick={closeMenu} style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none",
          }}>
            <img src={logoSrc} alt="Ritam Biswas" style={{ width: 19, height: 19, objectFit: "contain" }} />
          </a>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            style={{
              background: "none", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff", padding: 4,
            }}>
            {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>
        </header>

        <div onClick={closeMenu} style={{
          position: "fixed", inset: 0, zIndex: 998,
          background: "rgba(0,0,0,0.55)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity 0.3s ease",
        }} />

        <nav inert={!menuOpen} style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 999,
          background: "var(--nav-bg, #222222)",
          backdropFilter: "var(--nav-blur, none)",
          WebkitBackdropFilter: "var(--nav-blur, none)",
          padding: "8px 0",
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s ease",
        }}>
          {navLinks.map(({ label, href }, i) => {
            const sid = href.replace("#", "");
            const isActive = active === sid || (sid === "featured" && active === "projects");
            return (
              <a key={label} href={resolveHref(href)} onClick={closeMenu} style={{
                display: "flex", alignItems: "center",
                height: 52, padding: "0 24px",
                fontSize: 13, fontWeight: 600,
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                textDecoration: "none",
                borderBottom: i < navLinks.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                {label}
              </a>
            );
          })}
        </nav>
      </>
    );
  }

  // ─── DESKTOP: floating pill ─────────────────────────────────────────────────
  return (
    <div ref={wrapRef} onClickCapture={e => { if ((e.target as Element).closest?.('a[href*="#"]')) afterNav.current = true; }} style={{
      position: "fixed", top: 18, left: 0, right: 0,
      zIndex: 1000, pointerEvents: "none",
      padding: "0 24px", display: "flex", justifyContent: "center",
    }}>
      <nav ref={scope} style={{
        pointerEvents: "all",
        width: 54, height: 54, padding: 5,
        transform: "translateY(-70px)",
        background: "var(--nav-bg, #222222)",
        backdropFilter: "var(--nav-blur, none)",
        WebkitBackdropFilter: "var(--nav-blur, none)",
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <a href={resolveHref("#hero")} style={{
          flexShrink: 0, width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
        }}>
          <img src={logoSrc} alt="Ritam Biswas" style={{ width: 21, height: 21, objectFit: "contain" }} />
        </a>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, height: 44 }}>
          {navLinks.map(({ label, href }) => {
            const sid = href.replace("#", "");
            const isActive = active === sid || (sid === "featured" && active === "projects");
            return (
              <a key={label} href={resolveHref(href)} className="hm-nav-link-new" style={{
                display: "flex", alignItems: "center",
                height: 34, padding: "0 12px", borderRadius: isLiveHome ? 0 : 8,
                fontSize: 12, fontWeight: 600,
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.42)",
                letterSpacing: "0.08em", textTransform: "uppercase",
                textDecoration: "none", whiteSpace: "nowrap",
                opacity: 0, filter: "blur(4px)",
                transition: "color 0.25s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.95)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = isActive ? "#ffffff" : "rgba(255,255,255,0.42)"; }}>
                {label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
