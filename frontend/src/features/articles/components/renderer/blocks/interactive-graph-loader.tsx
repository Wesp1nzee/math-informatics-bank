"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { asArray } from "@/features/articles/runtime";
import type {
  GraphExpression,
  GraphParameter,
  InteractiveGraphBlockData,
} from "@/features/articles/types";

const DEFAULT_TRACE_TEXT = "Проведите по графику, чтобы увидеть значения.";

const loadGraph = () =>
  import("@/features/articles/components/renderer/blocks/interactive-graph").then(
    (module) => module.InteractiveGraph,
  );

const InteractiveGraph = dynamic(loadGraph, {
  ssr: false,
  loading: () => null,
});

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * Mirrors the real block's geometry: plot aspect ratio, legend row, fixed
 * trace readout, zoom controls and parameter sliders. Text is invisible but
 * occupies the same space, so the chunk swap introduces no layout shift.
 */
function InteractiveGraphSkeleton({
  data,
  loading,
}: {
  data: InteractiveGraphBlockData;
  loading: boolean;
}) {
  const expressions = asArray<GraphExpression>(data.expressions);
  const parameters = asArray<GraphParameter>(data.parameters).filter(
    (parameter) =>
      parameter &&
      typeof parameter.id === "string" &&
      Number.isFinite(parameter.min) &&
      Number.isFinite(parameter.max) &&
      parameter.min < parameter.max,
  );
  const interactions = asArray<string>(data.interactions);
  const zoomEnabled = interactions.includes("zoom");
  const traceEnabled = interactions.includes("trace");

  return (
    <div
      role={loading ? "status" : undefined}
      aria-busy={loading || undefined}
      aria-label={loading ? "Загружаем график…" : undefined}
      className="flex flex-col gap-4"
    >
      <div
        aria-hidden="true"
        className="border-line bg-canvas w-full rounded-lg border border-dashed"
        style={{ aspectRatio: "480 / 280" }}
      />

      {expressions.length > 0 ? (
        <div aria-hidden="true" className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {expressions.map((expression, index) => (
            <span
              key={expression.id ?? index}
              className="text-ink-soft invisible inline-flex items-center gap-2"
            >
              <span className="inline-block size-2 rounded-full" />
              {expression.label || expression.id}
            </span>
          ))}
        </div>
      ) : null}

      <div
        aria-hidden="true"
        className="text-ink-soft invisible h-6 overflow-x-auto overflow-y-hidden text-sm whitespace-nowrap tabular-nums"
      >
        {traceEnabled ? DEFAULT_TRACE_TEXT : null}
      </div>

      {zoomEnabled ? (
        <div aria-hidden="true" className="flex flex-wrap items-center gap-2">
          {["+", "−", "Сбросить вид"].map((label) => (
            <span
              key={label}
              className="border-line-strong text-ink invisible inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-sm"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {parameters.length > 0 ? (
        <div aria-hidden="true" className="grid gap-3 sm:grid-cols-2">
          {parameters.map((parameter) => (
            <div key={parameter.id} className="flex flex-col gap-1 text-sm">
              <span className="text-ink-soft invisible flex items-baseline justify-between gap-2">
                <span>{parameter.label || parameter.id}</span>
                <span className="tabular-nums">{formatNumber(parameter.default)}</span>
              </span>
              <span className="invisible block h-5" />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function InteractiveGraphLoader({ data }: { data: InteractiveGraphBlockData }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadGraph().then(
      () => {
        if (active) setReady(true);
      },
      () => {
        if (active) setReady(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid">
      {/* Both layers share one grid cell, so the skeleton reserves the exact
          geometry and the ready graph simply paints over it. */}
      <div
        aria-hidden={ready || undefined}
        className="pointer-events-none col-start-1 row-start-1"
      >
        <InteractiveGraphSkeleton data={data} loading={!ready} />
      </div>
      <div className="col-start-1 row-start-1">
        {ready ? <InteractiveGraph data={data} /> : null}
      </div>
    </div>
  );
}
