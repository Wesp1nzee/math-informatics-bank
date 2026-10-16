from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_session
from app.domains.leads.models import LeadStatus
from app.domains.leads.schemas import TutorLeadCreate, TutorLeadCreated, TutorLeadRead
from app.domains.leads.service import create_lead, list_leads
from app.domains.users.deps import require_admin

router = APIRouter(prefix="/tutor-leads", tags=["leads"])


@router.post("", response_model=TutorLeadCreated, status_code=201, summary="Отправить заявку")
async def submit_lead(
    payload: TutorLeadCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> TutorLeadCreated:
    ip = request.client.host if request.client else None
    return await create_lead(session, payload, ip=ip)


@router.get("", response_model=list[TutorLeadRead], summary="Список заявок (админ)")
async def leads_list(
    status: LeadStatus | None = Query(None),
    session: AsyncSession = Depends(get_session),
    _: object = Depends(require_admin),
) -> list[TutorLeadRead]:
    return [TutorLeadRead.model_validate(lead) for lead in await list_leads(session, status=status)]
