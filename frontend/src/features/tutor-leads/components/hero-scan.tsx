"use client";

import { useEffect } from "react";

import { scanWorld } from "@/features/world/bus";

const AXES = [
  { label: "Алгебра", x: 300, y: 54, value: 0.86 },
  { label: "Геометрия", x: 552, y: 300, value: 0.68 },
  { label: "Программирование", x: 300, y: 556, value: 0.78 },
  { label: "Логика", x: 48, y: 300, value: 0.72 },
] as const;

const CENTER = 300;

function point(value: number, angle: number): [number, number] {
  const radius = 216 * value;
  return [CENTER + Math.cos(angle) * radius, CENTER + Math.sin(angle) * radius];
}

const POLY = AXES.map((axis, index) =>
  point(axis.value, -Math.PI / 2 + (index * Math.PI) / 2),
)
  .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
  .join(" ");

export function HeroScan() {
  useEffect(() => {
    const timer = window.setTimeout(() => scanWorld(), 600);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="scan-radar" aria-hidden="true">
      <svg viewBox="0 0 600 600" className="h-full w-full" focusable="false">
        <defs>
          <radialGradient id="scan-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.34" />
            <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0.08" />
          </radialGradient>
          <linearGradient id="scan-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-cyan)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g fill="none" stroke="var(--color-line-strong)" opacity="0.5">
          <circle cx={CENTER} cy={CENTER} r="216" />
          <circle cx={CENTER} cy={CENTER} r="162" />
          <circle cx={CENTER} cy={CENTER} r="108" />
          <circle cx={CENTER} cy={CENTER} r="54" />
          <line x1={CENTER} y1="84" x2={CENTER} y2="516" />
          <line x1="84" y1={CENTER} x2="516" y2={CENTER} />
          <line x1="147" y1="147" x2="453" y2="453" />
          <line x1="453" y1="147" x2="147" y2="453" />
        </g>

        <g className="scan-radar-sweep">
          <path
            d={`M${CENTER} ${CENTER} L${CENTER} 84 A216 216 0 0 1 ${CENTER + 216 * Math.sin(Math.PI / 3)} ${CENTER - 216 * Math.cos(Math.PI / 3)} Z`}
            fill="url(#scan-sweep)"
          />
          <line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER}
            y2="84"
            stroke="var(--color-cyan)"
            strokeWidth="1.5"
            opacity="0.7"
          />
        </g>

        <polygon
          points={POLY}
          fill="url(#scan-fill)"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {AXES.map((axis, index) => {
          const [x, y] = point(axis.value, -Math.PI / 2 + (index * Math.PI) / 2);
          return (
            <circle
              key={axis.label}
              cx={x}
              cy={y}
              r="5"
              fill="var(--color-cyan)"
              stroke="var(--color-surface)"
              strokeWidth="2"
            />
          );
        })}

        {AXES.map((axis) => (
          <text
            key={`label-${axis.label}`}
            x={axis.x}
            y={axis.y}
            textAnchor={
              axis.x === CENTER ? "middle" : axis.x < CENTER ? "start" : "end"
            }
            fill="var(--color-ink-soft)"
            fontSize="14"
            fontFamily="var(--font-mono)"
          >
            {axis.label}
          </text>
        ))}

        <text
          x={CENTER}
          y={CENTER - 10}
          textAnchor="middle"
          fill="var(--color-ink)"
          fontSize="22"
          fontWeight="600"
        >
          СКАН
        </text>
        <text
          x={CENTER}
          y={CENTER + 18}
          textAnchor="middle"
          fill="var(--color-ink-faint)"
          fontSize="14"
          fontFamily="var(--font-mono)"
        >
          КОМПЕТЕНЦИИ
        </text>
      </svg>
    </div>
  );
}
