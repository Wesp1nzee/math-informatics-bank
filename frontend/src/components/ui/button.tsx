import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "group/btn inline-flex items-center justify-center gap-2.5 rounded-md border border-transparent font-medium transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-accent-surface text-white shadow-[0_16px_34px_-20px_rgba(79,70,229,0.9)] hover:bg-accent-surface-hover hover:shadow-[0_20px_44px_-18px_rgba(79,70,229,0.8)]",
        secondary:
          "border-line-strong bg-surface/60 text-ink hover:border-ink hover:bg-surface",
        ghost: "text-ink hover:bg-surface-subtle",
      },
      size: {
        md: "min-h-12 px-[22px] text-base",
        sm: "min-h-10 px-4 text-[15px]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export function ButtonArrow({ className }: { className?: string }) {
  return (
    <ArrowRight
      aria-hidden
      className={cn(
        "size-4 shrink-0 transition-transform duration-150 group-hover/btn:translate-x-1",
        className,
      )}
    />
  );
}
