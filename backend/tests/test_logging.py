from __future__ import annotations

import logging

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.exc import IntegrityError

from app.core.exceptions import register_exception_handlers


def _app_with_failing_routes() -> FastAPI:
    app = FastAPI()
    register_exception_handlers(app)

    @app.get("/boom")
    async def boom() -> None:
        raise RuntimeError("internal detail")

    @app.get("/conflict")
    async def conflict() -> None:
        raise IntegrityError("insert", {}, Exception("secret-db-detail"))

    return app


async def test_unexpected_error_is_logged_without_leaking_details(
    caplog: pytest.LogCaptureFixture,
) -> None:
    app = _app_with_failing_routes()

    with caplog.at_level(logging.ERROR):
        async with AsyncClient(
            transport=ASGITransport(app=app, raise_app_exceptions=False),
            base_url="http://test",
        ) as client:
            response = await client.get("/boom")

    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "internal detail" not in response.text
    assert "Unhandled error on GET /boom" in caplog.text
    assert "RuntimeError" in caplog.text


async def test_integrity_error_hides_database_details(
    caplog: pytest.LogCaptureFixture,
) -> None:
    app = _app_with_failing_routes()

    with caplog.at_level(logging.ERROR):
        async with AsyncClient(
            transport=ASGITransport(app=app, raise_app_exceptions=False),
            base_url="http://test",
        ) as client:
            response = await client.get("/conflict")

    assert response.status_code == 409
    body = response.json()
    assert body["error"]["code"] == "conflict"
    assert body["error"]["details"] is None
    assert "secret-db-detail" not in response.text
    assert "secret-db-detail" in caplog.text
