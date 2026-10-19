import type { GraphViewport } from "@/features/articles/types";

import type { CompiledExpression } from "./expression";

export type PlotLayout = {
  width: number;
  height: number;
  padding: number;
};

const MIN_SAMPLES = 240;
const MAX_SAMPLES = 600;
const SAMPLES_PER_PIXEL = 1.5;
const PIXEL_CLAMP = 1e4;

export function mapX(x: number, viewport: GraphViewport, layout: PlotLayout): number {
  return (
    layout.padding +
    ((x - viewport.x_min) / (viewport.x_max - viewport.x_min)) *
      (layout.width - 2 * layout.padding)
  );
}

export function mapY(y: number, viewport: GraphViewport, layout: PlotLayout): number {
  return (
    layout.height -
    layout.padding -
    ((y - viewport.y_min) / (viewport.y_max - viewport.y_min)) *
      (layout.height - 2 * layout.padding)
  );
}

export function samplesForLayout(layout: PlotLayout): number {
  const plotWidth = Math.max(0, layout.width - 2 * layout.padding);
  return Math.max(
    MIN_SAMPLES,
    Math.min(MAX_SAMPLES, Math.round(plotWidth * SAMPLES_PER_PIXEL)),
  );
}

export function niceStep(span: number, targetTicks = 6): number {
  if (!Number.isFinite(span) || span <= 0) return 1;
  const rough = span / Math.max(1, targetTicks);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalized = rough / magnitude;
  const multiplier =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return multiplier * magnitude;
}

export function niceTicks(min: number, max: number, targetTicks = 6): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(min < max)) return [];

  const step = niceStep(max - min, targetTicks);
  const ticks: number[] = [];
  const first = Math.ceil(min / step - 1e-9) * step;
  const limit = max + step * 1e-9;

  for (let value = first; value <= limit && ticks.length < 200; value += step) {
    const rounded = Number(value.toPrecision(12));
    ticks.push(Object.is(rounded, -0) ? 0 : rounded);
  }

  return ticks;
}

export function formatTick(value: number, step: number): string {
  if (!Number.isFinite(value)) return "";
  if (value === 0) return "0";

  const absolute = Math.abs(value);
  if (absolute >= 1e6 || absolute < 1e-4) {
    const exponent = Math.floor(Math.log10(absolute));
    const mantissa = value / 10 ** exponent;
    return `${Number(mantissa.toFixed(2))}e${exponent}`;
  }

  const decimals = Math.max(0, Math.min(8, -Math.floor(Math.log10(step))));
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

export function buildPath(
  expression: CompiledExpression,
  parameters: Record<string, number>,
  viewport: GraphViewport,
  layout: PlotLayout,
  samples = samplesForLayout(layout),
): string | null {
  if (!(viewport.x_min < viewport.x_max) || !(viewport.y_min < viewport.y_max)) {
    return null;
  }

  const plotHeight = layout.height - 2 * layout.padding;
  const visibleTop = layout.padding;
  const visibleBottom = layout.height - layout.padding;
  const xMin = viewport.x_min;
  const xSpan = viewport.x_max - viewport.x_min;
  const commands: string[] = [];
  let previousPixelY: number | null = null;

  for (let index = 0; index <= samples; index += 1) {
    const x = xMin + (index / samples) * xSpan;

    const y = expression.evaluate(x, parameters);
    if (!Number.isFinite(y)) {
      previousPixelY = null;
      continue;
    }

    const pixelX = mapX(x, viewport, layout);
    const rawPixelY = mapY(y, viewport, layout);
    const pixelY = Math.max(-PIXEL_CLAMP, Math.min(PIXEL_CLAMP, rawPixelY));

    let command = "M";
    if (previousPixelY !== null) {
      const oppositeSides =
        (previousPixelY < visibleTop && pixelY > visibleBottom) ||
        (previousPixelY > visibleBottom && pixelY < visibleTop);
      const jump = Math.abs(pixelY - previousPixelY);
      command = oppositeSides || jump > plotHeight ? "M" : "L";
    }

    commands.push(`${command}${pixelX.toFixed(1)} ${pixelY.toFixed(1)}`);
    previousPixelY = pixelY;
  }

  return commands.length > 0 ? commands.join("") : null;
}

export function sampleValue(
  expression: CompiledExpression,
  x: number,
  parameters: Record<string, number>,
): number | null {
  const value = expression.evaluate(x, parameters);
  return Number.isFinite(value) ? value : null;
}
