import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** Page shell: max width and the responsive gutter scale from the prototype. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("desk:px-12 mx-auto w-full max-w-[1440px] px-5 md:px-8", className)}
    >
      {children}
    </div>
  );
}
