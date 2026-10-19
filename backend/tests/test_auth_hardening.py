from __future__ import annotations

import importlib

import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.core.config import Settings
from app.core.login_rate_limit import clear_login_failures
from app.core.security import hash_password
from app.db.session import get_sessionmaker
from app.domains.users.models import User, UserRole
from scripts.create_admin import create_admin

users_router = importlib.import_module("app.domains.users.router")


@pytest.fixture(autouse=True)
def _reset_limiter():
    clear_login_failures()
    yield
    clear_login_failures()


def test_registration_is_disabled_by_default() -> None:
    assert Settings.model_fields["registration_enabled"].default is False


async def test_register_returns_404_when_disabled(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(users_router, "get_settings", lambda: Settings(registration_enabled=False))

    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "closed@example.com", "password": "password123"},
    )

    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


async def test_register_works_when_enabled(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(users_router, "get_settings", lambda: Settings(registration_enabled=True))

    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "open@example.com", "password": "password123"},
    )

    assert response.status_code == 201
    assert response.json()["email"] == "open@example.com"


async def test_sixth_failed_login_is_rate_limited(client: AsyncClient) -> None:
    async with get_sessionmaker()() as session:
        session.add(
            User(
                email="ratelimit@example.com",
                hashed_password=hash_password("correct-password"),
            )
        )
        await session.commit()

    for attempt in range(5):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "ratelimit@example.com", "password": "wrong-password"},
        )
        assert response.status_code == 401, (attempt, response.text)

    blocked = await client.post(
        "/api/v1/auth/login",
        json={"email": "ratelimit@example.com", "password": "wrong-password"},
    )

    assert blocked.status_code == 429
    assert blocked.json()["error"]["code"] == "rate_limited"


async def test_successful_login_resets_failure_counter(client: AsyncClient) -> None:
    async with get_sessionmaker()() as session:
        session.add(
            User(
                email="reset@example.com",
                hashed_password=hash_password("correct-password"),
            )
        )
        await session.commit()

    for _ in range(4):
        await client.post(
            "/api/v1/auth/login",
            json={"email": "reset@example.com", "password": "wrong-password"},
        )

    success = await client.post(
        "/api/v1/auth/login",
        json={"email": "reset@example.com", "password": "correct-password"},
    )
    assert success.status_code == 200

    for _ in range(4):
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "reset@example.com", "password": "wrong-password"},
        )
        assert response.status_code == 401


async def test_admin_endpoints_reject_non_admin(client: AsyncClient) -> None:
    registered = await client.post(
        "/api/v1/auth/register",
        json={"email": "student@example.com", "password": "password123"},
    )
    assert registered.status_code == 201

    response = await client.get("/api/v1/tutor-leads")

    assert response.status_code == 403
    assert response.json()["error"]["code"] == "forbidden"


async def test_create_admin_script_is_independent_of_registration(client: AsyncClient) -> None:
    await create_admin("owner@example.com", "password123", None)

    async with get_sessionmaker()() as session:
        user = await session.scalar(select(User).where(User.email == "owner@example.com"))

    assert user is not None
    assert user.role is UserRole.ADMIN
