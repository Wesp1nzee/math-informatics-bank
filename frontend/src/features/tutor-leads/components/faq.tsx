import { ChevronDown } from "lucide-react";

import { FAQ_ITEMS } from "@/features/tutor-leads/content";
import type { FaqItem } from "@/features/tutor-leads/types";
import { cn } from "@/lib/utils/cn";

/**
 * Native `details`/`summary` disclosure: keyboard accessible and functional
 * without JavaScript. The same items are mirrored into FAQPage JSON-LD.
 */
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
        <details key={item.question} className="group border-line border-b">
          <summary className="text-ink hover:text-accent flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-lg font-medium transition-colors [&::-webkit-details-marker]:hidden">
            {item.question}
            <ChevronDown
              aria-hidden
              className="text-ink-soft size-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="text-ink-soft pb-5 text-[17px] leading-relaxed">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
