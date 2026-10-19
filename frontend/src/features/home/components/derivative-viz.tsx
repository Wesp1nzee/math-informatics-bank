import type { CSSProperties } from "react";

import { Math } from "@/components/ui/math";
import { DerivativeGraph } from "@/features/home/components/derivative-graph";
import { cn } from "@/lib/utils/cn";

const FORMULA_LINES = [
  {
    id: "f1",
    delay: 0,
    derivative: false,
    parts: [
      { tex: "f(x)\\,=\\,", delay: 150 },
      { tex: "x^3", delay: 260 },
      { tex: "-\\,4x^2", delay: 370 },
      { tex: "+\\,7x", delay: 480 },
    ],
  },
  {
    id: "f2",
    delay: 800,
    derivative: true,
    parts: [
      { tex: "f'(x)\\,=\\,", delay: 950 },
      { tex: "3x^2", delay: 1060 },
      { tex: "-\\,8x", delay: 1170 },
      { tex: "+\\,7", delay: 1280 },
    ],
  },
] as const;

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function DerivativeViz() {
  return (
    <DerivativeGraph
      formulas={
        <div className="formulas" aria-hidden="true">
          {FORMULA_LINES.map((line) => (
            <div
              key={line.id}
              className={cn("f", line.derivative && "derivative")}
              style={delay(line.delay)}
            >
              {line.parts.map((part) => (
                <span key={part.tex} className="part" style={delay(part.delay)}>
                  <Math tex={part.tex} />
                </span>
              ))}
            </div>
          ))}
        </div>
      }
    />
  );
}
