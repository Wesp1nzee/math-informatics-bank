import katex from "katex";

import { cn } from "@/lib/utils/cn";

type MathProps = {
  /** LaTeX source. Authored in this repository — never user input. */
  tex: string;
  /** Block-level formula (centred, own line) instead of inline. */
  display?: boolean;
  className?: string;
};

/**
 * Renders a formula to HTML **on the server** with KaTeX.
 *
 * Because `katex.renderToString` is synchronous, public pages ship rendered
 * formulas inside the server HTML: no client bundle cost and no layout shift
 * after hydration. KaTeX also emits MathML for screen readers.
 */
export function Math({ tex, display = false, className }: MathProps) {
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: display,
    output: "htmlAndMathml",
    strict: "ignore",
  });

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
