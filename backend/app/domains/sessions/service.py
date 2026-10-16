"""Session lifecycle: issue, resolve and revoke opaque cookie tokens."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta

from fastapi import Response
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import hash_session_token, new_session_token
from app.db.base import utcnow
from app.domains.sessions.models import UserSession
from app.domains.users.models import User


def _as_utc(value: datetime) -> datetime:
    """Normalize DB datetimes (SQLite returns naive) for safe comparison."""
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value


async def create_session(
    session: AsyncSession,
    user: User,
    *,
    user_agent: str | None = None,
    ip: str | None = None,
) -> str:
    """Create a session and return the raw token to put in the cookie."""
    settings = get_settings()
    raw_token = new_session_token()
    row = UserSession(
        user_id=user.id,
        token_hash=hash_session_token(raw_token),
        expires_at=utcnow() + timedelta(minutes=settings.session_ttl_minutes),
        user_agent=(user_agent or "")[:256] or None,
        ip_hash=hash_session_token(ip)[:64] if ip else None,
    )
    session.add(row)
    await session.flush()
    return raw_token


async def resolve_session(session: AsyncSession, raw_token: str) -> User | None:
    """Return the session's user, or ``None`` when missing/expired/disabled."""
    row = await session.scalar(
        select(UserSession).where(UserSession.token_hash == hash_session_token(raw_token))
    )
    if row is None:
        return None
    if _as_utc(row.expires_at) <= utcnow():
        await session.delete(row)
        await session.flush()
        return None
    row.last_used_at = utcnow()
    return row.user


async def revoke_session(session: AsyncSession, raw_token: str) -> None:
    """Delete a single session by its raw token (logout)."""
    await session.execute(
        delete(UserSession).where(UserSession.token_hash == hash_session_token(raw_token))
    )


async def revoke_all_sessions(session: AsyncSession, user_id: uuid.UUID) -> None:
    await session.execute(delete(UserSession).where(UserSession.user_id == user_id))


def set_session_cookie(response: Response, raw_token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=raw_token,
        max_age=settings.session_ttl_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure_effective,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.session_cookie_name,
        domain=settings.cookie_domain,
        path="/",
    )
