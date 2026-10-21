import type { CSSProperties } from "react";

import { TUTORING_FACTS } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

function Art({ index }: { index: number }) {
  const common = {
    className: "bento-art micro-anim",
    viewBox: "0 0 180 54",
    "aria-hidden": true as const,
    fill: "none",
  };

  if (index === 0) {
    return (
      <svg {...common}>
        <rect x="2" y="14" width="46" height="26" rx="7" stroke="currentColor" opacity="0.45" />
        <text x="25" y="31" textAnchor="middle" fill="currentColor" fontSize="10" fontFamily="var(--font-mono)">
          ответ
        </text>
        <path className="micro-dash" d="M52 27h24" stroke="currentColor" strokeWidth="1.4" pathLength={1} />
        <path d="m72 22 6 5-6 5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="84" y="10" width="72" height="34" rx="8" stroke="var(--signal)" opacity="0.7" />
        <text x="120" y="31" textAnchor="middle" fill="var(--signal)" fontSize="10" fontFamily="var(--font-mono)">
          почему
        </text>
        <circle className="micro-pop" cx="160" cy="14" r="4" fill="var(--signal)" opacity="0.8" />
      </svg>
    );
  }

  if (index === 1) {
    return (
      <svg {...common}>
        <line x1="10" y1="32" x2="170" y2="32" stroke="currentColor" opacity="0.22" strokeWidth="2" />
        <line
          className="micro-fill"
          x1="10"
          y1="32"
          x2="170"
          y2="32"
          stroke="currentColor"
          strokeWidth="2"
          pathLength={1}
          style={{ "--fill": "0.62" } as CSSProperties}
        />
        {[0, 1, 2, 3, 4].map((tick) => (
          <line
            key={tick}
            x1={10 + tick * 40}
            y1="27"
            x2={10 + tick * 40}
            y2="37"
            stroke="currentColor"
            opacity="0.35"
          />
        ))}
        <circle cx="109" cy="32" r="6" fill="var(--color-surface)" stroke="currentColor" strokeWidth="2" />
        <text x="10" y="16" fill="currentColor" fontSize="10" fontFamily="var(--font-mono)" opacity="0.6">
          уровень
        </text>
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg {...common}>
        <circle cx="60" cy="27" r="20" stroke="currentColor" opacity="0.4" />
        <text x="60" y="32" textAnchor="middle" fill="currentColor" fontSize="15" fontFamily="var(--font-serif)">
          М
        </text>
        <path d="M88 27h10" stroke="currentColor" opacity="0.4" />
        <circle cx="120" cy="27" r="20" stroke="var(--signal)" opacity="0.65" />
        <text x="120" y="32" textAnchor="middle" fill="var(--signal)" fontSize="15" fontFamily="var(--font-serif)">
          И
        </text>
        <circle className="micro-pop" cx="90" cy="27" r="3" fill="currentColor" />
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg {...common}>
        {[0, 1, 2].map((row) => (
          <g key={row} transform={`translate(8 ${10 + row * 14})`}>
            <rect x="0" y="0" width="10" height="10" rx="2" stroke="currentColor" opacity="0.45" />
            <path
              className="micro-check"
              d="m1.5 5 2.2 2.2L8.5 2.4"
              stroke="currentColor"
              strokeWidth="1.4"
              pathLength={1}
              style={{ animationDelay: `${row * 180}ms` } as CSSProperties}
            />
            <line x1="18" y1="5" x2={90 - row * 12} y2="5" stroke="currentColor" opacity="0.3" />
          </g>
        ))}
        <text x="118" y="20" fill="currentColor" fontSize="10" fontFamily="var(--font-mono)" opacity="0.6">
          2 / 3
        </text>
      </svg>
    );
  }

  if (index === 4) {
    return (
      <svg {...common}>
        <path
          className="micro-pop"
          d="M16 12h62a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H44l-11 8 2-8H16a8 8 0 0 1-8-8V20a8 8 0 0 1 8-8Z"
          stroke="currentColor"
          opacity="0.55"
        />
        <line x1="24" y1="24" x2="76" y2="24" stroke="currentColor" opacity="0.45" />
        <line x1="24" y1="32" x2="58" y2="32" stroke="currentColor" opacity="0.35" />
        <path className="micro-dash" d="M100 32h34" stroke="currentColor" strokeWidth="1.3" pathLength={1} />
        <circle cx="148" cy="32" r="12" stroke="var(--signal)" opacity="0.65" />
        <path d="m143 32 3 3 6-7" stroke="var(--signal)" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      {[0, 1, 2].map((ring) => (
        <circle
          key={ring}
          className="micro-ring"
          cx={28 + ring * 30}
          cy="27"
          r={11 + ring * 2}
          stroke={ring === 2 ? "var(--signal)" : "currentColor"}
          strokeWidth="2"
          pathLength={1}
          opacity={ring === 2 ? 0.7 : 1}
          style={{ animationDelay: `${ring * 160}ms` } as CSSProperties}
        />
      ))}
      <text x="110" y="22" fill="currentColor" fontSize="10" fontFamily="var(--font-mono)" opacity="0.6">
        закрыто тем
      </text>
      <text x="110" y="38" fill="var(--signal)" fontSize="12" fontFamily="var(--font-mono)">
        проседает
      </text>
    </svg>
  );
}

export function FactsBento({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <ul className={cn("bento", compact && "bento-compact", className)}>
      {TUTORING_FACTS.map((fact, index) => (
        <li key={fact.title} className="bento-tile reveal" style={{ "--i": index } as CSSProperties}>
          <div>
            <b className="bento-title">{fact.title}</b>
            <span className="bento-text mt-1.5">{fact.text}</span>
          </div>
          <Art index={index} />
        </li>
      ))}
    </ul>
  );
}
