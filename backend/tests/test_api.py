from __future__ import annotations

import httpx
from sqlalchemy import func, select

from app.core.security import hash_password
from app.db.session import get_sessionmaker
from app.domains.articles.models import Article
from app.domains.solutions.models import SolutionAttempt
from app.domains.subjects.models import Subject
from app.domains.tasks.models import Task, TaskLevel
from app.domains.topics.models import Topic
from app.domains.users.models import User, UserRole


async def _seed(task_answer: str = "6") -> int:
    async with get_sessionmaker()() as session:
        subject = Subject(slug="matematika", label="Математика", position=0)
        session.add(subject)
        await session.flush()

        topic = Topic(slug="proizvodnaya", label="Производная", subject_id=subject.id)
        session.add(topic)
        await session.flush()

        task = Task(
            title="Производная",
            subject_id=subject.id,
            exam_label="ЕГЭ · Профиль",
            level=TaskLevel.EASY,
            minutes=3,
            summary="Коротко",
            statement=[{"type": "paragraph", "text": "f(x)=x^2"}],
            answer={"value": task_answer, "kind": "number", "explanation": "2x"},
            steps=[{"note": "Степень", "tex": "x^2"}],
            featured=True,
            topics=[topic],
        )
        session.add(task)
        await session.flush()

        session.add(
            Article(
                slug="razbor",
                title="Разбор",
                description="d",
                subject_id=subject.id,
                exam="ЕГЭ",
                reading_minutes=4,
                blocks=[{"type": "paragraph", "text": "t"}],
            )
        )
        await session.commit()
        return task.id


async def test_health(client: httpx.AsyncClient) -> None:
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": True}

    alias = await client.get("/health")
    assert alias.status_code == 200
    assert alias.json() == {"status": "ok", "database": True}


async def test_tasks_flow_and_related_envelope(client: httpx.AsyncClient) -> None:
    task_id = await _seed()

    listing = await client.get("/api/v1/tasks", params={"subject": "matematika"})
    assert listing.status_code == 200
    body = listing.json()
    assert body["total"] == 1
    assert body["items"][0]["id"] == str(task_id)
    assert body["items"][0]["examLabel"] == "ЕГЭ · Профиль"
    assert body["items"][0]["isDemo"] is False

    detail = await client.get(f"/api/v1/tasks/{task_id}")
    assert detail.status_code == 200
    assert detail.json()["subject"] == "matematika"

    related = await client.get(f"/api/v1/tasks/{task_id}/related")
    assert related.status_code == 200
    assert isinstance(related.json()["items"], list)

    missing = await client.get("/api/v1/tasks/9999")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "not_found"


async def test_check_answer_normalizes(client: httpx.AsyncClient) -> None:
    task_id = await _seed(task_answer="3.5")

    correct = await client.post(f"/api/v1/tasks/{task_id}/check", json={"answer": "3,50"})
    assert correct.json()["isCorrect"] is True
    assert correct.json()["explanation"] == "2x"

    wrong = await client.post(f"/api/v1/tasks/{task_id}/check", json={"answer": "9"})
    assert wrong.json()["isCorrect"] is False
    assert wrong.json()["explanation"] is None


async def test_anonymous_answer_checks_are_not_stored(client: httpx.AsyncClient) -> None:
    task_id = await _seed()

    response = await client.post(f"/api/v1/tasks/{task_id}/check", json={"answer": "6"})
    assert response.status_code == 200

    async with get_sessionmaker()() as session:
        attempts = await session.scalar(select(func.count()).select_from(SolutionAttempt))
        assert attempts == 0


async def test_articles(client: httpx.AsyncClient) -> None:
    await _seed()

    listing = await client.get("/api/v1/articles")
    assert listing.status_code == 200
    assert listing.json()[0]["slug"] == "razbor"
    assert listing.json()[0]["readingMinutes"] == 4
    assert listing.json()[0]["isDemo"] is False

    detail = await client.get("/api/v1/articles/razbor")
    assert detail.status_code == 200
    assert detail.json()["title"] == "Разбор"


