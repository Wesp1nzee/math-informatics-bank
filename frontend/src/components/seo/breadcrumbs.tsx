import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

export type BreadcrumbItem = {
  name: string;
  /** Omit on the last item — it is rendered as the current page. */
  href?: ComponentProps<typeof Link>["href"];
};

export function Breadcrumbs({
  items,
  className,
}: {
  items: readonly BreadcrumbItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Хлебные крошки" className={className}>
      <ol className="text-ink-soft flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <ChevronRight aria-hidden className="text-ink-faint size-3.5" />
            ) : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-accent transition-colors">
                {item.name}
              </Link>
            ) : (
              <span aria-current="page" className={cn("text-ink")}>
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
