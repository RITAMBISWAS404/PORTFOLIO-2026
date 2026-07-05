"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
interface ThemeCtx { theme: Theme; toggle: () => void; }
const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children, defaultTheme = "dark", experimentalPalette = false }: { children: React.ReactNode; defaultTheme?: Theme; experimentalPalette?: boolean }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Restore from localStorage on first mount
  useEffect(() => {
    const saved = localStorage.getItem("portfolio-theme-v2") as Theme | null;
    if (saved === "light" || saved === "dark") setTheme(saved);
  }, []);

  // Apply to <html data-theme="..."> so CSS vars cascade everywhere
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    // When navigating away from /new, restore dark default
    return () => { document.documentElement.removeAttribute("data-theme"); };
  }, [theme]);

  // Scope the experimental /new palette to <body> too, so the reserved
  // nav-offset strip above <main> (body's own padding-top) also gets it.
  useEffect(() => {
    if (!experimentalPalette) return;
    document.body.classList.add("new-palette");
    return () => { document.body.classList.remove("new-palette"); };
  }, [experimentalPalette]);

  const toggle = () => setTheme(t => {
    const next = t === "dark" ? "light" : "dark";
    localStorage.setItem("portfolio-theme-v2", next);
    return next;
  });

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
