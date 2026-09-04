#!/bin/bash
# SessionStart hook for E3 Empower LMS.
# Installs frontend dependencies and test tooling so lint/build/tests work in
# Claude Code on the web sessions. Idempotent and non-interactive.
# Backend (uv/PostgreSQL) is intentionally NOT set up here.
set -euo pipefail

# Only run in remote (web) sessions; local dev manages its own environment.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

FRONTEND_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}/frontend"
cd "$FRONTEND_DIR"

echo "[session-start] Installing frontend dependencies in $FRONTEND_DIR"
# Prefer npm install so the cached container layer is reused on re-runs.
npm install

# Ensure test tooling is present (declared in package.json devDependencies).
# node_modules/.bin/vitest existing means the install already covered it.
if [ ! -x "node_modules/.bin/vitest" ]; then
  echo "[session-start] Test tooling missing after install; installing explicitly"
  npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom \
    @testing-library/user-event @vitest/coverage-v8 playwright
fi

echo "[session-start] Frontend setup complete"
