# Enterprise-Grade Feature Gate Finalization Plan

Date: 2026-04-11
Status: Consensus-style finish plan grounded in the current execution report, migration ledger, and live repository state
Scope: Finish the entitlement refactor to the original Definition of Done after the first migration wave

## 1. Executive Summary

The platform is no longer in the pre-canonical transitional state. It now has one real entitlement core under `src/lib/entitlements`, live compatibility wrappers, targeted critical-surface migration, a governance script, and passing targeted tests/build/typecheck.

It is still not fully enterprise-grade by the plan's own Definition of Done because four classes of work remain:

1. DB/storage normalization is incomplete.
2. A small but meaningful set of raw-tier consumers still bypasses the canonical resolver.
3. Compatibility wrappers still exist as public APIs.
4. Observability is only partially expanded beyond middleware and override mutation routes.

This plan does not reopen the foundational architecture. It assumes the current canonical core remains the target and finishes the migration with staged, removal-safe work.

## 2. RALPLAN-DR Summary

### Principles

1. Finish by deletion, not by adding a second migration layer.
2. Keep runtime normalization in one place and push legacy vocabulary to the DB boundary.
3. Remove the last raw-tier consumers before removing wrappers.
4. Treat observability as a required enforcement surface, not documentation.
5. Only remove wrappers after tests and grep/governance prove zero active reliance.

### Decision Drivers

1. The canonical entitlement core already exists, so the remaining work is closure, not redesign.
2. The highest remaining correctness risk is split enforcement in residual raw-tier consumers.
3. The highest remaining long-term drift risk is leaving compatibility wrappers and DB legacy vocabulary in place too long.

### Viable Options

Option A: staged completion plan
- Migrate residual raw-tier consumers, normalize DB vocabulary, expand audit coverage, then remove wrappers in waves.
- Pros: low migration risk, consistent with current state, preserves compatibility while closing gaps.
- Cons: requires one more deliberate execution pass and a release-window-based wrapper retirement.

Option B: fast hard cut
- Remove wrappers immediately, rewrite all remaining consumers in one pass, and enforce full ban at once.
- Pros: shortest path to theoretical end state.
- Cons: highest regression risk, violates the bridge-first migration strategy, and increases rollback cost.

Option C: stop at current state and relabel it enterprise-grade
- Keep wrappers indefinitely and rely on governance script only.
- Pros: lowest short-term engineering effort.
- Cons: fails the original Definition of Done and leaves architectural ambiguity in public APIs.

### Recommended Option

Option A. The current codebase is already set up for staged closure. The remaining work is narrow enough to finish without another architectural reset, but still broad enough that a hard cut would be reckless.

## 3. ADR

Decision:
- Finalize the entitlement platform through a staged closure plan that treats the current `src/lib/entitlements` boundary as canonical and removes the remaining gaps in four finish phases.

Drivers:
- Canonical runtime path already exists.
- Remaining risks are specific and enumerable.
- Compatibility wrappers are still valuable until the final raw-tier consumers are migrated.

Alternatives considered:
- Immediate wrapper deletion and big-bang cutover.
- Declaring the current state complete without finishing storage normalization and wrapper retirement.

Why chosen:
- It reaches the original Definition of Done with the lowest regression risk and the strongest auditability story.

Consequences:
- One more execution cycle is required.
- DB migration and residual consumer migration must be treated as blocking, not optional cleanup.
- Wrapper retirement should be explicit and verified, not left for "later."

Follow-ups:
- Execute the phases below in order.
- Keep the existing execution report and migration ledger as the living truth.

## 4. Current Gap Inventory

### Already complete enough to preserve

