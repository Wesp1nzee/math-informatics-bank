from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from pydantic import ValidationError

from app.core.config import Settings
from app.main import create_app

VALID_PROD = {
    "env": "prod",
    "debug": False,
    "ip_hash_salt": "a-secret-salt-with-32-characters!!",
    "cors_origins": ["https://tutor.example"],
    "allowed_hosts": ["tutor.example", "api.tutor.example"],
    "database_url": "postgresql+asyncpg://site_bank:strong-password@db:5432/site_bank",
}


def test_valid_production_settings_are_accepted() -> None:
    settings = Settings(**VALID_PROD)

    assert settings.is_prod
    assert settings.docs_enabled is False


def test_csv_environment_values_are_split(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ALLOWED_HOSTS", "example.com, api.example.com")
    monkeypatch.setenv("CORS_ORIGINS", "https://example.com,https://www.example.com")

    settings = Settings()

    assert settings.allowed_hosts == ["example.com", "api.example.com"]
    assert settings.cors_origins == ["https://example.com", "https://www.example.com"]


def test_json_environment_values_are_still_supported(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ALLOWED_HOSTS", '["example.com", "api.example.com"]')
    monkeypatch.setenv("CORS_ORIGINS", '["https://example.com"]')

    settings = Settings()

    assert settings.allowed_hosts == ["example.com", "api.example.com"]
    assert settings.cors_origins == ["https://example.com"]


@pytest.mark.parametrize(
    "override",
    [
        {"debug": True},
        {"ip_hash_salt": ""},
        {"ip_hash_salt": "too-short"},
        {"cors_origins": ["http://localhost:3000"]},
        {"cors_origins": ["http://127.0.0.1:3000"]},
        {"allowed_hosts": ["*"]},
        {"database_url": "postgresql+asyncpg://postgres:postgres@db:5432/site_bank"},
    ],
)
def test_unsafe_production_settings_fail_fast(override: dict[str, object]) -> None:
    with pytest.raises(ValidationError):
        Settings(**{**VALID_PROD, **override})


def test_docs_are_disabled_outside_dev_or_without_debug() -> None:
    prod_app = create_app(Settings(**VALID_PROD))
    assert prod_app.docs_url is None
    assert prod_app.redoc_url is None
    assert prod_app.openapi_url is None

    dev_app = create_app(Settings(env="dev", debug=False))
    assert dev_app.docs_url is None

    docs_app = create_app(Settings(env="dev", debug=True))
    assert docs_app.docs_url == "/docs"
    assert docs_app.openapi_url == "/openapi.json"


async def test_trusted_host_middleware_rejects_unknown_host() -> None:
    app = create_app(Settings(env="test", allowed_hosts=["example.com"]))

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://evil.example"
    ) as client:
        response = await client.get("/health")

    assert response.status_code == 400


async def test_trusted_host_middleware_allows_configured_host() -> None:
    app = create_app(Settings(env="test", allowed_hosts=["example.com"]))

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://example.com"
    ) as client:
        response = await client.get("/health")

    assert response.status_code == 200


async def test_cors_preflight_allows_private_network_requests() -> None:
    app = create_app(
        Settings(env="test", cors_origins=["http://127.0.0.1:3210"])
    )

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.options(
            "/api/v1/tasks/4/check",
            headers={
                "Origin": "http://127.0.0.1:3210",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
                "Access-Control-Request-Private-Network": "true",
            },
        )

    assert response.status_code == 200
    assert response.headers["access-control-allow-private-network"] == "true"
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:3210"
