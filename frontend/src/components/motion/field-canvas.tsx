"use client";

import { useEffect, useRef, useState } from "react";

import {
  isDataSaverOn,
  isWeakDevice,
  supportsWebGL2,
  useMotionAllowed,
} from "@/components/motion/use-motion-allowed";
import type { FieldRenderer, FieldVariant } from "@/components/motion/field-shader";
import { cn } from "@/lib/utils/cn";

type FieldCanvasProps = {
  variant?: FieldVariant;
  className?: string;
};

const MAX_DPR = 1.75;
const COARSE_DPR = 1.25;

export function FieldCanvas({ variant = "quiet", className }: FieldCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const motionAllowed = useMotionAllowed();

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    if (!motionAllowed || isDataSaverOn() || isWeakDevice() || !supportsWebGL2()) {
      return;
    }

    let disposed = false;
    let renderer: FieldRenderer | null = null;
    let frameId = 0;
    let visible = false;
    let booted = false;
    let scale = 1;
    let lastTime = 0;
    let averageDelta = 16.7;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let targetX = 0.5;
    let targetY = 0.5;
    let scroll = 0;
    let targetScroll = 0;
    const pointerFine = window.matchMedia("(pointer: fine)").matches;
    let hostRect = host.getBoundingClientRect();

    const dpr = () =>
      Math.min(
        window.devicePixelRatio || 1,
        pointerFine ? MAX_DPR : COARSE_DPR,
      );

    const size = () => {
      if (!renderer) return;
      renderer.resize(host.clientWidth, host.clientHeight, dpr() * scale);
    };

    const frame = (now: number) => {
      if (!renderer || disposed) return;
      if (!lastTime) lastTime = now;
      const delta = Math.min(now - lastTime, 64);
      lastTime = now;
      averageDelta = averageDelta * 0.92 + delta * 0.08;

      if (averageDelta > 23 && scale > 0.62) {
        scale = Math.max(0.62, scale * 0.88);
        size();
      }

      if (!pointerFine) {
        const t = now * 0.00022;
        targetX = 0.5 + Math.sin(t * 1.7) * 0.34;
        targetY = 0.5 + Math.cos(t * 1.1) * 0.28;
      }

      pointerX += (targetX - pointerX) * 0.055;
      pointerY += (targetY - pointerY) * 0.055;
      scroll += (targetScroll - scroll) * 0.08;

      renderer.frame({
        time: now * 0.001,
        pointer: { x: pointerX, y: pointerY },
        scroll,
      });
      frameId = window.requestAnimationFrame(frame);
    };

    const start = () => {
      if (disposed || !visible || !renderer) return;
      if (document.visibilityState === "hidden") return;
      lastTime = 0;
      frameId = window.requestAnimationFrame(frame);
    };

    const stop = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
    };

    const teardownRenderer = () => {
      stop();
      renderer?.dispose();
      renderer = null;
      setReady(false);
    };

    const boot = async () => {
      if (booted || disposed) return;
      booted = true;
      try {
        const fieldModule = await import("@/components/motion/field-shader");
        if (disposed || !visible) {
          booted = false;
          return;
        }
        fieldModule.stopActiveField();
        renderer = fieldModule.createFieldRenderer(canvas, {
          variant,
          colors: fieldModule.readFieldColors(host),
        });
        if (!renderer) {
          booted = false;
          return;
        }
        hostRect = host.getBoundingClientRect();
        size();
        // Paint one frame before revealing the canvas: the CSS fallback never
        // flashes into an empty or black rectangle.
        renderer.frame({ time: 0, pointer: { x: 0.5, y: 0.5 }, scroll: 0 });
        setReady(true);
        start();
      } catch {
        booted = false;
      }
    };

    const activate = () => {
      visible = true;
      if (!booted) void boot();
      else start();
    };

    const deactivate = () => {
      visible = false;
      // Free the GL context while the field is out of view: one active field max.
      teardownRenderer();
      booted = false;
    };

    const onPointer = (event: PointerEvent) => {
      hostRect = host.getBoundingClientRect();
      targetX = Math.min(
        1,
        Math.max(0, (event.clientX - hostRect.left) / Math.max(hostRect.width, 1)),
      );
      targetY = Math.min(
        1,
        Math.max(0, 1 - (event.clientY - hostRect.top) / Math.max(hostRect.height, 1)),
      );
    };

    const onScroll = () => {
      targetScroll = window.scrollY / Math.max(window.innerHeight, 1);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") stop();
      else if (visible) start();
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) activate();
              else deactivate();
            },
            { rootMargin: "160px 0px", threshold: 0.01 },
          );

    observer?.observe(host);

    if (!observer) {
      visible = true;
      void boot();
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => {
            hostRect = host.getBoundingClientRect();
            size();
          });
    resizeObserver?.observe(host);

    const onTheme = () => {
      if (!visible) return;
      teardownRenderer();
      booted = false;
      void boot();
    };

    const themeObserver = new MutationObserver(onTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    colorScheme.addEventListener("change", onTheme);

    if (pointerFine) window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    onScroll();

    return () => {
      disposed = true;
      stop();
      observer?.disconnect();
      resizeObserver?.disconnect();
      themeObserver.disconnect();
      colorScheme.removeEventListener("change", onTheme);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer?.dispose();
      renderer = null;
    };
  }, [motionAllowed, variant]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      data-field={variant}
      data-field-ready={ready ? "" : undefined}
      className={cn("field-canvas", className)}
    >
      <div className="field-fallback" />
      <canvas ref={canvasRef} className="field-surface" />
      <div className="field-grain" />
    </div>
  );
}
