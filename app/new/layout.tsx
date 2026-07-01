"use client";
import { useEffect } from "react";
import { ThemeProvider } from "@/lib/ThemeContext";
import NavbarV2 from "@/components/NavbarV2";

function ForceLight({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    return () => { document.documentElement.removeAttribute("data-theme"); };
  }, []);
  return <>{children}</>;
}

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ForceLight>
        <NavbarV2 />
        {children}
      </ForceLight>
    </ThemeProvider>
  );
}
