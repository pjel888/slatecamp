#!/usr/bin/env bash
set -euo pipefail

# SlateCamp Vercel preview helper.
# Requires either an authenticated `vercel login` session or VERCEL_TOKEN in the shell.
# Does not set secrets and does not deploy production.

if ! command -v vercel >/dev/null 2>&1; then
  echo "Vercel CLI is not installed. Install with: npm i -g vercel" >&2
  exit 1
fi

TOKEN_ARGS=()
if [[ -n "${VERCEL_TOKEN:-}" ]]; then
  TOKEN_ARGS=(--token "$VERCEL_TOKEN")
fi

if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
  AUTH_CHECK=(vercel whoami "${TOKEN_ARGS[@]}")
else
  AUTH_CHECK=(vercel whoami)
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
if [[ ${#TOKEN_ARGS[@]} -gt 0 ]]; then
  vercel deploy "${TOKEN_ARGS[@]}"
else
  vercel deploy
fi
