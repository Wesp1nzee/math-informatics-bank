"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  CTA_CONTENT,
  REQUEST_PATH,
  type CtaPlacement,
} from "@/features/tutor-leads/content";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

type TutorCtaProps = {
  placement: CtaPlacement;

  size?: "default" | "compact";
  className?: string;
};

export function TutorCta({ placement, size = "default", className }: TutorCtaProps) {
  const copy = CTA_CONTENT[placement];
  const compact = size === "compact";
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        track(ANALYTICS_EVENTS.ctaView, { placement });
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [placement]);

  return (
    <aside
      ref={ref}
      aria-label={copy.title}
      data-cta-placement={placement}
      className={cn(
        "border-accent/25 bg-accent-soft/60 rounded-xl border",
        compact ? "p-5" : "p-6 md:p-7",
        className,
      )}
    >
      <span className="text-accent mb-2 block text-[12px] font-medium tracking-[0.08em] uppercase">
        {copy.eyebrow}
      </span>
      <p
        className={cn(
          "text-ink font-semibold",
          compact ? "text-base" : "text-lg md:text-xl",
        )}
      >
        {copy.title}
      </p>
      <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">{copy.text}</p>
      <Button asChild size="sm" className="mt-4">
        <Link
          href={REQUEST_PATH}
          onClick={() => track(ANALYTICS_EVENTS.ctaClick, { placement })}
        >
          {copy.action}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </Button>
    </aside>
  );
}
