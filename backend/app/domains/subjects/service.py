from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.domains.subjects.models import Subject
from app.domains.subjects.schemas import SubjectRead


async def list_subjects(session: AsyncSession) -> list[SubjectRead]:
    rows = (await session.scalars(select(Subject).order_by(Subject.position, Subject.id))).all()
    return [SubjectRead.model_validate(row) for row in rows]


async def get_subject_by_slug(session: AsyncSession, slug: str) -> Subject:
    subject = await session.scalar(select(Subject).where(Subject.slug == slug))
    if subject is None:
        raise NotFoundError(f"Предмет «{slug}» не найден.")
    return subject
