import { Container } from "@/components/layout/container";
import { ArticleCard } from "@/features/articles/components/article-card";
import type { Article } from "@/features/articles/types";

export function RelatedArticles({ articles }: { articles: readonly Article[] }) {
  if (articles.length === 0) return null;

  return (
    <section
      aria-labelledby="related-articles-title"
      className="border-line desk:py-[140px] border-t py-20 md:py-[104px]"
    >
      <Container>
        <h2 id="related-articles-title" className="heading-3 mb-10">
          Связанные материалы
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 md:gap-6">
          {articles.map((article) => (
            <li key={article.slug} className="flex">
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
