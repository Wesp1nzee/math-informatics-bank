from __future__ import annotations

import logging

import httpx
import pytest
from sqlalchemy import select

from app.core.config import Settings
from app.db.session import get_sessionmaker
from app.domains.leads import notify as notify_module
from app.domains.leads import service as leads_service
from app.domains.leads.models import LeadExam, LeadStatus, LeadSubject, TutorLead
from app.domains.leads.notify import notify_lead

DUMMY_TOKEN = "dummy-token-should-not-leak"


def _lead() -> TutorLead:
    return TutorLead(
        name="Тест",
        contact="test@example.com",
        exam=LeadExam.EGE,
        subject=LeadSubject.MATEMATIKA,
        message="Проверка",
        consent=True,
        status=LeadStatus.NEW,
    )


def _settings(token: str | None, chat_id: str | None) -> Settings:
    return Settings(telegram_bot_token=token, telegram_admin_chat_id=chat_id)


def test_test_suite_disables_real_telegram() -> None:
    pass
    from app.core.config import get_settings

    settings = get_settings()
    assert not settings.telegram_bot_token
    assert not settings.telegram_admin_chat_id


class _FailingClient:
    pass

    def __init__(self, *args, **kwargs) -> None:
        pass

    async def __aenter__(self):
        return self

    async def __aexit__(self, *args) -> bool:
        return False

    async def post(self, url, json=None):
        request = httpx.Request("POST", url)
        response = httpx.Response(401, request=request)
        response.raise_for_status()


async def test_notify_is_noop_without_config(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(notify_module, "get_settings", lambda: _settings(None, None))
    called = False

    async def fake_post(self, url, **kwargs):
        nonlocal called
        called = True
        raise AssertionError("must not be called without config")

    monkeypatch.setattr(httpx.AsyncClient, "post", fake_post)
    await notify_lead(_lead())
    assert called is False


async def test_notify_sends_expected_payload(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(notify_module, "get_settings", lambda: _settings("test-token", "42"))
    captured: dict[str, object] = {}

    class FakeResponse:
        status_code = 200

        def raise_for_status(self) -> None:
            return None

    class FakeClient:
        def __init__(self, *args, **kwargs) -> None:
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args) -> bool:
            return False

        async def post(self, url, json=None):
            captured["url"] = url
            captured["json"] = json
            return FakeResponse()

    monkeypatch.setattr(notify_module.httpx, "AsyncClient", FakeClient)
    await notify_lead(_lead())

    payload = captured["json"]
    assert isinstance(payload, dict)
    assert payload["chat_id"] == "42"
    assert "test@example.com" in payload["text"]


async def test_notify_failure_does_not_log_token(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    monkeypatch.setattr(notify_module, "get_settings", lambda: _settings(DUMMY_TOKEN, "42"))
    monkeypatch.setattr(notify_module.httpx, "AsyncClient", _FailingClient)

    with caplog.at_level(logging.WARNING, logger="app.domains.leads.notify"):
        await notify_lead(_lead())

    assert DUMMY_TOKEN not in caplog.text
    assert "notification failed" in caplog.text.lower()
    assert "(lead" in caplog.text.lower()


async def test_api_stores_lead_when_notification_raises(
    client: httpx.AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    async def boom(lead):
        raise RuntimeError("telegram down")

    monkeypatch.setattr(leads_service, "notify_lead", boom)

    response = await client.post(
        "/api/v1/tutor-leads",
        json={"contact": "fallback@example.com", "exam": "ege", "consent": True},
    )
    assert response.status_code == 201

    async with get_sessionmaker()() as session:
        lead = await session.scalar(
            select(TutorLead).where(TutorLead.contact == "fallback@example.com")
        )
        assert lead is not None


async def test_api_survives_telegram_error_and_hides_token(
    client: httpx.AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    monkeypatch.setattr(notify_module, "get_settings", lambda: _settings(DUMMY_TOKEN, "42"))

    monkeypatch.setattr(notify_module.httpx, "AsyncClient", _FailingClient)

    with caplog.at_level(logging.WARNING):
        response = await client.post(
            "/api/v1/tutor-leads",
            json={"contact": "telegram-error@example.com", "exam": "ege", "consent": True},
        )

    assert response.status_code == 201
    assert DUMMY_TOKEN not in caplog.text

    async with get_sessionmaker()() as session:
        lead = await session.scalar(
            select(TutorLead).where(TutorLead.contact == "telegram-error@example.com")
        )
        assert lead is not None
