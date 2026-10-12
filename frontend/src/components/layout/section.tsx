import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils/cn";

type SectionProps = {
  id?: string;
  /** id of the heading that labels this section (`aria-labelledby`). */
  labelledBy?: string;
  className?: string;
  /** Draw the hairline separator used between the prototype's sections. */
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
        "desk:py-[140px] py-20 md:py-[104px]",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}
