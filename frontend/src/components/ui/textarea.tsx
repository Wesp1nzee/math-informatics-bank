import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-line-strong bg-surface/80 text-ink placeholder:text-ink-faint focus-visible:border-accent min-h-32 w-full resize-y rounded-md border px-4 py-3 text-base transition-[border-color,box-shadow,background-color]",
        "aria-[invalid=true]:border-danger",
        className,
      )}
      {...props}
    />
  );
}
