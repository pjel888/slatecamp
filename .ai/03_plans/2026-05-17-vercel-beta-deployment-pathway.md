# SlateCamp Deployment Pathway: Vercel + Beta CI

Date: 2026-05-17
Status: planning baseline, no production deployment performed

## Beta launch boundary

- Beta launch is payment-free.
- `NEXT_PUBLIC_PAYMENTS_ENABLED=false` stays the default CI and deployment posture.
- Do not connect Stripe, PayRex, Lemon Squeezy, or other checkout/payment webhooks for beta.
- Beta testers should verify the learner app surfaces, excluding dev, admin, and other internal/protected routes.

## What changed now

- Added `.github/workflows/ci.yml` as the main production-readiness gate for PRs and pushes to `main`.
- CI uses Bun `1.3.11`, frozen lockfile install, entitlement boundary checks, typecheck, lint, build, and focused beta smoke.
- CI sets `NEXT_PUBLIC_PAYMENTS_ENABLED=false` to guard the payment-free beta launch.

## Vercel research notes

Checked official Vercel documentation on 2026-05-17:

- Next.js framework deployments: `https://vercel.com/docs/frameworks/full-stack/nextjs`
- Git-based deployments: `https://vercel.com/docs/git`
- Environment variables: `https://vercel.com/docs/environment-variables`
- Vercel MCP: `https://vercel.com/docs/agent-resources/vercel-mcp`

Deployment implications for SlateCamp:

1. Use Git-connected Vercel deployments from GitHub rather than local manual deploys for repeatability.
2. Keep preview deployments enabled for PR validation after CI stabilizes.
3. Keep production deployment tied to `main`, but do not enable automatic promotion until Philip approves the beta release gate.
4. Define environment variables in Vercel by environment: Development, Preview, Production.
5. Keep payment variables absent or disabled for beta:
   - `NEXT_PUBLIC_PAYMENTS_ENABLED=false`
   - no payment provider secrets required for beta
6. Treat Supabase production variables separately from local/demo CI variables. Do not reuse service-role keys in browser-exposed variables.

## Vercel MCP status

- Repo-local MCP config currently only lists `code-review-graph` in `.ai/00_system/mcp.json`.
- No Vercel MCP server is configured in the repo-local MCP file yet.
- Recommended MCP setup path:
  1. Decide whether Vercel MCP should be configured globally in Hermes or repo-local for SlateCamp.
  2. Add the Vercel MCP server only after confirming the auth method and token storage path.
  3. Never commit Vercel tokens or team/project secrets.
  4. Use MCP initially for read-only deployment/project inspection, not automatic production deploys.

## Proposed beta deployment path

Phase 1: CI baseline

- Keep `.github/workflows/ci.yml` required for PRs.
- Keep existing Storybook and 3D warning gates.
- Watch runtime and flake rate before expanding CI to the full release suite.

Phase 2: Vercel preview baseline

- Connect GitHub repo to Vercel.
- Set Preview env vars with demo-safe values first.
- Confirm `bun run build` works under Vercel runtime.
- Verify preview routes manually:
  - `/`
  - `/login`
  - `/register`
  - `/dashboard`
  - `/dashboard/wiki`
  - `/dashboard/testing`
  - `/dashboard/flash-cards`
  - `/dashboard/3d-lab`

Phase 3: Beta readiness gate

- Configure production env vars.
- Keep payment flags disabled.
- Ensure beta users cannot access dev/admin/internal routes unless explicitly authorized.
- Run local and preview smoke before beta invite distribution.

## Open risks

- Vercel MCP is not configured yet, so deployment inspection is currently CLI/docs-based.
- CI is intentionally focused; full `validate:release` remains heavier and may need separate scheduled/manual gating.
- Production Supabase verification is not part of this CI change.
