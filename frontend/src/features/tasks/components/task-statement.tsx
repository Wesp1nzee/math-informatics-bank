import { Math } from "@/components/ui/math";
import { RichText } from "@/components/ui/rich-text";
import type { StatementBlock } from "@/features/tasks/types";

function StatementBlockView({ block }: { block: StatementBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="text-ink text-lg leading-relaxed md:text-xl">
          <RichText text={block.text} />
        </p>
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
        <figure className="border-accent-soft my-2 overflow-x-auto border-l-2 pl-4">
          <Math display tex={block.tex} />
          {block.caption ? (
            <figcaption className="text-ink-faint text-sm">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
  }
}

export function TaskStatement({ blocks }: { blocks: readonly StatementBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => (
        <StatementBlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}
