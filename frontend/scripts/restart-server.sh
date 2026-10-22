#!/usr/bin/env bash
# Reliably restart the screenshot/e2e server on :3210.
set -e
cd "$(dirname "$0")/.."

# Kill anything on 3210 (by PID, avoids pkill self-matching).
PID=$(ss -ltnp 2>/dev/null | grep ':3210 ' | grep -oP 'pid=\K[0-9]+' | head -1)
if [ -n "$PID" ]; then kill -9 "$PID" 2>/dev/null || true; fi
# Kill lingering parent pnpm/sh processes for this port.
for p in $(pgrep -f 'start -p 3210' 2>/dev/null); do kill -9 "$p" 2>/dev/null || true; done
sleep 1

pnpm build >/tmp/build.log 2>&1
echo "build done"

nohup pnpm start -p 3210 >/tmp/next-start.log 2>&1 &
sleep 6
curl -s -o /dev/null -w "home=%{http_code}\n" http://127.0.0.1:3210/
# Verify a static chunk serves with the right MIME (catches stale standalone).
CHUNK=$(curl -s http://127.0.0.1:3210/ | grep -oP '/_next/static/css/[^"]+\.css' | head -1)
if [ -n "$CHUNK" ]; then
  curl -s -o /dev/null -w "css=%{http_code} %{content_type}\n" "http://127.0.0.1:3210$CHUNK"
fi
