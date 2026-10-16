from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.domains.subjects.schemas import SubjectRead
from app.domains.subjects.service import list_subjects

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("", response_model=list[SubjectRead], summary="Список предметов")
async def subjects_list(session: AsyncSession = Depends(get_session)) -> list[SubjectRead]:
    return await list_subjects(session)
