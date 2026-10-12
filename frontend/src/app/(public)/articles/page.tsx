import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { DemoNotice } from "@/components/ui/demo-notice";
import { ArticleCard } from "@/features/articles/components/article-card";
import { getArticles } from "@/features/articles/api";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Статьи и разборы",
  description:
    "Разборы задач, типичных ошибок и способов мышления по математике и информатике для подготовки к ОГЭ и ЕГЭ.",
  path: "/articles",
});

export default async function ArticlesPage() {
  const { items } = await getArticles();

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Статьи" }]}
        eyebrow="Разборы и идеи"
        title="Как думать, а не заучивать"
        description="Разбираю задачи, ошибки и способы мышления, которые помогают решать быстрее и увереннее."
      />

      <Section bordered>
        <ul className="desk:grid-cols-3 m-0 grid list-none gap-4 p-0 sm:grid-cols-2 md:gap-6">
          {items.map((article) => (
            <li key={article.slug} className="flex">
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <DemoNotice>
            Статьи подготовлены в рамках миграции и помечены как черновики: они содержат
            проверенные объяснения, но финальный редакционный текст будет добавлен
            отдельно.
          </DemoNotice>
        </div>
      </Section>
    </>
  );
}
