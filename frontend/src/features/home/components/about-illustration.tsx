"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const delay = (ms: number, duration?: number) =>
  ({
    "--d": `${ms}ms`,
    ...(duration ? { "--dur": `${duration}ms` } : {}),
  }) as CSSProperties;

const TAU = Math.PI * 2;

/*
 * Geometry, in SVG user units. The unit circle and the sine plot share the
 * same vertical scale (radius = amplitude = R) and the same zero line
 * (CY = OY), so the horizontal projection from a point on the circle always
 * lands exactly on the curve y = sin x at x = θ. That is what makes the
 * picture numerically honest rather than decorative.
 */
const CX = 104;
const CY = 196;
const R = 76;

const OX = 246;
const OY = 196;
const PPU = 30; // horizontal pixels per radian on the sine plot

const START_THETA = Math.PI / 2;
const PERIOD_MS = 7000;

const X_TICKS: ReadonlyArray<{ t: number; label: string }> = [
  { t: 0, label: "0" },
  { t: Math.PI / 2, label: "π/2" },
  { t: Math.PI, label: "π" },
  { t: (3 * Math.PI) / 2, label: "3π/2" },
  { t: TAU, label: "2π" },
];

const sinePoint = (t: number) => ({
  x: OX + t * PPU,
  y: OY - R * Math.sin(t),
});

