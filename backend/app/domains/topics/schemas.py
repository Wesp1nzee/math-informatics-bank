from __future__ import annotations

from app.common.schemas import ORMModel


class TopicRead(ORMModel):
    id: int
    slug: str
    label: str
    subject_slug: str
    position: int
