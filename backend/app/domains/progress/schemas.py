from __future__ import annotations

from datetime import datetime

from pydantic import Field

from app.common.schemas import ORMModel


class ProgressRead(ORMModel):
    task_id: int = Field(serialization_alias="taskId")
    attempts: int
    correct_attempts: int = Field(serialization_alias="correctAttempts")
    solved: bool
    updated_at: datetime = Field(serialization_alias="updatedAt")
