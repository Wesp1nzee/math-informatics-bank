"""API tests for interactive articles (public + editor operations)."""

from __future__ import annotations

import json
from datetime import date

import pytest
from pydantic import ValidationError
from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import get_sessionmaker
from app.domains.articles.models import Article
from app.domains.articles.schemas import ArticleContent
from app.domains.subjects.models import Subject
from app.domains.users.models import User, UserRole


def _content() -> dict:
    return {
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
                "id": "choose",
                "type": "single_choice",
                "data": {
                    "prompt": [{"type": "text", "text": "2 + 2?"}],
                    "options": [
                        {"id": "a", "label": [{"type": "text", "text": "4"}]},
                        {"id": "b", "label": [{"type": "text", "text": "5"}]},
                    ],
                    "correct_option_id": "a",
                    "explanation": [{"type": "text", "text": "2 + 2 = 4"}],
                },
            },
            {
                "id": "numeric",
                "type": "numeric_input",
                "data": {
                    "prompt": [{"type": "text", "text": "2 + 2"}],
                    "correct_value": 4,
                    "tolerance": 0,
                },
            },
        ],
    }


async def _seed_subject(slug: str = "matematika", label: str = "Математика") -> None:
    async with get_sessionmaker()() as session:
        session.add(Subject(slug=slug, label=label, position=0))
        await session.commit()


async def _seed_article(
    slug: str, *, published: bool = True, subject_slug: str | None = None
) -> int:
    async with get_sessionmaker()() as session:
        subject_id = None
        if subject_slug is not None:
            subject = await session.scalar(select(Subject).where(Subject.slug == subject_slug))
            subject_id = subject.id if subject else None
        article = Article(
            slug=slug,
            title=f"Article {slug}",
            description="d",
            subject_id=subject_id,
            blocks=[{"type": "paragraph", "text": "v1"}],
            is_published=published,
            published_on=date(2026, 1, 1) if published else None,
        )
        session.add(article)
        await session.commit()
        return article.id


async def _login_admin(client) -> None:
    async with get_sessionmaker()() as session:
        session.add(
            User(
                email="admin@example.com",
                hashed_password=hash_password("supersecret"),
                role=UserRole.ADMIN,
            )
        )
        await session.commit()
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "supersecret"},
    )
    assert response.status_code == 200


async def _register_student(client) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "student@example.com", "password": "password123"},
    )
    assert response.status_code == 201


