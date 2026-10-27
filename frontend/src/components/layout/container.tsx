import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "desk:px-12 mx-auto w-full max-w-full min-w-0 px-4 sm:px-6 md:max-w-[1440px] md:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
