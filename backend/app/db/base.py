"""Declarative base, common mixins and helper types for all ORM models."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import Enum as PyEnum
from typing import Any

from sqlalchemy import JSON, MetaData
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import CHAR, TypeDecorator

from app.db.naming import NAMING_CONVENTION

# Portable JSON type: JSONB on PostgreSQL, plain JSON elsewhere (sqlite tests).
JSONType = JSON().with_variant(JSONB(), "postgresql")


def enum_values(enum_cls: type[PyEnum]) -> list[str]:
    """SQLAlchemy ``values_callable``: persist enum *values*, not member names."""
    return [str(member.value) for member in enum_cls]


class UUIDType(TypeDecorator[uuid.UUID]):
    """Portable UUID type for primary/foreign keys.

    Native ``UUID`` on PostgreSQL (bound/returned as :class:`uuid.UUID`) and
    ``CHAR(32)`` hex elsewhere (e.g. SQLite in tests), so the same models work
    on both backends.
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):  # noqa: ANN001 — SQLAlchemy internal API
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PgUUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):  # noqa: ANN001
        if value is None:
            return None
        if not isinstance(value, uuid.UUID):
            value = uuid.UUID(str(value))
        return value if dialect.name == "postgresql" else value.hex

    def process_result_value(self, value, dialect):  # noqa: ANN001
        if value is None:
            return None
        return value if isinstance(value, uuid.UUID) else uuid.UUID(str(value))


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)

    type_annotation_map = {
        dict[str, Any]: JSONType,
        list[Any]: JSONType,
    }

    def to_dict(self) -> dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


def utcnow() -> datetime:
    return datetime.now(UTC)


class TimestampMixin:
    """``created_at``/``updated_at`` maintained by the database layer."""

    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)
