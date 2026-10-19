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
  const inputId = `article-numeric-${block.id}`;
  const promptId = `${inputId}-prompt`;

  return (
    <section
      aria-labelledby={promptId}
      className="border-line bg-surface rounded-xl border p-6"
    >
      <ExerciseForm
        articleSlug={articleSlug}
        exerciseId={block.id}
        kind="numeric"
        name={inputId}
        inputId={inputId}
        unit={unit}
      >
        <div id={promptId} className="text-ink text-lg leading-snug font-medium">
          <InlineNodes nodes={prompt} />
        </div>
      </ExerciseForm>
    </section>
  );
}
