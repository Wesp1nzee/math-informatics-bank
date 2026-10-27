import { InlineNodes } from "@/features/articles/components/renderer/inline-nodes";
import { asArray } from "@/features/articles/runtime";
import type { ArticleBlockV2, InlineNode } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "rich_text" }>;

export function RichTextBlock({ block }: { block: Block }) {
  const { kind, children, level, ordered, items } = block.data;

  if (kind === "heading") {
    const Tag = level === 3 ? "h3" : "h2";
    const className =
      level === 3
        ? "text-ink mt-6 scroll-mt-24 text-2xl font-medium tracking-[-0.02em] text-balance"
        : "heading-3 mt-6 scroll-mt-24 text-balance";
    return (
      <Tag id={block.id} className={className}>
        <InlineNodes nodes={children} />
      </Tag>
    );
  }

  if (kind === "list") {
    const listItems = asArray<InlineNode[]>(items);
    const Tag = ordered ? "ol" : "ul";
    const className = ordered
      ? "text-ink m-0 list-decimal space-y-2 pl-6 text-lg"
      : "text-ink m-0 list-disc space-y-2 pl-6 text-lg";

    return (
      <Tag className={className}>
        {listItems.map((item, index) => (
          <li key={index}>
            <InlineNodes nodes={asArray<InlineNode>(item)} />
          </li>
        ))}
      </Tag>
    );
  }

  return (
    <p className="text-ink text-lg leading-relaxed">
      <InlineNodes nodes={children} />
    </p>
  );
}
