from __future__ import annotations

from fastapi import APIRouter

from app.domains.articles.router import router as articles_router
from app.domains.leads.router import router as leads_router
from app.domains.progress.router import router as progress_router
from app.domains.solutions.router import router as solutions_router
from app.domains.subjects.router import router as subjects_router
from app.domains.tasks.router import router as tasks_router
from app.domains.topics.router import router as topics_router
from app.domains.users.router import router as users_router

router = APIRouter()

router.include_router(subjects_router)
router.include_router(topics_router)
router.include_router(tasks_router)
router.include_router(solutions_router)
router.include_router(articles_router)
router.include_router(leads_router)
router.include_router(users_router)
router.include_router(progress_router)
