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
  const source = asString(block.data.source);
  const bankId = asString(block.data.bank_id);

  if (options.length === 0) {
    return (
      <section className="border-line-strong bg-surface rounded-xl border p-6">
        <p className="text-ink text-lg leading-snug font-medium">
          <InlineNodes nodes={prompt} />
        </p>
        <p className="text-ink-faint mt-4 text-sm">Варианты ответа недоступны.</p>
      </section>
    );
  }

  return (
    <ExerciseForm
      articleSlug={articleSlug}
      exerciseId={block.id}
      kind="choice"
      name={name}
      className="border-line-strong bg-surface scroll-mt-24 rounded-xl border p-5 shadow-sm md:p-6"
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

      <fieldset className="m-0 mt-3 min-w-0 border-0 p-0">
        <legend className="text-ink px-0 text-lg leading-snug font-medium break-words [overflow-wrap:anywhere]">
          <InlineNodes nodes={prompt} />
        </legend>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {options.map((option, index) => {
            const optionId = asString(option.id, `option-${index}`);
            return (
              <label
                key={optionId}
                className="border-line-strong hover:border-ink hover:bg-surface-subtle flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors"
              >
                <input
                  type="radio"
                  name={name}
                  value={optionId}
                  className="accent-accent size-4 shrink-0"
                />
                <span className="text-ink min-w-0 break-words [overflow-wrap:anywhere]">
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
