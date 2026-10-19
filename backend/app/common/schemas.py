from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    pass

    model_config = ConfigDict(from_attributes=True)


class Message(BaseModel):
    pass

    message: str


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Any | None = None


class ErrorResponse(BaseModel):
    pass

    error: ErrorDetail
