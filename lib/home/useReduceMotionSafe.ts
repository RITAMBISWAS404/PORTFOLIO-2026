"use client";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const subscribe = () => () => {};

/**
 * The visitor's Reduce Motion preference, for anything that changes what is RENDERED (inline styles, reveal state).
 * framer-motion's useReducedMotion() already returns the real preference on the very first client render, so a visitor with Reduce Motion on hydrates with different props than the server
 * rendered (which assumes "no preference"). React does not patch attributes that differ during hydration, so server-rendered inline styles (opacity 0, offsets) would stay forever.
 * This hook reports false while hydrating (what the server rendered) and the real preference immediately afterwards, so the props change and React updates the DOM.
 */
export function useReduceMotionSafe(): boolean {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const reduce = !!useReducedMotion();
  return hydrated && reduce;
}
