from __future__ import annotations

from datetime import date

from sqlalchemy import JSON, Boolean, CheckConstraint, Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, JSONType, TimestampMixin
from app.domains.subjects.models import Subject

# Content JSON distinguishes "no v2 content" (SQL NULL) from a stored document.
# SQLAlchemy's default JSON behaviour serialises Python ``None`` as JSON
# ``null``; ``none_as_null=True`` keeps SQL NULL so the pairing CHECK below is
# enforced reliably on both PostgreSQL and SQLite.
ContentJSONType = JSON(none_as_null=True).with_variant(JSONB(none_as_null=True), "postgresql")


class Article(TimestampMixin, Base):
    __tablename__ = "articles"
    __table_args__ = (
        # ``content`` (schema v2) and its mirrored version must either both be
        # present or both be absent. Legacy articles keep v1 content in
        # ``blocks`` only, so both columns stay NULL for them.
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

    # Interactive article content (contract v2): a versioned document
    # ``{"version": 2, "blocks": [...]}``. ``content_version`` mirrors
    # ``content["version"]`` in a column so outdated content can be found
    # without parsing JSONB. ``blocks`` (v1) stays the source of truth for
    # legacy articles and is never touched by v2 writes.
    content: Mapped[dict | None] = mapped_column(ContentJSONType, nullable=True)
    content_version: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)

    is_published: Mapped[bool] = mapped_column(Boolean, default=True)

    subject: Mapped[Subject | None] = relationship(lazy="selectin")
