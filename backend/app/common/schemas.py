"""Schemas shared by several domains."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base for schemas built from ORM objects."""

    model_config = ConfigDict(from_attributes=True)


class Message(BaseModel):
    """Simple human-readable acknowledgement."""

    message: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Any | None = None


class ErrorResponse(BaseModel):
    """Mirror of the error envelope produced by ``app.core.exceptions``."""

    error: ErrorDetail
