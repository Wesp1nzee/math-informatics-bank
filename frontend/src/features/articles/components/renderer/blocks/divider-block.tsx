import type { ArticleBlockV2 } from "@/features/articles/types";
import { cn } from "@/lib/utils/cn";

type Block = Extract<ArticleBlockV2, { type: "divider" }>;

export function DividerBlock({ block }: { block: Block }) {
  const spaced = block.data.variant === "spaced";
  return <hr className={cn("border-line", spaced ? "my-8" : "my-2")} />;
}
