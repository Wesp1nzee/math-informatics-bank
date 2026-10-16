"""Topic domain: sections within a subject (e.g. «Производная»)."""

from app.domains.topics.models import Topic
from app.domains.topics.router import router
from app.domains.topics.service import list_topics

__all__ = ["Topic", "router", "list_topics"]
