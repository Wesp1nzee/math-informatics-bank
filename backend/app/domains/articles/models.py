from __future__ import annotations

from datetime import date

from sqlalchemy import JSON, Boolean, CheckConstraint, Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, JSONType, TimestampMixin
from app.domains.subjects.models import Subject

ContentJSONType = JSON(none_as_null=True).with_variant(JSONB(none_as_null=True), "postgresql")


class Article(TimestampMixin, Base):
    __tablename__ = "articles"
    __table_args__ = (
        CheckConstraint(
            "(content IS NULL AND content_version IS NULL) OR "
            "(content IS NOT NULL AND content_version IS NOT NULL AND content_version >= 1)",
            name="content_version_pair",
        ),
    )

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

    content: Mapped[dict | None] = mapped_column(ContentJSONType, nullable=True)
    content_version: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True)

    subject: Mapped[Subject | None] = relationship(lazy="selectin")
