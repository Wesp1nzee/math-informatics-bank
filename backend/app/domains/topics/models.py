from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin
from app.domains.subjects.models import Subject


class Topic(TimestampMixin, Base):
    __tablename__ = "topics"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(96), unique=True, index=True)
    label: Mapped[str] = mapped_column(String(128))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"))
    position: Mapped[int] = mapped_column(default=0)

    subject: Mapped[Subject] = relationship(lazy="selectin")
