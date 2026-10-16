"""Unit tests for security primitives."""

from __future__ import annotations

from app.core.security import hash_ip


def test_hash_ip_is_deterministic_and_salted() -> None:
    assert hash_ip("1.2.3.4") == hash_ip("1.2.3.4")
    assert hash_ip("1.2.3.4") != hash_ip("1.2.3.5")
    assert hash_ip("1.2.3.4") != hash_ip("1.2.3.4", salt="secret")
    assert len(hash_ip("1.2.3.4")) == 64
