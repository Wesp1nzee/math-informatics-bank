from __future__ import annotations

import enum

from sqlalchemy import Boolean, Column, Enum, ForeignKey, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, JSONType, TimestampMixin, enum_values
from app.domains.subjects.models import Subject
from app.domains.topics.models import Topic


class TaskLevel(enum.StrEnum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


task_topics = Table(
    "task_topics",
    Base.metadata,
    Column(
        "task_id",
        ForeignKey("tasks.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "topic_id",
        ForeignKey("topics.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Task(TimestampMixin, Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(256))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="RESTRICT"))
    exam_label: Mapped[str] = mapped_column(String(64), default="ЕГЭ · Профиль")
    level: Mapped[TaskLevel] = mapped_column(
        Enum(TaskLevel, name="task_level", values_callable=enum_values)
    )
    minutes: Mapped[int] = mapped_column(default=3)
    summary: Mapped[str] = mapped_column(String(512), default="")

    statement: Mapped[list[dict]] = mapped_column(JSONType, default=list)
    answer: Mapped[dict] = mapped_column(JSONType, default=dict)
    steps: Mapped[list[dict]] = mapped_column(JSONType, default=list)

    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    source_ref: Mapped[str | None] = mapped_column(String(128), nullable=True)

    subject: Mapped[Subject] = relationship(lazy="selectin")
    topics: Mapped[list[Topic]] = relationship(
        secondary=task_topics, lazy="selectin", order_by="Topic.position"
    )
