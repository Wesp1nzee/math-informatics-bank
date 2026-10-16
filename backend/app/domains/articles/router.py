from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.domains.articles.schemas import ArticleRead
from app.domains.articles.service import get_article_by_slug, list_articles

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("", response_model=list[ArticleRead], summary="Список статей")
async def articles_list(
    subject: str | None = Query(None, description="Фильтр по slug предмета"),
    session: AsyncSession = Depends(get_session),
) -> list[ArticleRead]:
    return await list_articles(session, subject_slug=subject)


@router.get("/{slug}", response_model=ArticleRead, summary="Статья по slug")
async def article_detail(
    slug: str = Path(..., min_length=1),
    session: AsyncSession = Depends(get_session),
) -> ArticleRead:
    article = await get_article_by_slug(session, slug)
    return ArticleRead.from_article(article)
