import { InlineNodes } from "@/features/articles/components/renderer/inline-nodes";
import { asArray, asString } from "@/features/articles/runtime";
import type { ArticleBlockV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "hint" }>;

export function HintBlock({ block }: { block: Block }) {
  const title = asString(block.data.title, "Подсказка");
  const body = asArray(block.data.body);

  return (
    <details className="border-line bg-surface-subtle/60 rounded-md border px-4 py-3">
      <summary className="text-ink cursor-pointer text-sm font-medium">{title}</summary>
      <div className="text-ink-soft mt-3 text-base leading-relaxed">
        <InlineNodes nodes={body} />
      </div>
    </details>
  );
}
