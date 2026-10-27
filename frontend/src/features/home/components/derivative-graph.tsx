"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

function f(x: number): number {
  return x ** 3 - 4 * x ** 2 + 7 * x;
}

function df(x: number): number {
  return 3 * x ** 2 - 8 * x + 7;
}

const mapX = (x: number): number => 40 + x * 115;
const mapY = (y: number): number => 340 - y * (310 / 28);

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

const MIN_X = 0.3;
const MAX_X = 3.7;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function DerivativeGraph({ formulas }: { formulas: ReactNode }) {
  const [x, setX] = useState(2);
  const [drawn, setDrawn] = useState(false);
  const figureRef = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const element = figureRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = window.requestAnimationFrame(() => setDrawn(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setDrawn(true);
        observer.disconnect();
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reduceMotion]);

  const isDrawn = drawn || reduceMotion;

  const slope = df(x);
  const pointX = mapX(x);
  const pointY = mapY(f(x));

  const tangentStartX = clamp(x - 1.5, 0, 4);
  const tangentEndX = clamp(x + 1.5, 0, 4);
  const tangentStartY = mapY(f(x) + slope * (tangentStartX - x));
  const tangentEndY = mapY(f(x) + slope * (tangentEndX - x));

  function update(next: number) {
    setX(clamp(next, MIN_X, MAX_X));
  }

  return (
    <figure
      ref={figureRef}
      data-drawn={isDrawn ? "true" : "false"}
      className="viz m-0 w-full max-w-full min-w-0 overflow-x-auto"
    >
      <div className="viz-top">
        <b>Математика · Производная</b>
        <output aria-live="polite" aria-atomic="true" className="tabular-nums">
          x = {x.toFixed(1)} · f′(x) = {formatValue(slope)}
        </output>
      </div>

      {formulas}

      <div className="graph-wrap relative w-full max-w-full min-w-0">
        <svg
          className="graph h-auto w-full max-w-full"
          viewBox="0 0 520 380"
          role="img"
          aria-label="График функции f от x равно x в кубе минус 4 x в квадрате плюс 7 x. Точка на кривой двигается, касательная и значение производной пересчитываются."
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
            className={cn("g-curve", isDrawn && "draw-in")}
            d={CURVE_PATH}
            pathLength={1}
            style={
              {
                "--dur": "900ms",
                opacity: isDrawn ? undefined : 0,
              } as CSSProperties
            }
          />

          <line
            className={cn("g-drop", isDrawn && "fade-el")}
            x1={pointX}
            x2={pointX}
            y1={pointY}
            y2={340}
            style={
              {
                "--d": "250ms",
                opacity: isDrawn ? undefined : 0,
              } as CSSProperties
            }
          />

          <line
            className={cn("g-tan", isDrawn && "draw-in")}
            x1={mapX(tangentStartX)}
            y1={tangentStartY}
            x2={mapX(tangentEndX)}
            y2={tangentEndY}
            pathLength={1}
            style={
              {
                "--d": "350ms",
                "--dur": "500ms",
                opacity: isDrawn ? undefined : 0,
              } as CSSProperties
            }
          />

          <circle
            className={cn("g-pt", isDrawn && "fade-el")}
            cx={pointX}
            cy={pointY}
            r={7}
            style={
              {
                "--d": "250ms",
                opacity: isDrawn ? undefined : 0,
              } as CSSProperties
            }
          />

          <text
            className={cn("g-label", isDrawn && "fade-el")}
            x={pointX + 14}
            y={pointY + 28}
            style={
              {
                "--d": "250ms",
                opacity: isDrawn ? undefined : 0,
              } as CSSProperties
            }
          >
            f′({formatValue(x)}) = {formatValue(slope)}
          </text>
        </svg>

        <input
          type="range"
          min={MIN_X}
          max={MAX_X}
          step={0.05}
          value={x}
          onChange={(event) => update(Number(event.target.value))}
          aria-label="Положение точки на графике"
          aria-valuetext={`x = ${x.toFixed(1)}, производная f′(x) = ${formatValue(slope)}`}
          className="absolute inset-0 z-10 h-full w-full cursor-ew-resize opacity-0 outline-none focus:outline-none focus-visible:outline-none"
        />
      </div>
    </figure>
  );
}
