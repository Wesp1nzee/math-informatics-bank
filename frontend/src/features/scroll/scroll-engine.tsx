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
  SplitText: typeof import("gsap/SplitText").SplitText;
  Lenis: typeof import("lenis").default;
};

async function loadTools(): Promise<ScrollTools | null> {
  try {
    const [{ default: gsap }, { ScrollTrigger }, { SplitText }, { default: Lenis }] =
      await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
        import("lenis"),
      ]);
    gsap.registerPlugin(ScrollTrigger, SplitText);
    return { gsap, ScrollTrigger, SplitText, Lenis };
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
      const { gsap, ScrollTrigger, SplitText, Lenis } = tools;

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
      const pinned = Array.from(document.querySelectorAll<HTMLElement>("[data-pinned]"));
      for (const section of pinned) {
        const steps = Array.from(section.querySelectorAll<HTMLElement>("[data-pinned-step]"));
        const states = steps.map((s) => s.dataset.stepState ?? "").filter(Boolean);
        const rail = section.querySelector<HTMLElement>("[data-rail-fill]");
        const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-rail-dot]"));

        const setStep = (index: number) => {
          const clamped = Math.max(0, Math.min(steps.length - 1, index));
          steps.forEach((step, i) => {
            if (i === clamped) step.dataset.active = "";
            else delete step.dataset.active;
          });
          dots.forEach((dot, i) => {
            if (i <= clamped) dot.dataset.active = "";
            else delete dot.dataset.active;
          });
          if (rail) rail.style.transform = `scaleX(${clamped / Math.max(1, steps.length - 1)})`;
          if (states[clamped]) setWorldState(states[clamped]);
        };

        const mm = gsap.matchMedia();
        mm.add(
          "(min-width: 1100px) and (min-height: 700px) and (pointer: fine)",
          () => {
            setStep(0);
            const trigger = ScrollTrigger.create({
              trigger: section,
              start: `top top+=${HEADER_OFFSET}`,
              end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const index = Math.floor(self.progress * steps.length);
                setStep(index === steps.length ? steps.length - 1 : index);
                track(ANALYTICS_EVENTS.pinnedViewed, { steps: steps.length });
              },
            });
            cleanups.push(() => trigger.kill());
          },
        );
        mm.add("(max-width: 1099px), (max-height: 699px), (pointer: coarse)", () => {
          steps.forEach((step, index) => {
            const state = states[index];
            if (!state) return;
            const trigger = ScrollTrigger.create({
              trigger: step,
              start: "top 70%",
              onEnter: () => {
                setStep(index);
                setWorldState(state);
              },
            });
            cleanups.push(() => trigger.kill());
          });
        });
        cleanups.push(() => mm.revert());
      }

      // --- H2 line reveals (SplitText) ------------------------------------
      const headings = Array.from(document.querySelectorAll<HTMLElement>("[data-split-text]"));
      for (const heading of headings) {
        if (typeof SplitText === "undefined") break;
        try {
          const split = new SplitText(heading, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            linesClass: "split-line",
          });
          gsap.from(split.lines, {
            yPercent: 110,
            opacity: 0,
            duration: 0.8,
            ease: "expo.out",
            stagger: 0.06,
            scrollTrigger: {
              trigger: heading,
              start: "top 82%",
              once: true,
            },
          });
          cleanups.push(() => split.revert());
        } catch {
          // SplitText unavailable — leave the heading visible.
        }
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
