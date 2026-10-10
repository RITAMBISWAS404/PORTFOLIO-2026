"use client";
// The Courier: ONE cursor character (same silhouette + pill as You / Clippy / the Restockers, via CursorBody) in its own vermilion. It is only ever drawn by
// courierController.ts while it delivers a section heading's icon; here it is just the (invisible, clipped) layer it lives in. The layer is absolute inside <main>
// with overflow hidden, so the Courier can come from beyond any edge without ever creating horizontal page overflow, and it scrolls WITH the page while it works.
import { useEffect, useRef } from "react";
import { CursorBody } from "./Cursor";
import { COURIER } from "@/lib/home/cursorCopy";
import { COURIER_ENABLED, registerCourier } from "./courierController";

export default function Courier() {
  const layer = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null), body = useRef<HTMLDivElement>(null), cargo = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!COURIER_ENABLED || !layer.current || !root.current || !body.current || !cargo.current) return;
    registerCourier({ layer: layer.current, root: root.current, body: body.current, cargo: cargo.current });
    return () => registerCourier(null);
  }, []);
  if (!COURIER_ENABLED) return null;
  return (
    <div ref={layer} className="hm-courier-layer" aria-hidden="true">
      <div ref={root} className="hm-courier">
        <div ref={cargo} className="hm-courier-cargo" />
        <CursorBody ref={body} color={COURIER.color} label={COURIER.name} />
      </div>
    </div>
  );
}
