from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

from email_validator import EmailNotValidError, validate_email
from pydantic import BaseModel, Field, field_validator

from app.common.schemas import ORMModel
from app.domains.leads.models import LeadExam, LeadStatus, LeadSubject

_TELEGRAM_USERNAME = r"[A-Za-z][A-Za-z0-9_]{4,31}"
_TELEGRAM_RE = re.compile(
    rf"^(?:@?{_TELEGRAM_USERNAME}|(?:https?://)?(?:www\.)?t\.me/{_TELEGRAM_USERNAME}/?)$"
)


def _contact_looks_sane(value: str) -> str:
    cleaned = value.strip()

    if "@" in cleaned and not cleaned.startswith("@"):
        try:
            validate_email(cleaned, check_deliverability=False)
        except EmailNotValidError:
            pass
        else:
            return cleaned

    if _TELEGRAM_RE.fullmatch(cleaned):
        return cleaned

    digits = re.sub(r"\D", "", cleaned)
    if 10 <= len(digits) <= 15:
        return cleaned

    raise ValueError("Укажите Telegram, телефон или e-mail")


class TutorLeadCreate(BaseModel):
    name: str | None = Field(None, max_length=128)
    contact: str = Field(..., max_length=256, description="Telegram, телефон или e-mail")
    exam: LeadExam
    subject: LeadSubject | None = None
    message: str | None = Field(None, max_length=4000)
    consent: Literal[True] = Field(..., description="Согласие на обработку данных обязательно")

    website: str | None = Field(None, exclude=True)

    @field_validator("contact")
    @classmethod
    def _validate_contact(cls, value: str) -> str:
        return _contact_looks_sane(value)


class TutorLeadCreated(BaseModel):
    ok: bool = True
    id: int


class TutorLeadUpdate(BaseModel):
    status: LeadStatus


class TutorLeadRead(ORMModel):
    id: int
    name: str | None
    contact: str
    exam: LeadExam
    subject: LeadSubject | None
    message: str | None
    status: LeadStatus
    created_at: datetime
