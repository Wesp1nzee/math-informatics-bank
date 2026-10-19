import { Fragment, type ReactNode } from "react";

import { CalloutBlock } from "@/features/articles/components/renderer/blocks/callout-block";
import { DividerBlock } from "@/features/articles/components/renderer/blocks/divider-block";
import { HintBlock } from "@/features/articles/components/renderer/blocks/hint-block";
import { ImageBlock } from "@/features/articles/components/renderer/blocks/image-block";
import { InteractiveGraphBlock } from "@/features/articles/components/renderer/blocks/interactive-graph-block";
import { MathBlock } from "@/features/articles/components/renderer/blocks/math-block";
import { NumericInputBlock } from "@/features/articles/components/renderer/blocks/numeric-input-block";
import { RichTextBlock } from "@/features/articles/components/renderer/blocks/rich-text-block";
import { SingleChoiceBlock } from "@/features/articles/components/renderer/blocks/single-choice-block";
import { StepSolutionBlock } from "@/features/articles/components/renderer/blocks/step-solution-block";
import { UnknownBlock } from "@/features/articles/components/renderer/unknown-block";
import { isRecord } from "@/features/articles/runtime";
import type { ArticleBlockV2, ArticleContent } from "@/features/articles/types";

export function ArticleRenderer({
  content,
  articleSlug,
  midSlot,
}: {
  content: ArticleContent | null | undefined;

  articleSlug?: string;

  midSlot?: ReactNode;
}) {
  if (!content || content.version !== 2 || !Array.isArray(content.blocks)) {
    return <UnknownBlock label="Контент статьи недоступен" />;
  }

  const blocks = content.blocks;
  if (blocks.length === 0) return null;

  const midIndex = Math.floor((blocks.length - 1) / 2);

  return (
    <div className="flex max-w-[68ch] flex-col gap-5">
      {blocks.map((block, index) => (
        <Fragment
          key={
            isRecord(block) && typeof block.id === "string"
              ? block.id
              : `block-${index}`
          }
        >
          <ArticleBlockView block={block} articleSlug={articleSlug} />
          {midSlot && index === midIndex ? midSlot : null}
        </Fragment>
      ))}
    </div>
  );
}

function ArticleBlockView({
  block,
  articleSlug,
}: {
  block: unknown;
  articleSlug?: string;
}) {
  if (!isRecord(block) || typeof block.type !== "string" || !isRecord(block.data)) {
    return <UnknownBlock label="Некорректный блок" />;
  }

  const typed = block as unknown as ArticleBlockV2;

  switch (typed.type) {
    case "rich_text":
      return <RichTextBlock block={typed} />;
    case "math":
      return <MathBlock block={typed} />;
    case "interactive_graph":
      return <InteractiveGraphBlock block={typed} />;
    case "single_choice":
      return <SingleChoiceBlock block={typed} articleSlug={articleSlug} />;
    case "numeric_input":
      return <NumericInputBlock block={typed} articleSlug={articleSlug} />;
    case "step_solution":
      return <StepSolutionBlock block={typed} />;
    case "hint":
      return <HintBlock block={typed} />;
    case "callout":
      return <CalloutBlock block={typed} />;
    case "image":
      return <ImageBlock block={typed} />;
    case "divider":
      return <DividerBlock block={typed} />;
    default: {
      const unknownType = (block as { type?: unknown }).type;
      return (
        <UnknownBlock label={`Блок «${String(unknownType)}» пока не поддерживается`} />
      );
    }
  }
}
