"use client";

import { Pause, Sparkles } from "lucide-react";

import {
  useMotionAllowed,
  useMotionPreference,
} from "@/components/motion/use-motion-allowed";
import { setMotionPreference } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

export function MotionToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const preference = useMotionPreference();
  const allowed = useMotionAllowed();
  const on = preference === "on" && allowed;
  const Icon = on ? Sparkles : Pause;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`Анимации: ${on ? "включены" : "выключены"}`}
      title={`Анимации: ${on ? "включены" : "выключены"}`}
      onClick={() => setMotionPreference(on ? "off" : "on")}
      className={cn(
        "border-line bg-surface-subtle/70 text-ink-soft hover:text-ink hover:border-line-strong inline-flex min-h-11 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
        compact && "w-full justify-between rounded-md px-4 text-sm",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Icon aria-hidden className="size-4" />
        {compact ? "Анимации" : <span className="hidden xl:inline">Анимации</span>}
      </span>
      <span className={cn("tabular-nums", compact ? "text-ink" : "sr-only xl:not-sr-only")}>
        {on ? "вкл" : "выкл"}
      </span>
    </button>
  );
}
