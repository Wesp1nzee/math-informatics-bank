"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { REQUEST_PATH } from "@/features/tutor-leads/content";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

function isRelevantPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/podgotovka") return true;
  return pathname.startsWith("/zadachi/") || pathname.startsWith("/articles/");
}

export function StickyCta() {
  const pathname = usePathname();
  const relevant = isRelevantPath(pathname);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const viewedRef = useRef(false);

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
    if (forms.length === 0 || typeof IntersectionObserver === "undefined") {
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

  const visible = scrolledPast && !formVisible;

  useEffect(() => {
    if (!visible || viewedRef.current) return;
    viewedRef.current = true;
    track(ANALYTICS_EVENTS.ctaView, { placement: "sticky-mobile" });
  }, [visible]);

  if (!relevant) return null;

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
            onClick={() =>
              track(ANALYTICS_EVENTS.ctaClick, { placement: "sticky-mobile" })
            }
            className="bg-accent-surface hover:bg-accent-surface-hover flex min-h-12 items-center justify-center gap-2 rounded-md text-base font-medium text-white transition-colors"
          >
            Записаться на пробное
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
