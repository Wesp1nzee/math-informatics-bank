from __future__ import annotations

import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDType


class UserProgress(TimestampMixin, Base):
    """One row per (user, task): attempt counters and solved flag."""

    __tablename__ = "user_progress"
    __table_args__ = (UniqueConstraint("user_id", "task_id", name="uq_user_progress_user_task"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    task_id: Mapped[int] = mapped_column(ForeignKey("tasks.id", ondelete="CASCADE"), index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    correct_attempts: Mapped[int] = mapped_column(Integer, default=0)
    solved: Mapped[bool] = mapped_column(Boolean, default=False)
