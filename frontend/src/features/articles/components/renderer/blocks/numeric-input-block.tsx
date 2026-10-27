import { ExerciseForm } from "@/features/articles/components/renderer/blocks/exercise-form";
import { InlineNodes } from "@/features/articles/components/renderer/inline-nodes";
import { asArray, asString } from "@/features/articles/runtime";
import type { ArticleBlockV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "numeric_input" }>;

export function NumericInputBlock({
  block,
  articleSlug,
}: {
  block: Block;
  articleSlug?: string;
}) {
  const prompt = asArray(block.data.prompt);
  const unit = asString(block.data.unit);
  const source = asString(block.data.source);
  const bankId = asString(block.data.bank_id);
  const inputId = `article-numeric-${block.id}`;
  const promptId = `${inputId}-prompt`;

  return (
    <section
      aria-labelledby={promptId}
      className="border-line-strong bg-surface w-full max-w-full min-w-0 scroll-mt-24 rounded-xl border p-4 shadow-sm sm:p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink-faint text-xs font-semibold tracking-wide uppercase">
          Проверьте себя
        </p>
        {source || bankId ? (
          <p className="text-ink-soft text-xs">
            {source}
            {bankId ? ` · № ${bankId}` : ""}
          </p>
        ) : null}
      </div>

      <ExerciseForm
        articleSlug={articleSlug}
        exerciseId={block.id}
        kind="numeric"
        name={inputId}
        inputId={inputId}
        unit={unit}
      >
        <div
          id={promptId}
          className="text-ink mt-3 text-lg leading-snug font-medium [overflow-wrap:anywhere] break-words"
        >
          <InlineNodes nodes={prompt} />
        </div>
      </ExerciseForm>
    </section>
  );
}
