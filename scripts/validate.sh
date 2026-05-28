#!/bin/bash
set -Eeuo pipefail

PROJECT_ROOT="${PROJECT_ROOT:-$(pwd)}"

cd "${PROJECT_ROOT}"

echo "🔍 Running validate..."
pnpm validate
echo "✅ Validate passed!"