async def test_lead_creation_requires_admin_to_list(client: httpx.AsyncClient) -> None:
    created = await client.post(
        "/api/v1/tutor-leads",
        json={"contact": "student@example.com", "exam": "ege", "consent": True},
    )
    assert created.status_code == 201
    assert created.json() == {"ok": True, "id": 1}

    anonymous = await client.get("/api/v1/tutor-leads")
    assert anonymous.status_code == 401

    async with get_sessionmaker()() as session:
        session.add(
            User(
                email="admin@example.com",
                hashed_password=hash_password("supersecret"),
                role=UserRole.ADMIN,
            )
        )
        await session.commit()

    login = await client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "supersecret"}
    )
    assert login.status_code == 200
    assert "site_bank_session" in login.headers.get("set-cookie", "")
    listed = await client.get("/api/v1/tutor-leads")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


async def test_wrong_password_is_rejected(client: httpx.AsyncClient) -> None:
    async with get_sessionmaker()() as session:
        session.add(User(email="admin@example.com", hashed_password=hash_password("supersecret")))
        await session.commit()

    response = await client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "nope"}
    )
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


async def test_register_me_and_progress(client: httpx.AsyncClient) -> None:
    task_id = await _seed(task_answer="6")

    register = await client.post(
        "/api/v1/auth/register",
        json={"email": "user@example.com", "password": "password123"},
    )
    assert register.status_code == 201
    assert register.json()["email"] == "user@example.com"
    assert "accessToken" not in register.json()

    set_cookie = register.headers.get("set-cookie", "")
    assert "site_bank_session" in set_cookie
    assert "httponly" in set_cookie.lower()
    assert "samesite=lax" in set_cookie.lower()

    me = await client.get("/api/v1/users/me")
    assert me.status_code == 200
    assert me.json()["email"] == "user@example.com"

    await client.post(f"/api/v1/tasks/{task_id}/check", json={"answer": "6"})
    progress = await client.get("/api/v1/progress")
    assert progress.status_code == 200
    assert progress.json()[0]["taskId"] == task_id
    assert progress.json()[0]["solved"] is True
    assert progress.json()[0]["correctAttempts"] == 1

    async with get_sessionmaker()() as session:
        attempts = await session.scalar(select(func.count()).select_from(SolutionAttempt))
        assert attempts == 1


async def test_logout_revokes_session(client: httpx.AsyncClient) -> None:
    await client.post(
        "/api/v1/auth/register",
        json={"email": "bye@example.com", "password": "password123"},
    )
    assert (await client.get("/api/v1/users/me")).status_code == 200

    logout = await client.post("/api/v1/auth/logout")
    assert logout.status_code == 204

    assert (await client.get("/api/v1/users/me")).status_code == 401


async def test_lead_validation_rejects_bad_contact(client: httpx.AsyncClient) -> None:
    response = await client.post(
        "/api/v1/tutor-leads",
        json={"contact": "no-digits-here", "exam": "ege", "consent": True},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"


async def test_admin_can_update_lead_status(client: httpx.AsyncClient) -> None:
    created = await client.post(
        "/api/v1/tutor-leads",
        json={"contact": "student@example.com", "exam": "ege", "consent": True},
    )
    lead_id = created.json()["id"]

    anonymous = await client.patch(f"/api/v1/tutor-leads/{lead_id}", json={"status": "contacted"})
    assert anonymous.status_code == 401

    async with get_sessionmaker()() as session:
        session.add(
            User(
                email="admin@example.com",
                hashed_password=hash_password("supersecret"),
                role=UserRole.ADMIN,
            )
        )
        await session.commit()

    await client.post(
        "/api/v1/auth/login", json={"email": "admin@example.com", "password": "supersecret"}
    )

    updated = await client.patch(f"/api/v1/tutor-leads/{lead_id}", json={"status": "contacted"})
    assert updated.status_code == 200
    assert updated.json()["status"] == "contacted"

    listed = await client.get("/api/v1/tutor-leads?status=contacted")
    assert listed.status_code == 200
    assert listed.json()[0]["id"] == lead_id
