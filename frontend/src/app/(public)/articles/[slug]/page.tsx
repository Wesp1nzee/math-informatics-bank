import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleBody } from "@/features/articles/components/article-body";
import { ArticleMeta } from "@/features/articles/components/article-meta";
import { ArticleToc } from "@/features/articles/components/article-toc";
import { ArticleRenderer } from "@/features/articles/components/renderer/article-renderer";
import { RelatedArticles } from "@/features/articles/components/related-articles";
import { TutorCta } from "@/features/tutor-leads/components/tutor-cta";
import {
  getArticleBySlug,
  getArticleToc,
  getRelatedArticles,
} from "@/features/articles/api";
import { getSeoArticlePath } from "@/features/seo/pages";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

type ArticlePageProps = { params: Promise<{ slug: string }> };

// Editorial content can be published after a deploy. Render article pages on
// demand so new slugs work immediately and unknown slugs return a real 404.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const seoPath = getSeoArticlePath(slug);
  if (seoPath) permanentRedirect(seoPath);

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
    ogImage: null,
    publishedTime: article.published,
    modifiedTime: article.updated ?? article.published,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const seoPath = getSeoArticlePath(slug);
  if (seoPath) permanentRedirect(seoPath);

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 2);
  const toc = getArticleToc(article);
  const midSlot = <TutorCta placement="article-mid" className="my-2" />;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Главная", path: "/" },
            { name: "Статьи", path: "/articles" },
            { name: article.title, path: `/articles/${article.slug}` },
          ]),
          articleJsonLd({
            title: article.title,
            description: article.description,
            path: `/articles/${article.slug}`,
            published: article.published,
            modified: article.updated,
            image: "/og/default.png",
          }),
        ]}
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
            {article.content ? (
              <ArticleRenderer
                content={article.content}
                articleSlug={article.slug}
                midSlot={midSlot}
              />
            ) : (
              <ArticleBody blocks={article.blocks} midSlot={midSlot} />
            )}
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
