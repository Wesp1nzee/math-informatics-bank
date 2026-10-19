from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
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


class ArticleExerciseProgress(TimestampMixin, Base):
    """One row per (user, article, exercise): attempt counters and solved flag.

    Article exercises are identified by the stable block id inside the published
    article content. This table lives in the existing ``progress`` domain so the
    project keeps a single progress subsystem alongside ``user_progress``.
    """

    __tablename__ = "article_exercise_progress"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "article_id",
            "exercise_id",
            name="uq_article_exercise_progress_user_article_exercise",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    article_id: Mapped[int] = mapped_column(
        ForeignKey("articles.id", ondelete="CASCADE"), index=True
    )
    exercise_id: Mapped[str] = mapped_column(String(64), index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    correct_attempts: Mapped[int] = mapped_column(Integer, default=0)
    solved: Mapped[bool] = mapped_column(Boolean, default=False)
    last_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    last_attempt_at: Mapped[datetime | None] = mapped_column(nullable=True)
