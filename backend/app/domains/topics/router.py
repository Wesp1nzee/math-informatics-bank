from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.domains.topics.schemas import TopicRead
from app.domains.topics.service import list_topics

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("", response_model=list[TopicRead], summary="Список тем")
async def topics_list(
    subject: str | None = Query(None, description="Фильтр по slug предмета"),
    session: AsyncSession = Depends(get_session),
) -> list[TopicRead]:
    return await list_topics(session, subject_slug=subject)
