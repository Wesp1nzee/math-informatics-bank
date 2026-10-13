import { selectPublishedReviews } from "@/features/tutor-leads/reviews";
import { REVIEWS } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

/** Renders nothing when there are no consented reviews. */
export function Reviews({ className }: { className?: string }) {
  const reviews = selectPublishedReviews(REVIEWS);
  if (reviews.length === 0) return null;

  return (
    <ul className={cn("grid gap-4 md:grid-cols-2", className)}>
      {reviews.map((review) => (
        <li
          key={`${review.name}-${review.exam}`}
          className="border-line bg-surface flex flex-col gap-4 rounded-xl border p-6"
        >
          <blockquote className="text-ink text-lg leading-relaxed">
            {review.text}
          </blockquote>

          {review.before || review.after ? (
            <p className="text-ink-soft flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {review.before ? <span>Было: {review.before}</span> : null}
              {review.after ? <span className="text-success">Стало: {review.after}</span> : null}
            </p>
          ) : null}

          <footer className="text-ink-soft mt-auto text-sm">
            <b className="text-ink font-medium">{review.name}</b>
            <span> · {review.exam}</span>
          </footer>
        </li>
      ))}
    </ul>
  );
}
