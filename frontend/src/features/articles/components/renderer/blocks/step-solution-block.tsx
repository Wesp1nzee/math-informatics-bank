import { Math } from "@/components/ui/math";
import { InlineNodes } from "@/features/articles/components/renderer/inline-nodes";
import { UnknownBlock } from "@/features/articles/components/renderer/unknown-block";
import { asArray } from "@/features/articles/runtime";
import type { ArticleBlockV2, SolutionStepV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "step_solution" }>;

export function StepSolutionBlock({ block }: { block: Block }) {
  const steps = asArray<SolutionStepV2>(block.data.steps);

  if (steps.length === 0) {
    return <UnknownBlock label="Решение недоступно" />;
  }

  return (
    <section aria-label="Решение по шагам">
      <p className="text-ink-faint mb-3 text-sm font-medium">Решение по шагам</p>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {steps.map((step, index) => (
          <li
            key={typeof step.id === "string" ? step.id : index}
            className="border-line-strong bg-surface rounded-md border-l-2 px-4 py-2"
          >
            <details>
              <summary className="text-ink cursor-pointer text-sm font-medium">
                Шаг {index + 1}
              </summary>
              <div className="mt-3 min-w-0">
                <div className="text-ink text-sm">
                  <InlineNodes nodes={asArray(step.note)} />
                </div>
                {step.math && typeof step.math.tex === "string" ? (
                  <Math
                    className="mt-1 text-lg"
                    display={step.math.display ?? true}
                    tex={step.math.tex}
                  />
                ) : null}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
