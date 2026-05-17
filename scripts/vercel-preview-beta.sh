#!/usr/bin/env bash
set -euo pipefail

# Uses the repo-pinned Vercel CLI through `bunx vercel@54.1.0` when no global `vercel` binary exists.
# Requires either an authenticated `vercel login` session or VERCEL_TOKEN in the shell.
# Does not set secrets and does not deploy production.

VERCEL_CMD=(bunx vercel@54.1.0)
if command -v vercel >/dev/null 2>&1; then
  VERCEL_CMD=(vercel)
elif ! command -v bunx >/dev/null 2>&1; then
  echo "Bun/bunx is required to run the repo-pinned Vercel CLI." >&2
  exit 1
fi

TOKEN_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
fi

if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
  AUTH_CHECK=("${VERCEL_CMD[@]}" whoami "${TOKEN_ARGS[@]}")
else
  AUTH_CHECK=("${VERCEL_CMD[@]}" whoami)
fi

if ! "${AUTH_CHECK[@]}" >/dev/null 2>&1; then
  echo "Vercel is not authenticated. Run 'vercel login' or export VERCEL_TOKEN securely." >&2
  exit 2
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "No .vercel/project.json found. Link this repo first with: vercel link" >&2
  exit 3
fi

export NEXT_PUBLIC_PAYMENTS_ENABLED=false

echo "Creating payment-free beta preview deployment..."
DEPLOY_ARGS=(deploy --archive=tgz --target=preview)
if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
  "${VERCEL_CMD[@]}" "${DEPLOY_ARGS[@]}" "${TOKEN_ARGS[@]}"
else
  "${VERCEL_CMD[@]}" "${DEPLOY_ARGS[@]}"
fi
