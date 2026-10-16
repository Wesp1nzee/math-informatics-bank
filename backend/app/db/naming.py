"""Constraint naming convention so Alembic autogenerate stays deterministic."""

from __future__ import annotations

from typing import Any

NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


def constraint_name(kind: str, **identifiers: Any) -> str:
    """Build a conventional constraint name outside of table definitions."""
    template = NAMING_CONVENTION[kind]
    return template % identifiers
