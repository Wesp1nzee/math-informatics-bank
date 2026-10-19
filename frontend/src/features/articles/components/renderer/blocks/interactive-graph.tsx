"use client";

import {
  Component,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { asArray } from "@/features/articles/runtime";
import type {
  GraphExpression,
  GraphParameter,
  GraphViewport,
  InteractiveGraphBlockData,
} from "@/features/articles/types";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

import {
  compileExpression,
  type CompiledExpression,
} from "@/features/articles/components/renderer/graph/expression";
import {
  buildPath,
  formatTick,
  mapX,
  mapY,
  niceStep,
  niceTicks,
  sampleValue,
  type PlotLayout,
} from "@/features/articles/components/renderer/graph/plot";

const WIDTH = 480;
const HEIGHT = 280;
const PADDING = 32;
const LAYOUT: PlotLayout = { width: WIDTH, height: HEIGHT, padding: PADDING };
const DEFAULT_VIEWPORT: GraphViewport = {
  x_min: -5,
  x_max: 5,
  y_min: -5,
  y_max: 5,
};
const PALETTE = ["#1f6feb", "#c83b3b", "#208a5a", "#b7791f", "#7c3aed"];
const SMOOTHING_TAU_MS = 70;
const MAX_FRAME_MS = 64;
const VALUE_EPSILON = 1e-4;
const VIEW_EPSILON = 1e-6;
const TRACE_STEP_DIVISIONS = 50;
const DEFAULT_TRACE_TEXT = "Проведите по графику, чтобы увидеть значения.";

type CompiledItem = {
  expression: GraphExpression;
  compiled: CompiledExpression | null;
  error: string | null;
  color: string;
};

function finite(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeViewport(value: unknown): GraphViewport {
  if (typeof value !== "object" || value === null) return DEFAULT_VIEWPORT;
  const raw = value as Record<string, unknown>;
  const xMin = finite(raw.x_min, DEFAULT_VIEWPORT.x_min);
  const xMax = finite(raw.x_max, DEFAULT_VIEWPORT.x_max);
  const yMin = finite(raw.y_min, DEFAULT_VIEWPORT.y_min);
  const yMax = finite(raw.y_max, DEFAULT_VIEWPORT.y_max);
  if (xMin >= xMax || yMin >= yMax) return DEFAULT_VIEWPORT;
  return { x_min: xMin, x_max: xMax, y_min: yMin, y_max: yMax };
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value !== 0 && (Math.abs(value) >= 1e6 || Math.abs(value) < 1e-4)) {
    return value.toExponential(2);
  }
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function colorFor(expression: GraphExpression, index: number): string {
  return typeof expression.color === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(expression.color)
    ? expression.color
    : PALETTE[index % PALETTE.length];
}

function initialValues(parameters: GraphParameter[]): Record<string, number> {
  const entries: Array<[string, number]> = [];
  for (const parameter of parameters) {
    if (typeof parameter.id !== "string" || parameter.id.length === 0) continue;
    if (
      !Number.isFinite(parameter.min) ||
      !Number.isFinite(parameter.max) ||
      parameter.min >= parameter.max
    ) {
      continue;
    }
    entries.push([
      parameter.id,
      Math.min(
        parameter.max,
        Math.max(parameter.min, finite(parameter.default, parameter.min)),
      ),
    ]);
  }
  return Object.fromEntries(entries);
}

function isClose(a: number, b: number, epsilon = VIEW_EPSILON): boolean {
  return Math.abs(a - b) <= epsilon * Math.max(1, Math.abs(a), Math.abs(b));
}

function sameView(a: GraphViewport, b: GraphViewport): boolean {
  return (
    a.x_min === b.x_min &&
    a.x_max === b.x_max &&
    a.y_min === b.y_min &&
    a.y_max === b.y_max
  );
}

function requestFrame(callback: (timestamp: number) => void): number {
  if (
    typeof window !== "undefined" &&
    typeof window.requestAnimationFrame === "function"
  ) {
    return window.requestAnimationFrame(callback);
  }
  return setTimeout(() => callback(performance.now()), 16) as unknown as number;
}

function cancelFrame(frame: number): void {
  if (
    typeof window !== "undefined" &&
    typeof window.cancelAnimationFrame === "function"
  ) {
    window.cancelAnimationFrame(frame);
    return;
  }
  clearTimeout(frame as unknown as ReturnType<typeof setTimeout>);
}

class GraphErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div
          role="alert"
          className="border-danger/30 bg-danger-soft text-ink-soft rounded-lg border px-4 py-3 text-sm"
        >
          Не удалось построить график. Остальная статья доступна.
        </div>
      );
    }
    return this.props.children;
  }
}

