#!/bin/bash
set -Eeuo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
PORT="${PORT:-${DEPLOY_RUN_PORT:-5000}}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

cd "${PROJECT_ROOT}"

echo "Starting Next.js production server on http://${HOSTNAME}:${PORT}"
exec pnpm next start --hostname "${HOSTNAME}" --port "${PORT}"
