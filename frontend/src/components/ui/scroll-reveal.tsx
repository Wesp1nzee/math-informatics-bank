"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement for the `.reveal` class.
 *
 * A single observer instance handles every `.reveal` element on the page.
 * Content stays in the server-rendered HTML with its original semantics (no
 * wrapper elements), and the hidden state is only applied when the `js` class
 * is present on `<html>` (see `globals.css` and the inline script in the root
 * layout). If JavaScript never runs, everything is simply visible.
 */
export function ScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (elements.length === 0) return;

    const revealAll = () => {
      for (const element of elements) element.dataset.revealIn = "";
    };

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealIn = "";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return null;
}
