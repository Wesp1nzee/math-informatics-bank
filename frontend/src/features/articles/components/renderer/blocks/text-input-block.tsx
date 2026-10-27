import { ExerciseForm } from "@/features/articles/components/renderer/blocks/exercise-form";
import { InlineNodes } from "@/features/articles/components/renderer/inline-nodes";
import { asArray, asString } from "@/features/articles/runtime";
import type { ArticleBlockV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "text_input" }>;

export function TextInputBlock({
  block,
  articleSlug,
}: {
  block: Block;
  articleSlug?: string;
}) {
  const prompt = asArray(block.data.prompt);
  const source = asString(block.data.source);
  const bankId = asString(block.data.bank_id);
  const inputId = `article-text-${block.id}`;
  const promptId = `${inputId}-prompt`;

  return (
    <section
      aria-labelledby={promptId}
      className="border-line-strong bg-surface min-w-0 scroll-mt-24 rounded-xl border p-5 shadow-sm md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink-faint text-xs font-semibold uppercase tracking-wide">
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
        kind="text"
        name={inputId}
        inputId={inputId}
      >
        <div
          id={promptId}
          className="text-ink mt-3 text-lg leading-snug font-medium break-words [overflow-wrap:anywhere]"
        >
          <InlineNodes nodes={prompt} />
        </div>
      </ExerciseForm>
    </section>
  );
}
