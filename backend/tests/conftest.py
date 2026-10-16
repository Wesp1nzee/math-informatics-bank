"""Pytest fixtures: a throwaway SQLite database and an ASGI test client."""

from __future__ import annotations

import os
from collections.abc import AsyncIterator

# Must be set before ``app`` (and its cached Settings) is imported.
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./.pytest_backend.db")
os.environ.setdefault("LEAD_RATE_LIMIT_PER_HOUR", "100")

import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402


@pytest_asyncio.fixture
async def client() -> AsyncIterator[AsyncClient]:
    from app.db.base import Base
    from app.db.session import get_engine
    from app.main import app

    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client
