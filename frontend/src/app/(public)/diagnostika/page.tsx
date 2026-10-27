import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { DemoNotice } from "@/components/ui/demo-notice";
import {
  DEMO_DIAGNOSTIC_ITEMS,
  DiagnosticsRunner,
  selectDiagnosticItems,
} from "@/features/diagnostics";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Диагностика по математике и информатике",
  description:
    "Бесплатная диагностика без регистрации: 10 задач разных тем с отчётом о том, где вы теряете баллы. Дальше — разбор результата на пробном занятии.",
  path: "/diagnostika",
});

export default function DiagnosticsPage() {
  const items = selectDiagnosticItems(DEMO_DIAGNOSTIC_ITEMS, 10);
  const isDemo = items.some((item) => item.isDemo);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Диагностика", path: "/diagnostika" },
        ])}
      />
      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Диагностика" }]}
        eyebrow="Бесплатно, без регистрации"
        title="Где вы теряете баллы?"
        description="Решите 10 задач разных тем. В конце увидите отчёт по темам — и сможете разобрать результат на пробном занятии."
      />

      <Section bordered labelledBy="diagnostics-title">
        <h2 id="diagnostics-title" className="sr-only">
          Задачи диагностики
        </h2>
        <DiagnosticsRunner items={items} />

        {isDemo ? (
          <div className="mt-10">
            <DemoNotice>
              Набор диагностики сейчас демонстрационный: он проверяет механику, а
              реальные задачи добавятся вместе с банком.
            </DemoNotice>
          </div>
        ) : null}
      </Section>
    </>
  );
}
