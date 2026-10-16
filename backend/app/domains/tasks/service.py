from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.db.session import get_session  # noqa: F401 — re-exported for routers
from app.domains.tasks.models import Task, TaskLevel
from app.domains.tasks.schemas import TaskRead


def _base_query():
    return (
        select(Task)
        .where(Task.is_published.is_(True))
        .options(selectinload(Task.topics), selectinload(Task.subject))
    )


async def count_tasks(
    session: AsyncSession,
    *,
    subject_slug: str | None = None,
    level: TaskLevel | None = None,
    featured: bool | None = None,
) -> int:
    query = select(func.count()).select_from(Task).where(Task.is_published.is_(True))
    if subject_slug is not None:
        query = query.where(Task.subject.has(slug=subject_slug))
    if level is not None:
        query = query.where(Task.level == level)
    if featured is not None:
        query = query.where(Task.featured.is_(featured))
    return int(await session.scalar(query) or 0)


async def list_tasks(
    session: AsyncSession,
    *,
    subject_slug: str | None = None,
    level: TaskLevel | None = None,
    featured: bool | None = None,
    limit: int = 10,
    offset: int = 0,
) -> list[TaskRead]:
    query = _base_query()
    if subject_slug is not None:
        query = query.where(Task.subject.has(slug=subject_slug))
    if level is not None:
        query = query.where(Task.level == level)
    if featured is not None:
        query = query.where(Task.featured.is_(featured))

    query = query.order_by(Task.featured.desc(), Task.id).limit(limit).offset(offset)
    rows = (await session.scalars(query)).all()
    return [TaskRead.from_task(task) for task in rows]


async def get_task(session: AsyncSession, task_id: int) -> Task:
    task = await session.scalar(_base_query().where(Task.id == task_id))
    if task is None:
        raise NotFoundError(f"Задача №{task_id} не найдена.")
    return task


async def get_related_tasks(session: AsyncSession, task: Task, *, limit: int = 3) -> list[TaskRead]:
    """Score candidates by shared topics + same subject + same level."""
    candidates = (await session.scalars(_base_query().where(Task.id != task.id).limit(500))).all()

    task_topics = {topic.id for topic in task.topics}

    def score(candidate: Task) -> int:
        shared = len(task_topics & {topic.id for topic in candidate.topics})
        same_subject = int(candidate.subject_id == task.subject_id)
        same_level = int(candidate.level == task.level)
        return shared * 2 + same_subject + same_level

    ranked = sorted(candidates, key=score, reverse=True)
    return [TaskRead.from_task(candidate) for candidate in ranked[:limit]]
