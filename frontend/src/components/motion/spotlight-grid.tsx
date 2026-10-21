"use client";

import { useEffect, useRef, type ReactNode } from "react";

import {
  hasFinePointer,
  useMotionAllowed,
} from "@/components/motion/use-motion-allowed";
import { cn } from "@/lib/utils/cn";

/**
 * One delegated pointermove listener for the whole grid. Cards receive CSS
 * variables for the spotlight and a very small (max 4deg) tilt.
 */
export function SpotlightGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed();

  useEffect(() => {
    const container = ref.current;
    if (!container || !allowed || !hasFinePointer()) return;

    const onMove = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>("[data-spotlight-card]");
      if (!card || !container.contains(card)) return;

      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const nx = (x / Math.max(rect.width, 1) - 0.5) * 2;
      const ny = (y / Math.max(rect.height, 1) - 0.5) * 2;

      card.style.setProperty("--mx", `${x.toFixed(1)}px`);
      card.style.setProperty("--my", `${y.toFixed(1)}px`);
      card.style.setProperty("--rx", `${(-ny * 3.2).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${(nx * 3.2).toFixed(2)}deg`);
    };

    const onLeave = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>("[data-spotlight-card]");
      if (!card) return;
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };

    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerout", onLeave, { passive: true });

    return () => {
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerout", onLeave);
    };
  }, [allowed]);

  return (
    <div ref={ref} className={cn("spotlight-scope", className)}>
      {children}
    </div>
  );
}
