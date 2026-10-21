import { FAQ_ITEMS } from "@/features/tutor-leads/content";
import type { FaqItem } from "@/features/tutor-leads/types";
import { cn } from "@/lib/utils/cn";

export function Faq({
  items = FAQ_ITEMS,
  className,
}: {
  items?: readonly FaqItem[];
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className={cn("border-line border-t", className)}>
      {items.map((item) => (
        <details key={item.question} className="faq-item group">
          <summary className="text-ink hover:text-accent flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-medium transition-colors [&::-webkit-details-marker]:hidden">
            {item.question}
            <span className="faq-icon text-ink-soft" aria-hidden="true">
              <span />
              <span />
            </span>
          </summary>
          <p className="text-ink-soft pb-5 text-[17px] leading-relaxed">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
