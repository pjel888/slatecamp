# Security Audit

## Scope

- Runtime dependency posture
- Webhook integrity
- Dev trust boundaries
- Auth/session handling surfaces

## Linked findings

- `SEC-001`
- `SEC-002`
- `SEC-003`
- `SEC-004`

## Observed

- No material hardcoded secret values were observed in the scoped runtime files
- The highest-signal issues are framework/dependency vulnerability debt, webhook replay integrity, and development-mode trust-boundary bypasses

## Material findings

### `SEC-001` Dependency vulnerability backlog

`bun audit` on 2026-04-17 reported advisory exposure across:
- `next`
- `storybook`
- `vite`
- `axios`
- `dompurify`
- transitive tooling packages

This is active security debt, not theoretical backlog.

### `SEC-002` Vulnerable Next.js range

Observed:
- `package.json` pins `next` to `16.1.6`
- `bun audit` flags versions `<16.1.7`

Impact:
- server-action and request-handling surfaces inherit framework risk

### `SEC-003` Non-atomic webhook idempotency

Observed in:
- `src/app/api/webhooks/lemonsqueezy/route.ts`
- `src/app/api/webhooks/payrex/route.ts`

Impact:
- duplicate concurrent deliveries can execute side effects before the uniqueness guard is inserted

### `SEC-004` Development impersonation can widen server-side privilege unexpectedly

Observed in:
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`

Impact:
- shared dev or preview environments can slip into service-role behavior if environment discipline fails

## Unknown

- Whether any shared environment currently uses the force-user path
- Whether infrastructure mitigates some of the current Next.js advisory blast radius
