import { Fragment, type ReactNode } from "react";

import { Math } from "@/components/ui/math";
import { RichText } from "@/components/ui/rich-text";
import type { ArticleBlock } from "@/features/articles/types";

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-ink-soft text-lg leading-relaxed">
          <RichText text={block.text} />
        </p>
      );
    case "heading":
      return (
        <h2 id={block.id} className="heading-3 mt-6 scroll-mt-24 text-balance">
          {block.text}
        </h2>
      );
    case "list":
      return block.ordered ? (
        <ol className="text-ink-soft m-0 list-decimal space-y-2 pl-6 text-lg">
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="text-ink-soft m-0 list-disc space-y-2 pl-6 text-lg">
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </ul>
      );
    case "formula":
      return (
        <figure className="border-accent-soft my-2 flex max-w-full min-w-0 flex-col gap-2 overflow-x-auto border-l-2 py-1 pl-4">
          <Math display tex={block.tex} />
          {block.caption ? (
            <figcaption className="text-ink-faint text-sm">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "quote":
      return (
        <blockquote className="border-accent text-ink border-l-2 pl-5 text-xl leading-snug font-medium">
          {block.text}
        </blockquote>
      );
  }
}

export function ArticleBody({
  blocks,
  midSlot,
}: {
  blocks: readonly ArticleBlock[];

  midSlot?: ReactNode;
}) {
  const midIndex = globalThis.Math.floor((blocks.length - 1) / 2);

  return (
    <div className="flex w-full max-w-[68ch] min-w-0 flex-col gap-5">
      {blocks.map((block, index) => (
        <Fragment key={`${block.type}-${"id" in block ? block.id : index}`}>
          <ArticleBlockView block={block} />
          {midSlot && index === midIndex ? midSlot : null}
        </Fragment>
      ))}
    </div>
  );
}
