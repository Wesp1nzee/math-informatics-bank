from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.common.schemas import ORMModel
from app.domains.leads.models import LeadExam, LeadStatus, LeadSubject


class TutorLeadCreate(BaseModel):
    pass

    name: str | None = Field(None, max_length=128)
    contact: str = Field(..., min_length=3, max_length=256, description="Телефон или e-mail")
    exam: LeadExam
    subject: LeadSubject | None = None
    message: str | None = Field(None, max_length=4000)
    consent: Literal[True] = Field(..., description="Согласие на обработку данных обязательно")

    website: str | None = Field(None, exclude=True)

    @field_validator("contact")
    @classmethod
    def _contact_looks_sane(cls, value: str) -> str:
        cleaned = value.strip()
        if "@" in cleaned:
            EmailStr._validate(cleaned)
        elif not any(ch.isdigit() for ch in cleaned):
            raise ValueError("Укажите телефон или e-mail")
        return cleaned


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
