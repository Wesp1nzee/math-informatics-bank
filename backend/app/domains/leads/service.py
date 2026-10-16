from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import RateLimitedError
from app.core.security import generate_token
from app.domains.leads.models import LeadStatus, TutorLead
from app.domains.leads.schemas import TutorLeadCreate, TutorLeadCreated


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
        ip_hash=generate_token(16) if ip else None,
    )
    session.add(lead)
    await session.flush()
    return TutorLeadCreated(ok=True, id=lead.id)


async def list_leads(session: AsyncSession, *, status: LeadStatus | None = None) -> list[TutorLead]:
    query = select(TutorLead).order_by(TutorLead.created_at.desc())
    if status is not None:
        query = query.where(TutorLead.status == status)
    return list((await session.scalars(query)).all())
