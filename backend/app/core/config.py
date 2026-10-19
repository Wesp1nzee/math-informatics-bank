from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "Site Bank API"
    app_version: str = "0.1.0"
    env: Literal["dev", "test", "prod"] = "dev"
    debug: bool = False
    log_level: str = "INFO"
    log_json: bool = False
    allowed_hosts: list[str] = Field(default_factory=lambda: ["*"])
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
    api_prefix: str = "/api"

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/site_bank"
    database_echo: bool = False

    session_cookie_name: str = "site_bank_session"
    session_ttl_minutes: int = 60 * 24 * 14

    cookie_secure: bool | None = None
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cookie_domain: str | None = None

    storage_backend: Literal["local", "s3"] = "local"
    storage_local_dir: Path = Path("media")
    s3_endpoint_url: str | None = None
    s3_bucket: str | None = None
    s3_access_key_id: str | None = None
    s3_secret_access_key: str | None = None
    s3_region: str | None = None

    lead_rate_limit_per_hour: int = 5
    lead_rate_limit_per_ip_per_hour: int = 10
    registration_enabled: bool = False

    telegram_bot_token: str | None = None
    telegram_admin_chat_id: str | None = None

    ip_hash_salt: str = ""

    @field_validator("cors_origins", "allowed_hosts", mode="before")
    @classmethod
    def _split_csv(cls, value: object) -> object:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @model_validator(mode="after")
    def _validate_production(self) -> Settings:
        if self.env != "prod":
            return self

        problems: list[str] = []
        if self.debug:
            problems.append("DEBUG must be false")
        if len(self.ip_hash_salt.strip()) < 16:
            problems.append("IP_HASH_SALT must contain at least 16 characters")
        if any(
            "localhost" in origin.lower() or "127.0.0.1" in origin for origin in self.cors_origins
        ):
            problems.append("CORS_ORIGINS must not contain localhost or 127.0.0.1")
        if "*" in self.allowed_hosts:
            problems.append("ALLOWED_HOSTS must not contain '*'")
        if "postgres:postgres" in self.database_url:
            problems.append("DATABASE_URL must not use the default postgres:postgres password")

        if problems:
            raise ValueError("Unsafe production configuration: " + "; ".join(problems) + ".")
        return self

    @property
    def is_prod(self) -> bool:
        return self.env == "prod"

    @property
    def docs_enabled(self) -> bool:
        return self.env == "dev" and self.debug

    @property
    def cookie_secure_effective(self) -> bool:
        return self.is_prod if self.cookie_secure is None else self.cookie_secure


@lru_cache
def get_settings() -> Settings:
    return Settings()
