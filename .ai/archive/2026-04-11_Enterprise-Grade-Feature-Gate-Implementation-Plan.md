# Executive Summary
SlateCamp has a transitional entitlement architecture, not an enterprise-grade one. The repository currently mixes at least four access-decision models: normalized internal-role helpers in `src/lib/admin/roles.ts` and `src/lib/admin/access-policy.ts`, effective-tier logic in `src/lib/admin/feature-flags.ts` plus `src/lib/dev/dev-mode.ts`, raw subscription checks in multiple product surfaces, and DB-backed `feature_flags.target_tier` checks in `src/lib/paywall/check-access.ts`. That means the same user can still receive different answers depending on whether the check runs in middleware, a layout, a route, a server action, or a paywall helper.

The target end state is one deterministic entitlement platform with:
- one canonical identity source
- one canonical role resolver
- one canonical policy layer
- one canonical entitlement resolver
- one canonical feature-key and tier vocabulary
- one canonical server enforcement path
- one canonical client entitlement payload
- structured allow/deny auditability and override visibility

The implementation approach should be phased, migration-safe, and compatibility-first. Do not do a big-bang rewrite. Build the canonical core, bridge legacy helpers onto it, dual-run decisions on critical paths, normalize DB vocabulary, migrate high-risk surfaces first, add observability, then remove legacy paths only after drift is proven absent.

# Current-State Risks
1. **Multiple active entitlement engines**
   Failure mode: the same feature class resolves differently in `3d-lab`, `pods`, `score-reveal`, `daily-cap`, and DB-backed paywalls.
2. **Policy drift between privileged surfaces**
   Failure mode: `/developer`, the dev toolbar, middleware, admin routes, and server actions do not all share the same internal-tooling policy boundary.
3. **Legacy DB tier vocabulary**
   Failure mode: `feature_flags.target_tier` still carries `camp` and `insurance`, while runtime tier code uses `pro`, `prime`, `institutional`, `enterprise`.
4. **Naming drift in core helpers**
   Failure mode: `getAdminAwareProfile()` and `isAdmin` parameters now mean "internal bypass eligible" in some flows, which invites incorrect reuse.
5. **Cookie and env overrides affect entitlement without full auditability**
   Failure mode: `cerebro_dev_flags`, `DEV_FORCE_USER_ID`, `DEV_FORCE_TIER`, and `ALLOW_DEV_PORTAL_BYPASS` can change effective access but do not produce a canonical audit trail.
6. **Middleware is narrower than app-level policy**
   Failure mode: `src/lib/supabase/middleware.ts` still gates `/admin` by `user_roles` only, while the rest of the app increasingly trusts normalized roles from auth metadata and profile state.
7. **No canonical allow/deny event trail**
   Failure mode: support and engineering cannot reconstruct whether access came from raw subscription, internal bypass, DB flag, env shortcut, or cookie override.
8. **Legacy patterns are still easy to add**
   Failure mode: new code can still ship with `sub?.tier === 'free'`, `target_tier.includes(...)`, or `getUserRole()` truthiness checks because there is no migration governance guardrail yet.

# Evidence From The Repository
- `.ai/docs/01-product/010-Feature-Gate-And-Developer-Feature-Specification.md`
  Current live-code-derived specification. It explicitly documents the mixed-state architecture and the remaining raw-tier debt.
- `.ai/archive/2026-04-11_Enterprise-Entitlement-Assessment.md`
  States correctly that the current architecture is transitional and identifies canonical-path, vocabulary, and auditability gaps.
- `.ai/archive/2026-04-11_Dev-Mode-Audit.md`
  Confirms the recent repair: role resolution improved and several newer surfaces now use effective-tier logic, but the audit also lists the still-split entitlement paths.
- `src/lib/admin/roles.ts`
  Current strongest role resolver. Pulls from auth metadata, `profiles.role`, `user_roles.role`, and `ADMIN_EMAILS`. This is the closest thing to a canonical role source today.
- `src/lib/admin/access-policy.ts`
  Current explicit policy layer for dev-toolbar visibility and internal-tier bypass. Good direction, but too narrow and not yet the full policy surface.
- `src/lib/admin/feature-flags.ts`
  Transitional entitlement helper. Reads `cerebro_dev_flags`, computes effective tier via `src/lib/dev/dev-mode.ts`, and still exposes misleading `isAdmin` semantics.
- `src/lib/dev/dev-mode.ts`
  Holds tier capabilities, connection-state logic, dev override config, and `resolveEffectiveTier()`. Important foundation, but it currently mixes capability modeling with environment override behavior.
- `src/lib/admin/get-admin-profile.ts`
  Aggregates subscription, role, flags, and effective tier into `AdminAwareProfile`. Useful bridge, but the name and payload are semantically stale.
- `src/lib/supabase/middleware.ts` and `middleware.ts`
  Global route protection path. Auth/session refresh is centralized here, but `/admin` still checks `user_roles` directly and does not use the normalized role resolver.
- `src/app/developer/layout.tsx`
  Developer portal is currently protected by `getUserRole()` truthiness or `ALLOW_DEV_PORTAL_BYPASS`, not by an explicit tooling policy helper.
- `src/components/dashboard/DashboardLayoutContent.tsx`
  Dashboard shell mounts `DevToolbar` and `DevKeyboardProvider` from `canSeeDevToolbar()`, but still computes tier context locally and passes `user.app_metadata?.role` into client system info.
- `src/app/api/admin/flags/route.ts`
  Dev override write path. Uses `isAdmin()` rather than explicit tooling policy and produces no audit event for override changes.
- `src/lib/paywall/check-access.ts`
  Separate DB-backed paywall engine. Reads `feature_flags.target_tier` and `user_subscriptions` directly, bypassing effective-tier and internal policy.
- `src/lib/paywall/score-reveal.ts` and `src/lib/paywall/daily-cap.ts`
  Raw subscription gating still active in production.
