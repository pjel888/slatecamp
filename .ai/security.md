# Security, Privacy, and Access Control

**Last audit:** 2026-04-29

## Auth/session architecture

- Supabase Auth via `@supabase/ssr`.
- `middleware.ts` delegates to `src/lib/supabase/middleware.ts` and preserves cookies.
- `src/lib/supabase/server.ts`, `client.ts`, `admin.ts` separate server/browser/service-role contexts.
- Demo mode can use a mock Supabase client when `NEXT_PUBLIC_ENABLE_DEMO_MODE=true` or production keys are missing outside development.

## Role and permission system

- Canonical roles: anonymous, member, super_admin, content_admin, sme_reviewer, developer, admin, ceo, owner (`src/lib/entitlements/types.ts`).
- Role sources: app metadata, user metadata, profiles.role, user_roles, admin/owner email fallback, dev force user.
- Admin route permissions are mapped in `src/lib/supabase/middleware.ts`.
- Feature access decisions live in `src/lib/entitlements/get-viewer-entitlements.ts`, `policy.ts`, `feature-keys.ts`, and dev overrides.

## Protected surfaces

| Surface | Protection |
| --- | --- |
| /admin/* | Authenticated + admin portal role + route-specific admin permission. |
| /developer/* | Developer entitlement; local bypass possible only when configured. |
| /ceo/* | CEO/owner entitlement. |
| /dashboard/* and /quiz/* | Authenticated outside demo/dev bypass mode. |
| /api/cron/* | CRON_SECRET bearer token. |
| /api/webhooks/* | Provider signature header + payments flag. |
| /api/ai/* | Demo allowed; otherwise authenticated and rate-limited. |


## Security headers

Configured in `next.config.ts`: X-Frame-Options SAMEORIGIN, nosniff, strict-origin-when-cross-origin referrer policy, HSTS, Permissions-Policy denying camera/microphone/geolocation, and a CSP allowing self, inline/eval scripts/styles, Supabase, Google avatar images, Anthropic connect, and blob workers.

## Privacy-relevant data

Profiles, subscriptions, quiz interactions, exam outcomes, notes, analytics events, notifications, financial/CEO entries, and AI prompts/responses are privacy-relevant. No secret values are documented in repo docs.

## Concerns

- `DEV_FORCE_USER_ID`, `DEV_FORCE_TIER`, and `ALLOW_DEV_PORTAL_BYPASS` are powerful local overrides.
- TypeScript strict mode and hooks lint rules are off.
- Cron monitoring remains launch-supporting; AI production behavior is intentionally deferred for the current live-AI-provider-free launch scope.


## Final launch provider stance

- Payment-free launch: PayRex checkout/webhook code remains but is disabled by default through `NEXT_PUBLIC_PAYMENTS_ENABLED=false`; live PayRex verification is deferred post-launch.
- LemonSqueezy runtime is removed; no LemonSqueezy webhook route should be exposed.
- Live-AI-provider-free launch: `/api/ai/*` remains authenticated/rate-limited outside demo where implemented, but launch-facing quiz/wiki AI helper UI is disabled or not rendered. Live OpenAI/Anthropic verification is deferred post-launch.