export function InteractiveGraph({ data }: { data: InteractiveGraphBlockData }) {
  return (
    <GraphErrorBoundary>
      <InteractiveGraphContent data={data} />
    </GraphErrorBoundary>
  );
}

const GridAxes = memo(function GridAxes({
  view,
  layout,
}: {
  view: GraphViewport;
  layout: PlotLayout;
}) {
  const plotLeft = layout.padding;
  const plotRight = layout.width - layout.padding;
  const plotTop = layout.padding;
  const plotBottom = layout.height - layout.padding;

  const xStep = niceStep(view.x_max - view.x_min);
  const yStep = niceStep(view.y_max - view.y_min);
  const xTicks = niceTicks(view.x_min, view.x_max);
  const yTicks = niceTicks(view.y_min, view.y_max);

  const axisY = view.y_min <= 0 && view.y_max >= 0 ? mapY(0, view, layout) : plotBottom;
  const axisX = view.x_min <= 0 && view.x_max >= 0 ? mapX(0, view, layout) : plotLeft;

  const xLabelY =
    axisY > plotBottom - 16
      ? Math.max(plotTop + 12, axisY - 6)
      : Math.min(layout.height - 3, axisY + 14);
  const yLabelsOnRight = axisX <= plotLeft + 34;
  const yLabelX = yLabelsOnRight ? axisX + 6 : axisX - 6;
  const yLabelAnchor = yLabelsOnRight ? "start" : "end";

  return (
    <g aria-hidden="true" data-graph-grid="">
      <g>
        {xTicks.map((tick) => {
          const x = mapX(tick, view, layout);
          return (
            <line
              key={`x-${tick}`}
              x1={x}
              y1={plotTop}
              x2={x}
              y2={plotBottom}
              stroke="var(--color-line)"
              strokeOpacity={0.55}
              strokeWidth={1}
            />
          );
        })}
        {yTicks.map((tick) => {
          const y = mapY(tick, view, layout);
          return (
            <line
              key={`y-${tick}`}
              x1={plotLeft}
              y1={y}
              x2={plotRight}
              y2={y}
              stroke="var(--color-line)"
              strokeOpacity={0.55}
              strokeWidth={1}
            />
          );
        })}
      </g>

      <line
        x1={plotLeft}
        y1={axisY}
        x2={plotRight}
        y2={axisY}
        stroke="var(--color-ink-faint)"
        strokeWidth={1}
      />
      <line
        x1={axisX}
        y1={plotTop}
        x2={axisX}
        y2={plotBottom}
        stroke="var(--color-ink-faint)"
        strokeWidth={1}
      />
      <text
        x={plotRight}
        y={axisY - 6}
        textAnchor="end"
        fontSize={11}
        fill="var(--color-ink-faint)"
      >
        x
      </text>
      <text x={axisX + 6} y={plotTop + 4} fontSize={11} fill="var(--color-ink-faint)">
        y
      </text>

      <g fontSize={10} fill="var(--color-ink-faint)">
        {xTicks.map((tick) => (
          <text
            key={`x-label-${tick}`}
            x={mapX(tick, view, layout)}
            y={xLabelY}
            textAnchor="middle"
          >
            {formatTick(tick, xStep)}
          </text>
        ))}
        {yTicks.map((tick) => (
          <text
            key={`y-label-${tick}`}
            x={yLabelX}
            y={mapY(tick, view, layout) + 3}
            textAnchor={yLabelAnchor}
          >
            {formatTick(tick, yStep)}
          </text>
        ))}
      </g>
    </g>
  );
});

