from __future__ import annotations

import enum
import uuid

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDType, enum_values


class UserRole(enum.StrEnum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(256), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(256))
    display_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", values_callable=enum_values), default=UserRole.STUDENT
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
