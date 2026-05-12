# Feature Gate And Developer Feature Specification

**Last Updated:** 2026-04-12
**Status:** Active - Post-Finalization Codebase Source of Truth
**Version:** 2.0
**Primary Evidence:**
- [2026-04-11_Enterprise-Grade-Feature-Gate-Execution-Report.md](</C:/Users/Philip Lewis/Desktop/slatecamp/.ai/plans/2026-04-11_Enterprise-Grade-Feature-Gate-Execution-Report.md>)
- [2026-04-11_Entitlement-Migration-Ledger.md](</C:/Users/Philip Lewis/Desktop/slatecamp/.ai/plans/2026-04-11_Entitlement-Migration-Ledger.md>)
- [2026-04-11_Enterprise-Grade-Feature-Gate-Finalization-Plan.md](</C:/Users/Philip Lewis/Desktop/slatecamp/.ai/plans/2026-04-11_Enterprise-Grade-Feature-Gate-Finalization-Plan.md>)

> This document is the authoritative product/engineering specification for SlateCamp's live entitlement, feature-gate, pricing-tier, and developer-tooling architecture after the enterprise-grade finalization pass.
> Every claim here is derived from the current codebase and the execution records above.

---

## 1. Overview

SlateCamp now uses one canonical entitlement platform for:

- role resolution
- privileged policy
- tier normalization
- feature-key vocabulary
- dev override parsing
- server-derived viewer entitlement payloads
- structured allow/deny and override auditability

The canonical runtime boundary is `src/lib/entitlements/`.

This document covers:

- current storage and vocabulary
- canonical runtime modules
- policy and override behavior
- paid/internal gate enforcement
- developer tooling access rules
- audit and governance behavior
- removed legacy engines
- remaining compatibility facades and caveats

This document does not cover:

- payment webhook payload schemas
- detailed pricing page copy
- general marketing packaging
- speculative future entitlement models

---

## 2. Governing Principles

1. **Canonical path first**
   Paid and privileged decisions are expected to flow through `src/lib/entitlements/*`.

2. **Identity, policy, and entitlements are distinct**
   Role discovery is not the same as policy, and policy is not the same as feature access.

3. **Developer tooling is separate from admin CMS access**
   Internal tooling visibility and override write access are explicit policy decisions.

4. **Storage normalization happens at the boundary**
   Legacy tier vocabulary is normalized once and not reinterpreted ad hoc across product code.

5. **Auditability is part of enforcement**
   Denies, allows, overrides, and config mismatches are structured events, not just booleans.

6. **Governance prevents drift**
   New raw-tier and raw-role product gating patterns are blocked by a repo check.

---

## 3. Canonical Module Boundary

Canonical modules under `src/lib/entitlements/`:

| Module | Responsibility |
| --- | --- |
| `feature-keys.ts` | Canonical feature-key vocabulary |
| `types.ts` | Viewer entitlements, decision, role, policy, and audit event contracts |
| `normalize-tier.ts` | Canonical tier normalization and paid-tier helpers |
| `normalize-feature-flag.ts` | DB feature-flag normalization, including legacy paid-shape handling |
| `dev-overrides.ts` | Cookie/env override parsing and serialization |
| `policy.ts` | Canonical privileged policy helpers |
| `resolve-role.ts` | Canonical role resolution |
| `resolve-entitlements.ts` | Effective tier, capabilities, and feature-decision evaluation |
| `get-viewer-entitlements.ts` | Canonical server payload for current viewer |
| `audit.ts` | Structured entitlement event logging and persistence |

Client-side provider:

- [entitlement-context.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/context/entitlement-context.tsx)

The old mixed entitlement center in `src/lib/admin/feature-flags.ts`, `src/lib/admin/get-admin-profile.ts`, `src/lib/paywall/check-access.ts`, and `src/lib/subscription/get-tier.ts` no longer exists.

---

## 4. Current Vocabulary

### Canonical tier vocabulary

The live `UserTier` union is:

- `free`
- `pro`
- `prime`
- `institutional`
- `enterprise`

### Legacy tier vocabulary still recognized only for normalization

These values are legacy inputs, not canonical runtime vocabulary:

- `camp` -> normalized to `pro`
- `insurance` -> normalized to `institutional`

Special case:

