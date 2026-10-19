from __future__ import annotations

import os
from collections.abc import AsyncIterator

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./.pytest_backend.db")
os.environ.setdefault("LEAD_RATE_LIMIT_PER_HOUR", "100")
os.environ.setdefault("LEAD_RATE_LIMIT_PER_IP_PER_HOUR", "1000")


os.environ["TELEGRAM_BOT_TOKEN"] = ""
os.environ["TELEGRAM_ADMIN_CHAT_ID"] = ""

import pytest_asyncio
from httpx import ASGITransport, AsyncClient


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
