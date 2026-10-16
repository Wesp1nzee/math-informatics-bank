from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.progress.models import UserProgress


async def record_attempt(
    session: AsyncSession,
    *,
    user_id: uuid.UUID,
    task_id: int,
    is_correct: bool,
) -> UserProgress:
    """Upsert the aggregate row for a (user, task) pair after an attempt."""
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
