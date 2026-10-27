"use client";

import { useEffect } from "react";

import { setWorldState } from "@/features/world/bus";

/**
 * Maps the section currently crossing the middle of the viewport to a named
 * world state. Used by the landing pages so the mobile 2.5D fallback (and the
 * WebGL canvas when present) changes hue as the reader moves through the page.
 */
export function useWorldSections(): void {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-world-state]"),
    );
    if (sections.length === 0) return;

    const activate = (element: HTMLElement) => {
      const state = element.dataset.worldState;
      if (state) setWorldState(state);
    };

    activate(sections[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) activate(visible.target as HTMLElement);
      },
      { rootMargin: "-32% 0px -46% 0px", threshold: [0, 0.1, 0.35, 0.6] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);
}
