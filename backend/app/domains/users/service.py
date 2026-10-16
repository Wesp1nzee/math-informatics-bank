from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import hash_password, verify_password
from app.domains.users.models import User, UserRole
from app.domains.users.schemas import UserRegister


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    return await session.scalar(select(User).where(User.email == email.strip().lower()))


async def create_user(session: AsyncSession, payload: UserRegister) -> User:
    email = payload.email.strip().lower()
    if await get_user_by_email(session, email) is not None:
        raise ConflictError("Пользователь с таким e-mail уже зарегистрирован.")
    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        display_name=payload.display_name,
        role=UserRole.STUDENT,
    )
    session.add(user)
    await session.flush()
    return user


async def authenticate(session: AsyncSession, email: str, password: str) -> User:
    user = await get_user_by_email(session, email)
    if user is None or not user.is_active or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Неверный e-mail или пароль.")
    return user
