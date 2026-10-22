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
cp .env.example .env        # adjust DATABASE_URL and other settings as needed
uv run alembic upgrade head # create the schema
uv run python -m scripts.seed   # editorial content: 17 articles + 12 tasks
uv run python main.py       # uvicorn --reload on http://localhost:8000
```

Interactive docs are available only in dev with `DEBUG=true`
(`http://localhost:8000/docs`); health: `GET /api/health`.

## Local run without Docker (SQLite)

If Docker/PostgreSQL is unavailable, run the API on SQLite:

```bash
cp .env.example .env
# .env
DATABASE_URL=sqlite+aiosqlite:///./site_bank.db

uv run alembic upgrade head
uv run python -m scripts.seed
uv run python main.py
```

SQLite is intended for local development only; production should use
PostgreSQL.

## PostgreSQL via Docker Compose

For production deployment (Caddy, TLS, Next.js, backup, CI) see
[`docs/deployment.md`](../docs/deployment.md). The local compose file is only
for development.

```bash
cp .env.example .env
docker compose up --build
```

The API container applies migrations on start
(`alembic upgrade head && uvicorn app.main:app`).

If `docker compose` hangs or reports that the daemon is unavailable, Docker
itself is not running — use the SQLite option above or restart Docker Desktop /
the Docker daemon.

## Standalone containers (no Compose)

Both containers use `--restart unless-stopped`, so they start automatically
when Docker Desktop starts.

```bash
# 1. Build the API image
docker build -t site-bank-backend:local .

# 2. PostgreSQL
docker network create site-bank 2>/dev/null || true
docker run -d --name site-bank-db \
  --restart unless-stopped --network site-bank \
  -e POSTGRES_DB=site_bank \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -v site-bank-pgdata:/var/lib/postgresql/data \
  postgres:17-alpine

# 3. API (migrations run automatically on start)
docker run -d --name site-bank-api \
  --restart unless-stopped --network site-bank \
  -p 8000:8000 \
  -e ENV=dev \
  -e DEBUG=false \
  -e DATABASE_URL='postgresql+asyncpg://postgres:postgres@site-bank-db:5432/site_bank' \
  -e CORS_ORIGINS='["http://localhost:3000","http://127.0.0.1:3000","http://localhost:3210","http://127.0.0.1:3210"]' \
  site-bank-backend:local

# 4. Editorial content (idempotent; --reset replaces tasks and articles)
docker exec site-bank-api python -m scripts.seed
```

Check: `curl http://localhost:8000/api/health` → `{"status":"ok","database":true}`.

Make sure **Settings → General → Start Docker Desktop when you sign in** is
enabled in Docker Desktop, otherwise the `restart` policy has nothing to attach
to at login.

## Commands

| Command | Purpose |
| --- | --- |
| `uv run python main.py` | Dev server with autoreload |
| `uv run alembic upgrade head` | Apply migrations |
| `uv run alembic revision --autogenerate -m "..."` | New migration from models |
| `uv run python -m scripts.seed` | Seed editorial content (idempotent) |
| `uv run python -m scripts.seed --reset` | Delete all tasks/articles, then seed |
| `uv run pytest` | Test suite (SQLite; set `TEST_DATABASE_URL` to run against PostgreSQL) |
| `uv run ruff check .` | Lint |
| `uv run ruff format .` | Format |

## API surface (`/api/v1`)

| Method & path | Notes |
| --- | --- |
| `GET /tasks` | Paginated; `subject`, `level`, `featured`, `page`, `page_size` |
| `GET /tasks/{id}`, `GET /tasks/{id}/related` | Detail and `{ items: [...] }` |
| `POST /tasks/{id}/check` | Optional session cookie records progress; anonymous checks are not stored |
| `GET /articles`, `GET /articles/{slug}` | Block-based content |
| `GET /subjects`, `GET /topics` | Reference data |
| `POST /tutor-leads` | Public form (rate-limited, honeypot) |
| `GET /tutor-leads` | Admin only |
| `POST /auth/register` | Disabled unless `REGISTRATION_ENABLED=true` |
| `POST /auth/login` | Sets the session cookie, returns the user (rate-limited) |
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
