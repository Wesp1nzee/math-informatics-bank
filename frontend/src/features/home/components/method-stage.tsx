"use client";

import { useEffect, useRef, useState } from "react";

const TRACE = [
  { id: "01", title: "Решение", value: "f′(2) = 3" },
  { id: "02", title: "Ход мысли", value: "знак потерян" },
  { id: "03", title: "Причина", value: "подстановка" },
] as const;

export function MethodStage({ active: initial = 0 }: { active?: number }) {
  const [active, setActive] = useState(initial);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>("[data-pinned]");
    if (!root) return;
    const onStep = (event: Event) => {
      setActive(Number((event as CustomEvent<number>).detail ?? 0));
    };
    root.addEventListener("pinned-step", onStep);
    return () => root.removeEventListener("pinned-step", onStep);
  }, []);

  return (
    <div ref={ref} className="glass border-line rounded-2xl border p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="mono-label">TRACE / COMPARE</span>
        <span className="metric-chip">
          <b>{String(active + 1).padStart(2, "0")}</b>
          <span className="text-ink-soft">/ 03</span>
        </span>
      </div>

      <svg
        className="mt-5 h-40 w-full"
        viewBox="0 0 420 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="method-line-a" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
            <stop offset="60%" stopColor="var(--color-accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="method-line-b" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-line-strong)" stopOpacity="0.2" />
            <stop offset="55%" stopColor="var(--color-danger)" stopOpacity="0.75" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <g stroke="var(--color-line)" strokeWidth="1" opacity="0.7">
          <line x1="0" y1="40" x2="420" y2="40" />
          <line x1="0" y1="80" x2="420" y2="80" />
          <line x1="0" y1="120" x2="420" y2="120" />
        </g>

        <path
          d="M8 124 C 86 118, 128 68, 194 76 S 308 54, 412 30"
          fill="none"
          stroke="url(#method-line-a)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M8 124 C 88 120, 130 92, 188 104 S 280 132, 326 96 S 372 64, 412 30"
          fill="none"
          stroke="url(#method-line-b)"
          strokeWidth="2"
          strokeDasharray="5 6"
          strokeLinecap="round"
        />
        <circle cx="194" cy="76" r="5" fill="var(--color-accent)" />
        <circle cx="188" cy="104" r="5" fill="var(--color-danger)" />
        <circle cx="412" cy="30" r="6" fill="var(--color-success)" />
      </svg>

      <ol className="m-0 mt-4 grid list-none gap-2 p-0">
        {TRACE.map((row, index) => (
          <li
            key={row.id}
            className="method-trace-row border-line bg-surface-subtle flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
            data-active={index === active ? "" : undefined}
          >
            <span className="text-ink-faint font-mono text-sm">{row.id}</span>
            <span className="text-ink-soft flex-1 text-sm">{row.title}</span>
            <b className="text-ink font-mono text-sm">{row.value}</b>
          </li>
        ))}
      </ol>
    </div>
  );
}
