from __future__ import annotations

import httpx
import pytest

from app.core.config import Settings
from app.domains.leads import service as leads_service


async def test_ip_rate_limit_blocks_eleventh_lead(
    client: httpx.AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    settings = Settings(
        lead_rate_limit_per_hour=100,
        lead_rate_limit_per_ip_per_hour=10,
        telegram_bot_token=None,
        telegram_admin_chat_id=None,
    )
    monkeypatch.setattr(leads_service, "get_settings", lambda: settings)

    for index in range(10):
        response = await client.post(
            "/api/v1/tutor-leads",
            json={"contact": f"student{index}@example.com", "exam": "ege", "consent": True},
        )
        assert response.status_code == 201, response.text

    blocked = await client.post(
        "/api/v1/tutor-leads",
        json={"contact": "student10@example.com", "exam": "ege", "consent": True},
    )

    assert blocked.status_code == 429, blocked.text
    assert blocked.json()["error"]["code"] == "rate_limited"
