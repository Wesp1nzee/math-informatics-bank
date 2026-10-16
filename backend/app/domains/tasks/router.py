from __future__ import annotations

from fastapi import APIRouter, Depends, Path, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.common.pagination import Page, PaginationParams, build_page
from app.db.session import get_session
from app.domains.tasks.models import TaskLevel
from app.domains.tasks.schemas import RelatedTasksResponse, TaskRead
from app.domains.tasks.service import count_tasks, get_related_tasks, get_task, list_tasks

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=Page[TaskRead], summary="Список задач с фильтрами")
async def tasks_list(
    subject: str | None = Query(None, description="Slug предмета: matematika | informatika"),
    level: TaskLevel | None = Query(None, description="easy | medium | hard"),
    featured: bool | None = Query(None, description="Только избранные"),
    params: PaginationParams = Depends(),
    session: AsyncSession = Depends(get_session),
) -> Page[TaskRead]:
    total = await count_tasks(session, subject_slug=subject, level=level, featured=featured)
    items = await list_tasks(
        session,
        subject_slug=subject,
        level=level,
        featured=featured,
        limit=params.limit,
        offset=params.offset,
    )
    return build_page(items, total, params)


@router.get("/{task_id}", response_model=TaskRead, summary="Задача по номеру")
async def task_detail(
    task_id: int = Path(..., ge=1),
    session: AsyncSession = Depends(get_session),
) -> TaskRead:
    task = await get_task(session, task_id)
    return TaskRead.from_task(task)


@router.get(
    "/{task_id}/related",
    response_model=RelatedTasksResponse,
    summary="Похожие задачи",
)
async def task_related(
    task_id: int = Path(..., ge=1),
    limit: int = Query(3, ge=1, le=10),
    session: AsyncSession = Depends(get_session),
) -> RelatedTasksResponse:
    task = await get_task(session, task_id)
    items = await get_related_tasks(session, task, limit=limit)
    return RelatedTasksResponse(items=items)
