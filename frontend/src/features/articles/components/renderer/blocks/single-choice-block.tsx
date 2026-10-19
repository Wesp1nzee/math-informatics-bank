import { ExerciseForm } from "@/features/articles/components/renderer/blocks/exercise-form";
import { InlineNodes } from "@/features/articles/components/renderer/inline-nodes";
import { asArray, asString } from "@/features/articles/runtime";
import type { ArticleBlockV2, ChoiceOption } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "single_choice" }>;

export function SingleChoiceBlock({
  block,
  articleSlug,
}: {
  block: Block;
  articleSlug?: string;
}) {
  const prompt = asArray(block.data.prompt);
  const options = asArray<ChoiceOption>(block.data.options);
  const name = `article-choice-${block.id}`;

  if (options.length === 0) {
    return (
      <fieldset className="border-line bg-surface m-0 rounded-xl border p-6">
        <legend className="text-ink px-1 text-lg leading-snug font-medium">
          <InlineNodes nodes={prompt} />
        </legend>
        <p className="text-ink-faint mt-4 text-sm">Варианты ответа недоступны.</p>
      </fieldset>
    );
  }

  return (
    <ExerciseForm
      articleSlug={articleSlug}
      exerciseId={block.id}
      kind="choice"
      name={name}
    >
      <fieldset className="border-line bg-surface m-0 rounded-xl border p-6">
        <legend className="text-ink px-1 text-lg leading-snug font-medium">
          <InlineNodes nodes={prompt} />
        </legend>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {options.map((option, index) => {
            const optionId = asString(option.id, `option-${index}`);
            return (
              <label
                key={optionId}
                className="border-line-strong hover:border-ink hover:bg-surface-subtle flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 transition-colors"
              >
                <input
                  type="radio"
                  name={name}
                  value={optionId}
                  className="accent-accent size-4"
                />
                <span className="text-ink">
                  <InlineNodes nodes={asArray(option.label)} />
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </ExerciseForm>
  );
}
