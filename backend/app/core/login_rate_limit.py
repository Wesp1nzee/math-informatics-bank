from __future__ import annotations

from collections import defaultdict, deque
from time import monotonic

MAX_ATTEMPTS = 5
WINDOW_SECONDS = 15 * 60

# In-memory only: one API replica. Move to Redis/DB before horizontal scaling.
_attempts: dict[tuple[str, str], deque[float]] = defaultdict(deque)


def _key(ip: str | None, email: str) -> tuple[str, str]:
    return (ip or "unknown", email.strip().lower())


def _prune(key: tuple[str, str], now: float) -> deque[float]:
    attempts = _attempts[key]
    while attempts and now - attempts[0] >= WINDOW_SECONDS:
        attempts.popleft()
    return attempts


def is_login_blocked(ip: str | None, email: str) -> bool:
    key = _key(ip, email)
    return len(_prune(key, monotonic())) >= MAX_ATTEMPTS


def record_login_failure(ip: str | None, email: str) -> None:
    key = _key(ip, email)
    now = monotonic()
    _attempts[key] = _prune(key, now)
    _attempts[key].append(now)


def reset_login_failures(ip: str | None, email: str) -> None:
    _attempts.pop(_key(ip, email), None)


def clear_login_failures() -> None:
    _attempts.clear()
