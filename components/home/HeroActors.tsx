"use client";
// The autonomous visitors of the Hero pegboard. They use the SAME cursor silhouette and pill as the visitor's own pointer (Cursor.tsx) and
// differ only in colour, name and what the pill says (vocabularies in lib/home/cursorCopy.ts):
//   Clippy       cheeky: says something as it approaches an object and something else as it takes hold
//   Restocker N  sarcastic but helpful: speaks while carrying an object in and again once it has actually been set down
// They are NOT pointers: pointer-events:none, invisible unless mid-action, moved by the director with motion values. Their pill text is theirs
// alone (say / show(false) only touch this actor), so nothing the user's cursor does can change it and vice versa.
import { forwardRef, useImperativeHandle, useRef } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { CursorBody, setPill, snapPx } from "./Cursor";

export type ActorHandle = {
  x: MotionValue<number>; y: MotionValue<number>;
  show: (on: boolean) => void;                  // hiding also restores the identity label
  say: (text: string | null) => void;           // an action phrase, or null for the identity label
  carry: readonly string[];                     // what this visitor says while bringing something in
  placed: readonly string[];                    // what it says once the object is down
};

/** An autonomous visitor. Its (x, y) is the cursor tip, in stage px; the director animates it. */
export const Actor = forwardRef<ActorHandle, { name: string; color: string; carry?: readonly string[]; placed?: readonly string[] }>(function Actor({ name, color, carry = [], placed = [] }, ref) {
  const x = useMotionValue(-1000), y = useMotionValue(-1000);                 // off-board; a value that snaps to itself at common DPRs, so server and client markup agree
  const sx = useTransform(x, snapPx), sy = useTransform(y, snapPx);           // the director drives x / y; what is painted lands on whole device pixels
  const el = useRef<HTMLDivElement>(null), body = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => ({
    x, y, carry, placed,
    show: (on: boolean) => {
      if (on) el.current?.setAttribute("data-on", "1");
      else { el.current?.removeAttribute("data-on"); if (body.current) setPill(body.current, name); }
    },
    say: (text: string | null) => { if (body.current) setPill(body.current, text ?? name); },
  }), [x, y, name, carry, placed]);
  return (
    <motion.div ref={el} className="hm-actor" style={{ x: sx, y: sy }} aria-hidden="true">
      <CursorBody ref={body} color={color} label={name} />
    </motion.div>
  );
});
