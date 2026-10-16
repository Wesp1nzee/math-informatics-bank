import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

const baseItem =
  "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm transition-colors";

function StepLink({
  href,
  label,
  icon,
  disabled,
}: {
  href: string;
  label: string;
  icon: "prev" | "next";
  disabled: boolean;
}) {
  const Icon = icon === "prev" ? ChevronLeft : ChevronRight;

  if (disabled) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          baseItem,
          "border-line text-ink-faint cursor-not-allowed opacity-60",
        )}
      >
        <Icon className="size-4" />
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(baseItem, "border-line bg-surface text-ink hover:border-ink")}
    >
      <Icon className="size-4" />
    </Link>
  );
}

export function Pagination({
  page,
  pageCount,
  hrefForPage,
  className,
}: {
  page: number;
  pageCount: number;
  hrefForPage: (page: number) => string;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav
      aria-label="Постраничная навигация"
      className={cn("flex items-center justify-center gap-2", className)}
    >
      <StepLink
        href={hrefForPage(Math.max(1, page - 1))}
        label="Предыдущая страница"
        icon="prev"
        disabled={page <= 1}
      />

      <ul className="m-0 flex list-none items-center gap-2 p-0">
        {pages.map((item) => {
          const active = item === page;
          return (
            <li key={item}>
              {active ? (
                <span
                  aria-current="page"
                  className={cn(baseItem, "border-ink bg-ink text-canvas")}
                >
                  {item}
                </span>
              ) : (
                <Link
                  href={hrefForPage(item)}
                  aria-label={`Страница ${item}`}
                  className={cn(
                    baseItem,
                    "border-line bg-surface text-ink hover:border-ink",
                  )}
                >
                  {item}
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <StepLink
        href={hrefForPage(Math.min(pageCount, page + 1))}
        label="Следующая страница"
        icon="next"
        disabled={page >= pageCount}
      />
    </nav>
  );
}
