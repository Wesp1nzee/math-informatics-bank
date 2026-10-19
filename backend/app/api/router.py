from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.router import router as v1_router
from app.db.session import ping_database

api_router = APIRouter()
api_router.include_router(v1_router, prefix="/v1")


@api_router.get("/health", tags=["system"], summary="Health check")
async def health() -> dict[str, str | bool]:
    db_ok = await ping_database()
    return {"status": "ok" if db_ok else "degraded", "database": db_ok}


root_router = APIRouter()
root_router.add_api_route(
    "/health",
    health,
    methods=["GET"],
    tags=["system"],
    summary="Health check",
    include_in_schema=False,
)
