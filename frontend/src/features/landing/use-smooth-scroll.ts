"use client";

import { useEffect } from "react";
import type Lenis from "lenis";

/**
 * Inertial wheel scrolling for the landing page.
 *
 * Lenis eases every wheel tick instead of jumping the native distance. The
 * easing is deliberately slow (`lerp`) and the wheel step is slightly reduced
 * (`wheelMultiplier`), which makes the page feel like it glides. Touch devices
 * and reduced-motion users keep native scrolling.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let disposed = false;
    let lenis: Lenis | null = null;
    let onAnchorClick: ((event: MouseEvent) => void) | null = null;

    void (async () => {
      try {
        const { default: LenisClass } = await import("lenis");
        if (disposed) return;

        lenis = new LenisClass({
          lerp: 0.075,
          wheelMultiplier: 0.85,
          autoRaf: true,
        });

        // Lenis drives window.scrollTo, but the browser's default anchor jump
        // would skip the animation, so animate hash links ourselves.
        onAnchorClick = (event: MouseEvent) => {
          const anchor = (
            event.target as HTMLElement | null
          )?.closest<HTMLAnchorElement>("a[href^='#']");
          const hash = anchor?.getAttribute("href");
          if (!anchor || !hash || hash === "#") return;

          const target = document.querySelector<HTMLElement>(hash);
          if (!target) return;

          event.preventDefault();
          lenis?.scrollTo(target, { duration: 1.6 });
        };
        document.addEventListener("click", onAnchorClick);
      } catch {
        // Native scrolling remains if Lenis fails to load.
      }
    })();

    return () => {
      disposed = true;
      if (onAnchorClick) document.removeEventListener("click", onAnchorClick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}
