"""Authentication dependencies: session cookie resolution and role guards."""

from __future__ import annotations

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.db.session import get_session
from app.domains.sessions.service import resolve_session
from app.domains.users.models import User, UserRole


async def get_optional_user(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> User | None:
    """Resolve the session cookie to a user, or ``None`` when anonymous/invalid."""
    raw_token = request.cookies.get(get_settings().session_cookie_name)
    if not raw_token:
        return None

    user = await resolve_session(session, raw_token)
    if user is None or not user.is_active:
        return None
    return user


async def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    if user is None:
        raise UnauthorizedError("Требуется авторизация.")
    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role is not UserRole.ADMIN:
        raise ForbiddenError("Недостаточно прав.")
    return user