- a legacy `feature_flags.target_tier` shape of `['camp','insurance','institutional']` is treated as the historical "all paid" set and normalized to:
  - `pro`
  - `prime`
  - `institutional`
  - `enterprise`

### Canonical feature-key vocabulary

Representative canonical keys include:

- `readiness_score_live`
- `analytics_dashboard_full`
- `taxonomy_heatmap_full`
- `questions_all_difficulty`
- `questions_unlimited`
- `camp_trails_full_library`
- `blindspot_protocol`
- `endurance_cycle`
- `proof_simulation`
- `3d_lab_full`
- `ai_assistant_unlimited`
- `developer_portal`
- `dev_toolbar`
- `dev_override_write`
- `admin_cms`
- `srs_review`

### Deprecated storage field

`feature_flags.target_roles` still exists in storage, but runtime entitlement logic treats it as deprecated metadata rather than an authoritative gate source.

---

## 5. Storage Model

### Identity and entitlement sources

| Source | Purpose |
| --- | --- |
| `auth.users.app_metadata.role` | role signal |
| `auth.users.user_metadata.role` | secondary role signal |
| `profiles.role` | role signal and compatibility source |
| `user_roles.role` | explicit DB role rows |
| `user_subscriptions.tier` | raw subscription tier |
| `user_subscriptions.status` | active/trialing/inactive semantics |
| `feature_flags` | feature metadata and allowed tier storage |
| `cerebro_dev_flags` | httpOnly developer override cookie |

### Current persistence rules

1. `feature_flags.target_tier` is expected to store canonical values only after the finalization migration.
2. Runtime still normalizes defensively in case a stale environment still contains legacy rows.
3. `target_roles` is not consulted for runtime entitlement allow/deny decisions.
4. Developer overrides are read from an `httpOnly` cookie and never from client-local state alone.

### Migration added during finalization

The finalization migration:

- [20260411_entitlement_finalization.sql](/C:/Users/Philip Lewis/Desktop/slatecamp/supabase/migrations/20260411_entitlement_finalization.sql)

does two things:

1. normalizes stored `feature_flags.target_tier` values to canonical vocabulary
2. documents `target_roles` as deprecated runtime metadata

Seed migrations were also updated to stop describing or storing the old `camp` / `insurance` feature-tier shape.

---

## 6. Role Resolution

### Canonical role resolver

Current authoritative runtime resolver:

- [resolve-role.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/entitlements/resolve-role.ts)

It resolves the current viewer by considering:

1. development forced-user bypass
2. `app_metadata.role`
3. `user_metadata.role`
4. `profiles.role`
5. `user_roles.role`
6. `ADMIN_EMAILS` fallback
7. fallback to `member` or `anonymous`

### Canonical role vocabulary

- `anonymous`
- `member`
- `super_admin`
- `content_admin`
- `sme_reviewer`
- `developer`
- `admin`
- `ceo`

### Compatibility role surface

The remaining admin compatibility facade:

- [roles.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/admin/roles.ts)

delegates to canonical role resolution and remains only to support broad existing imports.

### Important completion note

CEO auth/layout paths no longer depend on `profiles.role` alone. They now route through the canonical role resolver plus CEO policy helper, closing one of the final remaining compatibility drifts.

---

## 7. Policy Layer

### Canonical policy helper surface

Authoritative privileged policy lives in:

- [policy.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/entitlements/policy.ts)

Current policy decisions include:

- developer portal access
- dev toolbar visibility
- dev override write access
- internal tier bypass eligibility
- admin CMS access
- review-content access
- manage-users access
- CEO portal access

### Current effective policy boundaries

| Surface | Canonical policy source |
| --- | --- |
| `/developer` | `canAccessDeveloperPortalForRole()` |
| Dev toolbar | `canSeeDevToolbarForRole()` |
| Dev override write/delete | `canWriteDevOverridesForRole()` |
| Internal tier uplift | `canUseInternalTierBypassForRole()` |
| Admin CMS | `canAccessAdminCmsForRole()` |
| CEO portal | `canAccessCeoPortalForRole()` |

### Remaining compatibility facades

- [access-policy.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/admin/access-policy.ts)
- [is-admin.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/admin/is-admin.ts)

These are non-canonical exports retained for compatibility, not independent policy engines.

---

## 8. Effective Tier and Capabilities

### Effective tier precedence

Current runtime order:

