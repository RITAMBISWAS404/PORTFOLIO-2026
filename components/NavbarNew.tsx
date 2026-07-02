"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAnimate, stagger } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/data/content";
import { useAppReady } from "@/lib/AppReadyContext";

export default function NavbarNew() {
  const [active,   setActive]   = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scope, animate] = useAnimate();
  const animated = useRef(false);
  const { ready } = useAppReady();
  const pathname = usePathname();
  const isHome = pathname === "/new" || pathname?.startsWith("/new/");
  const resolveHref = (href: string) => isHome ? href : `/new${href}`;

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
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    if (isMobile || animated.current || !scope.current || !ready) return;
    animated.current = true;
    const run = async () => {
      await animate(scope.current, { y: 0 },      { duration: 0.55, ease: [0.22,1,0.36,1] });
      await animate(scope.current, { width: 720 }, { duration: 0.9,  ease: [0.16,1,0.3,1] });
      animate(".nav-link-new", { opacity: 1, filter: "blur(0px)" }, { duration: 0.3, delay: stagger(0.07) });
    };
    run();
  }, [isMobile, ready, scope.current]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // ─── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          height: 56,
          background: "#222222",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
        }}>
          <a href={resolveHref("#hero")} onClick={closeMenu} style={{
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none",
          }}>
            <img src="/images/logo.png" alt="Ritam Biswas" style={{ width: 19, height: 19, objectFit: "contain" }} />
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

        <nav style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 999,
          background: "#222222",
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
                fontSize: 13, fontWeight: 500,
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

  // ─── DESKTOP ───────────────────────────────────────────────────────────────
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
        background: "#222222",
        borderRadius: 4,
        display: "flex", alignItems: "center", gap: 5,
      }}>
        <a href={resolveHref("#hero")} style={{
          flexShrink: 0, width: 44, height: 44,
          display: "flex", alignItems: "center", justifyContent: "center",
          textDecoration: "none",
        }}>
          <img src="/images/logo.png" alt="Ritam Biswas" style={{ width: 21, height: 21, objectFit: "contain" }} />
        </a>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2, height: 44 }}>
          {navLinks.map(({ label, href }) => {
            const sid = href.replace("#", "");
            const isActive = active === sid || (sid === "featured" && active === "projects");
            return (
              <a key={label} href={resolveHref(href)} className="nav-link-new" style={{
                display: "flex", alignItems: "center",
                height: 34, padding: "0 12px", borderRadius: 4,
                fontSize: 12, fontWeight: 500,
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
