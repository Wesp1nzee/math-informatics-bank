import { TUTORING_FACTS } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

/**
 * Student-facing benefits rendered as a bento grid. The first card spans the
 * full width to break the rhythm and lead with the strongest benefit.
 */
export function TutoringFacts({ className }: { className?: string }) {
  return (
    <ul className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {TUTORING_FACTS.map((fact, index) => (
        <li
          key={fact.title}
          className={cn(
            "border-line bg-surface rounded-xl border p-5",
            index === 0 && "sm:col-span-2",
          )}
        >
          <b
            className={cn(
              "text-ink block font-semibold",
              index === 0 ? "text-lg" : "text-base",
            )}
          >
            {fact.title}
          </b>
          <span className="text-ink-soft mt-1.5 block text-[15px] leading-relaxed">
            {fact.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