- `src/lib/subscription/get-tier.ts`
  Another raw-tier helper, with its own `DEV_FORCE_USER_ID` shortcut and no canonical entitlement payload.
- `src/lib/actions/quiz-v2/start-session.ts` and `src/lib/actions/quiz-v2/get-review-data.ts`
  Newer critical surfaces already use `hasTierAccess('pro', ...)`; these should be first-class consumers of the future canonical resolver.
- `src/app/dashboard/3d-lab/page.tsx` and `src/app/dashboard/drills/page.tsx`
  Current model routes effective-tier-aware access through server components.
- `src/lib/actions/pods.ts`, `src/app/dashboard/pods/page.tsx`, `src/lib/actions/dashboard-page.ts`, `src/lib/actions/streak.ts`
  Verified residual raw-tier surfaces still in production.
- `src/lib/context/tier-context.tsx`
  Current client entitlement shape. It is close to the right idea, but it still derives capabilities from `effectiveTier` only and does not expose decision trace or override state explicitly.
- `supabase/migrations/020_populate_feature_flags.sql`
  Seeds `feature_flags.target_tier` with legacy values `camp`, `insurance`, `institutional`.
- `supabase/migrations/20260325_testing_review_schema_gaps.sql`
  Continues using the same table for mode-availability flags, confirming semantic overload inside `feature_flags`.
- `DATABASE_SCHEMA.sql`
  Confirms `feature_flags.target_tier`, `feature_flags.target_roles`, `profiles.role`, `user_roles.role`, and `user_subscriptions.{tier,status}` as the current persistence surface.
- `src/lib/admin/roles.test.ts`, `src/lib/admin/access-policy.test.ts`, `src/features/3d-lab/gate-copy.test.ts`
  Confirms minimal regression coverage exists for recent role-policy changes, but there is no comprehensive entitlement matrix, middleware authorization test suite, or compatibility test set.

# Target Architecture
## Canonical identity source
Supabase session user from `getUser()` plus persistent profile and subscription records. Identity is the authenticated actor, not the entitlement result. The canonical identity input set is:
- `auth.users` metadata
- `profiles`
- `user_roles`
- `user_subscriptions`
- dev override inputs (`cerebro_dev_flags`, `DEV_FORCE_USER_ID`, `DEV_FORCE_TIER`, `ALLOW_DEV_PORTAL_BYPASS`)

## Canonical role resolver
Create a dedicated resolver under `src/lib/entitlements/resolve-role.ts` that returns:
- `normalizedRole`
- `roleSources`
- `resolvedFrom`
- `precedenceTrace`

`src/lib/admin/roles.ts` should become a thin compatibility wrapper around this module.

## Canonical policy layer
Create `src/lib/entitlements/policy.ts` for all named policy decisions:
- internal tooling visibility
- internal entitlement bypass eligibility
- admin CMS/content operations
- developer portal access
- CEO/internal analytics access
- route-level privileged exceptions

No route, layout, middleware, or server action should decide policy by raw role string or `getUserRole()` truthiness once migration is complete.

## Canonical entitlement resolver
Create `src/lib/entitlements/resolve-entitlements.ts` that takes:
- canonical actor identity
- normalized role
- raw subscription state
- normalized feature-flag state
- normalized dev override state
- requested feature key or capability

It returns:
- `rawTier`
- `subscriptionStatus`
- `effectiveTier`
- `capabilities`
- `featureDecisions`
- `overrideState`
- `decisionTrace`
- `denialReason`

This becomes the single source of truth for paid access, internal bypass, and rollout-aware feature decisions.

## Canonical feature-flag model
Use one feature vocabulary in code and DB. The DB model should stop acting as an alternative entitlement engine.

Target model:
- `feature_flags.enabled` remains a rollout/kill-switch
- add canonical normalized tier semantics at the boundary
- deprecate direct runtime use of raw `target_tier`
- stop using `target_roles` for entitlement decisions
- centralize feature keys in `src/lib/entitlements/feature-keys.ts`

If DB still needs tier metadata, migrate it to canonical values only and normalize it once in `src/lib/entitlements/normalize-feature-flag.ts`.

## Canonical server enforcement path
`request/session -> resolveActorIdentity -> resolveRole -> applyPolicy -> resolveEntitlements -> enforceRouteOrAction -> logAccessDecision`

All server-side gates must flow through this path:
- middleware
- layouts
- pages
- server actions
- API routes that affect privilege or entitlements

## Canonical client consumption path
Clients should receive a typed `ViewerEntitlements` payload from the server through:
- a shared helper such as `src/lib/entitlements/get-viewer-entitlements.ts`
- a provider such as `src/lib/context/entitlement-context.tsx`

The payload should include:
- `normalizedRole`
- `rawTier`
- `effectiveTier`
- `capabilities`
- `toolingVisibility`
- `overrideState`
- `decisionTraceId`

Leaf components must not infer entitlements from raw subscription rows, auth metadata, or environment variables.

## Canonical developer tooling policy
Internal tooling must be explicitly separate from:
- paid product entitlements
- admin CMS privileges
- environment overlays

The canonical tooling policy should govern:
- `/developer`
- `DevToolbar`
- dev keyboard shortcuts
- cookie-backed override mutation APIs
- local/demo/dev shortcuts

## Canonical observability and audit path
Every privileged allow/deny decision and every override mutation should emit a structured event through one module, such as `src/lib/entitlements/audit.ts` or `src/lib/entitlements/log-access-decision.ts`.

Minimum canonical event classes:
- `entitlement.decision`
- `entitlement.denied`
- `entitlement.override.applied`
- `entitlement.override.cleared`
- `tooling.access`
- `tooling.override.write`
- `tooling.override.delete`
- `entitlement.config.mismatch`

