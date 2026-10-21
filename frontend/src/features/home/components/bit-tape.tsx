import type { CodeStage } from "@/features/home/components/code-demo";
import { countOnes } from "@/features/home/lib/task5";
import { cn } from "@/lib/utils/cn";

const EMPTY = "\u00b7";

function Cell({
  value,
  tone,
  flashKey,
}: {
  value: string;
  tone?: "appended";
  flashKey?: string;
}) {
  return (
    <span
      key={flashKey}
      className="bit-cell"
      data-tone={tone}
      data-new={value !== EMPTY ? "" : undefined}
    >
      {value}
    </span>
  );
}

export function BitTape({ stage, className }: { stage: CodeStage; className?: string }) {
  const binary = stage.binary ?? "";
  const ones = binary ? countOnes(binary) : null;
  const parity = ones === null ? null : ones % 2;
  const secondParity =
    ones === null || parity === null || stage.result === null
      ? null
      : (ones + parity) % 2;
  const resultBits = stage.result === null ? "" : stage.result.toString(2);
  const slots = binary ? binary.padStart(5, "0") : EMPTY.repeat(5);
  const resultSlots = resultBits ? resultBits.padStart(binary.length + 2, "0") : "";

  return (
    <div className={cn("bit-tape", className)}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="bit-label">Битовая лента</span>
        <span className="bit-label">задание 5</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-ink-soft w-16 text-sm">N</span>
          <div className="bit-row">
            {slots.split("").map((bit, index) => (
              <Cell
                key={`n-${index}-${bit}`}
                value={bit}
                flashKey={`n-${index}-${bit}`}
              />
            ))}
          </div>
          <span className="text-ink-faint text-xs">
            {stage.n === undefined ? "bin(N)" : `bin(${stage.n})`}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-ink-soft w-16 text-sm">+ чётность</span>
          <div className="bit-row">
            <Cell
              value={parity === null ? EMPTY : String(parity)}
              tone="appended"
              flashKey={`p1-${parity ?? "e"}`}
            />
            <Cell
              value={secondParity === null ? EMPTY : String(secondParity)}
              tone="appended"
              flashKey={`p2-${secondParity ?? "e"}`}
            />
          </div>
          <span className="text-ink-faint text-xs">сумма цифр mod 2</span>
        </div>

        <div className="border-line mt-1 flex flex-wrap items-center gap-3 border-t pt-2">
          <span className="text-ink-soft w-16 text-sm">R</span>
          <div className="bit-row">
            {resultSlots
              ? resultSlots
                  .split("")
                  .map((bit, index) => (
                    <Cell
                      key={`r-${index}-${bit}`}
                      value={bit}
                      flashKey={`r-${index}-${bit}`}
                    />
                  ))
              : EMPTY.repeat(Math.max(5, binary.length + 2))
                  .split("")
                  .map((bit, index) => <Cell key={`r-e-${index}`} value={bit} />)}
          </div>
          <span className="text-ink text-sm font-medium tabular-nums">
            {stage.result === null ? "R > 83" : `R = ${stage.result} > 83`}
          </span>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {stage.n === undefined
          ? "Битовая лента заполняется по ходу выполнения программы."
          : `N равно ${stage.n}, двоичная запись ${binary}. Результат R равен ${
              stage.result ?? "ещё не вычислен"
            }.`}
      </p>
    </div>
  );
}
