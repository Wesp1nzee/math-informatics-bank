import type { ReactNode } from "react";

import { Math } from "@/components/ui/math";
import { isExternalHref, isRecord, safeHref } from "@/features/articles/runtime";

export function InlineNodes({
  nodes,
}: {
  nodes: readonly unknown[] | undefined;
}): ReactNode {
  if (!Array.isArray(nodes) || nodes.length === 0) return null;

  return (
    <>
      {nodes.map((node, index) => (
        <InlineNodeView key={index} node={node} />
      ))}
    </>
  );
}

function InlineNodeView({ node }: { node: unknown }): ReactNode {
  if (!isRecord(node) || typeof node.type !== "string") return null;

  switch (node.type) {
    case "text":
      return typeof node.text === "string" ? node.text : null;
    case "strong":
      return (
        <strong className="text-ink font-semibold">
          <InlineNodes nodes={node.children as readonly unknown[] | undefined} />
        </strong>
      );
    case "em":
      return (
        <em>
          <InlineNodes nodes={node.children as readonly unknown[] | undefined} />
        </em>
      );
    case "code":
      return (
        <code className="bg-surface-subtle rounded px-1 py-0.5 font-mono text-[0.9em]">
          {typeof node.text === "string" ? node.text : ""}
        </code>
      );
    case "link": {
      const children = (
        <InlineNodes nodes={node.children as readonly unknown[] | undefined} />
      );
      const href = safeHref(node.href);
      if (!href) return <span>{children}</span>;
      const external = isExternalHref(href);
      return (
        <a
          href={href}
          className="text-accent hover:text-accent-strong underline underline-offset-4"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }
    case "math":
      return <Math tex={typeof node.tex === "string" ? node.tex : ""} />;
    case "br":
      return <br />;
    default:
      return null;
  }
}
