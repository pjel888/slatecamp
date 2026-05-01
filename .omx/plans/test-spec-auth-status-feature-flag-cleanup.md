# Test Spec — Auth / Status / Feature-Flag Cleanup

## Gate 1 baseline
- `bun run check:entitlements`
- `bun test src/lib/entitlements/resolve-role.test.ts src/lib/entitlements/middleware-authorization.test.ts src/lib/entitlements/normalize-feature-flag.test.ts src/lib/entitlements/resolve-entitlements.test.ts src/lib/admin/roles.test.ts src/lib/actions/admin/pipeline.test.ts src/lib/admin/editor-workflow.test.ts src/lib/supabase/middleware.test.ts`
- `bun run type-check`
- `bun run lint`

## Behavior locks before cleanup
- Role resolution: `user_roles`, `profiles.role`, auth metadata, email fallbacks, dev-force override, Playwright neutralization.
- Admin policies/wrappers: `isAdmin`, `isSuperAdmin`, content/review/user management permissions, assertion/redirect behavior.
- Feature flags: canonical paid tiers, legacy paid shape, non-empty `target_roles` ignored unless explicitly deferred.
- Status: canonical `in_review`, legacy read aliases, write candidates/fallback behavior.

## Regression commands after implementation
- All Gate 1 commands.
- `bun run build` for route/layout/server-action auth changes.
- Relevant E2E: restricted, admin content-admin, SME reviewer, developer, CEO portal.
- `git diff --check` and `npx gitnexus detect-changes --repo slatecamp`.

## Pass/fail rule
Do not claim cleanup complete if a compatibility removal is blocked by schema/data evidence. Mark that candidate deferred with evidence instead of deleting safety code prematurely.
