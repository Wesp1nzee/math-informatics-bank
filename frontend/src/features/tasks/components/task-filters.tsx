import Link from "next/link";

import type { TaskFilters as TaskFiltersValue } from "@/features/tasks/api";
import {
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  SUBJECTS,
  SUBJECT_LABEL,
} from "@/features/tasks/labels";
import type { TaskDifficulty, TaskSubject } from "@/features/tasks/types";
import { cn } from "@/lib/utils/cn";
import { buildQueryHref } from "@/lib/utils/url";

type FilterOption<T extends string> = { value?: T; label: string };

function FilterGroup<T extends string>({
  label,
  options,
  current,
  hrefFor,
}: {
  label: string;
  options: readonly FilterOption<T>[];
  current?: T;
  hrefFor: (value?: T) => string;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-ink-faint text-sm">{label}</span>
      <ul className="m-0 flex min-w-0 list-none flex-wrap gap-2 p-0">
        {options.map((option) => {
          const active = option.value === current;
          return (
            <li key={option.value ?? "all"}>
              <Link
                href={hrefFor(option.value)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border px-3.5 text-sm transition-colors",
                  active
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-surface text-ink-soft hover:border-ink hover:text-ink",
                )}
              >
                {option.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TaskFilters({
  basePath,
  filters,
}: {
  basePath: string;
  filters: TaskFiltersValue;
}) {
  const subjectOptions: readonly FilterOption<TaskSubject>[] = [
    { value: undefined, label: "Все предметы" },
    ...SUBJECTS.map((subject) => ({
      value: subject,
      label: SUBJECT_LABEL[subject],
    })),
  ];

  const levelOptions: readonly FilterOption<TaskDifficulty>[] = [
    { value: undefined, label: "Любая сложность" },
    ...DIFFICULTIES.map((level) => ({
      value: level,
      label: DIFFICULTY_LABEL[level],
    })),
  ];

  return (
    <div className="border-line mb-10 flex w-full min-w-0 flex-col gap-3 border-b pb-6">
      <FilterGroup
        label="Предмет"
        options={subjectOptions}
        current={filters.subject}
        hrefFor={(subject) =>
          buildQueryHref(basePath, { subject, level: filters.level })
        }
      />
      <FilterGroup
        label="Сложность"
        options={levelOptions}
        current={filters.level}
        hrefFor={(level) =>
          buildQueryHref(basePath, { subject: filters.subject, level })
        }
      />
    </div>
  );
}
