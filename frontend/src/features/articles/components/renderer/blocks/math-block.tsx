import { Math } from "@/components/ui/math";
import { UnknownBlock } from "@/features/articles/components/renderer/unknown-block";
import type { ArticleBlockV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "math" }>;

export function MathBlock({ block }: { block: Block }) {
  const { tex, display, caption } = block.data;

  if (typeof tex !== "string" || tex.trim() === "") {
    return <UnknownBlock label="Формула недоступна" />;
  }

  return (
    <figure className="border-accent-soft my-2 flex max-w-full min-w-0 flex-col gap-2 overflow-x-auto border-l-2 py-1 pl-4">
      <Math display={display ?? true} tex={tex} className="max-w-full" />
      {typeof caption === "string" && caption ? (
        <figcaption className="text-ink-faint text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
