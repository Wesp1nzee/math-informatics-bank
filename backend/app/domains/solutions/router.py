from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.domains.solutions.schemas import AnswerCheckRequest, AnswerCheckResponse
from app.domains.solutions.service import check_answer
from app.domains.tasks.service import get_task
from app.domains.users.deps import get_optional_user

router = APIRouter(prefix="/tasks", tags=["solutions"])


@router.post(
    "/{task_id}/check",
    response_model=AnswerCheckResponse,
    summary="Проверить ответ ученика",
)
async def check_task_answer(
    payload: AnswerCheckRequest,
    task_id: int = Path(..., ge=1),
    session: AsyncSession = Depends(get_session),
    user: object | None = Depends(get_optional_user),
) -> AnswerCheckResponse:
    task = await get_task(session, task_id)
    user_id: uuid.UUID | None = getattr(user, "id", None)
    return await check_answer(session, task, payload.answer, user_id=user_id)
