import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-medium leading-none",
  {
    variants: {
      tone: {
        accent: "bg-accent-soft text-accent",
        neutral: "border border-line bg-surface text-ink-soft",
        success: "bg-success-soft text-success",
        danger: "bg-danger-soft text-danger",
      },
    },
    defaultVariants: { tone: "accent" },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
