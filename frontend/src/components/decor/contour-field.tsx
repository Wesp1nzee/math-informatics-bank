"use client";

import { useEffect, useRef, type CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

const LINES = Array.from({ length: 16 }, (_, index) => {
  const y = 26 + index * 43;
  const amplitude = 24 + (index % 5) * 9;
  const bend = index % 2 === 0 ? 1 : -1;
  return `M-60 ${y} C 150 ${y - amplitude * bend}, 330 ${y + amplitude}, 520 ${y} S 880 ${y - amplitude}, 1260 ${y + amplitude * 0.4}`;
});

/**
 * Static contour map: 16 inline paths, drawn once on first paint, then still.
 * The mask dissolves the lower edge into the page canvas in both themes.
 */
export function ContourField({
  className,
  muted = false,
  parallax = true,
}: {
  className?: string;
  muted?: boolean;
  /** Moves the line work gently against the page scroll (CSS variables). */
  parallax?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion || !parallax) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      element.style.setProperty("--contour-scroll-y", `${window.scrollY.toFixed(1)}px`);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      element.style.setProperty("--contour-scroll-y", "0px");
    };
  }, [parallax, reduceMotion]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
      data-contour-field=""
      className={cn(
        "contour-field",
        muted && "contour-field-muted",
        parallax && "contour-field-parallax",
        className,
      )}
    >
      <defs>
        <linearGradient id="contour-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="contour-mask">
          <rect width="1200" height="700" fill="url(#contour-fade)" />
        </mask>
      </defs>
      <g className="contour-field-lines" mask="url(#contour-mask)">
        {LINES.map((line, index) => (
          <path
            key={line}
            d={line}
            pathLength={1}
            data-contour-path=""
            style={
              {
                "--d": `${index * 55}ms`,
                "--i": index,
              } as CSSProperties
            }
          />
        ))}
      </g>
    </svg>
  );
}
