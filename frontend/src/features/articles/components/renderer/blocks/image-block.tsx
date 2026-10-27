import { UnknownBlock } from "@/features/articles/components/renderer/unknown-block";
import { safeHref } from "@/features/articles/runtime";
import type { ArticleBlockV2 } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "image" }>;

export function ImageBlock({ block }: { block: Block }) {
  const src = safeHref(block.data.src);
  if (!src) {
    return <UnknownBlock label="Изображение недоступно" />;
  }

  const alt = typeof block.data.alt === "string" ? block.data.alt : "";
  const caption = typeof block.data.caption === "string" ? block.data.caption : "";
  const width =
    typeof block.data.width === "number" && block.data.width > 0
      ? block.data.width
      : undefined;
  const height =
    typeof block.data.height === "number" && block.data.height > 0
      ? block.data.height
      : undefined;

  return (
    <figure className="m-0 flex w-full max-w-full min-w-0 flex-col gap-2">
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        className="border-line h-auto max-w-full rounded-lg border"
      />
      {caption ? (
        <figcaption className="text-ink-faint text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