- Canonical modules under `src/lib/entitlements/*`
- Compatibility wrappers under `src/lib/admin/*`, `src/lib/paywall/check-access.ts`, and `src/lib/subscription/get-tier.ts`
- Critical migrated surfaces:
  - `src/app/dashboard/3d-lab/page.tsx`
  - `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
  - `src/app/dashboard/drills/page.tsx`
  - `src/lib/actions/quiz-v2/start-session.ts`
  - `src/lib/actions/quiz-v2/get-review-data.ts`
  - `src/lib/actions/pods.ts`
  - `src/app/dashboard/pods/page.tsx`
  - `src/lib/paywall/score-reveal.ts`
  - `src/lib/paywall/daily-cap.ts`
  - `src/lib/actions/dashboard-page.ts`
  - `src/lib/actions/streak.ts`
  - `src/app/developer/layout.tsx`
  - `src/app/api/admin/flags/route.ts`
  - `src/lib/supabase/middleware.ts`

### Remaining gaps verified in live code

1. Raw-tier consumers still present:
   - `src/lib/actions/final-stretch.ts`
   - `src/app/api/payments/checkout/route.ts`
   - `src/app/api/cron/blindspot-scan/route.ts`
   - `src/components/sidebar/MobileDrawer.tsx`
2. DB vocabulary/storage still exposes legacy entitlement semantics:
   - `feature_flags.target_tier`
   - `feature_flags.target_roles`
   - seed migrations still describe or store legacy semantics
3. Compatibility wrappers still remain public:
   - `src/lib/admin/roles.ts`
   - `src/lib/admin/access-policy.ts`
   - `src/lib/admin/feature-flags.ts`
   - `src/lib/admin/get-admin-profile.ts`
   - `src/lib/paywall/check-access.ts`
   - `src/lib/subscription/get-tier.ts`
   - `src/lib/actions/feature-flags.ts`
4. Observability is not yet broad enough:
   - no durable Supabase audit/event persistence for entitlement decisions
   - no systematic emit from all critical paid/server-action surfaces

## 5. Finish Plan

### Phase A: Storage Normalization and Contract Lock

Objective:
- Make storage match the runtime canonical vocabulary and reduce schema-level ambiguity.

Exact work:
1. Add a new migration under `supabase/migrations/` to normalize `feature_flags.target_tier` values to canonical vocabulary.
2. Backfill all legacy `camp` values to `pro` and `insurance` values to `institutional` in `feature_flags.target_tier`.
3. Update `DATABASE_SCHEMA.sql` and `src/types/{app,supabase}.ts` comments or dependent shapes to reflect canonical tier vocabulary.
4. Decide and encode one of these for `target_roles`:
   - deprecated-but-kept storage field with explicit runtime ignore semantics
   - or removal path with migration if no active consumers remain
5. Update seed migrations and comments:
   - `supabase/migrations/019_application_layer_schema.sql`
   - `supabase/migrations/020_populate_feature_flags.sql`
   - `supabase/migrations/20260325_testing_review_schema_gaps.sql`

Done criteria:
- No legacy tier strings remain in live `feature_flags.target_tier` data or seed SQL.
- Runtime normalization remains for migration safety, but only as a defensive adapter.
- Schema/docs describe canonical values only.

### Phase B: Residual Raw-Tier Consumer Elimination

Objective:
- Remove the remaining product/runtime paths that still bypass the canonical resolver.

Exact work:
1. Migrate `src/lib/actions/final-stretch.ts`
   - stop accepting raw `tier: string`
   - derive access from `getViewerEntitlements()` or an entitlement decision helper
2. Migrate `src/app/api/payments/checkout/route.ts`
   - replace raw `"free"` gating with canonical tier validation or allowed checkout tiers constant
   - ensure it uses canonical normalized tiers only
3. Migrate `src/app/api/cron/blindspot-scan/route.ts`
   - replace paid-user filtering logic with canonical paid entitlement semantics or a shared paid-tier helper built from canonical tier vocabulary
4. Migrate `src/components/sidebar/MobileDrawer.tsx`
   - stop direct `tier !== 'free'` UI branching
   - consume canonical client entitlement payload or an explicit boolean prop derived from it

Done criteria:
- `bun run check:entitlements` passes with no allowlist exemptions for raw-tier consumers outside intentional compatibility wrappers/tests.
- No runtime product surface branches on `'free'` directly for entitlement.

### Phase C: Wrapper Retirement and API Cleanup

Objective:
- Downgrade compatibility wrappers from active dependencies to removable residue, then remove them.

Exact work:
1. Replace remaining call sites of:
   - `getAdminAwareProfile()`
   - `getEffectiveTier()`
   - `hasTierAccess()`
   - `getFeatureFlags()` from admin wrapper
   - `getUserTier()` from subscription wrapper where used for privilege logic
2. For each wrapper in the migration ledger, update:
   - remaining consumers
   - removal gate
   - current status
3. Remove wrappers in this order:
   - `src/lib/actions/feature-flags.ts`
   - `src/lib/subscription/get-tier.ts`
   - `src/lib/paywall/check-access.ts`
   - `src/lib/admin/get-admin-profile.ts`
   - `src/lib/admin/feature-flags.ts`
4. Keep `src/lib/admin/roles.ts` and `src/lib/admin/access-policy.ts` only if the repo still wants compatibility exports for broad call sites. If retained, make them pure re-export facades with explicit deprecation comments and no logic.

Done criteria:
- No compatibility module remains as an active engine.
- Remaining compatibility modules, if any, are zero-logic re-export shims only.

### Phase D: Audit Persistence and Release Hardening

Objective:
- Move from console-structured events to enterprise-grade traceability.

Exact work:
1. Choose the durable audit sink:
   - extend `src/lib/audit/*` with an entitlement-specific persistence path
   - or add an entitlement event table/mutation path if needed
2. Emit structured events from all critical paid/privileged surfaces:
   - quiz-v2 gates
   - paywall helpers
   - pods
   - dashboard-page derived gates where user-visible state changes
   - final-stretch
   - blindspot cron when filtering paid users
   - payment checkout gate
3. Add config-mismatch logging for:
   - unknown feature keys
   - unexpected feature flag rows
   - storage values that require normalization fallback
4. Tighten governance:
   - keep `scripts/check-entitlement-legacy-usage.ts`
   - narrow any temporary allowlist entries added during execution
   - document final banned patterns in architecture/product docs

Done criteria:
- Entitlement allow/deny/override/config-mismatch paths are auditable beyond console-only traces.
- Governance script only exempts canonical normalization and explicit test files.

## 6. Verification Plan

### Unit and contract tests

- Extend `src/lib/entitlements/*.test.ts` for:
  - canonical storage-tier-only cases
  - `target_roles` deprecation/ignore behavior
  - wrapper parity during retirement

### Surface-specific regression tests

- Add or update tests for:
  - `src/lib/actions/final-stretch.ts`
  - `src/app/api/payments/checkout/route.ts`
  - `src/app/api/cron/blindspot-scan/route.ts`
  - `src/components/sidebar/MobileDrawer.tsx`

### Repository checks

- `bun run check:entitlements`
- targeted entitlement tests
- `bun run type-check`
- `bun run build`
- targeted `eslint` on changed files
- repo-wide `bun run lint` only if unrelated vendor/static noise is separately addressed or excluded

### Release gate

Before declaring enterprise-grade complete:
- migration ledger shows no active raw-tier product/runtime consumers
- wrapper list is empty or only zero-logic facades remain
- DB storage no longer contains legacy tier strings for feature flags
- audit path covers critical allow/deny/override flows

## 7. Risks and Pre-mortem

### Scenario 1: DB migration normalizes storage but old environments still have stale rows

Failure:
- runtime silently behaves differently across environments

Mitigation:
- keep runtime normalization until migration verified everywhere
- add post-migration assertion/logging for unexpected legacy rows

### Scenario 2: Wrapper removal breaks a low-visibility internal route

Failure:
- a dormant caller still imports a retired helper

Mitigation:
- remove wrappers only after grep + typecheck + migration ledger verification
- do wrapper retirement in small commits/waves

### Scenario 3: Audit persistence introduces new write failures on hot paths

Failure:
- entitlement checks become brittle or slower

Mitigation:
- keep audit writes non-blocking where business-safe
- use structured best-effort emission for hot paths, durable writes for admin/override mutations

## 8. Available Agent Types and Staffing Guidance

Recommended execution roster:
- `executor`: main implementation lane
- `architect`: storage/removal review and final sign-off
- `test-engineer`: regression coverage and release gate verification
- `security-reviewer`: override API and privileged route review if auth boundaries change
- `verifier`: final evidence pass

### Suggested `ralph` staffing

- Leader: `gpt-5.4`, high
- Local work:
  - Phase A+B implementation locally
  - spawn `test-engineer` after each phase boundary
  - spawn `architect` for final closure review

### Suggested `team` staffing

- Lane 1: storage normalization and schema/docs
- Lane 2: residual runtime consumer migration
- Lane 3: audit persistence and governance tightening
- Lane 4: regression verification

Suggested launch hints:
- `$ralph "<path to this plan>"`
- `$team "<execute phases A through D from the finalization plan>"`

## 9. Final Recommendation

Yes. A second plan is warranted, but it should be a closure plan, not another architecture rethink.

The right next execution contract is:
- finish storage normalization
- eliminate the four residual raw-tier consumers
- retire the wrappers in controlled waves
- expand audit persistence and tighten governance

That is the shortest path from the current partially-complete canonical platform to the original enterprise-grade Definition of Done.
