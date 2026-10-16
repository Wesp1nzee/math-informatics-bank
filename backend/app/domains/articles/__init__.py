"""Article domain: long-form content (разборы, методички) with a block editor payload."""

from app.domains.articles.models import Article
from app.domains.articles.router import router

__all__ = ["Article", "router"]
