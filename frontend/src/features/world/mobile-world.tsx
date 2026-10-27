"use client";

import { useSyncExternalStore } from "react";

import { WorldFallback } from "@/features/world/world-fallback";

const QUERY = "(max-width: 767px)";

function subscribe(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Renders the 2.5D fallback only on phones, and only after hydration. This
 * keeps the desktop DOM exactly as it was (WebGL hero untouched) and avoids
 * hydrating a large SVG that is never shown on desktop.
 */
export function MobileWorld() {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isMobile) return null;

  return (
    <div className="lp-mobile-world" aria-hidden="true">
      <WorldFallback density="mobile" />
    </div>
  );
}
