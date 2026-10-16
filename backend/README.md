# Site Bank API

FastAPI backend for the tutoring site: subjects, topics, tasks, articles, answer
checking, tutor leads, users and per-user progress. It serves the contract that
the Next.js frontend expects in `frontend/src/features/*/api.ts`.

## Requirements

- Python 3.14+
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL 17 (via Docker Compose) for real runs, or SQLite for quick local
  experiments and tests

## Setup

```bash
uv sync
cp .env.example .env        # adjust JWT_SECRET / DATABASE_URL as needed
uv run alembic upgrade head # create the schema
uv run python -m scripts.seed   # optional demo content
uv run python main.py       # uvicorn --reload on http://localhost:8000
```

Interactive docs: `http://localhost:8000/docs`, health: `GET /api/health`.

## PostgreSQL via Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

The API container applies migrations on start
(`alembic upgrade head && uvicorn app.main:app`).

## Commands

| Command | Purpose |
| --- | --- |
| `uv run python main.py` | Dev server with autoreload |
| `uv run alembic upgrade head` | Apply migrations |
| `uv run alembic revision --autogenerate -m "..."` | New migration from models |
| `uv run python -m scripts.seed` | Seed demo content (idempotent) |
| `uv run pytest` | Test suite (SQLite, no PostgreSQL needed) |
| `uv run ruff check .` | Lint |
| `uv run ruff format .` | Format |

## API surface (`/api/v1`)

| Method & path | Notes |
| --- | --- |
| `GET /tasks` | Paginated; `subject`, `level`, `featured`, `page`, `page_size` |
| `GET /tasks/{id}`, `GET /tasks/{id}/related` | Detail and `{ items: [...] }` |
| `POST /tasks/{id}/check` | Optional bearer token records progress |
| `GET /articles`, `GET /articles/{slug}` | Block-based content |
| `GET /subjects`, `GET /topics` | Reference data |
| `POST /tutor-leads` | Public form (rate-limited, honeypot) |
| `GET /tutor-leads` | Admin only |
| `POST /auth/register`, `POST /auth/login` | Sets the session cookie, returns the user |
| `POST /auth/logout` | Revokes the session and clears the cookie |
| `GET /users/me`, `GET /progress` | Current user (session cookie) |
| `GET /api/health` | Liveness + database check |

Errors use a single envelope: `{"error": {"code", "message", "details"}}`.

## Authentication

Auth is **server-side sessions + an HttpOnly cookie** (no JWT). `login`/`register`
create a row in `user_sessions` and set an opaque random token in the
`site_bank_session` cookie; only the SHA-256 hash of the token is stored. Cookie
flags come from settings (`SESSION_COOKIE_NAME`, `SESSION_TTL_MINUTES`,
`COOKIE_SECURE` → auto-`True` in production, `COOKIE_SAMESITE`, `COOKIE_DOMAIN`).

The browser must send cookies: the frontend `clientRequest` sets
`credentials: "include"`, and CORS already allows credentials for the configured
`CORS_ORIGINS` (never `*` together with credentials).

> Cross-site deployments (different registrable domains) need
> `COOKIE_SAMESITE=none`, `COOKIE_SECURE=true` **and** a CSRF token; same-site
> origins (e.g. `example.com` + `api.example.com`) are covered by `lax`.

## Layout

```
app/
├── api/            # root + v1 routers
├── core/           # settings, logging, security, exception handlers
├── db/             # declarative base, portable types, async session
├── common/         # pagination + shared schemas
└── domains/        # subjects, topics, tasks, solutions, articles,
                    # leads, users, progress (models/schemas/service/router)
migrations/         # Alembic environment and versions
scripts/            # seed helper
tests/              # pytest suite (SQLite)
```
