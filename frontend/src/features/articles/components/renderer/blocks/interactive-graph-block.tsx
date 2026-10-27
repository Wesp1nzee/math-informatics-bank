import { InteractiveGraphLoader } from "@/features/articles/components/renderer/blocks/interactive-graph-loader";
import { asArray, asString } from "@/features/articles/runtime";
import type { ArticleBlockV2, GraphExpression } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "interactive_graph" }>;

export function InteractiveGraphBlock({ block }: { block: Block }) {
  const expressions = asArray<GraphExpression>(block.data.expressions);
  const labels = expressions.map((expression, index) =>
    asString(expression.label, asString(expression.id, `f${index + 1}`)),
  );

  return (
    <figure className="border-line bg-surface m-0 w-full max-w-full min-w-0 rounded-xl border p-4 md:p-6">
      <figcaption className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-ink text-sm font-medium">Интерактивный график</span>
        {labels.length > 0 ? (
          <span className="text-ink-faint text-sm">{labels.join(" · ")}</span>
        ) : null}
      </figcaption>

      <InteractiveGraphLoader data={block.data} />

      <p className="text-ink-faint mt-3 text-sm">
        Настройте параметры — график перестроится локально. Выражения ограничены
        разрешённой грамматикой; произвольный код не выполняется.
      </p>
    </figure>
  );
}
