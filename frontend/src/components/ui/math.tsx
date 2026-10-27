import "katex/dist/katex.min.css";
import katex from "katex";

import { cn } from "@/lib/utils/cn";

type MathProps = {
  tex: string;
  display?: boolean;
  className?: string;
};

export function Math({ tex, display = false, className }: MathProps) {
  if (typeof tex !== "string" || tex.trim() === "") return null;

  let html: string;
  try {
    html = katex.renderToString(tex, {
      throwOnError: true,
      displayMode: display,
      output: "htmlAndMathml",
      strict: "ignore",
    });
  } catch {
    return (
      <code
        data-katex-fallback="true"
        className={cn(
          "bg-surface-subtle rounded px-1 font-mono text-[0.9em]",
          className,
        )}
      >
        {tex}
      </code>
    );
  }

  if (display) {
    return (
      <div
        className={cn("max-w-full min-w-0 overflow-x-auto py-1", className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-block max-w-full overflow-x-auto overflow-y-hidden align-baseline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
