import Link from "next/link";

import type { TaskTypeEntry } from "@/features/seo/pages";
import { cn } from "@/lib/utils/cn";

export function TaskTypeTable({
  items,
  className,
}: {
  items: readonly TaskTypeEntry[];
  className?: string;
}) {
  return (
    <ol className={cn("m-0 grid w-full min-w-0 list-none gap-3 p-0", className)}>
      {items.map((item) => (
        <li
          key={item.number}
          className="border-line bg-surface flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start"
        >
          <span
            aria-hidden="true"
            className="bg-surface-subtle text-ink-soft inline-flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-medium tabular-nums"
          >
            {item.number}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-ink font-medium">{item.label}</p>
            <p className="text-ink-soft mt-1 text-sm">{item.note}</p>
          </div>
          {item.path ? (
            <Link
              href={item.path}
              className="text-accent hover:text-accent-strong shrink-0 self-start text-sm font-medium underline underline-offset-4"
            >
              Разбор
            </Link>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