async def _create(client, **overrides) -> dict:
    payload = {"slug": "interactive", "title": "Interactive", "content": _content()}
    payload.update(overrides)
    response = await client.post("/api/v1/articles", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


async def test_public_legacy_list_and_detail_are_compatible(client) -> None:
    await _seed_subject()
    await _seed_article("legacy", subject_slug="matematika")

    listing = await client.get("/api/v1/articles")
    assert listing.status_code == 200
    assert isinstance(listing.json(), list)
    assert listing.json()[0]["slug"] == "legacy"
    assert listing.json()[0]["content"] is None

    detail = await client.get("/api/v1/articles/legacy")
    assert detail.status_code == 200
    assert detail.json()["blocks"][0]["type"] == "paragraph"
    assert detail.json()["content"] is None


async def test_drafts_are_not_public(client) -> None:
    await _login_admin(client)
    created = await _create(client, slug="draft")
    assert created["isPublished"] is False

    assert (await client.get("/api/v1/articles")).json() == []
    assert (await client.get("/api/v1/articles/draft")).status_code == 404

    missing = await client.get("/api/v1/articles/does-not-exist")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "not_found"


async def test_paginated_public_list_with_subject_filter(client) -> None:
    await _seed_subject("matematika", "Математика")
    await _seed_subject("informatika", "Информатика")
    for index in range(3):
        await _seed_article(f"m-{index}", subject_slug="matematika")
    await _seed_article("i-0", subject_slug="informatika")

    first_page = await client.get("/api/v1/articles/page", params={"page": 1, "page_size": 2})
    assert first_page.status_code == 200
    body = first_page.json()
    assert body["total"] == 4
    assert body["page"] == 1
    assert body["page_count"] == 2
    assert len(body["items"]) == 2

    filtered = await client.get("/api/v1/articles/page", params={"subject": "informatika"})
    assert filtered.status_code == 200
    assert filtered.json()["total"] == 1
    assert filtered.json()["items"][0]["slug"] == "i-0"


async def test_editor_endpoints_require_admin(client) -> None:
    anonymous = await client.post("/api/v1/articles", json={"slug": "x", "title": "X"})
    assert anonymous.status_code == 401

    await _register_student(client)
    student = await client.post("/api/v1/articles", json={"slug": "x", "title": "X"})
    assert student.status_code == 403


async def test_draft_publish_unpublish_lifecycle(client) -> None:
    await _login_admin(client)

    created = await _create(client)
    article_id = created["id"]
    assert created["isPublished"] is False
    assert created["contentVersion"] == 2

    draft = await client.get(f"/api/v1/articles/{article_id}/draft")
    assert draft.status_code == 200
    assert "correct_option_id" in json.dumps(draft.json(), ensure_ascii=False)

    updated = await client.patch(f"/api/v1/articles/{article_id}/draft", json={"title": "Updated"})
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated"

    published = await client.post(f"/api/v1/articles/{article_id}/publish")
    assert published.status_code == 200
    assert published.json()["isPublished"] is True
    assert published.json()["publishedOn"] is not None

    public = await client.get("/api/v1/articles/interactive")
    assert public.status_code == 200
    assert public.json()["content"]["version"] == 2
    assert public.json()["title"] == "Updated"

    blocked = await client.patch(f"/api/v1/articles/{article_id}/draft", json={"title": "Hacked"})
    assert blocked.status_code == 409
    assert blocked.json()["error"]["code"] == "conflict"

    unpublished = await client.post(f"/api/v1/articles/{article_id}/unpublish")
    assert unpublished.status_code == 200
    assert unpublished.json()["isPublished"] is False
    assert (await client.get("/api/v1/articles/interactive")).status_code == 404

    editable_again = await client.patch(
        f"/api/v1/articles/{article_id}/draft", json={"title": "After unpublish"}
    )
    assert editable_again.status_code == 200


async def test_public_projection_hides_correct_answers(client) -> None:
    await _login_admin(client)
    created = await _create(client, slug="lesson")
    article_id = created["id"]
    assert (await client.post(f"/api/v1/articles/{article_id}/publish")).status_code == 200

    public = await client.get("/api/v1/articles/lesson")
    assert public.status_code == 200
    public_text = json.dumps(public.json(), ensure_ascii=False)
    assert "correct_option_id" not in public_text
    assert "correct_value" not in public_text
    assert "tolerance" not in public_text
    assert "correct_option_id" not in public.text

    # The editor (admin) still sees server-only fields.
    draft = await client.get(f"/api/v1/articles/{article_id}/draft")
    assert "correct_option_id" in json.dumps(draft.json(), ensure_ascii=False)
    assert "correct_value" in json.dumps(draft.json(), ensure_ascii=False)


@pytest.mark.parametrize(
    "content",
    [
        {"version": 1, "blocks": []},
        {"version": 3, "blocks": []},
        {"version": 2, "blocks": [{"id": "x", "type": "nope", "data": {}}]},
        {
            "version": 2,
            "blocks": [
                {"id": "a", "type": "divider", "data": {}},
                {"id": "a", "type": "divider", "data": {}},
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "g",
                    "type": "interactive_graph",
                    "data": {
                        "engine": "svg",
                        "expressions": [{"id": "f", "expr": "a*x"}],
                        "parameters": [
                            {
                                "id": "a",
                                "label": "a",
                                "min": 5,
                                "max": 1,
                                "step": 1,
                                "default": 3,
                            }
                        ],
                    },
                }
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "g",
                    "type": "interactive_graph",
                    "data": {
                        "engine": "svg",
                        "expressions": [{"id": "f", "expr": "a*x"}],
                        "parameters": [
                            {
                                "id": "a",
                                "label": "a",
                                "min": 0,
                                "max": 1,
                                "step": 1,
                                "default": 5,
                            }
                        ],
                    },
                }
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "g",
                    "type": "interactive_graph",
                    "data": {
                        "engine": "svg",
                        "expressions": [{"id": "f", "expr": "x"}],
                        "parameters": [
                            {
                                "id": "a",
                                "label": "a",
                                "min": 0,
                                "max": 1,
                                "step": -1,
                                "default": 0,
                            }
                        ],
                    },
                }
            ],
        },
        {
            "version": 2,
            "blocks": [
                {"id": "m", "type": "math", "data": {}},
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "c",
                    "type": "single_choice",
                    "data": {
                        "prompt": [{"type": "text", "text": "?"}],
                        "options": [{"id": "a", "label": [{"type": "text", "text": "1"}]}],
                        "correct_option_id": "a",
                    },
                }
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "g",
                    "type": "interactive_graph",
                    "data": {
                        "engine": "svg",
                        "expressions": [{"id": "f", "expr": "__import__('os')"}],
                    },
                }
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "r",
                    "type": "rich_text",
                    "data": {
                        "kind": "paragraph",
                        "children": [
                            {
                                "type": "link",
                                "href": "javascript:alert(1)",
                                "children": [{"type": "text", "text": "x"}],
                            }
                        ],
                    },
                }
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "i",
                    "type": "image",
                    "data": {"src": "data:image/png;base64,AAAA", "alt": "x"},
                }
            ],
        },
        {
            "version": 2,
            "blocks": [
                {
                    "id": "c",
                    "type": "single_choice",
                    "data": {
                        "prompt": [{"type": "text", "text": "?"}],
                        "options": [
                            {"id": "a", "label": [{"type": "text", "text": "1"}]},
                            {"id": "b", "label": [{"type": "text", "text": "2"}]},
                        ],
                        "correct_option_id": "z",
                    },
                }
            ],
        },
    ],
)
async def test_content_validation_rejects_invalid_documents(client, content) -> None:
    await _login_admin(client)
    response = await client.post(
        "/api/v1/articles",
        json={"slug": "bad", "title": "Bad", "content": content},
    )
    assert response.status_code == 422, response.text
    assert response.json()["error"]["code"] == "validation_error"


