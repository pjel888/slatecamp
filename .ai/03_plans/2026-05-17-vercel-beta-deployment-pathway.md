# SlateCamp Deployment Pathway: Vercel + Beta CI

Date: 2026-05-17
Status: implementation baseline; no production deployment performed

## Beta launch boundary

- Beta launch is payment-free.
- `NEXT_PUBLIC_PAYMENTS_ENABLED=false` stays the default CI and deployment posture.
- Do not connect Stripe, PayRex, Lemon Squeezy, or other checkout/payment webhooks for beta.
- Beta testers should verify the learner app surfaces, excluding dev, admin, and other internal/protected routes.

## Implemented now

- Added `.github/workflows/ci.yml` as the main production-readiness gate for PRs and pushes to `main`.
- CI uses Bun `1.3.11`, frozen lockfile install, entitlement boundary checks, typecheck, lint, build, and focused beta smoke.
- CI sets `NEXT_PUBLIC_PAYMENTS_ENABLED=false` to guard the payment-free beta launch.
- All GitHub workflows now set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` to address the GitHub Actions Node 20 deprecation warning path.

## GitHub branch protection status

Attempted to inspect/configure `main` branch protection through the GitHub API.

Result:

- GitHub returned `403`: `Upgrade to GitHub Pro or make this repository public to enable this feature.`
- This blocks required-status-check enforcement on the current private/free repository plan.

Operational fallback until branch protection is available:

1. Keep all merges manual.
2. Treat these as required human merge gates:
   - `CI / Typecheck, lint, build, and smoke`
   - `Storybook / App Release Validation`
   - `Storybook / Build Storybook`
   - `3D Performance Warning Gates / Built-auth 3D warning gates` when 3D/performance paths are affected
3. Do not merge or deploy when any required gate is red or still running.

## Vercel research notes

Checked official Vercel documentation on 2026-05-17:

- Next.js framework deployments: `https://vercel.com/docs/frameworks/full-stack/nextjs`
- Git-based deployments: `https://vercel.com/docs/git`
- Environment variables: `https://vercel.com/docs/environment-variables`
- Vercel MCP: `https://vercel.com/docs/agent-resources/vercel-mcp`
- Vercel MCP markdown endpoint: `https://vercel.com/docs/agent-resources/vercel-mcp.md`

Deployment implications for SlateCamp:

1. Use Git-connected Vercel deployments from GitHub rather than local manual deploys for repeatability.
2. Keep preview deployments enabled for PR validation after CI stabilizes.
3. Keep production deployment tied to `main`, but do not enable automatic promotion until Philip approves the beta release gate.
4. Define environment variables in Vercel by environment: Development, Preview, Production.
5. Keep payment variables absent or disabled for beta:
   - `NEXT_PUBLIC_PAYMENTS_ENABLED=false`
   - no payment provider secrets required for beta
6. Treat Supabase production variables separately from local/demo CI variables. Do not reuse service-role keys in browser-exposed variables.

## Vercel CLI/project status

Checked local Vercel CLI:

- CLI exists: `vercel 54.1.0`
- `vercel whoami` failed with `No existing credentials found`
- `vercel project ls` failed with `No existing credentials found`
- Repo has `vercel.json` with cron definitions already present
- No `.vercel/project.json` project link exists in the repo root
- Added `.env.vercel.example` as the payment-free beta environment checklist.
- Added `scripts/vercel-preview-beta.sh` and `bun run deploy:preview:beta` as a safe preview deploy helper. It refuses to deploy unless Vercel auth and project linking are present, exports `NEXT_PUBLIC_PAYMENTS_ENABLED=false`, and never deploys production.

This means Git-connected Vercel setup still requires Philip's Vercel login/OAuth or a token supplied outside the repo.

## Vercel MCP status

Official Vercel MCP details:

- Remote MCP endpoint: `https://mcp.vercel.com`
- Setup helper from Vercel docs: `npx add-mcp https://mcp.vercel.com`
- Vercel states MCP is a remote MCP with OAuth and only supports reviewed/approved AI clients.

Hermes status checked locally:

- `hermes mcp list` currently shows `agentmemory` only.
- Attempted `hermes mcp add vercel --url https://mcp.vercel.com`.
- Hermes prompted for an API key/bearer token and failed with `401 Unauthorized` when no credential was supplied.
- No Vercel MCP config was saved.

Safe setup path:

1. Use Vercel's supported client path first for OAuth, e.g. Claude Code/Codex/Cursor, or `npx add-mcp https://mcp.vercel.com` if Philip wants it installed across detected clients.
2. Do not commit Vercel MCP credentials, Vercel tokens, project IDs, team IDs, or `.vercel/` metadata unless intentionally public/non-secret.
3. Use MCP initially for read-only deployment/project inspection, not automatic production deploys.
4. Revisit Hermes MCP only if Hermes gains supported OAuth/remote MCP flow for Vercel, or if Philip supplies a scoped token through a secure credential channel.

## Proposed beta deployment path

Phase 1: CI baseline — implemented

- Keep `.github/workflows/ci.yml` as a required human gate for PRs.
- Keep existing Storybook and 3D warning gates.
- Watch runtime and flake rate before expanding CI to the full release suite.

Phase 2: Vercel preview baseline — ready for credentialed setup

- Log in to Vercel with `vercel login`, or connect the GitHub repo from the Vercel dashboard.
- Set Preview env vars with payment disabled first.
- Confirm Vercel build uses Bun or the repository build command cleanly.
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

## Open blockers after this pass

- GitHub branch protection cannot be enabled under current repository plan/visibility.
- Vercel project linking/deployment cannot proceed without Vercel authentication.
- Vercel MCP cannot be configured in Hermes without a supported OAuth flow or secure token.
- Production Supabase verification is not part of this CI change.
