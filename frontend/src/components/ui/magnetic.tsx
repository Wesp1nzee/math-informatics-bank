"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Subtle magnetic drift (≤ 8px) for primary CTAs, fine-pointer desktops only.
 * Disabled for reduced motion.
 */
export function Magnetic({
  children,
  className,
  strength = 0.22,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const tx = Math.max(-8, Math.min(8, dx * strength));
      const ty = Math.max(-8, Math.min(8, dy * strength));
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = "translate3d(0, 0, 0)";
      });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <span
      ref={ref}
      className={cn("inline-flex", className)}
      style={{ transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      {children}
    </span>
  );
}
