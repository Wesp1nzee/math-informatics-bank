import { Math } from "@/components/ui/math";
import { RichText } from "@/components/ui/rich-text";
import type { SolutionStep } from "@/features/tasks/types";

export function SolutionSteps({ steps }: { steps: readonly SolutionStep[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0">
      {steps.map((step, index) => (
        <li
          key={step.tex}
          className="border-line bg-surface-subtle/60 flex gap-4 rounded-md border-l-2 px-3 py-3"
        >
          <span
            aria-hidden="true"
            className="bg-surface text-ink-soft mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-medium"
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-ink-soft text-sm">
              <RichText text={step.note} />
            </p>
            <Math className="mt-1 text-lg" display tex={step.tex} />
          </div>
        </li>
      ))}
    </ol>
  );
}
