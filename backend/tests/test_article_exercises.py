from __future__ import annotations

import json

from app.core.security import hash_password
from app.db.session import get_sessionmaker
from app.domains.articles.models import Article
from app.domains.users.models import User, UserRole


def _content() -> dict:
    return {
        "version": 2,
        "blocks": [
            {
                "id": "ex-choice",
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
                "id": "ex-number",
                "type": "numeric_input",
                "data": {
                    "prompt": [{"type": "text", "text": "3.5"}],
                    "correct_value": 3.5,
                    "tolerance": 0.01,
                    "explanation": [{"type": "text", "text": "Ответ 3.5"}],
                },
            },
            {
                "id": "not-an-exercise",
                "type": "rich_text",
                "data": {
                    "kind": "paragraph",
                    "children": [{"type": "text", "text": "text"}],
                },
            },
        ],
    }


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


async def _create_published(client, slug: str = "interactive") -> int:
    await _login_admin(client)
    created = await client.post(
        "/api/v1/articles",
        json={"slug": slug, "title": "Interactive", "content": _content()},
    )
    assert created.status_code == 201, created.text
    article_id = created.json()["id"]
    published = await client.post(f"/api/v1/articles/{article_id}/publish")
    assert published.status_code == 200, published.text
    return article_id


async def _register_student(client) -> None:
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "student@example.com", "password": "password123"},
    )
    assert response.status_code == 201


async def _logout(client) -> None:
    response = await client.post("/api/v1/auth/logout")
    assert response.status_code == 204


def _check(client, slug: str, exercise_id: str, answer: str):
    return client.post(
        f"/api/v1/articles/{slug}/exercises/{exercise_id}/check",
        json={"answer": answer},
    )


async def test_single_choice_check_and_public_hiding(client) -> None:
    await _create_published(client)
    await _logout(client)

    public = await client.get("/api/v1/articles/interactive")
    assert public.status_code == 200
    public_text = json.dumps(public.json(), ensure_ascii=False)
    assert "correct_option_id" not in public_text
    assert "explanation" not in public_text

    correct = await _check(client, "interactive", "ex-choice", "a")
    assert correct.status_code == 200, correct.text
    body = correct.json()
    assert body["isCorrect"] is True
    assert body["explanation"][0]["text"] == "2 + 2 = 4"
    assert body["attempts"] is None
    assert body["solved"] is None

    wrong = await _check(client, "interactive", "ex-choice", "b")
    assert wrong.status_code == 200
    assert wrong.json()["isCorrect"] is False
    assert wrong.json()["explanation"] is None


async def test_numeric_input_check_uses_tolerance_and_comma(client) -> None:
    await _create_published(client)
    await _logout(client)

    within_tolerance = await _check(client, "interactive", "ex-number", "3,505")
    assert within_tolerance.status_code == 200
    assert within_tolerance.json()["isCorrect"] is True

    outside_tolerance = await _check(client, "interactive", "ex-number", "3.6")
    assert outside_tolerance.json()["isCorrect"] is False

    non_numeric = await _check(client, "interactive", "ex-number", "abc")
    assert non_numeric.json()["isCorrect"] is False


async def test_unknown_article_exercise_and_unpublished_article(client) -> None:
    await _create_published(client)
    draft = await client.post(
        "/api/v1/articles",
        json={"slug": "draft", "title": "Draft", "content": _content()},
    )
    assert draft.status_code == 201
    await _logout(client)

    missing_article = await _check(client, "missing", "ex-choice", "a")
    assert missing_article.status_code == 404

    missing_exercise = await _check(client, "interactive", "missing", "a")
    assert missing_exercise.status_code == 404

    not_an_exercise = await _check(client, "interactive", "not-an-exercise", "a")
    assert not_an_exercise.status_code == 404

    unpublished = await _check(client, "draft", "ex-choice", "a")
    assert unpublished.status_code == 404


async def test_legacy_article_has_no_exercises(client) -> None:
    async with get_sessionmaker()() as session:
        session.add(
            Article(
                slug="legacy",
                title="Legacy",
                is_published=True,
                blocks=[{"type": "paragraph", "text": "v1"}],
            )
        )
        await session.commit()

    response = await _check(client, "legacy", "ex-choice", "a")
    assert response.status_code == 404


async def test_progress_is_persisted_for_authenticated_user(client) -> None:
    await _create_published(client)
    await _register_student(client)

    first = await _check(client, "interactive", "ex-choice", "b")
    assert first.status_code == 200
    assert first.json()["attempts"] == 1
    assert first.json()["solved"] is False

    second = await _check(client, "interactive", "ex-choice", "a")
    assert second.status_code == 200
    assert second.json()["attempts"] == 2
    assert second.json()["solved"] is True

    third = await _check(client, "interactive", "ex-choice", "a")
    assert third.json()["attempts"] == 3
    assert third.json()["solved"] is True

    progress = await client.get("/api/v1/progress/articles")
    assert progress.status_code == 200
    rows = progress.json()
    assert len(rows) == 1
    row = rows[0]
    assert row["exerciseId"] == "ex-choice"
    assert row["attempts"] == 3
    assert row["correctAttempts"] == 2
    assert row["solved"] is True
    assert row["lastCorrect"] is True


async def test_anonymous_checks_do_not_persist_progress(client) -> None:
    await _create_published(client)
    await _logout(client)

    result = await _check(client, "interactive", "ex-choice", "a")
    assert result.status_code == 200
    assert result.json()["attempts"] is None
    assert result.json()["solved"] is None

    progress = await client.get("/api/v1/progress/articles")
    assert progress.status_code == 401


async def test_answer_validation(client) -> None:
    await _create_published(client)
    await _logout(client)

    empty = await _check(client, "interactive", "ex-choice", "")
    assert empty.status_code == 422
    assert empty.json()["error"]["code"] == "validation_error"

    too_long = await _check(client, "interactive", "ex-choice", "x" * 513)
    assert too_long.status_code == 422
