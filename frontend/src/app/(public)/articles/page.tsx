import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { DemoNotice } from "@/components/ui/demo-notice";
import { ArticleCard } from "@/features/articles/components/article-card";
import { getArticles } from "@/features/articles/api";
import { isSeoArticleSlug } from "@/features/seo/pages";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Статьи и разборы",
  description:
    "Разборы задач, типичных ошибок и способов мышления по математике и информатике для подготовки к ОГЭ и ЕГЭ.",
  path: "/articles",
});

export default async function ArticlesPage() {
  const { items: allItems, isDemo } = await getArticles();
  const items = allItems.filter((article) => !isSeoArticleSlug(article.slug));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Статьи", path: "/articles" },
        ])}
      />
      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Статьи" }]}
        eyebrow="Разборы и идеи"
        title="Как думать, а не заучивать"
        description="Разбираю задачи, ошибки и способы мышления, которые помогают решать быстрее и увереннее."
      />

      <Section bordered>
        <ul className="desk:grid-cols-3 m-0 grid w-full min-w-0 list-none gap-4 p-0 sm:grid-cols-2 md:gap-6">
          {items.map((article) => (
            <li key={article.slug} className="flex min-w-0">
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>

        {isDemo ? (
          <div className="mt-10">
            <DemoNotice>
              Показан встроенный демонстрационный набор статей. Подключите API, чтобы
              читать материалы из базы.
            </DemoNotice>
          </div>
        ) : null}
      </Section>
    </>
  );
}
