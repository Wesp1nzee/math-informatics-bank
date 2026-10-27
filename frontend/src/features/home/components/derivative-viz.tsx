import { DerivativeGraph } from "@/features/home/components/derivative-graph";

export function DerivativeViz() {
  return (
    <div className="w-full max-w-full min-w-0">
      <DerivativeGraph
        formulas={
          <div className="formulas formula-plain" aria-hidden="true">
            <div className="f">f(x) = x³ − 4x² + 7x</div>
            <div className="f derivative">f′(x) = 3x² − 8x + 7</div>
          </div>
        }
      />
      <p className="text-ink-soft mt-3 text-sm">Потяните точку на графике</p>
    </div>
  );
}
