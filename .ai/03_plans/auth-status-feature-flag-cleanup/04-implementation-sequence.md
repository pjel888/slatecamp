# 04 — Implementation Sequence

## Principle

Sequence by behavior risk, not by file convenience. Compatibility logic must be replaced only after equivalent behavior is locked.

## Phase 0 — behavior locks and diagnostics only

**Goal:** strengthen tests/observability without changing production behavior.

Tasks:

1. Add/confirm tests for role precedence in `src/lib/entitlements/resolve-role.test.ts`.
2. Add/confirm tests for wrapper-equivalent policy behavior in `src/lib/admin/roles.test.ts`.
3. Add/confirm tests for feature flag legacy values in `src/lib/entitlements/normalize-feature-flag.test.ts`.
4. Add/confirm tests for canonical status behavior in `src/lib/admin/editor-workflow.test.ts` and `src/lib/actions/admin/pipeline.test.ts`.
5. Run `bun run check:entitlements` and capture baseline.

Stop if tests reveal undocumented behavior that product still needs.

## Phase 1 — admin role wrapper migration (`L5-C02`) without behavior change

**Goal:** reduce usage of deprecated wrappers while preserving access decisions.

Suggested order:

1. Replace route/page calls to deprecated `getUserRole()` and `isAdmin()` with canonical role/policy helpers.
2. Keep `assertPermission()` and `requirePermissionOrRedirect()` if they remain the clearest policy boundary, or move them to a canonical policy/access module in a single controlled refactor.
3. Update `src/app/auth/callback/route.ts` away from dynamic `isAdmin()` import if safe.
4. Keep `UserRole` type only if admin UI props still need it; otherwise move to canonical entitlement type exports.
5. Update tests to prove access behavior did not change.

Stop if any admin or middleware route decision changes unexpectedly.

## Phase 2 — feature flag runtime cleanup (`L5-C03`) before schema cleanup

**Goal:** remove ignored runtime role-targeting only after decisions are proven unaffected.

Suggested order:

1. Add a regression test where `target_roles` is non-empty and prove runtime access ignores it today.
2. Remove runtime selection/logging of `target_roles` from `getViewerEntitlements()` only if schema/type compatibility remains intact or is adjusted safely.
3. Keep `target_roles` column in DB until a later schema-specific migration/squash pass.
4. Remove legacy tier normalization only after test fixtures and launch data are canonical.
5. Tighten `scripts/check-entitlement-legacy-usage.ts` allowlist after runtime cleanup.

Stop if any feature access decision changes for free/pro/prime/institutional/enterprise tiers.

## Phase 3 — canonical editor status cleanup (`L5-C06`)

**Goal:** retire `pending_review` writes only when canonical status is guaranteed.

Suggested order:

1. Prove current schema accepts `in_review` in all target environments.
2. Change tests that currently expect fallback to instead assert no fallback is needed.
3. Remove direct `pending_review` retry from `src/lib/actions/admin/pipeline.ts`.
4. Disable/remove `LEGACY_REVIEW_STATUS_COMPAT` only after `content.ts` and `wiki.ts` write paths no longer need multiple write candidates.
5. Keep read normalization of historical `pending_review` values if old rows may still appear; read compatibility is lower risk than write fallback.
6. Later, after data cleanup, remove `pending_review` from read aliases if truly absent.

Stop if admin article/wiki save or review queue filtering fails.

## Phase 4 — schema/type cleanup only after runtime is canonical

**Goal:** handle schema/types deliberately, not as part of first runtime cleanup.

Potential later work:

- remove `feature_flags.target_roles` from schema snapshot/types after DB migration plan is approved.
- regenerate Supabase types from the launch DB.
- remove old status migration compatibility notes only if migration history is being squashed for launch.

This phase may require explicit DB approval because schema changes can be destructive or environment-coupled.

## Phase 5 — final validation and docs update

Required commands for the implementation wave:

```bash
bun run check:entitlements
bun test src/lib/entitlements/resolve-role.test.ts src/lib/entitlements/middleware-authorization.test.ts src/lib/entitlements/normalize-feature-flag.test.ts src/lib/entitlements/resolve-entitlements.test.ts src/lib/admin/roles.test.ts src/lib/actions/admin/pipeline.test.ts src/lib/admin/editor-workflow.test.ts src/lib/supabase/middleware.test.ts
bun run type-check
bun run lint
bun run build
bun run test:e2e:auth-demo:restricted
bun run test:e2e:auth-demo:admin-content-admin
bun run test:e2e:auth-demo:admin-sme-reviewer
bun run test:e2e:auth-demo:admin-developer
bun run test:e2e:auth-demo:ceo-portal
git diff --check
```

Docs to update after implementation:

- `.ai/10_state/cleanup-candidate-index.md`
- `.ai/10_state/cleanup-findings-register.md`
- `.ai/03_plans/legacy-removal-plan.md`
- `.ai/03_plans/cleanup-safety-validation-plan.md`
- `.ai/00_system/DATA_BOUNDARY_MAP.md` if boundaries move
