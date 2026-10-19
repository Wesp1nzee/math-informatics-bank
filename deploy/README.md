# Deploy helpers

## Database backups

`backup.sh` runs `pg_dump` inside the `db` container in custom (compressed)
format, stores the archive under `backups/` and keeps the newest 14 files.
The database password comes from the container environment and is never passed
as a command-line argument.

```bash
./deploy/backup.sh
```

Install a daily cron job (02:30 UTC) as the deploy user:

```cron
30 2 * * * cd /srv/site_bank && ./deploy/backup.sh >> /var/log/site_bank-backup.log 2>&1
```

Copy backups off the server (object storage, another host) — a backup on the
same disk is not a disaster-recovery plan.

## Restore

```bash
# Stop writers first; keep the database container running.
docker compose --env-file deploy/.env.production -f compose.prod.yaml stop api web

# Replace the current schema with the archive.
docker compose --env-file deploy/.env.production -f compose.prod.yaml exec -T db \
  sh -c 'pg_restore --clean --if-exists --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
  < backups/site_bank-YYYYMMDDTHHMMSSZ.dump

docker compose --env-file deploy/.env.production -f compose.prod.yaml start api web
```

After a restore, check `https://<SITE_DOMAIN>/api/health` and the application
logs before reopening the site.