# Architecture Decisions
- **Survives**
  - `src/lib/admin/roles.ts` logic survives, but only as the basis for the new canonical role resolver.
  - `src/lib/admin/access-policy.ts` survives conceptually, but must expand into the full canonical policy layer.
  - `TIER_CAPABILITIES` in `src/lib/dev/dev-mode.ts` survives as the seed of the capability matrix.
  - Effective-tier as a concept survives. It is the right abstraction.
- **Gets replaced**
  - `src/lib/admin/feature-flags.ts` stops being the canonical entitlement entry point. Its responsibilities split into override parsing, feature-flag normalization, and entitlement resolution.
  - `src/lib/paywall/check-access.ts` stops being an independent access engine and becomes a wrapper around the canonical resolver.
  - `src/lib/subscription/get-tier.ts` stops being a general entitlement helper and becomes a raw subscription data accessor only.
  - `src/lib/admin/get-admin-profile.ts` gets replaced by a semantically correct viewer-entitlement/profile aggregator.
- **Gets deprecated**
  - `getAdminAwareProfile()`
  - `getEffectiveTier(actualTier, isAdmin, flags)`
  - `hasTierAccess(requiredTier, actualTier, isAdmin, flags)`
  - direct `feature_flags.target_tier` checks
  - direct `getUserRole()` truthiness checks for privileged routes
  - raw `sub?.tier === 'free'` and `sub?.tier !== 'free'` checks in feature surfaces
- **Temporarily supported during migration**
  - legacy DB `target_tier` values via a single normalization adapter
  - compatibility wrappers in `src/lib/admin/roles.ts`, `src/lib/admin/access-policy.ts`, `src/lib/admin/feature-flags.ts`, and `src/lib/paywall/check-access.ts`
  - `cerebro_dev_flags.spoofedTier` only through an explicit migration shim
- **Must never be used again**
  - new raw subscription checks in product surfaces
  - new route-specific privileged checks outside the shared policy layer
  - new use of `ALLOW_DEV_PORTAL_BYPASS` or `DEV_FORCE_*` directly inside product routes or actions
  - new logic that reads `feature_flags.target_tier` without normalization

# Implementation Phases
## Phase 0: policy freeze and architecture contract
**Objective**
Freeze the entitlement surface area so no new legacy-style checks are added while the refactor is underway.

**Why this phase exists**
Without a freeze, the migration target keeps moving and the compatibility burden grows.

**Exact scope**
- define canonical module boundaries
- define canonical feature keys and tier vocabulary
- define banned patterns and code-review rules
- add temporary wrappers and TODO markers to current helpers

**Concrete files/modules/surfaces likely involved**
- `.ai/plans/2026-04-11_Enterprise-Grade-Feature-Gate-Implementation-Plan.md`
- `.ai/docs/01-product/010-Feature-Gate-And-Developer-Feature-Specification.md`
- `docs/architecture/SLATECAMP-ARCHITECTURE.md`
- `.ai/docs/02-architecture/001-system-architecture.md`
- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/feature-flags.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/subscription/get-tier.ts`
- `scripts/` new audit script or CI grep guard

**Expected outputs**
- architecture contract document
- canonical vocabulary list
- banned-pattern review checklist
- CI or script-based drift detector for raw tier checks

**Dependencies**
- none

**Implementation risks**
- weak freeze language will not stop new debt
- naming decisions delayed here will cascade confusion later

**Exit criteria**
- canonical vocabulary is documented
- compatibility strategy is documented
- a repo check exists that flags new legacy-style access checks

## Phase 1: canonical entitlement core
**Objective**
Create the canonical role resolver, policy layer, entitlement resolver, and client payload builder.

**Why this phase exists**
No migration is safe until one canonical engine exists and can shadow current behavior.

**Exact scope**
- create `src/lib/entitlements/` modules
- define `ViewerEntitlements` and `AccessDecision`
- bridge existing helpers to the new core without changing production behavior yet

**Concrete files/modules/surfaces likely involved**
- `src/lib/entitlements/resolve-role.ts`
- `src/lib/entitlements/policy.ts`
- `src/lib/entitlements/normalize-tier.ts`
- `src/lib/entitlements/normalize-feature-flag.ts`
- `src/lib/entitlements/resolve-entitlements.ts`
- `src/lib/entitlements/feature-keys.ts`
- `src/lib/entitlements/types.ts`
- `src/lib/entitlements/get-viewer-entitlements.ts`
- `src/lib/context/entitlement-context.tsx`
- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/feature-flags.ts`
- `src/lib/admin/get-admin-profile.ts`

**Expected outputs**
- canonical entitlement engine
- typed client payload
- compatibility wrappers
- first-pass unit tests for role resolution and entitlement matrix

**Dependencies**
- Phase 0 freeze

**Implementation risks**
- role precedence regressions
- accidental widening of internal bypass policy
- wrapper naming confusion if both old and new helpers remain unmarked

**Exit criteria**
- all existing helper outputs can be produced from the canonical core
- canonical resolver can shadow current decisions on critical flows
- unit tests cover role precedence and core matrix logic

## Phase 2: vocabulary and data normalization
**Objective**
Normalize tier and feature-flag vocabulary at the DB and runtime boundary.

**Why this phase exists**
Legacy `camp` and `insurance` values are a correctness hazard and block deterministic access decisions.

**Exact scope**
- add canonical normalization layer for `feature_flags`
- backfill DB rows to canonical tiers
- decide whether `target_tier` remains as normalized data or is replaced by `minimum_tier` / `allowed_tiers`

**Concrete files/modules/surfaces likely involved**
- `supabase/migrations/020_populate_feature_flags.sql`
- `supabase/migrations/20260325_testing_review_schema_gaps.sql`
- new migration under `supabase/migrations/`
- `DATABASE_SCHEMA.sql`
- `src/types/app.ts`
- `src/types/supabase.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/entitlements/normalize-feature-flag.ts`
- `src/lib/entitlements/feature-keys.ts`

