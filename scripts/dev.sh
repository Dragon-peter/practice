#!/bin/bash
set -Eeuo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"
PORT="${PORT:-${DEPLOY_RUN_PORT:-5000}}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

cd "${PROJECT_ROOT}"

echo "Starting Next.js dev server on http://${HOSTNAME}:${PORT}"
exec pnpm next dev --hostname "${HOSTNAME}" --port "${PORT}"
