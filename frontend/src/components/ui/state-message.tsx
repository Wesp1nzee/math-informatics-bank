import type { ReactNode } from "react";

/**
 * Shared empty / error presentation for data-driven screens. One component
 * keeps the copy and the visual treatment consistent across features.
 */
export function StateMessage({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="border-line bg-surface rounded-xl border p-8 text-center md:p-12"
    >
      <p className="text-ink text-lg font-medium">{title}</p>
      {description ? (
        <p className="text-ink-soft mx-auto mt-3 max-w-xl">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
