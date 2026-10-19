"""Storage-layer tests for interactive article content (contract v2).

These tests exercise the ORM/storage contract only: the new JSONB content
document, its mirrored version, the pairing constraint and independence from the
legacy v1 ``blocks`` payload. Pydantic validation of the blocks themselves is a
separate iteration.

The ``client`` fixture is used for its side effect of creating a clean schema
(drop_all/create_all); the assertions use the session factory directly, matching
``tests/test_api.py``.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest
from sqlalchemy import CheckConstraint, select
from sqlalchemy.exc import IntegrityError

from app.db.session import get_sessionmaker
from app.domains.articles.models import Article
from app.domains.subjects.models import Subject

REPO_ROOT = Path(__file__).resolve().parents[2]
EXAMPLES_DIR = REPO_ROOT / "docs" / "examples" / "interactive-articles"
EXAMPLE_DOCUMENTS: dict[str, dict] = {
    path.name: json.loads(path.read_text(encoding="utf-8"))
    for path in sorted(EXAMPLES_DIR.glob("*.json"))
}

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


async def _add_subject(session) -> Subject:  # noqa: ANN001 — test helper
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

    # Editing the v2 draft must not rewrite the legacy v1 payload.
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


def test_contract_examples_exist() -> None:
    assert set(EXAMPLE_DOCUMENTS) == {
        "seo-article.json",
        "math-article.json",
        "graph-article.json",
        "exercise-article.json",
    }


@pytest.mark.parametrize("name", sorted(EXAMPLE_DOCUMENTS), ids=lambda name: name)
async def test_contract_examples_roundtrip(client, name: str) -> None:
    document = EXAMPLE_DOCUMENTS[name]
    assert document["version"] == 2

    async with get_sessionmaker()() as session:
        session.add(
            Article(
                slug=Path(name).stem,
                title=Path(name).stem,
                content=document,
                content_version=document["version"],
            )
        )
        await session.commit()

    async with get_sessionmaker()() as session:
        article = await session.scalar(select(Article).where(Article.slug == Path(name).stem))
        assert article is not None
        assert article.content == document
        assert article.content_version == 2


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
