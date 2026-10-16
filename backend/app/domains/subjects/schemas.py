from __future__ import annotations

from app.common.schemas import ORMModel


class SubjectRead(ORMModel):
    id: int
    slug: str
    label: str
    position: int