**Expected outputs**
- canonical DB tier vocabulary
- runtime normalization adapter
- compatibility tests for legacy tier labels during migration

**Dependencies**
- Phase 1 canonical core

**Implementation risks**
- breaking seeded feature-flag behavior in existing environments
- partial DB migration across environments

**Exit criteria**
- all runtime decisions use normalized tier vocabulary
- unknown legacy values fail loudly in logs/tests
- DB backfill migration is idempotent and verified

## Phase 3: migrate critical production surfaces
**Objective**
Move the highest-risk entitlement surfaces to the canonical resolver.

**Why this phase exists**
These are the surfaces where inconsistent access creates direct revenue, access, or product regressions.

**Exact scope**
- migrate critical routes, layouts, and actions first
- dual-log old vs new decisions where appropriate
- remove local raw checks from the highest-risk surfaces

**Concrete files/modules/surfaces likely involved**
- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/app/dashboard/drills/page.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/lib/actions/quiz-v2/start-session.ts`
- `src/lib/actions/quiz-v2/get-review-data.ts`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/app/dashboard/pods/page.tsx`
- `src/lib/actions/pods.ts`
- `src/lib/paywall/score-reveal.ts`
- `src/lib/paywall/daily-cap.ts`
- `src/lib/actions/dashboard-page.ts`
- `src/lib/actions/streak.ts`

**Expected outputs**
- critical surfaces consume `ViewerEntitlements` or `resolveEntitlements()`
- raw subscription checks removed from migrated surfaces
- regression tests for each migrated gate

**Dependencies**
- Phases 1 and 2

**Implementation risks**
- user-facing access regressions
- stale cached payloads causing mismatched UI and server decisions
- partial migration leaving old/new decisions split across adjacent flows

**Exit criteria**
- every critical paid/internal surface uses the canonical server path
- dual-run divergence logging is clean for a release window

## Phase 4: unify developer tooling and privileged policy
**Objective**
Unify all internal tooling, override, and privileged-route decisions under one policy surface.

**Why this phase exists**
Developer tooling policy is still fragmented across toolbar, portal, middleware, route handlers, and environment switches.

**Exact scope**
- define explicit tooling-access policy helpers
- align `/developer`, dev-toolbar visibility, override write APIs, middleware, and local-only shortcuts
- separate admin CMS privilege from developer-tooling privilege

**Concrete files/modules/surfaces likely involved**
- `src/app/developer/layout.tsx`
- `src/components/dev/dev-toolbar.tsx`
- `src/components/dev/dev-mode-overlay.tsx`
- `src/app/api/admin/flags/route.ts`
- `src/lib/actions/feature-flags.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/demo/config.ts`
- `src/lib/admin/is-admin.ts`
- `src/lib/admin/access-policy.ts`
- new `src/lib/entitlements/dev-overrides.ts`

**Expected outputs**
- explicit tooling policy helpers
- audited override mutation path
- local/dev-only shortcuts isolated behind one boundary

**Dependencies**
- Phase 1

**Implementation risks**
- accidentally broadening developer portal access
- conflating admin authoring privileges with internal engineering privileges

**Exit criteria**
- `/developer`, dev toolbar, override APIs, and local bypasses all use the same policy contract
- all override writes are logged

## Phase 5: observability and auditability
**Objective**
Make every allow/deny/override decision traceable and supportable.

**Why this phase exists**
Enterprise-grade access control requires deterministic debugging, not just correct code.

**Exact scope**
- add structured access decision logging
- add denial reason logging
- add override visibility and config-mismatch alerts
- connect entitlement events to the broader logging architecture

**Concrete files/modules/surfaces likely involved**
- new `src/lib/entitlements/audit.ts`
- new `src/lib/entitlements/log-access-decision.ts`
- existing `src/lib/audit/*`
- `src/lib/analytics-server.ts`
- `src/lib/supabase/format-error.ts`
- `.ai/plans/2026-04-11-Error-Logging-Audit.md`
- `src/app/api/admin/flags/route.ts`
- `src/lib/supabase/middleware.ts`

**Expected outputs**
- structured telemetry schema
- access decision logs
- override audit trail
- alerts for environment/config mismatches

**Dependencies**
- Phases 1 through 4

**Implementation risks**
- logging too little to debug
- logging too much without redaction
- high-volume noise if every low-value check is emitted

**Exit criteria**
- all critical allow/deny/override paths emit structured logs
- support can trace a decision from route/feature to source inputs

## Phase 6: legacy removal and hardening
**Objective**
Delete compatibility shims and prevent reintroduction of entitlement debt.

**Why this phase exists**
The refactor is not complete while legacy engines still exist as usable alternatives.

**Exact scope**
- remove deprecated helpers
- delete raw-tier checks
- remove legacy vocabulary support once backfill is complete
- add governance checks and docs updates

**Concrete files/modules/surfaces likely involved**
- `src/lib/admin/feature-flags.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/subscription/get-tier.ts`
- `src/lib/actions/feature-flags.ts`
- any remaining raw-tier call sites found by grep
- CI/review scripts in `scripts/`

**Expected outputs**
- no independent legacy entitlement engines
- hard CI failure on banned patterns
- updated architecture docs and migration completion note

**Dependencies**
- successful rollout of Phases 1 through 5

**Implementation risks**
- deleting a wrapper before downstream code is migrated
- leaving unowned dead code paths that still compile

**Exit criteria**
- zero allowed legacy-path consumers remain
- grep-based banned-pattern checks are clean
- deprecation checklist is complete

# Detailed Workstreams
## role resolution
**Problem**
Role resolution is strongest in `src/lib/admin/roles.ts`, but it still lives in an admin-named module and its outputs are not accompanied by source trace metadata.

**Target state**
One canonical role resolver with explicit precedence trace and compatibility wrappers only.

