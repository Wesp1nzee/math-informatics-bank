from __future__ import annotations

from fastapi import Request


def get_client_ip(request: Request) -> str | None:
    """Client IP as resolved by the ASGI server (uvicorn proxy headers included)."""
    return request.client.host if request.client else None
