"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const OFFSET = 40;

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const all = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (all.length === 0) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      for (const element of all) element.dataset.revealIn = "";
      return;
    }

    const pending = new Set(all);
    let frame = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      },
      { rootMargin: `0px 0px -${OFFSET}px 0px`, threshold: 0 },
    );

    function reveal(element: HTMLElement) {
      if (!pending.delete(element)) return;
      element.dataset.revealIn = "";
      observer.unobserve(element);
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
