# PRD — Auth / Status / Feature-Flag Cleanup

## Intent
Reduce launch risk by retiring or containing legacy auth/status/feature-flag compatibility code only after equivalent behavior is proven by tests and data/readiness checks.

## Scope
Included:
- `L5-C02` admin-role compatibility wrapper migration.
- `L5-C03` feature flag `target_roles` / legacy tier runtime cleanup.
- `L5-C06` admin editorial `pending_review` fallback retirement where safe.
- `.ai` documentation updates for implementation evidence and remaining deferrals.

Excluded:
- Payment cleanup.
- AI cleanup.
- Destructive database column drops unless explicitly proven safe and non-destructive.
- Unrelated quiz, 3D Lab, calculators/tools, route consolidation, or UI cleanup.

## Acceptance criteria
1. Gate 1 baseline commands are run and failures are fixed or documented before risky changes.
2. Behavior-lock tests cover role precedence, privileged route boundaries, feature flag legacy values, and editor status behavior before removal.
3. Deprecated admin role wrapper usage is reduced only where equivalent canonical policy semantics are proven.
4. Feature flag role-targeting is removed from runtime only if access decisions remain unchanged and schema/type compatibility is preserved.
5. `pending_review` write fallback is removed only if canonical `in_review` writes are proven safe; otherwise it remains documented as deferred.
6. Final verification includes entitlement guard, targeted tests, type-check, lint, build as feasible, relevant E2E lanes as feasible, GitNexus detect-changes, and `git diff --check`.
