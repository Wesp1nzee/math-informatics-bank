from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.domains.progress.schemas import (
    ArticleExerciseProgressRead,
    ProgressRead,
)
from app.domains.progress.service import (
    list_article_exercise_progress,
    list_progress,
)
from app.domains.users.deps import get_current_user
from app.domains.users.models import User

router = APIRouter(tags=["progress"])


@router.get("/progress", response_model=list[ProgressRead], summary="Мой прогресс")
async def my_progress(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[ProgressRead]:
    rows = await list_progress(session, user.id)
    return [ProgressRead.model_validate(row) for row in rows]


@router.get(
    "/progress/articles",
    response_model=list[ArticleExerciseProgressRead],
    summary="Мой прогресс по упражнениям статей",
)
async def my_article_exercise_progress(
    session: AsyncSession = Depends(get_session),
    user: User = Depends(get_current_user),
) -> list[ArticleExerciseProgressRead]:
    rows = await list_article_exercise_progress(session, user.id)
    return [ArticleExerciseProgressRead.model_validate(row) for row in rows]
