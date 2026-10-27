"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

const SPRING = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * Pointer-driven tilt (≤ 6°) for showcase cards.
 *
 * - Fine pointers: magnetic tilt + specular glare under the cursor.
 * - Coarse pointers: touch tilt while dragging only. Scroll-linked tilt was
 *   removed because it forced a style pass for every card on every frame.
 *
 * Only CSS custom properties are written from rAF callbacks, so the compositor
 * handles transform/opacity. Reduced motion opts out entirely.
 */
export function TiltCard({
  children,
  className,
  max = 5,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
    const touchMax = Math.min(max, 4.5);

    let frame = 0;
    let touching = false;

    const setTilt = (rx: number, ry: number) => {
      el.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
    };

    const setGlare = (x: number, y: number, opacity: number) => {
      el.style.setProperty("--glare-x", `${x.toFixed(1)}%`);
      el.style.setProperty("--glare-y", `${y.toFixed(1)}%`);
      el.style.setProperty("--glare-opacity", opacity.toFixed(3));
    };

    const reset = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setTilt(0, 0);
        setGlare(50, 50, 0);
      });
    };

    const fromPointer = (event: PointerEvent, limit: number) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const clampedX = Math.min(1, Math.max(0, px));
      const clampedY = Math.min(1, Math.max(0, py));
      const rx = (0.5 - clampedY) * 2 * limit;
      const ry = (clampedX - 0.5) * 2 * limit;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setTilt(rx, ry);
        setGlare(clampedX * 100, clampedY * 100, coarse ? 0.22 : 0.3);
      });
    };

    if (!coarse) {
      const onMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
        fromPointer(event, max);
      };
      const onLeave = () => reset();

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        cancelAnimationFrame(frame);
      };
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      touching = true;
      fromPointer(event, touchMax);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!touching || event.pointerType === "mouse") return;
      fromPointer(event, touchMax);
    };

    const release = () => {
      touching = false;
      reset();
    };

    /*
     * No scroll-linked tilt on touch devices: each card used to subscribe to
     * window scroll, read its rect and rewrite five custom properties every
     * frame. Touch drag still tilts the card while the finger is down.
     */
    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerup", release, { passive: true });
    el.addEventListener("pointercancel", release, { passive: true });
    el.addEventListener("pointerleave", release, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
      el.removeEventListener("pointerleave", release);
      cancelAnimationFrame(frame);
    };
  }, [max, reduceMotion]);

  return (
    <div
      ref={ref}
      className={cn("tilt-card", className)}
      style={{
        transition: `transform 260ms ${SPRING}`,
      }}
    >
      {children}
      <span className="tilt-glare" aria-hidden="true" />
    </div>
  );
}
