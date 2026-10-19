from __future__ import annotations

import pytest
from httpx import AsyncClient

VALID_CONTACTS = [
    "@ivan_petrov",
    "ivan_petrov",
    "https://t.me/ivan_petrov",
    "+7 (999) 123-45-67",
    "a@b.co",
]

INVALID_CONTACTS = [
    "abc",
    "@a",
    "12345",
    "a@",
    "@@@@@",
]


@pytest.mark.parametrize("contact", VALID_CONTACTS)
async def test_lead_accepts_supported_contact_formats(client: AsyncClient, contact: str) -> None:
    response = await client.post(
        "/api/v1/tutor-leads",
        json={"contact": contact, "exam": "ege", "consent": True},
    )

    assert response.status_code == 201, response.text


@pytest.mark.parametrize("contact", INVALID_CONTACTS)
async def test_lead_rejects_unsupported_contact_formats(client: AsyncClient, contact: str) -> None:
    response = await client.post(
        "/api/v1/tutor-leads",
        json={"contact": contact, "exam": "ege", "consent": True},
    )

    assert response.status_code == 422, response.text
    assert "Укажите Telegram, телефон или e-mail" in response.text