def test_content_size_limit_is_enforced() -> None:
    blocks = [
        {
            "id": f"b{index}",
            "type": "rich_text",
            "data": {
                "kind": "paragraph",
                "children": [{"type": "text", "text": "x" * 20_000}],
            },
        }
        for index in range(30)
    ]
    with pytest.raises(ValidationError):
        ArticleContent.model_validate({"version": 2, "blocks": blocks})


async def test_publish_requires_content(client) -> None:
    await _login_admin(client)
    created = await _create(client, slug="empty", content=None)
    response = await client.post(f"/api/v1/articles/{created['id']}/publish")
    assert response.status_code == 409


async def test_slug_conflict_and_unknown_subject(client) -> None:
    await _login_admin(client)
    first = await client.post("/api/v1/articles", json={"slug": "same", "title": "A"})
    assert first.status_code == 201
    conflict = await client.post("/api/v1/articles", json={"slug": "same", "title": "B"})
    assert conflict.status_code == 409

    unknown_subject = await client.post(
        "/api/v1/articles",
        json={"slug": "other", "title": "Other", "subject": "unknown"},
    )
    assert unknown_subject.status_code == 404


async def test_reserved_slug_is_rejected(client) -> None:
    await _login_admin(client)
    response = await client.post("/api/v1/articles", json={"slug": "page", "title": "Page"})
    assert response.status_code == 422


async def test_v1_blocks_draft_can_be_published(client) -> None:
    await _login_admin(client)
    created = await client.post(
        "/api/v1/articles",
        json={
            "slug": "legacy-draft",
            "title": "Legacy",
            "blocks": [{"type": "paragraph", "text": "v1 body"}],
        },
    )
    assert created.status_code == 201, created.text

    published = await client.post(f"/api/v1/articles/{created.json()['id']}/publish")
    assert published.status_code == 200

    public = await client.get("/api/v1/articles/legacy-draft")
    assert public.status_code == 200
    assert public.json()["blocks"][0]["type"] == "paragraph"
    assert public.json()["content"] is None


async def test_unknown_and_broken_blocks_are_skipped_on_public_read(client) -> None:
    async with get_sessionmaker()() as session:
        session.add(
            Article(
                slug="mixed",
                title="Mixed",
                is_published=True,
                published_on=date(2026, 1, 1),
                content_version=2,
                content={
                    "version": 2,
                    "blocks": [
                        {"id": "ok", "type": "divider", "data": {}},
                        {"id": "future", "type": "future_block", "data": {}},
                        {"id": "broken", "type": "math", "data": {}},
                    ],
                },
            )
        )
        await session.commit()

    response = await client.get("/api/v1/articles/mixed")
    assert response.status_code == 200
    blocks = response.json()["content"]["blocks"]
    assert [block["type"] for block in blocks] == ["divider"]