const CurveLayer = memo(function CurveLayer({
  items,
  values,
  view,
  layout,
  clipId,
  pathRefs,
}: {
  items: CompiledItem[];
  values: Record<string, number>;
  view: GraphViewport;
  layout: PlotLayout;
  clipId: string;
  pathRefs: Array<(element: SVGPathElement | null) => void>;
}) {
  return (
    <g clipPath={`url(#${clipId})`} data-graph-curves="">
      {items.map((item, index) =>
        item.compiled ? (
          <path
            key={item.expression.id ?? index}
            ref={pathRefs[index]}
            data-graph-curve=""
            d={buildPath(item.compiled, values, view, layout) ?? undefined}
            fill="none"
            stroke={item.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null,
      )}
    </g>
  );
});

const Legend = memo(function Legend({ items }: { items: CompiledItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {items.map((item, index) => (
        <span
          key={item.expression.id ?? index}
          className="text-ink-soft inline-flex items-center gap-2"
        >
          <span
            aria-hidden="true"
            className="inline-block size-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {item.expression.label || item.expression.id}
        </span>
      ))}
    </div>
  );
});

type ParameterSliderProps = {
  parameter: GraphParameter;
  initialValue: number;
  onTargetChange: (id: string, value: number) => void;
};

function snapToStep(value: number, min: number, max: number, step: number): number {
  const snapped = min + Math.round((value - min) / step) * step;
  return Number(clamp(snapped, min, max).toFixed(10));
}

const ParameterSlider = memo(function ParameterSlider({
  parameter,
  initialValue,
  onTargetChange,
}: ParameterSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef(initialValue);

  const range = parameter.max - parameter.min;
  const dataStep =
    Number.isFinite(parameter.step) && parameter.step > 0 ? parameter.step : 0.1;
  // A fine step keeps pointer dragging continuous; the value is magnetised
  // back to the article's step when the gesture ends.
  const fineStep = Math.min(dataStep, range / 500);

  useEffect(() => {
    if (labelRef.current) {
      labelRef.current.textContent = formatNumber(initialValue);
    }
  }, [initialValue]);

  const applyValue = useCallback(
    (next: number, snap: boolean) => {
      const finalValue = snap
        ? snapToStep(next, parameter.min, parameter.max, dataStep)
        : clamp(next, parameter.min, parameter.max);

      valueRef.current = finalValue;
      if (inputRef.current) {
        inputRef.current.value = String(finalValue);
        inputRef.current.setAttribute("aria-valuetext", formatNumber(finalValue));
      }
      if (labelRef.current) {
        labelRef.current.textContent = formatNumber(finalValue);
      }
      onTargetChange(parameter.id, finalValue);
    },
    [dataStep, onTargetChange, parameter.id, parameter.max, parameter.min],
  );

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    let next: number | null = null;
    let snap = true;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = valueRef.current + dataStep;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = valueRef.current - dataStep;
        break;
      case "PageUp":
        next = valueRef.current + dataStep * 10;
        break;
      case "PageDown":
        next = valueRef.current - dataStep * 10;
        break;
      case "Home":
        next = parameter.min;
        snap = false;
        break;
      case "End":
        next = parameter.max;
        snap = false;
        break;
      default:
        return;
    }

    event.preventDefault();
    applyValue(next, snap);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
    if (!Number.isFinite(next)) return;
    applyValue(next, false);
  }

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink-soft flex items-baseline justify-between gap-2">
        <span>{parameter.label || parameter.id}</span>
        <span ref={labelRef} className="tabular-nums" />
      </span>
      <input
        ref={inputRef}
        type="range"
        min={parameter.min}
        max={parameter.max}
        step={fineStep}
        defaultValue={initialValue}
        aria-label={`Параметр ${parameter.label || parameter.id}`}
        aria-valuetext={formatNumber(initialValue)}
        onChange={handleChange}
        onPointerUp={() => applyValue(valueRef.current, true)}
        onPointerCancel={() => applyValue(valueRef.current, true)}
        onBlur={() => applyValue(valueRef.current, true)}
        onKeyDown={handleKeyDown}
        className="graph-range accent-accent h-5 w-full"
      />
    </label>
  );
});

