from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.request import get_client_ip
from app.db.session import get_session
from app.domains.sessions.service import (
    clear_session_cookie,
    create_session,
    revoke_session,
    set_session_cookie,
)
from app.domains.users.deps import get_current_user
from app.domains.users.models import User
from app.domains.users.schemas import UserLogin, UserRead, UserRegister
from app.domains.users.service import authenticate, create_user

router = APIRouter(tags=["users"])


@router.post(
    "/auth/register",
    response_model=UserRead,
    status_code=201,
    summary="Регистрация ученика",
)
async def register(
    payload: UserRegister,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    user = await create_user(session, payload)
    raw_token = await create_session(
        session,
        user,
        user_agent=request.headers.get("user-agent"),
        ip=get_client_ip(request),
    )
    set_session_cookie(response, raw_token)
    return user


@router.post("/auth/login", response_model=UserRead, summary="Вход по e-mail и паролю")
async def login(
    payload: UserLogin,
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> User:
    user = await authenticate(session, payload.email, payload.password)
    raw_token = await create_session(
        session,
        user,
        user_agent=request.headers.get("user-agent"),
        ip=get_client_ip(request),
    )
    set_session_cookie(response, raw_token)
    return user


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Выход")
async def logout(
    request: Request,
    response: Response,
    session: AsyncSession = Depends(get_session),
) -> None:
    raw_token = request.cookies.get(get_settings().session_cookie_name)
    if raw_token:
        await revoke_session(session, raw_token)
    clear_session_cookie(response)


@router.get("/users/me", response_model=UserRead, summary="Текущий пользователь")
async def me(user: User = Depends(get_current_user)) -> User:
    return user
