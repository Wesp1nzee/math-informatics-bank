#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yaml}"
COMPOSE_ENV_FILE="${COMPOSE_ENV_FILE:-deploy/.env.production}"
KEEP="${KEEP:-14}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TARGET="$BACKUP_DIR/site_bank-$STAMP.dump"

# The password stays inside the db container environment; it is never passed
# as a command-line argument.
docker compose --env-file "$COMPOSE_ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
	sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' >"$TARGET"

if [ ! -s "$TARGET" ]; then
	echo "Backup failed: $TARGET is empty" >&2
	rm -f "$TARGET"
	exit 1
fi

# Keep only the newest $KEEP archives.
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'site_bank-*.dump' -printf '%T@ %p\n' \
	| sort -rn \
	| tail -n "+$((KEEP + 1))" \
	| cut -d' ' -f2- \
	| xargs -r rm -f --

echo "Backup written: $TARGET"