**Specific code areas**
- `src/lib/admin/roles.ts`
- `src/lib/admin/is-admin.ts`
- `src/lib/supabase/server.ts`
- `src/app/developer/layout.tsx`
- `src/lib/supabase/middleware.ts`

**Exact tasks**
- create `src/lib/entitlements/resolve-role.ts`
- return `normalizedRole`, `sources`, `precedenceTrace`, `isLocalDevBypass`
- make `src/lib/admin/roles.ts` re-export the canonical resolver
- remove direct role-truthiness checks from portal layouts
- add role precedence tests for metadata/profile/role-row conflicts

**Risk notes**
- precedence changes can silently widen or narrow access

**Done criteria**
- all role consumers call the canonical resolver or its wrapper
- role source and precedence are available for logs/tests

## policy layer
**Problem**
Policy helpers exist but only cover dev-toolbar visibility and internal-tier bypass.

**Target state**
One named policy module for all privileged decisions.

**Specific code areas**
- `src/lib/admin/access-policy.ts`
- `src/app/developer/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/app/api/admin/flags/route.ts`

**Exact tasks**
- expand policy helpers into `canAccessDeveloperPortal`, `canWriteDevOverrides`, `canAccessAdminCms`, `canBypassTierForInternalUse`, `canSeeDevToolbar`
- move policy decisions out of route/layout files
- forbid direct `getUserRole()` truthiness checks

**Risk notes**
- admin/content permissions and dev-tool permissions must not collapse into one broad role bucket

**Done criteria**
- every privileged route/layout/action calls a named policy helper

## entitlement core
**Problem**
`src/lib/admin/feature-flags.ts`, `src/lib/dev/dev-mode.ts`, `src/lib/paywall/check-access.ts`, and raw subscription helpers all resolve access independently.

**Target state**
One entitlement resolver for paid, internal, and rollout-aware access.

**Specific code areas**
- `src/lib/admin/feature-flags.ts`
- `src/lib/dev/dev-mode.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/subscription/get-tier.ts`
- `src/lib/context/tier-context.tsx`

**Exact tasks**
- create `resolve-entitlements.ts`
- define `AccessDecision` and `ViewerEntitlements`
- move tier normalization into canonical helper
- move capability resolution into canonical helper
- bridge `hasTierAccess()` and `checkFeatureAccess()` to the new engine

**Risk notes**
- shadow-mode comparison is required before flipping high-traffic surfaces

**Done criteria**
- one canonical resolver can answer every current gate type

## feature-flag normalization
**Problem**
`feature_flags` mixes rollout and pricing semantics, and legacy tier strings still exist.

**Target state**
Feature flags are normalized once and never compared raw in product code.

**Specific code areas**
- `supabase/migrations/020_populate_feature_flags.sql`
- `supabase/migrations/20260325_testing_review_schema_gaps.sql`
- `DATABASE_SCHEMA.sql`
- `src/lib/paywall/check-access.ts`
- `src/types/app.ts`
- `src/types/supabase.ts`

**Exact tasks**
- add new migration to normalize seeded rows
- add runtime normalizer with strict unknown-value logging
- centralize feature keys in one module
- decide whether to keep `target_tier` as normalized data or replace it with a clearer field

**Risk notes**
- old environments may contain mixed values not visible in repo seeds

**Done criteria**
- no runtime consumer reads `target_tier` without normalization

## middleware alignment
**Problem**
Middleware still has its own narrower role logic and local bypass behavior.

**Target state**
Middleware calls the same role and policy contracts as the rest of the app.

**Specific code areas**
- `middleware.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/lib/routes.ts`

**Exact tasks**
- move route authorization decisions onto the canonical policy helper
- preserve `DEV_FORCE_USER_ID` only through one explicit dev-only path
- add access decision logging for redirect/deny outcomes

**Risk notes**
- middleware regressions affect the whole app immediately

**Done criteria**
- privileged redirects and allows match the canonical policy matrix

## route/layout/server-action migration
**Problem**
Critical surfaces already improved, but multiple raw checks remain.

**Target state**
Critical route, layout, and server-action enforcement consumes the canonical resolver.

**Specific code areas**
- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/app/dashboard/drills/page.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/lib/actions/quiz-v2/start-session.ts`
- `src/lib/actions/quiz-v2/get-review-data.ts`
- `src/lib/actions/pods.ts`
- `src/app/dashboard/pods/page.tsx`
- `src/lib/paywall/score-reveal.ts`
- `src/lib/paywall/daily-cap.ts`
- `src/lib/actions/dashboard-page.ts`
- `src/lib/actions/streak.ts`

**Exact tasks**
- migrate server-side feature checks to `resolveEntitlements()`
- pass typed entitlement payloads into clients
- remove per-surface raw `user_subscriptions` gating
- dual-log old vs new decisions during rollout

**Risk notes**
- partial migration inside one feature flow causes UI/server mismatch

**Done criteria**
- zero raw tier checks remain in migrated surfaces

## client entitlement payloads
**Problem**
Client code still receives fragmented tier/tooling state and infers capabilities from effective tier alone.

**Target state**
One typed entitlement payload and one provider for client consumption.

**Specific code areas**
- `src/lib/context/tier-context.tsx`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/components/dev/dev-toolbar.tsx`

**Exact tasks**
- replace `TierProvider` with `EntitlementProvider` or wrap it around the new payload
- include override state and decision trace ID
- remove client inference from `user.app_metadata?.role` and raw tier fragments

**Risk notes**
- stale RSC payloads can mislead client UI if caching is not aligned

**Done criteria**
- client components consume only the canonical entitlement payload

## developer tooling unification
**Problem**
Toolbar, portal, overrides, and local shortcuts are not governed by one policy surface.

**Target state**
One tooling policy and one override service.

