from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domains.articles.models import Article
from app.domains.articles.schemas import ArticleRead


def _base_query():
    return select(Article).where(Article.is_published.is_(True))


async def list_articles(
    session: AsyncSession, *, subject_slug: str | None = None
) -> list[ArticleRead]:
    query = _base_query().order_by(Article.published_on.desc().nullslast(), Article.id.desc())
    if subject_slug is not None:
        query = query.where(Article.subject.has(slug=subject_slug))
    rows = (await session.scalars(query)).all()
    return [ArticleRead.from_article(article) for article in rows]


async def get_article_by_slug(session: AsyncSession, slug: str) -> Article:
    article = await session.scalar(_base_query().where(Article.slug == slug))
    if article is None:
        raise NotFoundError(f"Статья «{slug}» не найдена.")
    return article
