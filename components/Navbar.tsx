"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAnimate, stagger } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { navLinks } from "@/data/content";
import { C } from "@/lib/tokens";
import { useAppReady } from "@/lib/AppReadyContext";
import { useTheme } from "@/lib/ThemeContext";

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [active,    setActive]    = useState("");
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const [scope, animate] = useAnimate();
  const animated = useRef(false);
  const { ready } = useAppReady();
  const { theme, toggle } = useTheme();

  const logoSrc = theme === "light" ? "/images/light/logo.png" : "/images/logo.png";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const upd = () => setIsMobile(mq.matches);
    upd(); mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ids = ["hero","featured","process","experience","stack","contact","socials"];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (isMobile || animated.current || !scope.current || !ready) return;
    animated.current = true;
    const run = async () => {
      await animate(scope.current, { y: 0 },      { duration: 0.55, ease: [0.22,1,0.36,1] });
      await animate(scope.current, { width: 720 }, { duration: 0.9,  ease: [0.16,1,0.3,1] });
      animate(".nav-link", { opacity: 1, filter: "blur(0px)" }, { duration: 0.3, delay: stagger(0.07) });
    };
    run();
  }, [isMobile, ready, scope.current]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // ─── MOBILE NAV ────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          height: 56,
          background: scrolled ? "var(--nav-mobile-bg-scrolled)" : "var(--nav-mobile-bg)",
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${scrolled ? "var(--nav-mobile-border-scrolled)" : "var(--nav-mobile-border)"}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
          transition: "background 0.3s, border-color 0.3s",
        }}>
          <a href="#hero" onClick={closeMenu} style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none",
          }}>
            <img src={logoSrc} alt="Ritam Biswas" style={{ width: 19, height: 19, objectFit: "contain" }} />
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Theme toggle */}
            <button onClick={toggle} aria-label="Toggle theme"
              style={{ background:"none", border:"none", cursor:"pointer",
                color:"var(--c-t2)", display:"flex", alignItems:"center", padding:4 }}>
              {theme === "dark"
                ? <Sun  size={18} strokeWidth={2} />
                : <Moon size={18} strokeWidth={2} />}
            </button>

            <button onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{ background:"none", border:"none", cursor:"pointer",
                color:"var(--c-t1)", display:"flex", alignItems:"center", padding:4 }}>
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </header>

        {/* Overlay */}
        <div onClick={closeMenu} style={{
          position: "fixed", inset: 0, zIndex: 998,
          background: "var(--nav-overlay)",
          backdropFilter: "blur(2px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity 0.3s ease",
        }} />

        {/* Drawer */}
        <nav style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 999,
          background: "var(--nav-drawer-bg)",
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
          borderBottom: `1px solid var(--nav-drawer-border)`,
          padding: "8px 0 20px",
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "transform 0.3s cubic-bezier(.22,1,.36,1), opacity 0.3s ease",
        }}>
          {navLinks.map(({ label, href }, i) => {
            const sid = href.replace("#", "");
            const isActive = active === sid || (sid === "featured" && active === "projects");
            return (
              <a key={label} href={href} onClick={closeMenu} style={{
                display: "flex", alignItems: "center",
                height: 52, padding: "0 24px",
                fontSize: 13, fontWeight: 500,
                color: isActive ? "var(--nav-link-active)" : "var(--nav-link-mobile)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                textDecoration: "none",
                borderBottom: i < navLinks.length - 1 ? `1px solid var(--nav-link-sep)` : "none",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--c-hover-bg)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                {label}
              </a>
            );
          })}
        </nav>
      </>
    );
  }

  // ─── DESKTOP NAV ───────────────────────────────────────────────────────────
  return (
    <div style={{
      position: "fixed", top: 18, left: 0, right: 0,
      zIndex: 1000, pointerEvents: "none",
      padding: "0 24px", display: "flex", justifyContent: "center",
    }}>
      <nav ref={scope} style={{
        pointerEvents: "all",
        width: 54, height: 54, padding: 5,
        transform: "translateY(-70px)",
        background: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${scrolled ? "var(--nav-border-scrolled)" : "var(--nav-border)"}`,
        borderRadius: 16,
        display: "flex", alignItems: "center", gap: 5,
        overflow: "hidden",
        boxShadow: scrolled ? "var(--nav-shadow)" : "none",
        transition: "background 0.25s, border-color 0.25s, box-shadow 0.25s",
      }}>
        {/* Logo */}
        <a href="#hero" style={{
          flexShrink: 0, width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
        }}>
          <img src={logoSrc} alt="Ritam Biswas" style={{ width: 21, height: 21, objectFit: "contain" }} />
        </a>

        {/* Links */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, height: 44 }}>
          {navLinks.map(({ label, href }) => {
            const sid = href.replace("#", "");
            const isActive = active === sid || (sid === "featured" && active === "projects");
            return (
              <a key={label} href={href} className="nav-link" style={{
                display: "flex", alignItems: "center",
                height: 34, padding: "0 12px", borderRadius: 8,
                fontSize: 12, fontWeight: 500,
                color: isActive ? "var(--nav-link-active)" : "var(--nav-link)",
                letterSpacing: "0.08em", textTransform: "uppercase",
                textDecoration: "none", whiteSpace: "nowrap",
                opacity: 0, filter: "blur(4px)",
                transition: "color 0.25s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--nav-link-active)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = isActive ? "var(--nav-link-active)" : "var(--nav-link)"; }}>
                {label}
              </a>
            );
          })}

          {/* Theme toggle */}
          <button className="nav-link" onClick={toggle} aria-label="Toggle theme"
            style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: "transparent",
              border: `1px solid var(--nav-border)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--c-t2)",
              opacity: 0, filter: "blur(4px)",
              transition: "background 0.2s, color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background = "var(--c-hover-bg)"; b.style.color = "var(--c-t1)"; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background = "transparent"; b.style.color = "var(--c-t2)"; }}>
            {theme === "dark"
              ? <Sun  size={13} strokeWidth={2} />
              : <Moon size={13} strokeWidth={2} />}
          </button>
        </div>
      </nav>
    </div>
  );
}
