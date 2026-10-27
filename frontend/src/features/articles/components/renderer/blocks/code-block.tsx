import type { ArticleBlockV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "code" }>;

export function CodeBlock({ block }: { block: Block }) {
  const { language, code, caption } = block.data;

  return (
    <figure className="my-2 w-full max-w-full min-w-0">
      <div className="border-line bg-surface-subtle w-full max-w-full overflow-hidden rounded-lg border">
        <div className="border-line text-ink-faint flex items-center justify-between border-b px-4 py-2 text-xs tracking-wide uppercase">
          <span>{language || "code"}</span>
        </div>
        <pre className="m-0 w-full max-w-full overflow-x-auto p-4 text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
      {caption ? (
        <figcaption className="text-ink-faint mt-2 text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
