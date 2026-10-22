# Deployment

This guide describes a single-VPS deployment: Caddy (TLS + reverse proxy),
Next.js (`web`), FastAPI (`api`) and PostgreSQL (`db`). Only Caddy publishes
ports; the API and database stay on the internal Docker network.

## 1. VPS and DNS

1. Create an Ubuntu LTS VPS with at least 2 vCPU / 2 GB RAM / 20 GB disk.
2. Point an `A` record (and `AAAA` if you have IPv6) for the site domain to the
   server IP. Wait for DNS propagation.
3. Install Docker Engine and the Compose plugin:
   `curl -fsSL https://get.docker.com | sh` (or the official Docker docs).
4. Allow inbound TCP 22, 80 and 443 in the firewall; do not expose 3000, 8000
   or 5432.

## 2. Get the code and configure

```bash
git clone <repository-url> /srv/site_bank
cd /srv/site_bank
git checkout <release-tag-or-commit>

cp deploy/.env.production.example deploy/.env.production
chmod 600 deploy/.env.production
```

Fill in `deploy/.env.production`:

- `SITE_DOMAIN`, `ACME_EMAIL`, `NEXT_PUBLIC_SITE_URL`,
  `NEXT_PUBLIC_API_BASE_URL` (all the same public origin);
- `POSTGRES_PASSWORD` and `POSTGRES_USER` — do not keep the example password;
- `IP_HASH_SALT` — `openssl rand -hex 32`;
- `ALLOWED_HOSTS` — the public domain plus `localhost,127.0.0.1,api` for the
  container healthcheck;
- `CORS_ORIGINS` — the single public origin;
- `FORWARDED_ALLOW_IPS` — the compose subnet `172.28.0.0/16` (or the proxy
  address/subnet you actually use; never `*` without a reason);
- `NEXT_PUBLIC_TUTOR_*` — real tutor details (required by `check:deploy`);
- optionally `NEXT_PUBLIC_YM_ID` and the Telegram bot token/chat id.

The frontend `NEXT_PUBLIC_*` values are baked at image build time, so changing
them requires rebuilding the `web` image.

## 3. First launch

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml build
docker compose --env-file deploy/.env.production -f compose.prod.yaml up -d
docker compose --env-file deploy/.env.production -f compose.prod.yaml ps
```

The API container applies `alembic upgrade head` before starting uvicorn. To run
migrations explicitly (for example during a controlled release):

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml \
  run --rm api alembic upgrade head
```

Load the editorial content (idempotent):

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml \
  exec api python -m scripts.seed
```

Editorial pages (articles, tasks and the sitemap) are rendered on demand and read
the API at runtime. The `web` image can therefore be built before the API is
seeded; run `scripts.seed` after the stack is healthy. A `web` rebuild is needed
only when frontend code or `NEXT_PUBLIC_*` values change:

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml build web
docker compose --env-file deploy/.env.production -f compose.prod.yaml up -d web
```

Watch the logs:

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml logs -f api web caddy
```

## 4. Create the admin

Public registration is disabled by default (`REGISTRATION_ENABLED=false`). The
admin script works regardless of that setting:

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml \
  exec api python -m scripts.create_admin admin@example.com "Admin"
```

The command asks for a password interactively (at least 8 characters).

## 5. Verify

```bash
curl -fsS https://<SITE_DOMAIN>/api/health
curl -fsS -o /dev/null -w '%{http_code}\n' https://<SITE_DOMAIN>/
curl -fsS https://<SITE_DOMAIN>/robots.txt
curl -fsSI https://<SITE_DOMAIN>/ | grep -i -E 'strict-transport|content-security|x-frame'
```

`/api/health` must return `{"status":"ok","database":true}`. The API docs are
intentionally disabled when `ENV=prod` or `DEBUG=false`.

`robots.ts` disallows `/api/`; this is intentional and does not conflict with
Caddy routing `/api/*` to the API — crawlers simply should not index the API.

Submit a test lead through the form and confirm it appears in the admin list.
Enable Metrika only after the owner supplies the counter id.

## 6. Updates and rollback

```bash
# Before every release
./deploy/backup.sh

git fetch --tags
git checkout <new-tag>
docker compose --env-file deploy/.env.production -f compose.prod.yaml build
docker compose --env-file deploy/.env.production -f compose.prod.yaml up -d
```

Migrations are applied automatically. If a release must be rolled back:

1. Stop traffic to the new API: `... stop api web`.
2. `git checkout <previous-tag>` and rebuild/start (`build`, `up -d`).
3. If the new release changed the schema incompatibly, restore the backup from
   step 1 (see below) instead of running application code against a newer
   schema.

## 7. Restore from a backup

```bash
docker compose --env-file deploy/.env.production -f compose.prod.yaml stop api web
docker compose --env-file deploy/.env.production -f compose.prod.yaml exec -T db \
  sh -c 'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < backups/site_bank-YYYYMMDDTHHMMSSZ.dump
docker compose --env-file deploy/.env.production -f compose.prod.yaml start api web
curl -fsS https://<SITE_DOMAIN>/api/health
```

Backups live in `backups/` (14 newest) and should be copied off the server.
See `deploy/README.md` for cron setup.

## 8. Pre-launch checklist

- [ ] DNS points to the VPS; ports 80/443 are open, 3000/8000/5432 are closed.
- [ ] `ENV=prod`, `DEBUG=false`, `ALLOWED_HOSTS` has no `*`,
      `CORS_ORIGINS` has no localhost, `IP_HASH_SALT` is random and at least 16
      characters, `DATABASE_URL` does not use `postgres:postgres`.
- [ ] `NEXT_PUBLIC_TUTOR_NAME`, `NEXT_PUBLIC_TUTOR_ABOUT` and at least one
      contact channel are set; the tutor block renders correctly.
- [ ] `./deploy/backup.sh` succeeds and the archive is non-empty.
- [ ] Admin can log in; public `/api/v1/auth/register` returns 404.
- [ ] `/api/health` is OK, an unknown Host header is rejected, `/docs` is 404.
- [ ] Security headers are present and CSP report-only shows no unexpected
      violations in the browser console.
- [ ] Lead form submits, Telegram notification arrives (if configured), and the
      lead appears in the admin list.
- [ ] Legal pages, prices, reviews and contacts are filled by the owner.
- [ ] Sitemap/robots resolve on the production domain; Search Console and
      Metrika are configured by the owner.
- [ ] Off-server backup copy and log rotation are configured.
