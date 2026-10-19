from __future__ import annotations

import logging

import httpx

from app.core.config import get_settings
from app.domains.leads.models import TutorLead

logger = logging.getLogger(__name__)

_EXAM_LABELS = {"oge": "ОГЭ", "ege": "ЕГЭ", "other": "Другое"}
_SUBJECT_LABELS = {"matematika": "Математика", "informatika": "Информатика", "both": "Оба"}


def _lead_text(lead: TutorLead) -> str:
    lines = ["📩 Новая заявка на занятия", ""]
    if lead.name:
        lines.append(f"Имя: {lead.name}")
    lines.append(f"Связь: {lead.contact}")
    lines.append(f"Экзамен: {_EXAM_LABELS.get(lead.exam.value, lead.exam.value)}")
    if lead.subject:
        lines.append(f"Предмет: {_SUBJECT_LABELS.get(lead.subject.value, lead.subject.value)}")
    if lead.message:
        lines.append(f"Комментарий: {lead.message}")
    return "\n".join(lines)


async def notify_lead(lead: TutorLead) -> None:
    settings = get_settings()
    token = settings.telegram_bot_token
    chat_id = settings.telegram_admin_chat_id
    if not token or not chat_id:
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.post(url, json={"chat_id": chat_id, "text": _lead_text(lead)})
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        logger.warning(
            "Telegram lead notification failed: HTTP %s (lead %s)",
            exc.response.status_code,
            lead.id,
        )
    except Exception as exc:
        logger.warning(
            "Telegram lead notification failed: %s (lead %s)",
            type(exc).__name__,
            lead.id,
        )
