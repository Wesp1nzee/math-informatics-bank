from __future__ import annotations

import re
import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import utcnow
from app.domains.solutions.models import AttemptOutcome, SolutionAttempt
from app.domains.solutions.schemas import AnswerCheckResponse
from app.domains.tasks.models import Task

_DECIMAL_SEP = re.compile(r",(?=\d)")


def normalize_answer(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        return ""
    cleaned = _DECIMAL_SEP.sub(".", cleaned)
    try:
        number = float(cleaned)
    except ValueError:
        return " ".join(cleaned.lower().split())
    if number == int(number):
        return str(int(number))
    return str(number).rstrip("0").rstrip(".")


def answers_match(user_answer: str, expected: str, *, kind: str = "number") -> bool:
    if kind == "number":
        return normalize_answer(user_answer) == normalize_answer(expected)
    return normalize_answer(user_answer) == normalize_answer(expected)


async def check_answer(
    session: AsyncSession,
    task: Task,
    answer: str,
    *,
    user_id: uuid.UUID | None = None,
) -> AnswerCheckResponse:
    expected = str((task.answer or {}).get("value", ""))
    kind = str((task.answer or {}).get("kind", "number"))
    is_correct = answers_match(answer, expected, kind=kind)

    checked_at = utcnow()

    if user_id is not None:
        session.add(
            SolutionAttempt(
                task_id=task.id,
                user_id=user_id,
                answer_value=answer[:512],
                outcome=AttemptOutcome.CORRECT if is_correct else AttemptOutcome.INCORRECT,
                checked_at=checked_at,
            )
        )
        from app.domains.progress.service import record_attempt

        await record_attempt(session, user_id=user_id, task_id=task.id, is_correct=is_correct)

    return AnswerCheckResponse(
        is_correct=is_correct,
        checked_at=checked_at,
        explanation=str((task.answer or {}).get("explanation", "")) if is_correct else None,
    )
