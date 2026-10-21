"use client";

import { useSyncExternalStore } from "react";

import {
  getMotionPreference,
  subscribeMotion,
  type MotionPreference,
} from "@/lib/motion";

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReduced(onStoreChange: () => void): () => void {
  const mediaQuery = window.matchMedia(REDUCED_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);
  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getReduced(): boolean {
  return window.matchMedia(REDUCED_QUERY).matches;
}

function getReducedServer(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReduced, getReduced, getReducedServer);
}

export function useMotionPreference(): MotionPreference {
  return useSyncExternalStore(
    subscribeMotion,
    getMotionPreference,
    (): MotionPreference => "on",
  );
}

/**
 * One switch for CSS cycles, scroll scenes, shaders and pointer effects.
 * The OS-level preference always wins over the in-page toggle.
 */
export function useMotionAllowed(): boolean {
  const preference = useMotionPreference();
  const reduced = usePrefersReducedMotion();
  return preference === "on" && !reduced;
}

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

export function isDataSaverOn(): boolean {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as NavigatorWithHints).connection?.saveData);
}

export function isWeakDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency;
  const memory = (navigator as NavigatorWithHints).deviceMemory;
  return (typeof cores === "number" && cores <= 4) || (typeof memory === "number" && memory <= 4);
}

export function supportsWebGL2(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}
