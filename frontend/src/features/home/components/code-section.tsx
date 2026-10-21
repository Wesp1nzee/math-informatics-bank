import type { CSSProperties } from "react";

import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { BitRain } from "@/features/home/components/bit-rain";
import { CodeLab } from "@/features/home/components/code-lab";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export function CodeSection() {
  return (
    <Section labelledBy="code-title" className="code-section-relative">
      <BitRain />
      <div className="relative z-[1] grid grid-cols-12 items-start gap-4 md:gap-6">
        <div className="reveal desk:col-span-5 col-span-12">
          <span className="eyebrow">Информатика</span>
          <h2 id="code-title" className="heading-2">
            Алгоритм — это тоже способ мышления
          </h2>

          <article className="border-line bg-surface mt-10 grid gap-3 rounded-lg border p-7 text-base">
            <Badge className="justify-self-start">ЕГЭ · Информатика · Задание 5</Badge>
            <p>
              По натуральному числу <i className="font-serif text-[1.1em]">N</i>{" "}
              строится число <i className="font-serif text-[1.1em]">R</i>:
            </p>
            <ol className="text-ink-soft m-0 list-decimal pl-5">
              <li>
                Строится двоичная запись числа{" "}
                <i className="font-serif text-[1.1em]">N</i>.
              </li>
              <li>Справа дописывается остаток от деления суммы её цифр на 2.</li>
              <li>То же действие повторяется с полученной записью.</li>
            </ol>
            <p>
              Результат — двоичная запись числа{" "}
              <i className="font-serif text-[1.1em]">R</i>. Найдите наименьшее{" "}
              <i className="font-serif text-[1.1em]">R</i>, большее 83.
            </p>
            <p className="text-ink-faint mt-3 text-sm">
              Условие в формате заданий ЕГЭ, переписано в сокращённом виде.
            </p>
          </article>
        </div>

        <div
          className="reveal desk:col-span-6 desk:col-start-7 desk:mt-0 col-span-12 mt-6"
          style={step(1)}
        >
          <CodeLab />
        </div>
      </div>
    </Section>
  );
}
