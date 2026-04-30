# 02 — Current-State Observations

## Observation 1 — admin-role wrappers are deprecated; route usage has started migrating

`src/lib/admin/roles.ts` labels `getUserRole()` and `isAdmin()` as deprecated. The admin layout, admin dashboard page, and auth callback have been migrated to canonical role/policy helpers; the file remains a compatibility facade for server actions and page-level permission helpers.

Current wrapper family includes:

- `getUserRole()`
- `isAdmin()`
- `isSuperAdmin()`
- `canManageContent()`
- `canReviewContent()`
- `canManageUsers()`
- `getUserRoles()`
- `assertPermission()`
- `requirePermissionOrRedirect()`

Not all wrappers are equal. `assertPermission()` and `requirePermissionOrRedirect()` are current useful policy boundary helpers even though they live in the same compatibility file as deprecated functions.

## Observation 2 — role resolution has intentional multi-source precedence

`src/lib/entitlements/resolve-role.ts` is the canonical role resolver. It still supports several compatibility sources:

- `user_roles`
- `profiles.role`
- auth app metadata role
- auth user metadata role
- owner/admin email fallbacks
- development `DEV_FORCE_USER_ID` owner override

The cleanup should not flatten these without first proving which sources are expected to remain for launch.

## Observation 3 — middleware and app layouts both gate privileged routes

`src/lib/supabase/middleware.ts` performs defense-in-depth route gating for `/admin`, `/developer`, and `/ceo`.

App/layout helpers also gate access through:

- admin layout and page permission checks
- developer layout checks using `getViewerEntitlements()`
- CEO layout/access helpers

Any role cleanup must preserve both middleware and route/layout behavior.

## Observation 4 — `target_roles` is deprecated and no longer read by runtime entitlements

`supabase/migrations/20260411_entitlement_finalization.sql` documents `feature_flags.target_roles` as deprecated for runtime entitlement decisions.

`src/lib/entitlements/get-viewer-entitlements.ts` no longer selects `target_roles`; schema snapshots and generated types still retain the column for a later schema-specific cleanup pass.

## Observation 5 — legacy tier normalization is still intentional

`src/lib/entitlements/normalize-feature-flag.ts` still maps legacy paid target tiers (`camp`, `insurance`, `institutional`) into current paid tiers when the old shape is detected.

This should not be removed until data evidence proves no flags carry those legacy values in any launch environment.

## Observation 6 — `pending_review` write fallback has been retired; read aliases remain

`src/lib/actions/admin/pipeline.test.ts` now asserts canonical-only behavior and no direct `pending_review` fallback. `normalizeEditorStatus()` still maps historical `review` and `pending_review` values to `in_review` for read compatibility until data checks prove old rows are absent.

## Observation 7 — existing validation surface already knows this is risky

`.ai/03_plans/cleanup-safety-validation-plan.md` classifies Wave 5 auth/entitlement/Supabase cleanup as needing:

- `bun run type-check`
- `bun run lint`
- `bun run build`
- `bun run check:entitlements`
- targeted later tests/observability additions before implementation if cleanup touches role resolution, feature flags, bootstrap, or privileged Supabase helpers

## Observation 8 — `check:entitlements` is a mandatory guard, not a nice-to-have

`package.json` wires:

```text
check:entitlements: bun run scripts/check-entitlement-legacy-usage.ts
```

The script bans direct legacy entitlement usage outside allowlisted canonical boundaries. Later implementation must update this allowlist only when the canonical boundary has actually moved.
