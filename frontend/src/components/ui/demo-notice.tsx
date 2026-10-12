import { Info } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Marks content that comes from the built-in demo dataset instead of the real
 * API. Shown explicitly so no one mistakes fixtures for production data.
 */
export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="border-line bg-surface-subtle text-ink-soft flex items-start gap-3 rounded-lg border px-4 py-3 text-sm">
      <Info aria-hidden="true" className="text-ink-faint mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
