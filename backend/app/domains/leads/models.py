from __future__ import annotations

import enum

from sqlalchemy import Boolean, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, enum_values


class LeadExam(enum.StrEnum):
    OGE = "oge"
    EGE = "ege"
    OTHER = "other"


class LeadSubject(enum.StrEnum):
    MATEMATIKA = "matematika"
    INFORMATIKA = "informatika"
    BOTH = "both"


class LeadStatus(enum.StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    CLOSED = "closed"


class TutorLead(TimestampMixin, Base):
    __tablename__ = "tutor_leads"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    contact: Mapped[str] = mapped_column(String(256), index=True)
    exam: Mapped[LeadExam] = mapped_column(
        Enum(LeadExam, name="lead_exam", values_callable=enum_values)
    )
    subject: Mapped[LeadSubject | None] = mapped_column(
        Enum(LeadSubject, name="lead_subject", values_callable=enum_values), nullable=True
    )
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    consent: Mapped[bool] = mapped_column(Boolean, default=False)

    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, name="lead_status", values_callable=enum_values), default=LeadStatus.NEW
    )
    source: Mapped[str] = mapped_column(String(64), default="site")
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)
