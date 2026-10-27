"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const OFFSET = 24;

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (all.length === 0) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      for (const element of all) {
        element.dataset.revealIn = "";
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          element.style.filter = "none";
          element.style.willChange = "auto";
        }
      }
      return;
    }

    const pending = new Set(all);
    let frame = 0;

    const groups = new Map<Element, number>();
    for (const element of all) {
      const parent = element.parentElement ?? document.body;
      const index = groups.get(parent) ?? 0;
      groups.set(parent, index + 1);
      if (!element.style.getPropertyValue("--stagger-index")) {
        element.style.setProperty("--stagger-index", String(Math.min(index, 6)));
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -6% 0px" },
    );

    function finish(element: HTMLElement) {
      element.style.filter = "none";
      element.style.willChange = "auto";
      element.dataset.revealed = "";
    }

    function reveal(element: HTMLElement) {
      if (!pending.delete(element)) return;
      element.dataset.revealIn = "";
      observer.unobserve(element);

      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== element) return;
        if (event.propertyName !== "filter") return;
        element.removeEventListener("transitionend", onTransitionEnd);
        finish(element);
      };
      element.addEventListener("transitionend", onTransitionEnd);
      window.setTimeout(() => finish(element), 1100);

      if (pending.size === 0) detach();
    }

    function flush() {
      frame = 0;
      const limit = window.innerHeight - OFFSET;
      for (const element of Array.from(pending)) {
        if (element.getBoundingClientRect().top < limit) reveal(element);
      }
    }

    function schedule() {
      if (frame === 0) frame = window.requestAnimationFrame(flush);
    }

    function detach() {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
    }

    function rescan() {
      for (const element of document.querySelectorAll<HTMLElement>(".reveal")) {
        if (element.dataset.revealIn !== undefined || pending.has(element)) continue;
        pending.add(element);
        observer.observe(element);
      }
    }

    for (const element of pending) observer.observe(element);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const timers = [250, 800, 1800].map((delay) => window.setTimeout(rescan, delay));

    flush();

    return () => {
      for (const timer of timers) window.clearTimeout(timer);
      detach();
    };
  }, [pathname]);

  return null;
}
