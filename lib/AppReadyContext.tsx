"use client";
import { createContext, useContext, useState } from "react";

const Ctx = createContext<{ ready: boolean; setReady: (v: boolean) => void }>({
  ready: false, setReady: () => {},
});

export function AppReadyProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  return <Ctx.Provider value={{ ready, setReady }}>{children}</Ctx.Provider>;
}

export const useAppReady = () => useContext(Ctx);
