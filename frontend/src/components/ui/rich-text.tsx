import type { ReactNode } from "react";

import { Math } from "@/components/ui/math";

export function RichText({ text, className }: { text: string; className?: string }) {
  const token = /\$([^$]+)\$/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = token.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }
    nodes.push(<Math key={`${match.index}-${match[1]}`} tex={match[1]} />);
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return <span className={className}>{nodes}</span>;
}
