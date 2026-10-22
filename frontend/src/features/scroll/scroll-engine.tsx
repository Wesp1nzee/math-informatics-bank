"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { setWorldState } from "@/features/world/bus";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

/**
 * Shared scroll engine for `/` and `/podgotovka`. Loads Lenis + GSAP +
 * ScrollTrigger + SplitText lazily (after first interaction), wires them
 * together, and drives:
 *  - section → world-state mapping via `[data-world-state]`
 *  - pinned episodes via `[data-pinned]` / `[data-pinned-step]`
 *  - line-based H2 reveals via `[data-split-text]`
 *  - smooth anchor scrolling and scroll-depth analytics
 */

const HEADER_OFFSET = 64;

type ScrollTools = {
  gsap: typeof import("gsap").default;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
  Lenis: typeof import("lenis").default;
};

async function loadTools(): Promise<ScrollTools | null> {
  try {
    const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] =
      await Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("lenis")]);
    gsap.registerPlugin(ScrollTrigger);
    return { gsap, ScrollTrigger, Lenis };
  } catch {
    return null;
  }
}

function isFinePointer(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ScrollEngine() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let disposed = false;
    let lenis: InstanceType<ScrollTools["Lenis"]> | null = null;
    let cleanups: Array<() => void> = [];

    const bootstrap = async () => {
      const tools = await loadTools();
      if (!tools || disposed) return;
      const { gsap, ScrollTrigger, Lenis } = tools;

      // --- Lenis (inertial scroll), fine pointers only --------------------
      if (isFinePointer()) {
        lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, touchMultiplier: 1.4 });
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add((time) => lenis?.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      }

      // --- Anchor scrolling ----------------------------------------------
      const onAnchorClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const anchor = target?.closest?.("a[href^='#']") as HTMLAnchorElement | null;
        if (!anchor) return;
        const hash = anchor.getAttribute("href");
        if (!hash || hash === "#") return;
        const el = document.querySelector<HTMLElement>(hash);
        if (!el) return;
        event.preventDefault();
        const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        if (lenis) lenis.scrollTo(top, { duration: 1.1 });
        else window.scrollTo({ top, behavior: "smooth" });
      };
      document.addEventListener("click", onAnchorClick);
      cleanups.push(() => document.removeEventListener("click", onAnchorClick));

      // --- Section → world state -----------------------------------------
      const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-world-state]"));
      for (const section of sections) {
        const name = section.dataset.worldState;
        if (!name) continue;
        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top 62%",
          end: "bottom 62%",
          onEnter: () => setWorldState(name),
          onEnterBack: () => setWorldState(name),
        });
        cleanups.push(() => trigger.kill());
      }

      // --- Pinned episodes ------------------------------------------------
      // Pinned episodes manage their own GSAP ScrollTrigger pin inside the
      // `PinnedEpisode` client component (scoped with gsap.context so the pin
      // is reverted before React unmounts it on navigation). Nothing to do
      // here.

      // --- H2 reveal ------------------------------------------------------
      // Whole-element reveal (transform/opacity only) — no DOM splitting,
      // which keeps React's reconciliation intact across client navigations.
      const headings = Array.from(document.querySelectorAll<HTMLElement>("[data-split-text]"));
      for (const heading of headings) {
        gsap.from(heading, {
          y: 26,
          opacity: 0,
          duration: 0.75,
          ease: "expo.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 86%",
            once: true,
          },
        });
      }

      // --- Scroll depth analytics -----------------------------------------
      const depthRef = { half: false, ninety: false };
      const onDepthScroll = () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        const ratio = window.scrollY / max;
        if (!depthRef.half && ratio >= 0.5) {
          depthRef.half = true;
          track(ANALYTICS_EVENTS.scrollDepth, { depth: 50 });
        }
        if (!depthRef.ninety && ratio >= 0.9) {
          depthRef.ninety = true;
          track(ANALYTICS_EVENTS.scrollDepth, { depth: 90 });
        }
      };
      window.addEventListener("scroll", onDepthScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onDepthScroll));

      ScrollTrigger.refresh();
    };

    // Defer heavy work until the page has settled or the user interacts.
    let started = false;
    const start = () => {
      if (started || disposed) return;
      started = true;
      void bootstrap();
    };
    if (document.readyState === "complete") {
      const idle = (window as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
      if (typeof idle === "function") idle(start);
      else window.setTimeout(start, 250);
    } else {
      window.addEventListener("load", start, { once: true });
    }
    window.addEventListener("scroll", start, { once: true, passive: true });
    window.addEventListener("pointerdown", start, { once: true, passive: true });

    return () => {
      disposed = true;
      for (const fn of cleanups) fn();
      cleanups = [];
      lenis?.destroy();
      lenis = null;
    };
  }, [pathname]);

  return null;
}