function buildSinePath(): string {
  const steps = 120;
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const { x, y } = sinePoint((i / steps) * TAU);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

function sinePathUpTo(theta: number): string {
  const steps = Math.max(2, Math.round((theta / TAU) * 120));
  let d = "";
  for (let i = 0; i <= steps; i += 1) {
    const { x, y } = sinePoint((i / steps) * theta);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

const SINE_PATH = buildSinePath();

const initialCircleX = CX + R * Math.cos(START_THETA);
const initialCircleY = CY - R * Math.sin(START_THETA);
const initialSineX = OX + START_THETA * PPU;
const initialSineY = OY - R * Math.sin(START_THETA);

const labelHalo = {
  paintOrder: "stroke",
  stroke: "var(--color-canvas)",
  strokeWidth: 4,
  strokeLinejoin: "round",
} as CSSProperties;

export function AboutIllustration() {
  const radiusRef = useRef<SVGLineElement>(null);
  const circlePointRef = useRef<SVGCircleElement>(null);
  const projectRef = useRef<SVGLineElement>(null);
  const sinePointRef = useRef<SVGCircleElement>(null);
  const dropRef = useRef<SVGLineElement>(null);
  const trailRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const apply = (theta: number) => {
      const sin = Math.sin(theta);
      const circleX = CX + R * Math.cos(theta);
      const circleY = CY - R * sin;
      const sineX = OX + theta * PPU;
      const sineY = OY - R * sin; // === circleY, because CY === OY

      const round = (value: number) => value.toFixed(2);

      radiusRef.current?.setAttribute("x2", round(circleX));
      radiusRef.current?.setAttribute("y2", round(circleY));

      circlePointRef.current?.setAttribute("cx", round(circleX));
      circlePointRef.current?.setAttribute("cy", round(circleY));

      projectRef.current?.setAttribute("x1", round(circleX));
      projectRef.current?.setAttribute("y1", round(circleY));
      projectRef.current?.setAttribute("x2", round(sineX));
      projectRef.current?.setAttribute("y2", round(circleY));

      sinePointRef.current?.setAttribute("cx", round(sineX));
      sinePointRef.current?.setAttribute("cy", round(sineY));

      dropRef.current?.setAttribute("x1", round(sineX));
      dropRef.current?.setAttribute("y1", round(sineY));
      dropRef.current?.setAttribute("x2", round(sineX));
      dropRef.current?.setAttribute("y2", round(OY));

      trailRef.current?.setAttribute("d", sinePathUpTo(theta));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(START_THETA);
      return;
    }

    let frame = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const progress = ((now - start) % PERIOD_MS) / PERIOD_MS;
      apply(START_THETA + progress * TAU);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      viewBox="0 0 480 380"
      role="img"
      aria-label="Анимация связи единичной окружности и синуса: точка движется по окружности, её высота переносится вправо и вычерчивает график y = sin x. Оси размечены в радианах и в единицах от −1 до 1."
      className="block h-auto w-full"
    >
      {/* Faint grid on the sine side (vertical lines at the tick values). */}
      <g className="draw stroke-line" strokeWidth={1} fill="none" style={delay(0, 700)}>
        {X_TICKS.map(({ t }) => {
          const x = OX + t * PPU;
          return (
            <path
              key={`gx-${t}`}
              d={`M${x.toFixed(1)} ${OY - R - 14}V${OY + R + 14}`}
            />
          );
        })}
        <path d={`M${OX - 12} ${OY - R}H${(OX + TAU * PPU + 6).toFixed(1)}`} />
        <path d={`M${OX - 12} ${OY + R}H${(OX + TAU * PPU + 6).toFixed(1)}`} />
      </g>

      {/* Axes: sine plot and unit circle. */}
      <g
        className="draw stroke-line-strong"
        strokeWidth={1.25}
        fill="none"
        style={delay(150, 700)}
      >
        <path d={`M${OX - 12} ${OY}H${(OX + TAU * PPU + 6).toFixed(1)}`} />
        <path d={`M${OX} ${OY - R - 20}V${OY + R + 20}`} />
        <path d={`M${CX} ${CY - R - 20}V${CY + R + 20}`} />
        <path d={`M${CX - R - 20} ${CY}H${CX + R + 20}`} />
      </g>

      {/* Tick marks. */}
      <g
        className="a-fade stroke-line-strong"
        strokeWidth={1}
        fill="none"
        style={delay(500, 500)}
      >
        {X_TICKS.map(({ t }) => {
          const x = OX + t * PPU;
          return <path key={`tx-${t}`} d={`M${x.toFixed(1)} ${OY - 5}V${OY + 5}`} />;
        })}
        <path d={`M${OX - 5} ${OY - R}H${OX + 5}`} />
        <path d={`M${OX - 5} ${OY + R}H${OX + 5}`} />
        <path d={`M${CX - 5} ${CY - R}H${CX + 5}`} />
        <path d={`M${CX - 5} ${CY + R}H${CX + 5}`} />
      </g>

      {/* Numeric labels. */}
      <g
        className="a-fade fill-ink-faint"
        style={{
          ...delay(600, 500),
          fontFamily: "var(--font-sans)",
          fontSize: 12,
        }}
      >
        {X_TICKS.map(({ t, label }) => (
          <text
            key={`lx-${t}`}
            x={(OX + t * PPU).toFixed(1)}
            y={OY + 18}
            textAnchor="middle"
            style={labelHalo}
          >
            {label}
          </text>
        ))}
        <text x={OX - 10} y={OY - R + 4} textAnchor="end" style={labelHalo}>
          1
        </text>
        <text x={OX - 10} y={OY + R + 4} textAnchor="end" style={labelHalo}>
          −1
        </text>
        <text x={CX + 12} y={CY - R + 4} style={labelHalo}>
          1
        </text>
        <text x={CX + 12} y={CY + R + 4} style={labelHalo}>
          −1
        </text>
        <text x={CX - 14} y={CY + 16} style={labelHalo}>
          0
        </text>
      </g>

      {/* Curve and circle names. */}
      <text
        className="a-fade fill-accent"
        x={(OX + TAU * PPU).toFixed(1)}
        y={OY - R - 26}
        textAnchor="end"
        style={{
          ...delay(700, 500),
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 20,
        }}
      >
        y = sin x
      </text>
      <text
        className="a-fade fill-ink-soft"
        x={CX}
        y={CY - R - 30}
        textAnchor="middle"
        style={{
          ...delay(700, 500),
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 18,
        }}
      >
        sin θ
      </text>

      {/* The function itself, drawn once on reveal. */}
      <path
        className="draw stroke-accent"
        d={SINE_PATH}
        pathLength={1}
        fill="none"
        strokeWidth={2.25}
        strokeLinecap="round"
        opacity={0.22}
        style={delay(300, 1100)}
      />

      <circle
        className="draw stroke-ink"
        cx={CX}
        cy={CY}
        r={R}
        pathLength={1}
        fill="none"
        strokeWidth={1.75}
        style={delay(200, 900)}
      />

      {/* Dynamic layer: rotating radius, projection, drop and tracing point. */}
      <g className="a-fade" style={delay(1100, 700)}>
        <path
          ref={trailRef}
          className="stroke-accent"
          d={sinePathUpTo(START_THETA)}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <line
          ref={projectRef}
          className="stroke-accent"
          x1={initialCircleX}
          y1={initialCircleY}
          x2={initialSineX}
          y2={initialSineY}
          strokeWidth={1}
          strokeDasharray="4 5"
          opacity={0.85}
        />
        <line
          ref={radiusRef}
          className="stroke-accent"
          x1={CX}
          y1={CY}
          x2={initialCircleX}
          y2={initialCircleY}
          strokeWidth={1.5}
          opacity={0.45}
        />
        <line
          ref={dropRef}
          className="stroke-line-strong"
          x1={initialSineX}
          y1={initialSineY}
          x2={initialSineX}
          y2={OY}
          strokeWidth={1}
          strokeDasharray="3 4"
        />
        <circle
          ref={circlePointRef}
          className="fill-accent"
          cx={initialCircleX}
          cy={initialCircleY}
          r={5.5}
        />
        <circle
          ref={sinePointRef}
          className="fill-accent"
          cx={initialSineX}
          cy={initialSineY}
          r={6}
        />
      </g>
    </svg>
  );
}
