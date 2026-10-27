import Image from "next/image";

import { ExerciseForm } from "@/features/articles/components/renderer/blocks/exercise-form";
import { safeHref } from "@/features/articles/runtime";
import { Math } from "@/components/ui/math";
import type { ArticleBlockV2, MatchingOption } from "@/features/articles/types";

type Block = Extract<ArticleBlockV2, { type: "matching" }>;

function toTex(value: string): string {
  let tex = value.replace(/`/g, "").replace(/²/g, "^2").replace(/−/g, "-").trim();
  tex = tex.replace(/\((\d+)\/(\d+)\)x/g, "\\frac{$1}{$2}x");
  tex = tex.replace(/(-?)(\d+)\/x/g, (_, sign: string, number: string) => {
    return `${sign === "-" ? "-" : ""}\\frac{${number}}{x}`;
  });
  tex = tex.replace(/(\d+)\/(\d+)/g, "\\frac{$1}{$2}");
  tex = tex.replace(/\s+/g, "");
  tex = tex.replace(/,/g, ",\\,");
  return tex;
}

function OptionValue({ value }: { value: string }) {
  if (/[=<>]/.test(value) || value.includes("/")) {
    return <Math tex={toTex(value)} display={false} className="text-[0.95rem]" />;
  }
  return <span className="font-mono text-sm">{value}</span>;
}

function OptionSide({ options }: { options: readonly MatchingOption[] }) {
  const hasImages = options.some((option) => Boolean(option.image));
  const title = hasImages ? "Графики" : "Варианты";

  return (
    <div className="min-w-0">
      <p className="text-ink text-sm font-semibold">{title}</p>
      {hasImages ? (
        <div className="mt-3 grid w-full min-w-0 grid-cols-3 gap-2 sm:gap-3">
          {options.map((option) => {
            const src = safeHref(option.image ?? "");
            return (
              <figure
                key={option.label}
                className="border-line-strong bg-surface-subtle m-0 flex min-w-0 flex-col items-center gap-2 rounded-lg border p-2"
              >
                <div className="relative h-36 w-full overflow-hidden rounded-md bg-white">
                  {src ? (
                    <Image
                      src={src}
                      alt={option.image_alt || `Вариант ${option.label}`}
                      fill
                      sizes="(max-width: 640px) 30vw, 160px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="text-ink-faint flex h-full items-center justify-center text-xs">
                      нет изображения
                    </span>
                  )}
                </div>
                <figcaption className="text-ink text-sm font-semibold">
                  {option.label}
                </figcaption>
              </figure>
            );
          })}
        </div>
      ) : (
        <ul className="m-0 mt-3 grid list-none gap-2 p-0">
          {options.map((option) => (
            <li
              key={option.label}
              className="border-line-strong bg-surface-subtle flex min-w-0 items-start gap-3 rounded-md border px-3 py-2"
            >
              <span className="text-ink-faint shrink-0 font-mono text-sm font-semibold">
                {option.label}
              </span>
              <span className="text-ink min-w-0 text-sm break-words">
                <OptionValue value={option.value} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MatchingBlock({
  block,
  articleSlug,
}: {
  block: Block;
  articleSlug?: string;
}) {
  const source = block.data.source?.trim();
  const bankId = block.data.bank_id?.trim();
  const inputId = `article-matching-${block.id}`;

  return (
    <section className="border-line-strong bg-surface text-ink w-full max-w-full min-w-0 scroll-mt-24 rounded-xl border p-4 shadow-sm sm:p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink-faint text-xs font-semibold tracking-wide uppercase">
          Задание на соответствие
        </p>
        {source || bankId ? (
          <p className="text-ink-soft text-xs">
            {source}
            {bankId ? ` · банк № ${bankId}` : ""}
          </p>
        ) : null}
      </div>

      <p className="text-ink mt-3 text-lg leading-relaxed font-medium">
        {block.data.instruction}
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
        <OptionSide options={block.data.left} />
        <OptionSide options={block.data.right} />
      </div>

      <div className="border-line mt-5 border-t pt-4">
        <ExerciseForm
          articleSlug={articleSlug}
          exerciseId={block.id}
          kind="numeric"
          name={inputId}
          inputId={inputId}
        >
          <p className="text-ink-soft text-sm">
            Запишите последовательность цифр. Например, 213 — это А→2, Б→1, В→3.
          </p>
        </ExerciseForm>
      </div>
    </section>
  );
}
