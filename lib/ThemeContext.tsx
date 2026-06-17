"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
interface ThemeCtx { theme: Theme; toggle: () => void; }
const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

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

  const toggle = () => setTheme(t => {
    const next = t === "dark" ? "light" : "dark";
    localStorage.setItem("portfolio-theme-v2", next);
    return next;
  });

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