1. `DEV_FORCE_TIER`
2. cookie `simulatedTier`
3. internal-tier-bypass policy
4. local-dev bypass mode
5. raw DB tier

### Capability model

Capability resolution still uses the tier capability matrix in:

- [dev-mode.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/dev/dev-mode.ts)

Key capability outputs include:

- `questionsPerDay`
- `aiTokens`
- `savedConfigs`
- `srsAccess`
- `threeDLabAccess`
- `aiTutorAccess`
- `customBanksAccess`

The `DEV_FORCE_TIER` shortcut is now resolved only through the canonical override boundary, not directly inside the capability engine itself.

---

## 9. Developer Overrides

### Canonical override source

Overrides are parsed in:

- [dev-overrides.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/entitlements/dev-overrides.ts)

Current cookie-backed fields:

- `simulatedTier`
- `spoofedTier` (legacy alias retained for migration compatibility)
- `bypass3dGate`
- `bypassAiGate`
- `bypassSrsGate`

### Canonical override state includes

- simulated tier
- legacy spoofed tier
- forced env tier
- forced-user-active flag
- local-dev-bypass flag
- developer-portal-bypass flag
- feature override map
- source trace

### Override mutation path

Authoritative write/delete route:

- [src/app/api/admin/flags/route.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/app/api/admin/flags/route.ts)

Current properties:

- server-authorized
- `httpOnly` cookie write
- structured override audit events
- canonical entitlement policy for write authorization

---

## 10. Canonical Viewer Payload

### Canonical server payload

The canonical viewer payload is returned by:

- [get-viewer-entitlements.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/entitlements/get-viewer-entitlements.ts)

It includes:

- trace id
- user id / email
- normalized role
- compatibility role
- role resolution trace
- raw tier
- subscription status
- effective tier
- capabilities
- tooling policy snapshot
- override state
- normalized feature flags
- evaluated feature decisions

### Client consumption

Client code can consume the payload through:

- [entitlement-context.tsx](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/context/entitlement-context.tsx)

Dashboard shell still also feeds `TierProvider` for legacy client ergonomics, but the authoritative server-derived entitlement payload exists and is available.

---

## 11. Enforcement Map

### Paid and feature-gated product surfaces now on canonical entitlements

| Surface | Current enforcement path |
| --- | --- |
| 3D Lab gallery | `getViewerEntitlements()` + canonical feature decision |
| 3D Lab module page | same |
| Drills hub | canonical viewer entitlements passed into `ReviewHub` |
| Quiz V2 start session | canonical Pro decision |
| Quiz V2 review history enrichment | canonical Pro decision |
| Study Pods create/list | canonical Pro decision |
| Score reveal | canonical readiness-score decision |
| Daily cap | canonical unlimited-questions decision |
| Dashboard summary state | canonical live-score / unlimited-questions decisions |
| Study streak grace-day logic | canonical unlimited-questions decision |
| Final stretch upsell gating | canonical unlimited-questions decision |
| Welcome Pro | canonical unlimited-questions decision |
| DAE mode state and session limits | canonical unlimited-questions decision |

### Privileged/internal surfaces now on canonical policy

| Surface | Current enforcement path |
| --- | --- |
| `/developer` | canonical developer-portal policy |
| middleware protected routes | canonical role resolution + policy |
| override API | canonical dev-override-write policy |
| CEO layout/auth helpers | canonical role resolution + CEO policy |

### Remaining high-fanout compatibility surfaces

These still exist but are no longer authoritative:

- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/is-admin.ts`

---

## 12. Observability and Auditability

### Canonical entitlement event shape

Entitlement audit events are defined in:

- [types.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/entitlements/types.ts)

Event families include:

- `entitlement.decision`
- `entitlement.denied`
- `entitlement.override.applied`
- `entitlement.override.cleared`
- `tooling.access`
- `tooling.override.write`
- `tooling.override.delete`
- `entitlement.config.mismatch`

### Audit sink

Current logging module:

- [audit.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/src/lib/entitlements/audit.ts)

Behavior:

1. emits structured console events for immediate runtime visibility
2. persists non-middleware entitlement events through `analytics_events` using the service-role client

### Important live coverage

Structured entitlement events now emit from:

- middleware privileged-route decisions
- override write/delete route
- quiz-v2 Pro gating
- paywall daily cap
- paywall score reveal
- pods Pro gate
- final stretch gate
- checkout gate
- blindspot cron summary decision
- feature-flag config mismatch handling in viewer entitlement resolution

---

## 13. Governance

### Banned-pattern detector

Repository guard:

- [check-entitlement-legacy-usage.ts](/C:/Users/Philip Lewis/Desktop/slatecamp/scripts/check-entitlement-legacy-usage.ts)

Command:

- `bun run check:entitlements`

### Guarded patterns

The detector blocks new:

- raw `tier === 'free'` / `tier !== 'free'` product/runtime gating
- direct runtime `target_tier` interpretation outside canonical normalization
- direct entitlement-affecting env usage outside the canonical override/identity boundary
- privileged gating by `getUserRole()` truthiness

This guard is now part of the live completion path for entitlement work.

---

## 14. Removed Legacy Engines

Removed during finalization:

- `src/lib/admin/feature-flags.ts`
- `src/lib/admin/get-admin-profile.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/subscription/get-tier.ts`
- `src/lib/actions/feature-flags.ts`

These are no longer available as runtime alternatives.

---

## 15. Compatibility Facades Still Present

Still present by design:

- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/is-admin.ts`

Current role:

- compatibility import surface
- thin delegation to canonical role/policy logic
- not an alternative entitlement engine

Open question:

- whether these should remain permanently as compatibility facades or be removed in a later broad import cleanup

---

## 16. Verification Evidence

Validated in the execution reports:

- targeted entitlement/admin regression suite passes
- `bun run check:entitlements` passes
- `bun run type-check` passes
- `bun run build` passes
- targeted `eslint` on changed entitlement files passes

Current caveat:

- repo-wide `bun run lint` is still red because of unrelated pre-existing vendor/static issues outside the entitlement work

---

## 17. Current Known Caveats

1. `feature_flags.target_roles` still exists in storage as deprecated metadata.
2. The remaining admin compatibility facades still exist for import stability.
3. Route-level tests for some handlers such as checkout and blindspot cron are still lighter than the core contract tests.
4. External architect/verifier subagent sign-off was blocked by usage/time limits during execution, so the completion evidence is repo-grounded and test/build-backed rather than tool-signed.

---

## 18. Source Inventory

Primary code sources for this document:

- `src/lib/entitlements/*`
- `src/lib/context/entitlement-context.tsx`
- `src/lib/admin/{roles,access-policy,is-admin}.ts`
- `src/lib/actions/{quiz-v2/start-session,quiz-v2/get-review-data,pods,streak,dashboard-page,final-stretch,dae-mode}.ts`
- `src/lib/paywall/{daily-cap,score-reveal,index}.ts`
- `src/lib/queries/ceo/{auth,financial-queries}.ts`
- `src/app/api/{admin/flags,cron/blindspot-scan,payments/checkout}/route.ts`
- `src/app/dashboard/{3d-lab,drills,pods,settings,welcome-pro,dae-mode}/`
- `src/components/{dashboard,dev,sidebar,testing}/`
- `supabase/migrations/20260411_entitlement_finalization.sql`
- `.ai/plans/2026-04-11_Enterprise-Grade-Feature-Gate-Execution-Report.md`
- `.ai/plans/2026-04-11_Entitlement-Migration-Ledger.md`

---

## 19. Change History

### 2026-04-12 update

This version updates the document from the earlier mixed-state migration snapshot to the post-finalization state:

- canonical entitlement boundary fully documented
- legacy runtime engines marked removed
- remaining compatibility facades explicitly narrowed
- storage normalization and audit persistence documented
- CEO and DAE entitlement drift fixes incorporated
- governance and verification evidence updated

### Related docs

- [008-3d-lab-feature-specification.md](008-3d-lab-feature-specification.md)
- [009-admin-feature-specification.md](009-admin-feature-specification.md)
- [2026-04-11_Enterprise-Grade-Feature-Gate-Execution-Report.md](</C:/Users/Philip Lewis/Desktop/slatecamp/.ai/plans/2026-04-11_Enterprise-Grade-Feature-Gate-Execution-Report.md>)
- [2026-04-11_Entitlement-Migration-Ledger.md](</C:/Users/Philip Lewis/Desktop/slatecamp/.ai/plans/2026-04-11_Entitlement-Migration-Ledger.md>)

---

*End of specification. This document reflects the live post-finalization entitlement and developer-tooling architecture as verified on 2026-04-12.*
