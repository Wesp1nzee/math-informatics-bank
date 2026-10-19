import katex from "katex";

import { cn } from "@/lib/utils/cn";

type MathProps = {
  tex: string;
  display?: boolean;
  className?: string;
};

/**
 * Server-friendly KaTeX renderer. Invalid LaTeX never throws on the page: the
 * raw TeX is shown in a `<code>` fallback instead.
 *
 * `dangerouslySetInnerHTML` is used only for KaTeX's own output, never for
 * article-authored HTML.
 */
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
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <span
      className={cn("inline-block", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
