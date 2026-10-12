"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

/**
 * Subtle scroll parallax for the hero visualisation, ported from the original
 * prototype. Updates are batched into a single rAF per scroll burst and the
 * whole effect is skipped when the user prefers reduced motion.
 */
export function HeroParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const progress = Math.min(window.scrollY / 600, 1);
        element.style.transform = `translateY(${progress * -24}px) scale(${1 + progress * 0.04})`;
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      element.style.transform = "";
    };
  }, [reducedMotion]);

  return (
    <div ref={ref} className="origin-[50%_60%] will-change-transform">
      {children}
    </div>
  );
}
