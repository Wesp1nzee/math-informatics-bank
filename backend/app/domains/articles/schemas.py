from __future__ import annotations

from datetime import date
from typing import Annotated

from pydantic import BaseModel, Field, TypeAdapter

from app.common.schemas import ORMModel
from app.domains.tasks.schemas import (
    FormulaBlock,
    HeadingBlock,
    ListBlock,
    ParagraphBlock,
    QuoteBlock,
)

ArticleBlock = Annotated[
    ParagraphBlock | HeadingBlock | ListBlock | FormulaBlock | QuoteBlock,
    Field(discriminator="type"),
]

article_blocks_adapter: TypeAdapter[list[ArticleBlock]] = TypeAdapter(list[ArticleBlock])


class ArticleRead(BaseModel):
    """Wire format consumed by ``features/articles/types.ts``."""

    slug: str
    title: str
    description: str
    subject: str | None = None
    exam: str
    reading_minutes: int = Field(serialization_alias="readingMinutes")
    published: date | None = None
    updated: date | None = None
    blocks: list[ArticleBlock]
    is_demo: bool = Field(default=False, serialization_alias="isDemo")

    @classmethod
    def from_article(cls, article) -> ArticleRead:  # noqa: ANN001 — avoids circular import
        return cls(
            slug=article.slug,
            title=article.title,
            description=article.description,
            subject=article.subject.slug if article.subject else None,
            exam=article.exam,
            reading_minutes=article.reading_minutes,
            published=article.published_on,
            updated=article.updated_on,
            blocks=article_blocks_adapter.validate_python(article.blocks or []),
            is_demo=False,
        )


class ArticleListItem(ORMModel):
    """Compact list item without heavy blocks (optional optimization for /articles)."""

    slug: str
    title: str
    description: str
    exam: str
