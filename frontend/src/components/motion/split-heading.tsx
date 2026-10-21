import type { CSSProperties } from "react";

import { cn } from "@/lib/utils/cn";

export type SplitWord = {
  text: string;
  accent?: boolean;
  stroke?: boolean;
};

export type SplitLine = readonly SplitWord[];

type SplitHeadingProps = {
  lines: readonly SplitLine[];
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
  className?: string;
  animate?: "load" | "view" | "none";
  lineClassNames?: readonly (string | undefined)[];
};

/**
 * Server-rendered kinetic typography. Words are real inline elements separated by
 * real spaces, so wrapping, search and screen readers keep working. Only transform
 * is animated; the text is painted without waiting for JavaScript.
 */
export function SplitHeading({
  lines,
  as: Tag = "h2",
  id,
  className,
  animate = "view",
  lineClassNames,
}: SplitHeadingProps) {
  let index = 0;

  return (
    <Tag id={id} className={cn("split-heading", className)} data-split={animate}>
      {lines.map((line, lineIndex) => (
        <span
          className={cn("split-line", lineClassNames?.[lineIndex])}
          key={lineIndex}
        >
          {line.map((word, wordIndex) => {
            const space = wordIndex < line.length - 1 ? " " : "";
            return (
              <span key={`${word.text}-${wordIndex}`}>
                <span
                  className={cn(
                    "split-word",
                    word.accent && "serif-accent text-accent",
                    word.stroke && "split-word-stroke",
                  )}
                  style={{ "--i": index++ } as CSSProperties}
                >
                  {word.text}
                  {word.stroke ? (
                    <svg
                      className="word-stroke"
                      viewBox="0 0 220 14"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        d="M4 9.5C48 3.5 156 2.5 216 7.5"
                        pathLength={1}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : null}
                </span>
                {space}
              </span>
            );
          })}
          {lineIndex < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
