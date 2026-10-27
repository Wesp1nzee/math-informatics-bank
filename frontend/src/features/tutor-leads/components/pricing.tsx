import { PRICING } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

export function Pricing({ className }: { className?: string }) {
  if (!PRICING) return null;

  const details = [PRICING.format, PRICING.duration].filter(Boolean);

  return (
    <div
      className={cn(
        "gradient-border glass relative overflow-hidden rounded-xl border border-[var(--glass-border)] p-6",
        className,
      )}
    >
      <span className="mono-label mb-3">PRICING / PLAN</span>
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
