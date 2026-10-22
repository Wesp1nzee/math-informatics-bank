import type { ArticleTocItem } from "@/features/articles/types";

export function ArticleToc({ items }: { items: readonly ArticleTocItem[] }) {
  if (items.length === 0) return null;

  return (
    <nav aria-labelledby="toc-title" className="desk:self-start">
      <h2
        id="toc-title"
        className="text-ink-faint mb-4 text-sm font-medium tracking-[0.08em] uppercase"
      >
        Содержание
      </h2>
      <ol className="m-0 flex list-none flex-col gap-1 p-0 text-[15px]">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-ink-soft hover:text-accent flex gap-3 rounded-sm py-1 transition-colors"
            >
              <span className="text-ink-faint tabular-nums">{index + 1}</span>
              <span>{item.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
