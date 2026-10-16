from __future__ import annotations

import uuid

from pydantic import BaseModel, EmailStr, Field

from app.common.schemas import ORMModel
from app.domains.users.models import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    display_name: str | None = Field(None, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)


class UserRead(ORMModel):
    id: uuid.UUID
    email: str
    display_name: str | None
    role: UserRole
