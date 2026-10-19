from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import utcnow
from app.domains.progress.models import ArticleExerciseProgress, UserProgress


async def record_attempt(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    task_id: int,
    is_correct: bool,
) -> UserProgress:
    pass
    row = await session.scalar(
        select(UserProgress).where(UserProgress.user_id == user_id, UserProgress.task_id == task_id)
    )
    if row is None:
        row = UserProgress(
            user_id=user_id, task_id=task_id, attempts=0, correct_attempts=0, solved=False
        )
        session.add(row)

    row.attempts += 1
    if is_correct:
        row.correct_attempts += 1
        row.solved = True

    await session.flush()
    return row


async def list_progress(session: AsyncSession, user_id: uuid.UUID) -> list[UserProgress]:
    rows = await session.scalars(
        select(UserProgress)
        .where(UserProgress.user_id == user_id)
        .order_by(UserProgress.updated_at.desc())
    )
    return list(rows.all())


async def record_article_exercise_attempt(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    article_id: int,
    exercise_id: str,
    is_correct: bool,
    checked_at: datetime | None = None,
) -> ArticleExerciseProgress:
    pass
    checked_at = checked_at or utcnow()
    row = await session.scalar(
        select(ArticleExerciseProgress).where(
            ArticleExerciseProgress.user_id == user_id,
            ArticleExerciseProgress.article_id == article_id,
            ArticleExerciseProgress.exercise_id == exercise_id,
        )
    )
    if row is None:
        row = ArticleExerciseProgress(
            user_id=user_id,
            article_id=article_id,
            exercise_id=exercise_id,
            attempts=0,
            correct_attempts=0,
            solved=False,
        )
        session.add(row)

    row.attempts += 1
    if is_correct:
        row.correct_attempts += 1
        row.solved = True
    row.last_correct = is_correct
    row.last_attempt_at = checked_at

    await session.flush()
    return row


async def list_article_exercise_progress(
    session: AsyncSession, user_id: uuid.UUID
) -> list[ArticleExerciseProgress]:
    rows = await session.scalars(
        select(ArticleExerciseProgress)
        .where(ArticleExerciseProgress.user_id == user_id)
        .order_by(ArticleExerciseProgress.updated_at.desc())
    )
    return list(rows.all())
