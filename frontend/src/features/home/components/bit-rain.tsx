"use client";

import { useEffect, useRef } from "react";

import { useMotionAllowed } from "@/components/motion/use-motion-allowed";
import { cn } from "@/lib/utils/cn";

/**
 * Very quiet 2D bit rain behind the informatics section. It is deliberately
 * capped at a few percent opacity, pauses offscreen and respects the switch.
 */
export function BitRain({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const allowed = useMotionAllowed();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!allowed) {
      const context = canvas.getContext("2d");
      context?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let columns = 0;
    let drops: number[] = [];
    let frame = 0;
    let visible = false;
    let lastDraw = 0;
    let color = "rgb(120, 140, 220)";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(1, Math.floor(rect.width * dpr));
      height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.width = width;
      canvas.height = height;
      columns = Math.max(6, Math.floor(width / (22 * dpr)));
      drops = Array.from({ length: columns }, () => Math.random() * height);
      color = getComputedStyle(canvas).color || color;
    };

    const draw = (now: number) => {
      if (!visible) return;
      frame = window.requestAnimationFrame(draw);
      if (now - lastDraw < 90) return;
      lastDraw = now;

      context.clearRect(0, 0, width, height);
      context.font = `${12 * Math.min(window.devicePixelRatio || 1, 1.5)}px ui-monospace, monospace`;
      context.fillStyle = color;

      for (let index = 0; index < columns; index += 1) {
        const x = (index + 0.5) * 22 * Math.min(window.devicePixelRatio || 1, 1.5);
        const y = drops[index];
        context.fillText(Math.random() > 0.5 ? "1" : "0", x, y);
        context.globalAlpha = 0.3;
        context.fillText(Math.random() > 0.5 ? "1" : "0", x, Math.max(0, y - 20));
        context.globalAlpha = 1;
        drops[index] = y + 14 > height ? 0 : y + 14;
      }
    };

    const start = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else if (visible) start();
    };

    resize();
    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    resizeObserver?.observe(canvas);

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              visible = entries.some((entry) => entry.isIntersecting);
              if (visible) start();
              else stop();
            },
            { rootMargin: "120px 0px" },
          );
    observer?.observe(canvas);

    if (!observer) {
      visible = true;
      start();
    }

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer?.disconnect();
      resizeObserver?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      context.clearRect(0, 0, width, height);
    };
  }, [allowed]);

  return (
    <canvas ref={canvasRef} aria-hidden="true" className={cn("bit-rain", className)} />
  );
}
