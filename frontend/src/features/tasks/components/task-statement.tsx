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
        <figure className="border-accent-soft my-2 flex max-w-full min-w-0 flex-col gap-2 overflow-x-auto border-l-2 py-1 pl-4">
          <Math display tex={block.tex} className="max-w-full" />
          {block.caption ? (
            <figcaption className="text-ink-faint text-sm">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
    case "heading":
      return (
        <h2
          id={block.id}
          className="heading-3 mt-2 scroll-mt-24 [overflow-wrap:anywhere]"
        >
          {block.text}
        </h2>
      );
    case "quote":
      return (
        <blockquote className="border-accent text-ink border-l-2 pl-5 text-xl leading-snug font-medium">
          {block.text}
        </blockquote>
      );
    case "table":
      return (
        <figure className="my-2 w-full max-w-full min-w-0">
          {block.caption ? (
            <figcaption className="text-ink-faint mb-2 text-sm">
              {block.caption}
            </figcaption>
          ) : null}
          <div className="border-line-strong bg-surface w-full max-w-full overflow-x-auto rounded-lg border">
            <table className="text-ink w-full table-auto border-collapse text-left text-sm">
              {block.headers?.length ? (
                <thead className="bg-ink/5">
                  <tr>
                    {block.headers.map((header, index) => (
                      <th
                        key={`${header}-${index}`}
                        scope="col"
                        className="border-line-strong text-ink border-b px-3 py-2 text-xs font-semibold break-words sm:px-4 sm:py-3 sm:text-sm"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr
                    key={`row-${rowIndex}`}
                    className="border-line-strong odd:bg-surface even:bg-ink/5 border-b last:border-b-0"
                  >
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`cell-${rowIndex}-${cellIndex}`}
                        className="border-line-strong text-ink px-3 py-2 align-top text-xs break-words sm:px-4 sm:py-3 sm:text-sm"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );
    case "image":
      return (
        <figure className="m-0 flex w-full max-w-full min-w-0 flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt ?? ""}
            width={block.width}
            height={block.height}
            loading="lazy"
            decoding="async"
            className="border-line h-auto max-w-full rounded-lg border"
          />
          {block.caption ? (
            <figcaption className="text-ink-faint text-sm">{block.caption}</figcaption>
          ) : null}
        </figure>
      );
  }
}

export function TaskStatement({ blocks }: { blocks: readonly StatementBlock[] }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      {blocks.map((block, index) => (
        <StatementBlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  );
}
