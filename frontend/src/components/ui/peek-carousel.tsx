"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

/**
 * Shared card width for the mobile peek carousel.
 * Apply together with `data-peek-item` so progress dots can find each card.
 */
export const PEEK_ITEM =
  "w-[84vw] max-w-[340px] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink";

type PeekCarouselProps = {
  children: ReactNode;
  count: number;
  className?: string;
  label: string;
  as?: "div" | "ul";
};

/**
 * Swipeable, scroll-snapped rail below 640px. The next card peeks in from the
 * right, and compact progress dots show the active card. At `sm` and above the
 * same children become a regular grid, so desktop layout stays untouched.
 */
export function PeekCarousel({
  children,
  count,
  className,
  label,
  as = "div",
}: PeekCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduceMotion = usePrefersReducedMotion();
  // The runtime element may be a <ul>; refs only use HTMLElement APIs.
  const Tag = as as "div";

  useEffect(() => {
    const track = trackRef.current;
    if (!track || count <= 1) return;

    let frame = 0;

    const measure = () => {
      frame = 0;
      const items = Array.from(track.querySelectorAll<HTMLElement>("[data-peek-item]"));
      if (items.length === 0) return;

      const trackRect = track.getBoundingClientRect();
      const trackCenter = trackRect.left + trackRect.width / 2;
      let nearest = 0;
      let distance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const nextDistance = Math.abs(itemCenter - trackCenter);
        const ratio = Math.min(1, nextDistance / Math.max(1, trackRect.width * 0.85));
        item.style.setProperty("--peek-distance", ratio.toFixed(3));

        if (nextDistance < distance) {
          distance = nextDistance;
          nearest = index;
        }
      });

      items.forEach((item, index) => {
        if (index === nearest) item.dataset.active = "";
        else delete item.dataset.active;
      });

      setActive((current) => (current === nearest ? current : nearest));
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(onScroll) : null;

    measure();
    track.addEventListener("scroll", onScroll, { passive: true });
    observer?.observe(track);
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [count]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const item = track.querySelectorAll<HTMLElement>("[data-peek-item]")[index];
    if (!item) return;

    const trackRect = track.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const left =
      track.scrollLeft +
      itemRect.left -
      trackRect.left -
      (track.clientWidth - itemRect.width) / 2;

    track.scrollTo({
      left,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="w-full min-w-0">
      <Tag
        ref={trackRef}
        aria-label={label}
        role={as === "ul" ? undefined : "group"}
        className={cn(
          "peek-track -mx-4 flex w-full min-w-0 snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden",
          as === "ul" && "m-0 list-none",
          className,
        )}
      >
        {children}
      </Tag>

      {count > 1 ? (
        <div
          className="mt-1 flex items-center justify-center gap-1 sm:hidden"
          role="group"
          aria-label={`${label}: прогресс`}
        >
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Перейти к карточке ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              className="inline-grid size-6 place-items-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block h-1 w-5 origin-center rounded-full transition-[transform,opacity] duration-300",
                  index === active
                    ? "bg-accent scale-x-100"
                    : "bg-line-strong scale-x-[0.3] opacity-70",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
