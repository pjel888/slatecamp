# 06 — Risk Mitigation and Rollback Plan

## Highest-risk failure modes

| Failure mode | Likely cause | Prevention | Detection |
| --- | --- | --- | --- |
| Admin lockout | Removing wrapper behavior without equivalent canonical policy call. | Migrate one route/action cluster at a time with role tests. | Admin E2E lanes and manual login smoke. |
| Privilege escalation | Mis-mapping `member`, `developer`, `admin`, `ceo`, or `owner`. | Preserve `resolveRoleFromInputs()` precedence until product explicitly changes it. | Restricted-access E2E and middleware tests. |
| Developer bypass leaks | `ALLOW_DEV_PORTAL_BYPASS` or `DEV_FORCE_USER_ID` behavior moves outside dev/test bounds. | Keep dev override behavior in canonical entitlements boundary. | `check:entitlements`, dev-overrides tests, middleware tests. |
| Feature flags deny paid users | Legacy tier normalization removed while DB still has old values. | Data check canonical tiers before removal. | Feature flag normalization and paid feature tests. |
| Feature flags unexpectedly allow users | Misinterpreting or reactivating `target_roles`. | Keep `target_roles` ignored or remove read after tests prove no behavior change. | Entitlement decision tests and audit log checks. |
| Admin review writes fail | `pending_review` fallback removed before DB accepts `in_review`. | Confirm constraints and rewrite tests before code removal. | Pipeline/content/wiki tests and admin E2E. |
| Schema/type drift | Column removed from DB/schema but generated types or runtime still expect it. | Separate runtime cleanup from schema cleanup. | Typecheck, Supabase type generation, schema diff. |

## Containment rules

- Do not combine all three candidates in one unreviewable diff unless each phase has separate tests and commits.
- Do not remove schema columns in the same pass as role wrapper migration.
- Do not remove read compatibility and write compatibility at the same time for editor statuses.
- Do not change payment or AI routes/providers in this wave.
- Do not loosen middleware as a shortcut to make E2E pass.

## Rollback strategy

| Phase | Rollback unit |
| --- | --- |
| Role wrapper migration | Revert route/action cluster to previous wrapper call; keep tests showing expected behavior. |
| Feature flag runtime cleanup | Restore `target_roles` selection/logging and legacy normalization; do not alter DB. |
| Status fallback cleanup | Restore `pending_review` fallback and `getStatusWriteCandidates()` compatibility. |
| Schema/type cleanup | Requires migration rollback or forward-fix; do not start without explicit DB plan. |

## Observability requirements

Before and after implementation, inspect/log where appropriate:

- entitlement audit events for denied/allowed privileged access
- `entitlement.config.mismatch` events related to `feature_flags.target_roles`
- admin pipeline update failures
- middleware auth errors
- developer/admin/CEO route access decisions in E2E output

## Recommended implementation PR shape

Best split:

1. **PR A — behavior locks only:** tests and docs, no behavior change.
2. **PR B — admin wrapper migration:** route/action callers move to canonical policy semantics.
3. **PR C — feature flag runtime cleanup:** remove ignored role-target read/logging and tighten guardrails, no schema drop.
4. **PR D — status fallback retirement:** canonical-only writes after DB readiness.
5. **PR E — schema/types cleanup:** only if DB launch baseline and generated types are ready.

If velocity requires one PR, preserve those phases as separate commits and run the full validation matrix after each phase.

## Final sign-off criteria for later implementation

- `bun run check:entitlements` passes.
- Targeted auth/admin/feature/status tests pass.
- `bun run type-check`, `bun run lint`, and `bun run build` pass.
- Relevant auth-demo E2E lanes pass.
- GitNexus detect-changes shows expected scope only.
- `.ai` status docs are updated to mark each candidate implemented or deferred with evidence.
