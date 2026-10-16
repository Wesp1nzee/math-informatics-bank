"""Task domain: the core content unit — задачи with statement, answer and steps."""

from app.domains.tasks.models import Task
from app.domains.tasks.router import router

__all__ = ["Task", "router"]
