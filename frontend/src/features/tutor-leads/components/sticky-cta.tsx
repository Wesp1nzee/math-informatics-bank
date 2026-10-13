"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { REQUEST_PATH } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

/** Sticky CTA is only useful where a "warm" moment exists. */
function isRelevantPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return pathname.startsWith("/zadachi/") || pathname.startsWith("/articles/");
}

/**
 * Mobile-only sticky request bar. It appears after the visitor scrolls past the
 * first screen and hides as soon as a lead form enters the viewport, so it never
 * covers the form itself. Layout properties reserve space at the end of the
 * document and respect the safe area on notched devices.
 */
export function StickyCta() {
  const pathname = usePathname();
  const relevant = isRelevantPath(pathname);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    if (!relevant) return;

    const onScroll = () => setScrolledPast(window.scrollY > 360);
    window.addEventListener("scroll", onScroll, { passive: true });
    const frame = window.requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [relevant]);

  useEffect(() => {
    if (!relevant) return;

    const forms = Array.from(document.querySelectorAll("[data-lead-form]"));
    if (forms.length === 0) {
      const frame = window.requestAnimationFrame(() => setFormVisible(false));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setFormVisible(entries.some((entry) => entry.isIntersecting));
      },
      { rootMargin: "0px 0px -15% 0px", threshold: 0.1 },
    );
    for (const form of forms) observer.observe(form);
    return () => observer.disconnect();
  }, [relevant, pathname]);

  if (!relevant) return null;

  const visible = scrolledPast && !formVisible;

  return (
    <div className="md:hidden">
      <div aria-hidden className="h-20" />
      {visible ? (
        <nav
          aria-label="Быстрая запись на пробное"
          className={cn(
            "border-line bg-canvas/95 fixed inset-x-0 bottom-0 z-40 border-t px-4 pt-3 backdrop-blur-[14px]",
            "pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
          )}
        >
          <Link
            href={REQUEST_PATH}
            className="bg-accent hover:bg-accent-strong flex min-h-12 items-center justify-center gap-2 rounded-md text-base font-medium text-white transition-colors"
          >
            Записаться на пробное
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
