from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import NotFoundError, RateLimitedError
from app.core.security import hash_ip
from app.domains.leads.models import LeadStatus, TutorLead
from app.domains.leads.notify import notify_lead
from app.domains.leads.schemas import TutorLeadCreate, TutorLeadCreated

logger = logging.getLogger(__name__)


async def create_lead(
    session: AsyncSession,
    payload: TutorLeadCreate,
    *,
    ip: str | None = None,
) -> TutorLeadCreated:
    settings = get_settings()

    # Honeypot filled → silently pretend success, store nothing.
    if payload.website:
        return TutorLeadCreated(ok=True, id=0)

    window_start = datetime.now(UTC) - timedelta(hours=1)
    recent = await session.scalar(
        select(func.count())
        .select_from(TutorLead)
        .where(TutorLead.contact == payload.contact, TutorLead.created_at >= window_start)
    )
    if (recent or 0) >= settings.lead_rate_limit_per_hour:
        raise RateLimitedError("Слишком много заявок. Попробуйте позже.")

    lead = TutorLead(
        name=payload.name,
        contact=payload.contact,
        exam=payload.exam,
        subject=payload.subject,
        message=payload.message,
        consent=payload.consent,
        status=LeadStatus.NEW,
        ip_hash=hash_ip(ip, salt=settings.ip_hash_salt) if ip else None,
    )
    session.add(lead)
    await session.flush()

    # Defence in depth: notify_lead already swallows its own errors, but a stored
    # lead must never be rolled back because of a notification problem.
    try:
        await notify_lead(lead)
    except Exception as exc:  # noqa: BLE001 — notification must never block a stored lead
        logger.warning(
            "Lead notification raised unexpectedly for lead %s: %s",
            lead.id,
            type(exc).__name__,
        )

    return TutorLeadCreated(ok=True, id=lead.id)


async def list_leads(session: AsyncSession, *, status: LeadStatus | None = None) -> list[TutorLead]:
    query = select(TutorLead).order_by(TutorLead.created_at.desc())
    if status is not None:
        query = query.where(TutorLead.status == status)
    return list((await session.scalars(query)).all())


async def get_lead(session: AsyncSession, lead_id: int) -> TutorLead:
    lead = await session.get(TutorLead, lead_id)
    if lead is None:
        raise NotFoundError(f"Заявка №{lead_id} не найдена.")
    return lead


async def update_lead_status(session: AsyncSession, lead_id: int, status: LeadStatus) -> TutorLead:
    lead = await get_lead(session, lead_id)
    lead.status = status
    await session.flush()
    return lead
