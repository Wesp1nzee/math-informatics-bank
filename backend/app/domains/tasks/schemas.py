from __future__ import annotations

from typing import Annotated, Literal

from pydantic import BaseModel, Field, TypeAdapter

from app.common.schemas import ORMModel
from app.domains.tasks.models import TaskLevel


class ParagraphBlock(BaseModel):
    type: Literal["paragraph"]
    text: str


class ListBlock(BaseModel):
    type: Literal["list"]
    ordered: bool = False
    items: list[str]


class FormulaBlock(BaseModel):
    type: Literal["formula"]
    tex: str
    caption: str | None = None


class HeadingBlock(BaseModel):
    type: Literal["heading"]
    text: str
    id: str


class QuoteBlock(BaseModel):
    type: Literal["quote"]
    text: str


StatementBlock = Annotated[
    ParagraphBlock | ListBlock | FormulaBlock | HeadingBlock | QuoteBlock,
    Field(discriminator="type"),
]

statement_blocks_adapter: TypeAdapter[list[StatementBlock]] = TypeAdapter(list[StatementBlock])


class SolutionStep(BaseModel):
    note: str
    tex: str


class TaskAnswer(BaseModel):
    value: str
    kind: Literal["number", "text"] = "number"
    explanation: str = ""


class TopicBrief(BaseModel):
    slug: str
    label: str


class TaskRead(ORMModel):
    pass

    id: str
    title: str
    subject: str
    exam_label: str = Field(serialization_alias="examLabel")
    level: TaskLevel
    minutes: int
    summary: str
    statement: list[StatementBlock]
    answer: TaskAnswer
    steps: list[SolutionStep]
    topics: list[str]
    featured: bool
    is_demo: bool = Field(default=False, serialization_alias="isDemo")

    @classmethod
    def from_task(cls, task) -> TaskRead:
        return cls(
            id=str(task.id),
            title=task.title,
            subject=task.subject.slug,
            exam_label=task.exam_label,
            level=task.level,
            minutes=task.minutes,
            summary=task.summary,
            statement=statement_blocks_adapter.validate_python(task.statement or []),
            answer=TaskAnswer.model_validate(task.answer or {}),
            steps=[SolutionStep.model_validate(step) for step in task.steps or []],
            topics=[topic.label for topic in task.topics],
            featured=task.featured,
            is_demo=False,
        )


class TaskRelatedRead(TaskRead):
    pass


class RelatedTasksResponse(BaseModel):
    pass

    items: list[TaskRead]


class TaskDetailRead(TaskRead):
    solution_available: bool = True
