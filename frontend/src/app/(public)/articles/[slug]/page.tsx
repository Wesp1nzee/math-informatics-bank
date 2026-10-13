import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleBody } from "@/features/articles/components/article-body";
import { ArticleMeta } from "@/features/articles/components/article-meta";
import { ArticleToc } from "@/features/articles/components/article-toc";
import { RelatedArticles } from "@/features/articles/components/related-articles";
import { TutorCta } from "@/features/tutor-leads/components/tutor-cta";
import {
  getArticleBySlug,
  getArticleSlugList,
  getArticleToc,
  getRelatedArticles,
} from "@/features/articles/api";
import { articleJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getArticleSlugList().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return buildMetadata({
      title: "Статья не найдена",
      description: "Запрашиваемая статья не найдена.",
      path: `/articles/${slug}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: article.title,
    description: article.description,
    path: `/articles/${article.slug}`,
    type: "article",
    publishedTime: article.published,
    modifiedTime: article.updated ?? article.published,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 2);
  const toc = getArticleToc(article);

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.description,
          path: `/articles/${article.slug}`,
          published: article.published,
          modified: article.updated,
        })}
      />

      <PageHero
        breadcrumbs={[
          { name: "Главная", href: "/" },
          { name: "Статьи", href: "/articles" },
          { name: article.title },
        ]}
        eyebrow={`${article.exam} · разбор`}
        title={article.title}
      >
        <div className="mt-6">
          <ArticleMeta article={article} />
        </div>
        <p className="body-large mt-6">{article.description}</p>
      </PageHero>

      <Section bordered>
        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          {toc.length > 0 ? (
            <div className="desk:col-span-3 desk:mb-0 col-span-12 mb-8">
              <ArticleToc items={toc} />
            </div>
          ) : null}

          <div
            className={
              toc.length > 0
                ? "desk:col-span-8 desk:col-start-5 col-span-12"
                : "col-span-12"
            }
          >
            <ArticleBody
              blocks={article.blocks}
              midSlot={<TutorCta placement="article-mid" className="my-2" />}
            />
            <TutorCta placement="article-end" className="mt-8" />
          </div>
        </div>
      </Section>

      <RelatedArticles articles={related} />

      <Section bordered={false} className="pt-0 pb-16 md:pb-24">
        <Button asChild variant="secondary">
          <Link href="/articles">Все статьи</Link>
        </Button>
      </Section>
    </>
  );
}
