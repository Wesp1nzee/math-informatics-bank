"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Button, ButtonArrow } from "@/components/ui/button";
import { REQUEST_PATH } from "@/features/tutor-leads/content";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";

/**
 * Tracked primary CTA that leads to the request form. Client leaf so the
 * click handler is serializable-safe.
 */
export function RequestCta({
  placement,
  href = REQUEST_PATH,
  variant = "primary",
  size,
  className,
  arrow = true,
  children,
}: {
  placement: string;
  href?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
  arrow?: boolean;
  children: ReactNode;
}) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link
        href={href}
        onClick={() => track(ANALYTICS_EVENTS.ctaClick, { placement })}
      >
        {children}
        {arrow ? <ButtonArrow /> : null}
      </Link>
    </Button>
  );
}
