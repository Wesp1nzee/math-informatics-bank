from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDType
from app.domains.users.models import User


class UserSession(TimestampMixin, Base):
    pass

    __tablename__ = "user_sessions"

    id: Mapped[uuid.UUID] = mapped_column(UUIDType, primary_key=True, default=uuid.uuid4)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUIDType, ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    expires_at: Mapped[datetime] = mapped_column(nullable=False)
    last_used_at: Mapped[datetime | None] = mapped_column(nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(256), nullable=True)
    ip_hash: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user: Mapped[User] = relationship(lazy="selectin")
