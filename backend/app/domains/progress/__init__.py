"""Progress domain: per-user aggregate results across the task bank."""

from app.domains.progress.models import UserProgress
from app.domains.progress.router import router

__all__ = ["UserProgress", "router"]
