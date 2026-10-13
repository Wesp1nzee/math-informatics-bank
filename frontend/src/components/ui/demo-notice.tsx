import { Info } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Development-only hint about demo content. It is rendered in dev and fully
 * removed from production builds, so visitors never see service notices.
 */
export function DemoNotice({ children }: { children: ReactNode }) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <p
      data-demo-notice=""
      className="border-line bg-surface-subtle text-ink-soft flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
    >
      <Info aria-hidden="true" className="text-ink-faint mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
