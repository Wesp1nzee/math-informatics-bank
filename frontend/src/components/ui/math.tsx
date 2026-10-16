import katex from "katex";

import { cn } from "@/lib/utils/cn";

type MathProps = {
  tex: string;
  display?: boolean;
  className?: string;
};

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
