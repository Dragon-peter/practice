#!/bin/bash
set -Eeuo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"

cd "${PROJECT_ROOT}"

echo "Installing dependencies..."
pnpm install --prefer-frozen-lockfile --reporter=append-only

echo "Building the Next.js project..."
pnpm next build --webpack

echo "Build completed successfully!"
