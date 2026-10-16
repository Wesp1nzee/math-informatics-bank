from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.topics.models import Topic
from app.domains.topics.schemas import TopicRead


def _to_read(topic: Topic) -> TopicRead:
    return TopicRead(
        id=topic.id,
        slug=topic.slug,
        label=topic.label,
        subject_slug=topic.subject.slug,
        position=topic.position,
    )


async def list_topics(session: AsyncSession, *, subject_slug: str | None = None) -> list[TopicRead]:
    query = select(Topic).order_by(Topic.position, Topic.id)
    if subject_slug is not None:
        query = query.join(Topic.subject).where(Topic.subject.has(slug=subject_slug))
    rows = (await session.scalars(query)).all()
    return [_to_read(topic) for topic in rows]
