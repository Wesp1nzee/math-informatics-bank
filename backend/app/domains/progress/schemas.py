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


class ArticleExerciseProgressRead(ORMModel):
    article_id: int = Field(serialization_alias="articleId")
    exercise_id: str = Field(serialization_alias="exerciseId")
    attempts: int
    correct_attempts: int = Field(serialization_alias="correctAttempts")
    solved: bool
    last_correct: bool | None = Field(default=None, serialization_alias="lastCorrect")
    last_attempt_at: datetime | None = Field(default=None, serialization_alias="lastAttemptAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")