function InteractiveGraphContent({ data }: { data: InteractiveGraphBlockData }) {
  const clipId = `graph-clip-${useId().replace(/:/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const parameterList = useMemo(
    () => asArray<GraphParameter>(data.parameters),
    [data.parameters],
  );
  const expressionList = useMemo(
    () => asArray<GraphExpression>(data.expressions),
    [data.expressions],
  );
  const interactions = useMemo(
    () => asArray<string>(data.interactions),
    [data.interactions],
  );
  const initialViewport = useMemo(
    () => normalizeViewport(data.viewport),
    [data.viewport],
  );
  const [initialParameterValues] = useState(() => initialValues(parameterList));

  const traceEnabled = interactions.includes("trace");
  const zoomEnabled = interactions.includes("zoom");

  const parameterIds = useMemo(
    () =>
      parameterList
        .map((parameter) => parameter.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0),
    [parameterList],
  );

  const compiled = useMemo<CompiledItem[]>(() => {
    const parameterSet = new Set(parameterIds);
    return expressionList.map((expression, index) => {
      try {
        return {
          expression,
          compiled: compileExpression(expression.expr, parameterSet),
          error: null,
          color: colorFor(expression, index),
        };
      } catch (error) {
        return {
          expression,
          compiled: null,
          error: error instanceof Error ? error.message : "Ошибка выражения",
          color: colorFor(expression, index),
        };
      }
    });
  }, [expressionList, parameterIds]);

  const compiledRef = useRef(compiled);

  useEffect(() => {
    compiledRef.current = compiled;
  }, [compiled]);

  const targetsRef = useRef<Record<string, number>>({ ...initialParameterValues });
  const displayedRef = useRef<Record<string, number>>({
    ...initialParameterValues,
  });
  const [committedValues, setCommittedValues] =
    useState<Record<string, number>>(initialParameterValues);

  const [view, setView] = useState<GraphViewport>(initialViewport);
  const viewRef = useRef<GraphViewport>(initialViewport);
  const viewTargetRef = useRef<GraphViewport>(initialViewport);
  const reduceMotionRef = useRef(prefersReducedMotion);

  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  const pathElements = useRef<Array<SVGPathElement | null>>([]);
  const pathRefs = useMemo(
    () =>
      compiled.map((_item, index) => (element: SVGPathElement | null) => {
        pathElements.current[index] = element;
      }),
    [compiled],
  );

  const traceGroupRef = useRef<SVGGElement>(null);
  const traceLineRef = useRef<SVGLineElement>(null);
  const traceCircleElements = useRef<Array<SVGCircleElement | null>>([]);
  const traceCircleRefs = useMemo(
    () =>
      compiled.map((_item, index) => (element: SVGCircleElement | null) => {
        traceCircleElements.current[index] = element;
      }),
    [compiled],
  );
  const readoutRef = useRef<HTMLSpanElement>(null);
  const announceRef = useRef<HTMLDivElement>(null);
  const lastReadoutRef = useRef("");
  const traceXRef = useRef<number | null>(null);
  const pendingTraceXRef = useRef<number | null>(null);
  const traceFrameRef = useRef<number | null>(null);

  const updatePaths = useCallback(
    (values: Record<string, number>, nextView: GraphViewport) => {
      const items = compiledRef.current;
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const element = pathElements.current[index];
        if (!element) continue;
        if (!item?.compiled) {
          element.removeAttribute("d");
          continue;
        }
        const path = buildPath(item.compiled, values, nextView, LAYOUT);
        if (path) element.setAttribute("d", path);
        else element.removeAttribute("d");
      }
    },
    [],
  );

  const updateTrace = useCallback(
    (traceX: number | null) => {
      const group = traceGroupRef.current;
      if (!group) return;

      if (traceX === null) {
        group.style.display = "none";
        lastReadoutRef.current = "";
        if (readoutRef.current) {
          readoutRef.current.textContent = traceEnabled ? DEFAULT_TRACE_TEXT : "";
        }
        return;
      }

      group.style.display = "";
      const currentView = viewRef.current;
      const pixelX = mapX(traceX, currentView, LAYOUT);
      const line = traceLineRef.current;
      if (line) {
        line.setAttribute("x1", String(pixelX));
        line.setAttribute("x2", String(pixelX));
      }

      const parts = [`x = ${formatNumber(traceX)}`];
      compiledRef.current.forEach((item, index) => {
        const circle = traceCircleElements.current[index];
        if (!circle) return;
        if (!item.compiled) {
          circle.style.display = "none";
          return;
        }
        const value = sampleValue(item.compiled, traceX, displayedRef.current);
        if (value === null) {
          circle.style.display = "none";
          parts.push(`${item.expression.label || item.expression.id}: y = —`);
          return;
        }
        const pixelY = clamp(mapY(value, currentView, LAYOUT), -1e4, 1e4);
        circle.style.display = "";
        circle.setAttribute("cx", String(pixelX));
        circle.setAttribute("cy", String(pixelY));
        parts.push(
          `${item.expression.label || item.expression.id}: y = ${formatNumber(value)}`,
        );
      });

      const readout = parts.join(" · ");
      lastReadoutRef.current = readout;
      if (readoutRef.current) readoutRef.current.textContent = readout;
    },
    [traceEnabled],
  );

  const hideTrace = useCallback(() => {
    pendingTraceXRef.current = null;
    if (traceFrameRef.current !== null) {
      cancelFrame(traceFrameRef.current);
      traceFrameRef.current = null;
    }
    traceXRef.current = null;
    updateTrace(null);
  }, [updateTrace]);

  const applyImmediately = useCallback(() => {
    const viewChanged = !sameView(viewRef.current, viewTargetRef.current);
    displayedRef.current = { ...targetsRef.current };
    viewRef.current = { ...viewTargetRef.current };
    updatePaths(displayedRef.current, viewRef.current);
    if (traceXRef.current !== null) updateTrace(traceXRef.current);
    setCommittedValues({ ...displayedRef.current });
    if (viewChanged) setView({ ...viewRef.current });
  }, [updatePaths, updateTrace]);

  const stepRef = useRef<(timestamp: number) => void>(() => undefined);

  const scheduleFrame = useCallback((resetClock: boolean) => {
    if (frameRef.current !== null) return;
    if (resetClock) lastFrameTimeRef.current = null;
    const run = (timestamp: number) => {
      frameRef.current = null;
      stepRef.current(timestamp);
    };
    frameRef.current = requestFrame(run);
  }, []);

  const step = (timestamp: number) => {
    const previous = lastFrameTimeRef.current;
    const dt =
      previous === null ? 16.6667 : clamp(timestamp - previous, 1, MAX_FRAME_MS);
    lastFrameTimeRef.current = timestamp;
    // Frame-rate independent exponential smoothing.
    const alpha = 1 - Math.exp(-dt / SMOOTHING_TAU_MS);

    let valuesMoving = false;
    const targets = targetsRef.current;
    const displayed = displayedRef.current;
    for (const id of Object.keys(targets)) {
      const target = targets[id];
      const current = displayed[id];
      if (!Number.isFinite(current)) {
        displayed[id] = target;
        continue;
      }
      const difference = target - current;
      if (Math.abs(difference) <= VALUE_EPSILON * Math.max(1, Math.abs(target))) {
        displayed[id] = target;
      } else {
        displayed[id] = current + difference * alpha;
        valuesMoving = true;
      }
    }

    const targetView = viewTargetRef.current;
    const currentView = viewRef.current;
    const currentCenterX = (currentView.x_min + currentView.x_max) / 2;
    const currentCenterY = (currentView.y_min + currentView.y_max) / 2;
    const currentHalfX = (currentView.x_max - currentView.x_min) / 2;
    const currentHalfY = (currentView.y_max - currentView.y_min) / 2;
    const targetCenterX = (targetView.x_min + targetView.x_max) / 2;
    const targetCenterY = (targetView.y_min + targetView.y_max) / 2;
    const targetHalfX = (targetView.x_max - targetView.x_min) / 2;
    const targetHalfY = (targetView.y_max - targetView.y_min) / 2;

    // Scale interpolates in log space, so zooming feels uniform.
    const nextHalfX = Math.exp(
      Math.log(currentHalfX) + (Math.log(targetHalfX) - Math.log(currentHalfX)) * alpha,
    );
    const nextHalfY = Math.exp(
      Math.log(currentHalfY) + (Math.log(targetHalfY) - Math.log(currentHalfY)) * alpha,
    );
    const nextCenterX = currentCenterX + (targetCenterX - currentCenterX) * alpha;
    const nextCenterY = currentCenterY + (targetCenterY - currentCenterY) * alpha;

    const viewMoving = !(
      isClose(nextCenterX, targetCenterX) &&
      isClose(nextCenterY, targetCenterY) &&
      isClose(nextHalfX, targetHalfX) &&
      isClose(nextHalfY, targetHalfY)
    );

    viewRef.current = viewMoving
      ? {
          x_min: nextCenterX - nextHalfX,
          x_max: nextCenterX + nextHalfX,
          y_min: nextCenterY - nextHalfY,
          y_max: nextCenterY + nextHalfY,
        }
      : { ...targetView };

    updatePaths(displayed, viewRef.current);
    if (traceXRef.current !== null) updateTrace(traceXRef.current);

    if (viewMoving) {
      // Grid labels must follow the animated viewport, so commit view state
      // once per frame. Parameter-only dragging never takes this branch.
      setView({ ...viewRef.current });
      setCommittedValues({ ...displayed });
    }

    if (valuesMoving || viewMoving) {
      scheduleFrame(false);
    } else {
      lastFrameTimeRef.current = null;
      setCommittedValues({ ...displayed });
      if (!sameView(viewRef.current, view)) {
        setView({ ...viewRef.current });
      }
    }
  };

  useEffect(() => {
    stepRef.current = step;
  });

  const handleParameterChange = useCallback(
    (id: string, value: number) => {
      // If a zoom is still animating, finish it immediately: a slider drag
      // must never commit view state on every frame.
      if (!sameView(viewRef.current, viewTargetRef.current)) {
        viewRef.current = { ...viewTargetRef.current };
        setView({ ...viewRef.current });
      }
      targetsRef.current = { ...targetsRef.current, [id]: value };
      if (reduceMotionRef.current) {
        applyImmediately();
        return;
      }
      scheduleFrame(true);
    },
    [applyImmediately, scheduleFrame],
  );

  const zoom = useCallback(
    (factor: number) => {
      // Finish a parameter animation first, so only the viewport animates.
      displayedRef.current = { ...targetsRef.current };
      updatePaths(displayedRef.current, viewRef.current);
      setCommittedValues({ ...displayedRef.current });

      const current = viewTargetRef.current;
      const centerX = (current.x_min + current.x_max) / 2;
      const centerY = (current.y_min + current.y_max) / 2;
      const halfX = ((current.x_max - current.x_min) / 2) * factor;
      const halfY = ((current.y_max - current.y_min) / 2) * factor;
      if (halfX < 1e-4 || halfY < 1e-4 || halfX > 1e6 || halfY > 1e6) {
        return;
      }

      viewTargetRef.current = {
        x_min: centerX - halfX,
        x_max: centerX + halfX,
        y_min: centerY - halfY,
        y_max: centerY + halfY,
      };
      hideTrace();
      if (reduceMotionRef.current) applyImmediately();
      else scheduleFrame(true);
    },
    [applyImmediately, hideTrace, scheduleFrame, updatePaths],
  );

  const resetView = useCallback(() => {
    displayedRef.current = { ...targetsRef.current };
    updatePaths(displayedRef.current, viewRef.current);
    setCommittedValues({ ...displayedRef.current });
    viewTargetRef.current = initialViewport;
    hideTrace();
    if (reduceMotionRef.current) applyImmediately();
    else scheduleFrame(true);
  }, [applyImmediately, hideTrace, initialViewport, scheduleFrame, updatePaths]);

  useEffect(() => {
    if (readoutRef.current) {
      readoutRef.current.textContent = traceEnabled ? DEFAULT_TRACE_TEXT : "";
    }
    if (traceGroupRef.current) traceGroupRef.current.style.display = "none";
  }, [traceEnabled]);

  useEffect(() => {
    reduceMotionRef.current = prefersReducedMotion;
    if (!prefersReducedMotion) return;
    if (frameRef.current !== null) {
      cancelFrame(frameRef.current);
      frameRef.current = null;
    }
    lastFrameTimeRef.current = null;
    applyImmediately();
  }, [applyImmediately, prefersReducedMotion]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelFrame(frameRef.current);
      if (traceFrameRef.current !== null) cancelFrame(traceFrameRef.current);
    },
    [],
  );

  const flushTrace = useCallback(() => {
    traceFrameRef.current = null;
    const nextX = pendingTraceXRef.current;
    traceXRef.current = nextX;
    updateTrace(nextX);
  }, [updateTrace]);

  function announceTrace() {
    if (announceRef.current && lastReadoutRef.current) {
      announceRef.current.textContent = lastReadoutRef.current;
    }
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!traceEnabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0) return;

    const plotLeft = PADDING;
    const plotRight = WIDTH - PADDING;
    const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    if (relativeX < plotLeft || relativeX > plotRight) {
      hideTrace();
      return;
    }

    const currentView = viewRef.current;
    const x =
      currentView.x_min +
      ((relativeX - plotLeft) / (plotRight - plotLeft)) *
        (currentView.x_max - currentView.x_min);
    pendingTraceXRef.current = x;

    if (traceFrameRef.current !== null) return;
    traceFrameRef.current = requestFrame(() => flushTrace());
  }

  function handlePointerUp() {
    if (traceFrameRef.current !== null) {
      cancelFrame(traceFrameRef.current);
      traceFrameRef.current = null;
      flushTrace();
    }
    announceTrace();
  }

  function handleGraphKeyDown(event: ReactKeyboardEvent<SVGSVGElement>) {
    if (!traceEnabled) return;
    const currentView = viewRef.current;
    const span = currentView.x_max - currentView.x_min;
    const step = span / TRACE_STEP_DIVISIONS;
    const current = traceXRef.current ?? (currentView.x_min + currentView.x_max) / 2;
    let next: number | null;

    switch (event.key) {
      case "ArrowLeft":
        next = clamp(current - step, currentView.x_min, currentView.x_max);
        break;
      case "ArrowRight":
        next = clamp(current + step, currentView.x_min, currentView.x_max);
        break;
      case "Home":
        next = currentView.x_min;
        break;
      case "End":
        next = currentView.x_max;
        break;
      case "Escape":
        next = null;
        break;
      default:
        return;
    }

    event.preventDefault();
    if (traceFrameRef.current !== null) {
      cancelFrame(traceFrameRef.current);
      traceFrameRef.current = null;
    }
    traceXRef.current = next;
    pendingTraceXRef.current = next;
    updateTrace(next);
    announceTrace();
  }

  const parameters = parameterList.filter(
    (parameter) =>
      parameter &&
      typeof parameter.id === "string" &&
      Number.isFinite(parameter.min) &&
      Number.isFinite(parameter.max) &&
      parameter.min < parameter.max,
  );

  const expressionErrors = compiled.filter((item) => item.error);
  const ariaLabel = compiled.length
    ? `Интерактивный график функций: ${compiled
        .map((item) => item.expression.label || item.expression.id)
        .join(", ")}`
    : "Интерактивный график";

  return (
    <div className="article-graph flex flex-col gap-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        focusable="false"
        tabIndex={traceEnabled ? 0 : undefined}
        className="border-line bg-canvas focus-visible:outline-accent w-full rounded-lg border focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ touchAction: "pan-y", aspectRatio: "480 / 280" }}
        onPointerMove={handlePointerMove}
        onPointerLeave={hideTrace}
        onPointerUp={handlePointerUp}
        onKeyDown={handleGraphKeyDown}
      >
        <title>{ariaLabel}</title>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={PADDING}
              y={PADDING}
              width={WIDTH - 2 * PADDING}
              height={HEIGHT - 2 * PADDING}
            />
          </clipPath>
        </defs>

        <GridAxes view={view} layout={LAYOUT} />

        <CurveLayer
          items={compiled}
          values={committedValues}
          view={view}
          layout={LAYOUT}
          clipId={clipId}
          pathRefs={pathRefs}
        />

        {traceEnabled ? (
          <g
            ref={traceGroupRef}
            clipPath={`url(#${clipId})`}
            style={{ display: "none" }}
            data-graph-trace=""
          >
            <line
              ref={traceLineRef}
              x1={PADDING}
              x2={PADDING}
              y1={PADDING}
              y2={HEIGHT - PADDING}
              stroke="var(--color-ink-faint)"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            {compiled.map((item, index) =>
              item.compiled ? (
                <circle
                  key={item.expression.id ?? index}
                  ref={traceCircleRefs[index]}
                  r={4}
                  fill={item.color}
                  style={{ display: "none" }}
                />
              ) : null,
            )}
          </g>
        ) : null}
      </svg>

      <Legend items={compiled} />

      <div
        className="text-ink-soft h-6 overflow-x-auto overflow-y-hidden text-sm whitespace-nowrap tabular-nums"
        data-graph-readout=""
      >
        <span ref={readoutRef} aria-live="off" />
      </div>
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {zoomEnabled ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => zoom(0.8)}
            aria-label="Приблизить график"
            className="border-line-strong text-ink hover:bg-surface-subtle min-h-9 rounded-md border px-3 text-sm"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoom(1.25)}
            aria-label="Отдалить график"
            className="border-line-strong text-ink hover:bg-surface-subtle min-h-9 rounded-md border px-3 text-sm"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetView}
            className="border-line-strong text-ink hover:bg-surface-subtle min-h-9 rounded-md border px-3 text-sm"
          >
            Сбросить вид
          </button>
        </div>
      ) : null}

      {parameters.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {parameters.map((parameter) => (
            <ParameterSlider
              key={parameter.id}
              parameter={parameter}
              initialValue={
                initialParameterValues[parameter.id] ??
                finite(parameter.default, parameter.min)
              }
              onTargetChange={handleParameterChange}
            />
          ))}
        </div>
      ) : null}

      {expressionErrors.length > 0 ? (
        <ul className="text-danger text-sm" role="alert">
          {expressionErrors.map((item, index) => (
            <li key={item.expression.id ?? index}>
              {item.expression.label || item.expression.id}: {item.error}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
