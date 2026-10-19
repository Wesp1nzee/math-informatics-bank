from __future__ import annotations

import pytest
from sqlalchemy import CheckConstraint, select
from sqlalchemy.exc import IntegrityError

from app.db.session import get_sessionmaker
from app.domains.articles.models import Article
from app.domains.subjects.models import Subject

CONTENT_V2: dict = {
    "version": 2,
    "blocks": [
        {
            "id": "intro",
            "type": "rich_text",
            "data": {
                "kind": "paragraph",
                "children": [{"type": "text", "text": "Вступление"}],
            },
        },
        {
            "id": "math-1",
            "type": "math",
            "data": {"tex": "x^2", "display": True},
        },
    ],
}


async def _add_subject(session) -> Subject:
    subject = Subject(slug="matematika", label="Математика", position=0)
    session.add(subject)
    await session.flush()
    return subject


async def test_article_stores_v2_content_and_keeps_subject(client) -> None:
    async with get_sessionmaker()() as session:
        subject = await _add_subject(session)
        session.add(
            Article(
                slug="interactive",
                title="Интерактивная статья",
                description="d",
                subject_id=subject.id,
                content=CONTENT_V2,
                content_version=2,
            )
        )
        await session.commit()

    async with get_sessionmaker()() as session:
        article = await session.scalar(select(Article).where(Article.slug == "interactive"))
        assert article is not None
        assert article.content_version == 2
        assert article.content == CONTENT_V2
        assert article.blocks == []
        assert article.subject is not None
        assert article.subject.slug == "matematika"


async def test_legacy_blocks_are_independent_of_v2_content(client) -> None:
    legacy_blocks = [{"type": "paragraph", "text": "v1 body"}]
    async with get_sessionmaker()() as session:
        session.add(
            Article(
                slug="both",
                title="Both",
                blocks=legacy_blocks,
                content=CONTENT_V2,
                content_version=2,
            )
        )
        await session.commit()

    async with get_sessionmaker()() as session:
        article = await session.scalar(select(Article).where(Article.slug == "both"))
        assert article is not None
        article.content = {"version": 2, "blocks": []}
        await session.commit()

    async with get_sessionmaker()() as session:
        article = await session.scalar(select(Article).where(Article.slug == "both"))
        assert article is not None
        assert article.blocks == legacy_blocks
        assert article.content == {"version": 2, "blocks": []}


async def test_legacy_article_without_v2_content_is_allowed(client) -> None:
    async with get_sessionmaker()() as session:
        session.add(
            Article(
                slug="legacy",
                title="Legacy",
                blocks=[{"type": "paragraph", "text": "t"}],
            )
        )
        await session.commit()

    async with get_sessionmaker()() as session:
        article = await session.scalar(select(Article).where(Article.slug == "legacy"))
        assert article is not None
        assert article.content is None
        assert article.content_version is None
        assert article.blocks == [{"type": "paragraph", "text": "t"}]


@pytest.mark.parametrize(
    ("content", "version"),
    [
        (CONTENT_V2, None),
        (None, 2),
        (CONTENT_V2, 0),
    ],
)
async def test_content_and_version_must_pair(client, content, version) -> None:
    with pytest.raises(IntegrityError):
        async with get_sessionmaker()() as session:
            session.add(
                Article(
                    slug="bad",
                    title="Bad",
                    content=content,
                    content_version=version,
                )
            )
            await session.commit()


def test_article_metadata_declares_storage_contract() -> None:
    table = Article.__table__
    assert {"content", "content_version"} <= {column.name for column in table.columns}
    assert table.c.content.nullable is True
    assert table.c.content_version.nullable is True

    index_names = {index.name for index in table.indexes}
    assert "ix_articles_content_version" in index_names

    check_sql = {
        str(constraint.sqltext)
        for constraint in table.constraints
        if isinstance(constraint, CheckConstraint)
    }
    assert any("content_version" in sql for sql in check_sql)
