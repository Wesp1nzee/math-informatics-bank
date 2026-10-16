from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.common.schemas import ORMModel


class AnswerCheckRequest(BaseModel):
    answer: str = Field(..., min_length=1, max_length=512, description="Ответ ученика")


class AnswerCheckResponse(BaseModel):
    is_correct: bool = Field(serialization_alias="isCorrect")
    checked_at: datetime = Field(serialization_alias="checkedAt")

    # Reveal the explanation only when the answer is correct — the site shows
    # full solutions after a successful attempt or via the task page anyway.
    explanation: str | None = None


class AttemptRead(ORMModel):
    id: int
    task_id: int = Field(serialization_alias="taskId")
    answer_value: str = Field(serialization_alias="answerValue")
    outcome: str
    checked_at: datetime = Field(serialization_alias="checkedAt")