**Specific code areas**
- `src/app/developer/layout.tsx`
- `src/app/api/admin/flags/route.ts`
- `src/lib/actions/feature-flags.ts`
- `src/components/dev/dev-toolbar.tsx`
- `src/components/dev/dev-mode-overlay.tsx`
- `src/lib/demo/config.ts`
- `src/lib/supabase/server.ts`

**Exact tasks**
- rename or replace `src/lib/actions/feature-flags.ts` to avoid collision with admin entitlement helpers
- move cookie parsing/writing into `src/lib/entitlements/dev-overrides.ts`
- enforce `canWriteDevOverrides()` on override mutation routes
- log all override writes and clears

**Risk notes**
- developer ergonomics will regress if overrides are over-constrained

**Done criteria**
- all tooling and override paths share one policy contract and one audit path

## observability and audit trails
**Problem**
There is no canonical access decision log or override audit trail.

**Target state**
All allow/deny/override/config-mismatch events are structured and queryable.

**Specific code areas**
- new `src/lib/entitlements/audit.ts`
- `src/lib/audit/*`
- `src/lib/analytics-server.ts`
- `.ai/plans/2026-04-11-Error-Logging-Audit.md`

**Exact tasks**
- define event schema
- emit decision logs from middleware, layouts, actions, and override routes
- correlate logs with role source, tier source, and override source
- connect to the broader logging architecture defined in the error logging audit

**Risk notes**
- lack of redaction or log-volume control will create a different operational problem

**Done criteria**
- support can trace why a feature was allowed or denied for a specific user

## testing and regression coverage
**Problem**
Existing tests only cover narrow recent fixes.

**Target state**
A minimum trustworthy entitlement regression suite exists and blocks rollout regressions.

**Specific code areas**
- `src/lib/admin/roles.test.ts`
- `src/lib/admin/access-policy.test.ts`
- new `src/lib/entitlements/*.test.ts`
- new middleware authorization tests
- new server-action gate tests

**Exact tasks**
- add role matrix tests
- add entitlement matrix tests
- add feature-flag normalization tests
- add middleware/route/layout/action integration tests
- add legacy vocabulary compatibility tests

**Risk notes**
- without matrix coverage, the bridge layer will fail silently

**Done criteria**
- the regression suite proves old and new paths match until cutover

## docs and governance
**Problem**
The current docs are honest but still describe a mixed-state platform.

**Target state**
Architecture docs, schema docs, and review rules reflect the canonical platform and the migration status.

**Specific code areas**
- `.ai/docs/01-product/010-Feature-Gate-And-Developer-Feature-Specification.md`
- `.ai/docs/02-architecture/001-system-architecture.md`
- `docs/architecture/SLATECAMP-ARCHITECTURE.md`
- `DATABASE_SCHEMA.sql`
- CI/review scripts in `scripts/`

**Exact tasks**
- update product and architecture docs after each phase boundary
- document banned patterns in review guidance
- keep a migration ledger of remaining legacy call sites

**Risk notes**
- stale docs will recreate the same split in future work

**Done criteria**
- docs and code review policy enforce the canonical path

# File and Module Plan
## likely to be created
- `src/lib/entitlements/types.ts`
- `src/lib/entitlements/feature-keys.ts`
- `src/lib/entitlements/resolve-role.ts`
- `src/lib/entitlements/policy.ts`
- `src/lib/entitlements/normalize-tier.ts`
- `src/lib/entitlements/normalize-feature-flag.ts`
- `src/lib/entitlements/dev-overrides.ts`
- `src/lib/entitlements/resolve-entitlements.ts`
- `src/lib/entitlements/get-viewer-entitlements.ts`
- `src/lib/entitlements/audit.ts`
- `src/lib/context/entitlement-context.tsx`
- `src/lib/entitlements/__tests__/resolve-role.test.ts`
- `src/lib/entitlements/__tests__/policy.test.ts`
- `src/lib/entitlements/__tests__/resolve-entitlements.test.ts`
- `src/lib/entitlements/__tests__/normalize-feature-flag.test.ts`
- `src/lib/entitlements/__tests__/middleware-authorization.test.ts`
- `scripts/check-entitlement-legacy-usage.ts`
- new normalization migration under `supabase/migrations/`

## likely to be renamed or semantically replaced
- `src/lib/admin/get-admin-profile.ts` -> replace with `src/lib/entitlements/get-viewer-entitlements.ts`
- `src/lib/context/tier-context.tsx` -> replace or wrap with `entitlement-context.tsx`
- `src/lib/actions/feature-flags.ts` -> rename to something unambiguous such as `src/lib/actions/dev-overrides.ts`

