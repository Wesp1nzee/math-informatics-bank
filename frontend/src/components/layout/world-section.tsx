import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

type WorldSectionProps = {
  id?: string;
  worldState?: string;
  labelledBy?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
};

/**
 * A transparent section that lets the fixed world show through. Text sits on
 * matte surfaces / scrims rather than directly on the isolines.
 */
export function WorldSection({
  id,
  worldState,
  labelledBy,
  className,
  containerClassName,
  children,
}: WorldSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      data-world-state={worldState}
      className={cn("world-section relative py-14 md:py-24", className)}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
