"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** SSR and the first client render assume no preference. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Tracks the user's reduced-motion preference.
 *
 * Implemented with `useSyncExternalStore` — the designated React API for
 * subscribing to an external store — so it is SSR-safe and never triggers the
 * "setState inside an effect" anti-pattern.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
