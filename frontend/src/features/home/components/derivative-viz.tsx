import type { CSSProperties } from "react";

import { Math } from "@/components/ui/math";
import { cn } from "@/lib/utils/cn";

/** f(x) = x³ − 4x² + 7x — the function plotted in the hero. */
function f(x: number): number {
  return x ** 3 - 4 * x ** 2 + 7 * x;
}

const mapX = (x: number): number => 40 + x * 115;
const mapY = (y: number): number => 340 - y * (310 / 28);

/** SVG path of the curve on [0, 4], evaluated at build/render time. */
function buildCurvePath(): string {
  let path = "";
  for (let x = 0; x <= 4.001; x += 0.05) {
    const command = path ? "L" : "M";
    path += `${command}${mapX(x).toFixed(1)} ${mapY(f(x)).toFixed(1)}`;
  }
  return path;
}

const CURVE_PATH = buildCurvePath();

const X_TICKS = [0, 1, 2, 3, 4];
const Y_TICKS = [7, 14, 21, 28];

/** Tangent at x = 2: y = 6 + 3·(x − 2). */
const TANGENT = {
  x1: mapX(0.7),
  y1: mapY(6 + 3 * (0.7 - 2)),
  x2: mapX(3.3),
  y2: mapY(6 + 3 * (3.3 - 2)),
};

const POINT = { x: mapX(2), y: mapY(6) };

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

/**
 * Hero visualisation: the function, its derivative and the tangent at x = 2.
 *
 * The curve is computed here on the server and shipped as static SVG; the
 * reveal is a pure CSS animation, so the whole block costs zero client
 * JavaScript (only the parallax wrapper is a client component).
 */
export function DerivativeViz() {
  return (
    <figure className="viz m-0">
      <div className="viz-top">
        <b>Математика · Производная</b>
        <span>x = 2</span>
      </div>

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

      <div className="graph-wrap">
        <svg
          className="graph"
          viewBox="0 0 520 380"
          role="img"
          aria-label="График функции f от x равно x в кубе минус 4 x в квадрате плюс 7 x. Касательная в точке x = 2 имеет угловой коэффициент 3."
          focusable="false"
        >
          <g className="g-grid">
            {X_TICKS.map((tick) => (
              <line
                key={`vx-${tick}`}
                x1={mapX(tick)}
                y1={20}
                x2={mapX(tick)}
                y2={340}
              />
            ))}
            {[0, ...Y_TICKS].map((tick) => (
              <line
                key={`hy-${tick}`}
                x1={40}
                y1={mapY(tick)}
                x2={500}
                y2={mapY(tick)}
              />
            ))}
          </g>

          <line className="g-axis" x1={40} y1={340} x2={500} y2={340} />
          <line className="g-axis" x1={40} y1={20} x2={40} y2={340} />

          <g className="g-text">
            {X_TICKS.map((tick) => (
              <text key={`tx-${tick}`} x={mapX(tick)} y={360} textAnchor="middle">
                {tick}
              </text>
            ))}
            {Y_TICKS.map((tick) => (
              <text key={`ty-${tick}`} x={30} y={mapY(tick) + 4} textAnchor="end">
                {tick}
              </text>
            ))}
          </g>

          <text className="g-text" x={498} y={330} textAnchor="end">
            x
          </text>
          <text className="g-text" x={48} y={30}>
            y
          </text>

          <path
            className="g-curve draw-in"
            d={CURVE_PATH}
            pathLength={1}
            style={{ ...delay(1500), "--dur": "1100ms" } as CSSProperties}
          />

          <line
            className="g-drop fade-el"
            x1={POINT.x}
            x2={POINT.x}
            y1={POINT.y}
            y2={340}
            style={delay(2600)}
          />

          <line
            className="g-tan draw-in"
            x1={TANGENT.x1}
            y1={TANGENT.y1}
            x2={TANGENT.x2}
            y2={TANGENT.y2}
            pathLength={1}
            style={{ ...delay(2900), "--dur": "600ms" } as CSSProperties}
          />

          <circle
            className="g-pt fade-el"
            cx={POINT.x}
            cy={POINT.y}
            r={7}
            style={delay(2600)}
          />

          <text
            className="g-label fade-el"
            x={POINT.x + 14}
            y={POINT.y + 28}
            style={delay(2600)}
          >
            f′(2) = 3
          </text>
        </svg>
      </div>

      <figcaption className="viz-note">
        Касательная в точке x = 2: её наклон равен значению производной.
      </figcaption>
    </figure>
  );
}
