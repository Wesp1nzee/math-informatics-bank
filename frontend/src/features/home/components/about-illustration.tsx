import type { CSSProperties } from "react";

const delay = (ms: number, duration?: number) =>
  ({
    "--d": `${ms}ms`,
    ...(duration ? { "--dur": `${duration}ms` } : {}),
  }) as CSSProperties;

/**
 * Abstract maths illustration from the original prototype: axes, a circle, a
 * curve, a tangent line and a marked point. Shapes are drawn in with a pure
 * CSS animation that starts when the surrounding `.about-art.reveal` element
 * becomes visible (see `ScrollReveal`).
 */
export function AboutIllustration() {
  return (
    <svg
      viewBox="0 0 400 480"
      role="img"
      aria-label="Абстрактный математический рисунок: окружность, кривая, касательная и оси координат"
      className="block h-auto w-full"
    >
      <g className="a-fade stroke-line" strokeWidth={1} style={delay(0)} fill="none">
        <path d="M0 120h400M0 240h400M0 360h400M100 0v480M200 0v480M300 0v480" />
      </g>

      <g
        className="draw stroke-line-strong"
        strokeWidth={1.25}
        fill="none"
        style={delay(200, 800)}
      >
        <path d="M40 420h320M40 420V60" />
      </g>

      <circle
        className="draw stroke-ink"
        cx={200}
        cy={240}
        r={110}
        fill="none"
        strokeWidth={2}
        style={delay(700, 1100)}
      />

      <path
        className="draw stroke-accent"
        d="M60 330 Q200 60 340 150"
        fill="none"
        strokeWidth={2}
        style={delay(1400, 1200)}
      />

      <path
        className="a-fade stroke-ink"
        d="M120 120 L330 330"
        strokeWidth={1}
        strokeDasharray="4 5"
        fill="none"
        style={delay(2500)}
      />

      <circle
        className="a-fade fill-accent"
        cx={278}
        cy={162}
        r={6}
        style={delay(2800, 400)}
      />

      <text
        className="a-fade fill-ink"
        x={292}
        y={156}
        style={{
          ...delay(3000, 500),
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 26,
        }}
      >
        x
      </text>
    </svg>
  );
}
