from __future__ import annotations

from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, JSONType, TimestampMixin
from app.domains.subjects.models import Subject


class Article(TimestampMixin, Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(256))
    description: Mapped[str] = mapped_column(String(1024), default="")
    subject_id: Mapped[int | None] = mapped_column(
        ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True
    )
    exam: Mapped[str] = mapped_column(String(64), default="ЕГЭ")
    reading_minutes: Mapped[int] = mapped_column(Integer, default=5)
    published_on: Mapped[date | None] = mapped_column(Date, nullable=True)
    updated_on: Mapped[date | None] = mapped_column(Date, nullable=True)

    blocks: Mapped[list[dict]] = mapped_column(JSONType, default=list)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)

    subject: Mapped[Subject | None] = relationship(lazy="selectin")
