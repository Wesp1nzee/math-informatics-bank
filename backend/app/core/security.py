"""Security primitives: password hashing (scrypt) and opaque session tokens."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets

# --- passwords -----------------------------------------------------------------

_SCRYPT_N = 2**14
_SCRYPT_R = 8
_SCRYPT_P = 1
_KEY_LEN = 32
_SALT_LEN = 16


def hash_password(password: str) -> str:
    """Return ``scrypt$<salt_b64>$<hash_b64>`` for the given plain password."""
    salt = secrets.token_bytes(_SALT_LEN)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=_SCRYPT_N,
        r=_SCRYPT_R,
        p=_SCRYPT_P,
        dklen=_KEY_LEN,
    )
    return f"scrypt${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt_b64, hash_b64 = stored.split("$")
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
    except ValueError, TypeError:
        return False

    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=salt,
        n=_SCRYPT_N,
        r=_SCRYPT_R,
        p=_SCRYPT_P,
        dklen=len(expected),
    )
    return hmac.compare_digest(digest, expected)


# --- session tokens ------------------------------------------------------------


def new_session_token(nbytes: int = 48) -> str:
    """Opaque, URL-safe token stored in the session cookie (never logged)."""
    return secrets.token_urlsafe(nbytes)


def hash_session_token(token: str) -> str:
    """SHA-256 hex of a session token — only the hash is persisted."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


# --- misc ----------------------------------------------------------------------


def generate_token(nbytes: int = 32) -> str:
    """URL-safe random token for links, confirmations, request de-duplication."""
    return secrets.token_urlsafe(nbytes)


def mask_secret(value: str, visible: int = 4) -> str:
    """Show the tail of a secret (e.g. token prefix in logs), never the whole value."""
    if len(value) <= visible:
        return "***"
    return f"***{value[-visible:]}"