## likely to be migrated in place
- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/feature-flags.ts`
- `src/lib/admin/is-admin.ts`
- `src/lib/dev/dev-mode.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/paywall/score-reveal.ts`
- `src/lib/paywall/daily-cap.ts`
- `src/lib/subscription/get-tier.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/server.ts`
- `src/app/developer/layout.tsx`
- `src/app/admin/layout.tsx`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/components/dev/dev-toolbar.tsx`
- `src/app/api/admin/flags/route.ts`
- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/app/dashboard/drills/page.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/lib/actions/quiz-v2/start-session.ts`
- `src/lib/actions/quiz-v2/get-review-data.ts`
- `src/lib/actions/pods.ts`
- `src/app/dashboard/pods/page.tsx`
- `src/lib/actions/dashboard-page.ts`
- `src/lib/actions/streak.ts`

## likely to be deprecated
- `src/lib/admin/feature-flags.ts` as canonical access engine
- `src/lib/actions/feature-flags.ts`
- `src/lib/subscription/get-tier.ts` as a privilege helper
- direct consumers of `feature_flags.target_tier`

## likely to be audited for removal
- all `sub?.tier === 'free'`, `sub?.tier !== 'free'`, and `target_tier.includes(...)` call sites
- `ALLOW_DEV_PORTAL_BYPASS` direct consumers outside the tooling boundary
- `DEV_FORCE_USER_ID` and `DEV_FORCE_TIER` direct consumers outside the identity/dev-override boundary

# Migration and Rollout Strategy
Start with bridge layers, not cutovers.

1. **Compatibility adapters**
   - keep `src/lib/admin/roles.ts`, `src/lib/admin/access-policy.ts`, `src/lib/admin/feature-flags.ts`, and `src/lib/paywall/check-access.ts` as public entry points temporarily
   - rewire them internally to call the new `src/lib/entitlements/*` modules
   - mark them with deprecation comments and link to the canonical module

2. **Dual-read / dual-path strategy**
   - on critical surfaces, compute both the legacy and canonical decision during the migration window
   - enforce the legacy decision until divergence logging is stable
   - log `legacyDecision`, `canonicalDecision`, `featureKey`, `userId`, `normalizedRole`, `rawTier`, and `overrideState`

3. **Rollout ordering**
   - first: build canonical core and wrappers
   - second: normalize vocabulary and DB reads
   - third: migrate critical server actions and routes
   - fourth: unify tooling policy and override mutation paths
   - fifth: remove old engines and banned patterns

4. **How old and new logic coexist temporarily**
   - legacy helpers remain as wrappers only
   - DB legacy tier vocabulary is normalized once at the boundary
   - client code keeps receiving the old tier context until the new entitlement payload is available, then both can coexist behind a provider wrapper for one release

5. **How to detect drift during migration**
   - dual-decision logs on critical surfaces
   - scripted grep checks for banned patterns
   - test matrix covering legacy vocabulary and override scenarios
   - explicit migration ledger of remaining legacy call sites

6. **How to prevent partial-refactor regressions**
   - block new raw-tier checks in CI
   - require new privileged code to consume the canonical resolver
   - add PR checklist items for feature gates, overrides, and route policy

7. **Removal gates for deleting old paths**
   - no dual-decision divergences for a full release window on critical surfaces
   - zero production consumers of legacy wrappers except explicitly approved compatibility shims
   - grep check clean for banned patterns
   - regression suite green across role, entitlement, middleware, route, and override coverage

# Testing Strategy
## role resolution tests
- **What should be tested**
  - metadata vs profile vs `user_roles` precedence
  - `ADMIN_EMAILS` fallback
  - `DEV_FORCE_USER_ID` local bypass behavior
- **Where tests likely belong**
  - `src/lib/entitlements/__tests__/resolve-role.test.ts`
  - keep `src/lib/admin/roles.test.ts` as compatibility coverage during migration
- **What failure would mean**
  - the app can misidentify privileged users or remove valid access

## policy helper tests
- **What should be tested**
  - tooling visibility, dev override write access, admin CMS access, internal bypass eligibility
- **Where tests likely belong**
  - `src/lib/entitlements/__tests__/policy.test.ts`
- **What failure would mean**
  - privileged surfaces are semantically inconsistent

## entitlement matrix tests
- **What should be tested**
  - all normalized roles x all raw tiers x active/trialing/inactive subscription states x override states x requested features
- **Where tests likely belong**
  - `src/lib/entitlements/__tests__/resolve-entitlements.test.ts`
- **What failure would mean**
  - the canonical engine is not deterministic

## feature-flag normalization tests
- **What should be tested**
  - legacy `camp`/`insurance` mapping
  - canonical `pro`/`prime` mapping
  - unknown tier vocabulary rejection/logging
- **Where tests likely belong**
  - `src/lib/entitlements/__tests__/normalize-feature-flag.test.ts`
- **What failure would mean**
  - DB-backed flags can silently misfire

## middleware authorization tests
- **What should be tested**
  - public routes
  - authenticated dashboard routes
  - `/admin`
  - `/developer`
  - local dev bypass behavior
- **Where tests likely belong**
  - `src/lib/entitlements/__tests__/middleware-authorization.test.ts`
  - or co-located middleware tests if the repo already supports them
- **What failure would mean**
  - route protection differs from app policy

## route protection tests
- **What should be tested**
  - `3d-lab` gallery and module routes
  - dashboard shell tooling visibility
  - developer portal protection
  - pods access behavior
- **Where tests likely belong**
  - co-located server-component tests or integration tests under the affected feature directories
- **What failure would mean**
  - route-level regressions will reach production

## server action gate tests
- **What should be tested**
  - `start-session`
  - `get-review-data`
  - `pods`
  - score reveal and daily cap helpers
- **Where tests likely belong**
  - co-located tests in `src/lib/actions/**` and `src/lib/paywall/**`
- **What failure would mean**
  - backend enforcement is split or incorrect

## developer mode override tests
- **What should be tested**
  - cookie parsing
  - override write permissions
  - `spoofedTier` backward compatibility
  - override clear behavior
- **Where tests likely belong**
  - `src/lib/entitlements/__tests__/dev-overrides.test.ts`
  - route tests for `src/app/api/admin/flags/route.ts`
- **What failure would mean**
  - internal tooling can produce invisible or invalid entitlement states

## stale session / stale metadata tests
- **What should be tested**
  - profile role changes
  - auth metadata changes
  - subscription status transitions
  - stale cookie overrides vs fresh server state
- **Where tests likely belong**
  - entitlement integration tests
- **What failure would mean**
  - users can see stale access after identity or billing changes

## compatibility tests for legacy tier vocabulary during migration
- **What should be tested**
  - old seeded `feature_flags.target_tier` values still normalize correctly until DB cleanup is complete
- **Where tests likely belong**
  - normalization tests plus a DB-seed compatibility fixture
- **What failure would mean**
  - rollout breaks old environments or partial migrations

# Observability and Audit Strategy
Create a structured event schema for all entitlement decisions and override changes.

Minimum event fields:
- `eventName`
- `timestamp`
- `requestId`
- `userId`
- `routeOrAction`
- `featureKey`
- `normalizedRole`
- `roleSource`
- `rawTier`
- `subscriptionStatus`
- `effectiveTier`
- `overrideState`
- `featureFlagState`
- `decision`
- `denialReason`
- `decisionSource`
- `legacyDecision` during migration
- `canonicalDecision` during migration

Required telemetry:
- **access decision logging**
  - emit on critical route/layout/action gates
- **denial-reason logging**
  - every deny path logs a concrete reason code, not just a string
- **source trace logging**
  - record whether role came from metadata, profile, `user_roles`, env bypass, or email fallback
- **override visibility**
  - include cookie/env override state in decision logs
- **internal tooling audit events**
  - log writes and clears to `cerebro_dev_flags`
  - log `/developer` access for internal actors
- **config/environment mismatch alerts**
  - alert when legacy tier values are encountered
  - alert when dev bypass env vars are active outside approved local contexts
- **support/debug traceability**
  - include `requestId`/`decisionTraceId` in surfaced errors or internal tooling diagnostics

This work should align with the logging architecture direction already documented in `.ai/plans/2026-04-11-Error-Logging-Audit.md`. Entitlement logging should plug into that shared logger, not create another standalone event system.

# Deprecation Plan
- ban and remove raw tier checks in feature surfaces such as `sub?.tier === 'free'` and `sub?.tier !== 'free'`
- ban and remove direct `target_tier` string comparisons without normalization
- ban and remove route-specific privilege logic outside shared policy helpers
- ban and remove environment-only privileged behavior in product surfaces
- ban and remove ambiguous helper names whose semantics drifted, especially `getAdminAwareProfile` and `isAdmin` parameters used for internal bypass
- ban and remove middleware logic that silently diverges from app-level policy
- ban and remove entitlement-affecting cookie overrides without audit visibility
- ban new `getUserRole()` truthiness gates for privileged routes or layouts
- ban new direct reads of `ALLOW_DEV_PORTAL_BYPASS`, `DEV_FORCE_USER_ID`, or `DEV_FORCE_TIER` outside the canonical identity/dev-override boundary

# Prioritized Roadmap
## P0
- **Objective:** build the canonical role, policy, and entitlement core
  - **Why it matters:** everything else depends on one deterministic engine
  - **Impact:** highest
  - **Implementation difficulty:** high
  - **Regression risk if delayed:** highest, because mixed models continue to grow
- **Objective:** normalize tier and feature vocabulary
  - **Why it matters:** legacy DB strings are a silent correctness bug
  - **Impact:** high
  - **Implementation difficulty:** medium
  - **Regression risk if delayed:** high, because DB-backed paywalls remain ambiguous
- **Objective:** migrate critical server-side gates
  - **Why it matters:** `3d-lab`, quiz actions, and dashboard shell are user-visible and revenue-sensitive
  - **Impact:** high
  - **Implementation difficulty:** medium
  - **Regression risk if delayed:** high

## P1
- **Objective:** unify developer tooling policy and override mutation paths
  - **Why it matters:** privileged internal surfaces are still fragmented
  - **Impact:** high
  - **Implementation difficulty:** medium
  - **Regression risk if delayed:** medium-high
- **Objective:** add structured entitlement observability and override audit trails
  - **Why it matters:** enterprise-grade claims are not credible without traceability
  - **Impact:** high
  - **Implementation difficulty:** medium
  - **Regression risk if delayed:** high from an operations and support standpoint
- **Objective:** migrate residual raw-tier product surfaces
  - **Why it matters:** pods, score reveal, daily cap, streak, and dashboard state still bypass the canonical model
  - **Impact:** medium-high
  - **Implementation difficulty:** medium
  - **Regression risk if delayed:** medium-high

## P2
- **Objective:** replace legacy wrappers and harden governance
  - **Why it matters:** the platform is not unified while old engines remain usable
  - **Impact:** medium
  - **Implementation difficulty:** medium
  - **Regression risk if delayed:** medium
- **Objective:** complete client entitlement payload consolidation
  - **Why it matters:** leaf UI should stop inferring capabilities from partial tier state
  - **Impact:** medium
  - **Implementation difficulty:** medium-high
  - **Regression risk if delayed:** medium
- **Objective:** simplify naming and finalize docs/schema contracts
  - **Why it matters:** semantic clarity prevents new drift
  - **Impact:** medium
  - **Implementation difficulty:** low-medium
  - **Regression risk if delayed:** medium

# Definition of Done
SlateCamp can only claim enterprise-grade entitlement architecture when all of the following are true:
- every privileged or paid decision flows through one canonical entitlement resolver
- every privileged route/layout/action uses one canonical policy layer
- middleware, layouts, routes, actions, and client payloads agree on the same access answer
- DB feature flags no longer rely on legacy tier vocabulary at runtime
- direct raw tier checks are absent from product feature surfaces
- internal tooling access is explicitly separated from admin CMS access and paid entitlements
- override sources are explicit, auditable, and visible in decision traces
- access allows and denies are logged with structured reasons and source traces
- compatibility wrappers exist only where explicitly planned, not as shadow engines
- banned-pattern CI checks are green
- regression coverage exists for role resolution, policy helpers, entitlement matrix, middleware, route gates, server actions, override behavior, stale-state cases, and legacy vocabulary compatibility during migration

# Open Questions
- Should `feature_flags` remain the long-term storage surface for tier metadata after normalization, or should tier eligibility move fully into code policy and leave `feature_flags` as rollout-only state? The repository shows both semantics today but does not settle the desired final ownership.
- Is `ceo` intended to retain developer-tooling visibility and internal-tier bypass long-term, or is that only a current convenience? The current repo grants it, but the repository does not contain a durable product-policy decision explaining why.
- Is `ALLOW_DEV_PORTAL_BYPASS` meant to survive as a local-only developer convenience, or should it be replaced entirely by the canonical dev-override/identity path? The repo shows the mechanism, but not the intended long-term governance.
