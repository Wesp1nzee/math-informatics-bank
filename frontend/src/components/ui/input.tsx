import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "border-line-strong bg-surface/80 text-ink placeholder:text-ink-faint focus-visible:border-accent min-h-12 w-full rounded-md border px-4 text-base transition-[border-color,box-shadow,background-color]",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}
