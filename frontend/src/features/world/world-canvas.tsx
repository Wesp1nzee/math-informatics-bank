"use client";

import { useEffect, useRef } from "react";

import { registerWorld, unregisterWorld } from "@/features/world/bus";
import { WorldRenderer } from "@/features/world/renderer/renderer";
import type { WorldPalette } from "@/features/world/types";
import { getThemePreference, subscribeTheme } from "@/lib/theme";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

type WorldStats = {
  avgFrameMs: number;
  dpr: number;
  degradations: number;
  frames: number;
  stopped: boolean;
};

declare global {
  interface Window {
    __worldStats?: WorldStats;
    __worldMode?: string;
  }
}

const CSS_VARS = {
  bg: "--world-bg",
  line: "--world-line",
  lineMajor: "--world-line-major",
  accent: "--world-accent",
  peak: "--world-peak",
  signal: "--world-signal",
  fog: "--world-fog",
} as const;

function readHex(name: string): [number, number, number] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const hex = raw.replace(/^#/, "");
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function readPalette(): WorldPalette {
  return {
    bg: readHex(CSS_VARS.bg),
    line: readHex(CSS_VARS.line),
    lineMajor: readHex(CSS_VARS.lineMajor),
    accent: readHex(CSS_VARS.accent),
    peak: readHex(CSS_VARS.peak),
    signal: readHex(CSS_VARS.signal),
    fog: readHex(CSS_VARS.fog),
  };
}

function isDark(): boolean {
  return getThemePreference() === "dark";
}

function detectSoftwareRenderer(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "";
    const value = String(name).toLowerCase();
    return /swiftshader|llvmpipe|software|basic render/i.test(value);
  } catch {
    return true;
  }
}

function detectWeakDevice(): boolean {
  const cores = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
  const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || mem <= 4;
}

function initialDpr(): number {
  const base = Math.min(window.devicePixelRatio || 1, 1.5);
  return window.innerWidth < 768 ? Math.min(base, 1.25) : base;
}

export function WorldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<WorldRenderer | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const el = canvas;

    let renderer: WorldRenderer | null = null;
    let started = false;
    let disposed = false;

    function init(): void {
      if (started || disposed) return;
      started = true;

      const params = new URLSearchParams(window.location.search);
      const force = params.get("world") === "force";
      const saveData =
        (navigator as { connection?: { saveData?: boolean } }).connection?.saveData === true;

      let mode: string;

      if (saveData) {
        mode = "save-data";
        window.__worldMode = mode;
        return;
      }
      if (!force && detectWeakDevice()) {
        mode = "weak-device";
        window.__worldMode = mode;
        return;
      }
      if (!force && detectSoftwareRenderer()) {
        mode = "software-renderer";
        window.__worldMode = mode;
        return;
      }

      try {
        renderer = new WorldRenderer(el, readPalette(), isDark(), initialDpr());
      } catch {
        mode = "no-webgl";
        window.__worldMode = mode;
        return;
      }

      mode = reducedMotion ? "reduced-motion" : "active";
      window.__worldMode = mode;
      rendererRef.current = renderer;

      const onResize = () => {
        renderer?.resize(window.innerWidth, window.innerHeight);
      };
      onResize();

      const onPointerMove = (event: PointerEvent) => {
        const nx = (event.clientX / window.innerWidth) * 2 - 1;
        const ny = (event.clientY / window.innerHeight) * 2 - 1;
        renderer?.setPointer(nx, ny);
      };
      const onScroll = () => renderer?.resume();
      const onKey = () => renderer?.resume();

      window.addEventListener("resize", onResize, { passive: true });
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("keydown", onKey, { passive: true });

      const unsubscribeTheme = subscribeTheme(() => {
        renderer?.setPalette(readPalette(), isDark());
      });

      registerWorld({
        setState: (name) => renderer?.setState(name),
        pulse: (kind) => renderer?.pulse(kind),
      });

      const statsInterval = window.setInterval(() => {
        if (renderer) window.__worldStats = renderer.stats;
      }, 1000);

      if (reducedMotion) {
        renderer.renderStaticFrame();
      } else {
        renderer.start();
      }

      el.style.opacity = "1";
      // Cleanup.
      const cleanup = () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("keydown", onKey);
        unsubscribeTheme();
        window.clearInterval(statsInterval);
        unregisterWorld();
        renderer?.dispose();
        renderer = null;
        rendererRef.current = null;
      };
      if (disposed) cleanup();
    }

    function scheduleInit(): void {
      const viaIdle = () => {
        const idle = (window as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
        if (typeof idle === "function") idle(() => init(), { timeout: 2500 });
        else window.setTimeout(init, 300);
      };
      const onLoad = () => viaIdle();
      const onFirst = () => init();

      if (document.readyState === "complete") viaIdle();
      else window.addEventListener("load", onLoad, { once: true });

      window.addEventListener("scroll", onFirst, { once: true, passive: true });
      window.addEventListener("pointerdown", onFirst, { once: true, passive: true });
    }

    scheduleInit();

    return () => {
      disposed = true;
      if (renderer) {
        unregisterWorld();
        renderer.dispose();
        rendererRef.current = null;
      }
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="world-canvas"
      style={{ opacity: 0 }}
    />
  );
}
