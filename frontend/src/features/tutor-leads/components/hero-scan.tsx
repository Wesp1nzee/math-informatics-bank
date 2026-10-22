"use client";

import { useEffect } from "react";

import { scanWorld } from "@/features/world/bus";

/** Triggers the single hero scan sweep once, shortly after mount. */
export function HeroScan() {
  useEffect(() => {
    const timer = window.setTimeout(() => scanWorld(), 600);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
