#!/bin/bash
# deploy.sh — build pls.nfunc.xyz and push dist/ to the server.
# Usage: ./deploy.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
SERVER="nfunc"   # ~/.ssh/config alias for the server
REMOTE_PATH="/var/www/pls.nfunc.xyz"

echo "▸ building…"
if [ ! -d node_modules ]; then npm ci --silent; fi
rm -rf dist
npm run build
[ -f dist/index.html ] || { echo "❌ dist/index.html missing"; exit 1; }

# The webroot is owned by the deploy user, so no sudo is needed. nginx only
# reads, so force world-readable modes rather than copying local permissions.
# --chmod needs real rsync (Homebrew's), not the openrsync macOS ships.
echo "▸ rsync → $SERVER:$REMOTE_PATH"
rsync -rlptvz --delete --chmod=D755,F644 --exclude='.DS_Store' dist/ "$SERVER:$REMOTE_PATH/"

# The exit code is not proof: check what the server actually serves.
want=$(grep -o 'assets/index-[^"]*\.js' dist/index.html | head -1)
if curl -fsS -m 15 "https://pls.nfunc.xyz/" | grep -q "$want"; then
  echo "✓ live at https://pls.nfunc.xyz ($want)"
else
  echo "❌ https://pls.nfunc.xyz is not serving this build ($want)"; exit 1
fi
