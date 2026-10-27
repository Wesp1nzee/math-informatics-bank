import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

type SectionProps = {
  id?: string;
  labelledBy?: string;
  className?: string;
  bordered?: boolean;
  children: ReactNode;
};

export function Section({
  id,
  labelledBy,
  className,
  bordered = true,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        bordered && "border-line border-t",
        "desk:py-[88px] w-full min-w-0 py-14 md:py-[88px]",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
