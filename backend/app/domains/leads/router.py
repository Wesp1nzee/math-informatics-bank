from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.request import get_client_ip
from app.db.session import get_session
from app.domains.leads.models import LeadStatus
from app.domains.leads.schemas import (
    TutorLeadCreate,
    TutorLeadCreated,
    TutorLeadRead,
    TutorLeadUpdate,
)
from app.domains.leads.service import create_lead, list_leads, update_lead_status
from app.domains.users.deps import require_admin

router = APIRouter(prefix="/tutor-leads", tags=["leads"])


@router.post("", response_model=TutorLeadCreated, status_code=201, summary="Отправить заявку")
async def submit_lead(
    payload: TutorLeadCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> TutorLeadCreated:
    ip = get_client_ip(request)
    return await create_lead(session, payload, ip=ip)


@router.get("", response_model=list[TutorLeadRead], summary="Список заявок (админ)")
async def leads_list(
    status: LeadStatus | None = Query(None),
    session: AsyncSession = Depends(get_session),
    _: object = Depends(require_admin),
) -> list[TutorLeadRead]:
    return [TutorLeadRead.model_validate(lead) for lead in await list_leads(session, status=status)]


@router.patch("/{lead_id}", response_model=TutorLeadRead, summary="Сменить статус заявки (админ)")
async def update_lead(
    lead_id: int,
    payload: TutorLeadUpdate,
    session: AsyncSession = Depends(get_session),
    _: object = Depends(require_admin),
) -> TutorLeadRead:
    lead = await update_lead_status(session, lead_id, payload.status)
    return TutorLeadRead.model_validate(lead)
