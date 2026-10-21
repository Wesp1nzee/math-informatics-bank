"use client";

import { useEffect, useRef, type ReactNode } from "react";

import {
  hasFinePointer,
  useMotionAllowed,
} from "@/components/motion/use-motion-allowed";
import { cn } from "@/lib/utils/cn";

const MAX_PULL = 8;

/** Magnetic hover for primary actions. Fine pointers only, transform only. */
export function Magnetic({
  children,
  className,
  strength = MAX_PULL,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const allowed = useMotionAllowed();

  useEffect(() => {
    const element = ref.current;
    if (!element || !allowed || !hasFinePointer()) return;

    let frame = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      element.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = window.requestAnimationFrame(render);
      } else {
        frame = 0;
        if (targetX === 0 && targetY === 0) element.style.transform = "";
      }
    };

    const wake = () => {
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      targetX = Math.max(-1, Math.min(1, dx / (rect.width / 2))) * strength;
      targetY = Math.max(-1, Math.min(1, dy / (rect.height / 2))) * strength;
      wake();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    element.addEventListener("blur", onLeave, true);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      element.style.transform = "";
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      element.removeEventListener("blur", onLeave, true);
    };
  }, [allowed, strength]);

  return (
    <span ref={ref} className={cn("magnetic inline-flex", className)}>
      {children}
    </span>
  );
}
