import { InlineNodes } from "@/features/articles/components/renderer/inline-nodes";
import { asArray, asString } from "@/features/articles/runtime";
import type { ArticleBlockV2, CalloutKind } from "@/features/articles/types";
import { cn } from "@/lib/utils/cn";

type Block = Extract<ArticleBlockV2, { type: "callout" }>;

const CALLOUT_LABEL: Record<CalloutKind, string> = {
  info: "К сведению",
  tip: "Совет",
  warning: "Важно",
  danger: "Осторожно",
};

const CALLOUT_STYLES: Record<CalloutKind, string> = {
  info: "border-accent/25 bg-accent-soft/60",
  tip: "border-success/30 bg-success-soft",
  warning: "border-warning/40 bg-warning/10",
  danger: "border-danger/30 bg-danger-soft",
};

function asCalloutKind(value: unknown): CalloutKind {
  return value === "tip" || value === "warning" || value === "danger" ? value : "info";
}

export function CalloutBlock({ block }: { block: Block }) {
  const kind = asCalloutKind(block.data.kind);
  const title = asString(block.data.title, CALLOUT_LABEL[kind]);
  const body = asArray(block.data.body);

  return (
    <aside
      role="note"
      className={cn("rounded-xl border px-5 py-4", CALLOUT_STYLES[kind])}
    >
      <p className="text-ink text-sm font-semibold">{title}</p>
      <div className="text-ink-soft mt-2 text-base leading-relaxed">
        <InlineNodes nodes={body} />
      </div>
    </aside>
  );
}
