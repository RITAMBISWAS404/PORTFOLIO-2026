"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnimate, stagger } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { navLinks } from "@/data/content";
import { useAppReady } from "@/lib/AppReadyContext";
import { useTheme } from "@/lib/ThemeContext";

export default function NavbarV2() {
  const [scrolled,  setScrolled]  = useState(false);
  const [active,    setActive]    = useState("");
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const [scope, animate] = useAnimate();
  const animated = useRef(false);
  const { ready } = useAppReady();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const isHome = pathname === "/new" || pathname === "/new/";
  const resolveHref = (href: string) => isHome ? href : `/${href}`;
  const isLight = theme === "light";

  // Nav is always dark regardless of page theme
  const navBg     = scrolled ? "rgba(12,12,12,0.82)" : "rgba(12,12,12,0.72)";
  const navBorder = scrolled ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)";
  const navShadow = "none";
  const linkActive   = "#ffffff";
  const linkInactive = "rgba(255,255,255,0.42)";
  const linkHover    = "rgba(255,255,255,0.95)";
  const toggleColor  = "rgba(255,255,255,0.45)";
  const toggleHover  = "rgba(255,255,255,0.92)";
  const sepColor     = "rgba(255,255,255,0.10)";
  const logoFilter   = "none";
  // Mobile nav still adapts to theme
  const mobileNavBg     = isLight ? (scrolled ? "rgba(244,243,238,0.92)" : "rgba(244,243,238,0.68)") : (scrolled ? "rgba(10,10,10,0.70)" : "rgba(10,10,10,0.35)");
  const mobileNavBorder = isLight ? (scrolled ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.07)") : (scrolled ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.09)");
  const mobileLinkActive   = isLight ? "#111111" : "#ffffff";
  const mobileLinkInactive = isLight ? "rgba(0,0,0,0.42)" : "rgba(255,255,255,0.42)";
  const mobileToggleColor  = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const mobileLogoFilter   = isLight ? "brightness(0)" : "none";

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const upd = () => setIsMobile(mq.matches);
    upd(); mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section tracker
  useEffect(() => {
    const ids = ["hero","featured","about","process","experience","contact","socials"];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  // Desktop entry animation — waits for loading screen
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
          background: mobileNavBg,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid ${mobileNavBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
          transition: "background 0.3s, border-color 0.3s",
        }}>
          <a href={resolveHref("#hero")} onClick={closeMenu} style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none",
          }}>
            <img src="/images/logo.png" alt="Ritam Biswas" style={{ width: 19, height: 19, objectFit: "contain", filter: mobileLogoFilter, transition: "filter 0.3s" }} />
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* Theme toggle */}
            <button onClick={toggle} aria-label="Toggle theme" style={{
              background: "none", border: "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: mobileToggleColor, padding: 6,
              transition: "color 0.25s",
            }}>
              {theme === "dark" ? <Sun size={18} strokeWidth={1.5}/> : <Moon size={18} strokeWidth={1.5}/>}
            </button>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              style={{
                background: "none", border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: isLight ? "#333" : "#fff", padding: 4,
              }}>
              {menuOpen ? <X size={20} strokeWidth={1.5}/> : <Menu size={20} strokeWidth={1.5}/>}
            </button>
          </div>
        </header>

        {/* Drawer overlay */}
        <div onClick={closeMenu} style={{
          position: "fixed", inset: 0, zIndex: 998,
          background: isLight ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.55)",
          backdropFilter: "blur(2px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          transition: "opacity 0.3s ease",
        }}/>

        {/* Drawer panel */}
        <nav style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 999,
          background: isLight ? "rgba(244,243,238,0.97)" : "rgba(10,10,10,0.97)",
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
          borderBottom: `1px solid ${mobileNavBorder}`,
          padding: "8px 0 8px",
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
                fontSize: 13, fontWeight: 500,
                color: isActive ? mobileLinkActive : mobileLinkInactive,
                letterSpacing: "0.1em", textTransform: "uppercase",
                textDecoration: "none",
                borderBottom: i < navLinks.length - 1
                  ? `1px solid ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}` : "none",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = ""; }}>
                {label}
              </a>
            );
          })}
        </nav>
      </>
    );
  }

  // ─── DESKTOP NAV (floating pill) ───────────────────────────────────────────
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
        background: navBg,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        border: `1px solid ${navBorder}`,
        borderRadius: 18,
        display: "flex", alignItems: "center", gap: 5,
        overflow: "hidden",
        boxShadow: navShadow,
        transition: "background 0.3s, border-color 0.3s",
      }}>
        {/* Logo chip */}
        <a href={resolveHref("#hero")} style={{
          flexShrink: 0, width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
        }}>
          <img src="/images/logo.png" alt="Ritam Biswas" style={{ width: 21, height: 21, objectFit: "contain", filter: logoFilter, transition: "filter 0.3s" }} />
        </a>

        {/* Links + toggle */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, height: 44 }}>
          {navLinks.map(({ label, href }) => {
            const sid = href.replace("#", "");
            const isActive = active === sid || (sid === "featured" && active === "projects");
            return (
              <a key={label} href={resolveHref(href)} className="nav-link" style={{
                display: "flex", alignItems: "center",
                height: 34, padding: "0 12px", borderRadius: 8,
                fontSize: 12, fontWeight: 500,
                color: isActive ? linkActive : linkInactive,
                letterSpacing: "0.08em", textTransform: "uppercase",
                textDecoration: "none", whiteSpace: "nowrap",
                opacity: 0, filter: "blur(4px)",
                transition: "color 0.25s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = linkHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = isActive ? linkActive : linkInactive; }}>
                {label}
              </a>
            );
          })}

          {/* Separator */}
          <div style={{ width: 1, height: 16, background: sepColor, margin: "0 4px", flexShrink: 0 }}/>

          {/* Theme toggle — animates in with nav links via .nav-link class */}
          <button onClick={toggle} className="nav-link" aria-label="Toggle theme" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 8,
            background: "none", border: "none",
            cursor: "pointer",
            color: toggleColor,
            opacity: 0, filter: "blur(4px)",
            fontFamily: "Poppins, sans-serif",
            transition: "color 0.25s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = toggleHover; }}
          onMouseLeave={e => { e.currentTarget.style.color = toggleColor; }}>
            {theme === "dark" ? <Sun size={14} strokeWidth={1.5}/> : <Moon size={14} strokeWidth={1.5}/>}
          </button>
        </div>
      </nav>
    </div>
  );
}
