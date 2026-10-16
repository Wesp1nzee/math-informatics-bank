from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDType, enum_values


class AttemptOutcome(enum.StrEnum):
    CORRECT = "correct"
    INCORRECT = "incorrect"


class SolutionAttempt(TimestampMixin, Base):
    __tablename__ = "solution_attempts"

    id: Mapped[int] = mapped_column(primary_key=True)
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUIDType, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    answer_value: Mapped[str] = mapped_column(String(512))
    outcome: Mapped[AttemptOutcome] = mapped_column(
        Enum(AttemptOutcome, name="attempt_outcome", values_callable=enum_values)
    )
    checked_at: Mapped[datetime] = mapped_column(nullable=False)

    task = relationship("Task", lazy="selectin")
    user = relationship("User", lazy="selectin")
