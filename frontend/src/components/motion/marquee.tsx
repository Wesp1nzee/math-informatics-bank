import { cn } from "@/lib/utils/cn";

type MarqueeProps = {
  items: readonly string[];
  label: string;
  className?: string;
  compact?: boolean;
};

/** CSS-only marquee: duplicated track, pause on hover, reduced-motion safe. */
export function Marquee({ items, label, className, compact = false }: MarqueeProps) {
  const set = (hidden: boolean) => (
    <span
      className={cn("marquee-set", hidden && "marquee-dup")}
      aria-hidden={hidden ? "true" : undefined}
    >
      {items.map((item) => (
        <span className="marquee-item" key={`${hidden ? "dup" : "src"}-${item}`}>
          <span className="marquee-dot" aria-hidden="true" />
          {item}
        </span>
      ))}
    </span>
  );

  return (
    <div
      className={cn("marquee", compact && "marquee-compact", className)}
      role="group"
      aria-label={label}
    >
      <div className="marquee-track">
        {set(false)}
        {set(true)}
      </div>
    </div>
  );
}
