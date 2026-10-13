import { PRICING } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

/** Renders nothing until the owner configures prices. */
export function Pricing({ className }: { className?: string }) {
  if (!PRICING) return null;

  const details = [PRICING.format, PRICING.duration].filter(Boolean);

  return (
    <div className={cn("border-line bg-surface rounded-xl border p-6", className)}>
      <p className="text-ink text-2xl font-semibold tracking-[-0.02em]">
        {PRICING.from}
      </p>
      {details.length > 0 ? (
        <p className="text-ink-soft mt-2 text-sm">{details.join(" · ")}</p>
      ) : null}
      {PRICING.note ? (
        <p className="text-ink-faint mt-3 text-sm">{PRICING.note}</p>
      ) : null}
    </div>
  );
}
