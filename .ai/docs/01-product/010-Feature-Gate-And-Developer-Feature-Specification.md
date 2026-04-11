# Feature Gate And Developer Feature Specification

**Last Updated:** 2026-04-11  
**Status:** Active - Codebase Source of Truth  
**Version:** 1.0 (Comprehensive Codebase-Derived Specification)  
**Audit Source:** `.ai/plans/2026-04-11_Dev-Mode-Audit.md`  
**Cross-References:**  
- [3D Lab Feature Specification](008-3d-lab-feature-specification.md)  
- [Admin CMS Feature Specification](009-admin-feature-specification.md)

> This document is the authoritative specification for SlateCamp's live feature-gate and developer-mode architecture.
> Every claim is derived from and verified against the current codebase as of 2026-04-11.
> This document is intentionally scoped to entitlement behavior, internal developer-mode behavior, and their enforcement layers.
> It is not a pricing catalog, webhook specification, or billing system overview.

---

## 1. Overview and Principles

### Purpose

SlateCamp uses a layered entitlement model that combines:

- subscription tier
- role resolution
- explicit access-policy helpers
- dev-mode cookie overrides
- environment-based local/demo behavior
- feature-specific enforcement in routes, layouts, and server actions

This document defines how those layers work together today.

### Governing Principles

1. **Code-derived only**  
   The system is documented from live code, not intended future policy.

2. **Identity is not policy**  
   Role discovery and entitlement decisions are separate layers.

3. **Internal tooling is not a paid feature**  
   Developer-mode and internal bypass behavior are explicit policy decisions, not accidents of `NODE_ENV`.

4. **Effective tier is the key runtime abstraction**  
   Product gates should prefer effective tier over raw DB tier when internal or simulated overrides are intended.

5. **Residual inconsistency must be documented**  
   Not every entitlement surface is fully unified yet. Remaining raw subscription checks are called out explicitly.

---

## 2. Purpose and Audience

### Primary Audiences

| Audience | Why this doc exists |
|---|---|
| Product / founder | Understand what is actually gated and how internal access works |
| Engineering | Use one reference for entitlement and developer-mode behavior |
| Admin / developer tooling maintainers | Avoid reintroducing raw role and raw tier logic |
| Future auditors | Compare intended architecture to live implementation |

### What this doc covers

- role precedence
- internal access policy
- effective tier resolution
- dev-mode cookie behavior
- DB-backed feature flags
- route/component/server-action gate enforcement
- current developer tooling visibility rules

### What this doc does not cover

- payment provider webhook payloads
- full pricing/checkout UX
- general business plan packaging
- speculative future access systems

---

## 3. Terminology

| Term | Meaning in code |
|---|---|
| **Raw tier** | The user's tier as read from `user_subscriptions` |
| **Effective tier** | The runtime tier after internal bypass, local mode, or dev cookie simulation |
| **Role resolution** | The process of determining the strongest recognized internal role from multiple sources |
| **Internal tier bypass** | Policy that grants elevated effective tier to specific internal roles |
| **Dev flags** | Cookie-backed developer overrides stored in `cerebro_dev_flags` |
| **Feature flags** | DB-backed rows in `feature_flags` used for product gating |
| **Local mode** | `NEXT_PUBLIC_SUPABASE_URL` absent -> `getConnectionState()` returns `local` |
| **Connected mode** | Live Supabase-backed environment |
| **Developer mode** | Internal tooling/visibility system, not the same thing as a paid entitlement |

### Current role vocabulary

The live normalized role union in [`src/lib/admin/roles.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/admin/roles.ts) is:

- `super_admin`
- `content_admin`
- `sme_reviewer`
- `developer`
- `admin`
- `ceo`

`developer`, `admin`, and `ceo` are recognized by runtime role normalization even though not all are represented in `user_roles`.

---

## 4. Storage and Persistence Model

### Identity / entitlement sources

| Source | Type | Purpose |
|---|---|---|
| `auth.users.app_metadata.role` | Supabase auth metadata | Role signal |
| `auth.users.user_metadata.role` | Supabase auth metadata | Secondary role signal |
| `profiles.role` | DB column | Role signal used by some portal logic |
| `user_roles.role` | DB rows | Legacy/admin role rows |
| `user_subscriptions.tier` | DB column | Raw subscription tier |
| `user_subscriptions.status` | DB column | Active/trialing gating status |
| `feature_flags` table | DB table | Product-level feature-flag rules |
| `cerebro_dev_flags` | httpOnly cookie | Simulated tier and bypass flags |

### Current DB tables

From [`DATABASE_SCHEMA.sql`](C:/Users/Philip%20Lewis/Desktop/slatecamp/DATABASE_SCHEMA.sql):

#### `profiles`

Relevant columns:
- `id`
- `role`
- `full_name`
- `display_name`
- `onboarding_completed_at`

#### `user_roles`

Relevant columns:
- `id`
- `user_id`
- `role`
- `created_at`
- `created_by`

#### `user_subscriptions`

Relevant columns:
- `user_id`
- `tier`
- `status`
- `amount`
- `cancelled_at`

#### `feature_flags`

Relevant columns:
- `key`
- `description`
- `enabled`
- `target_tier`
- `target_roles`

### Cookie-backed dev-mode storage

`src/lib/admin/feature-flags.ts` reads a cookie named:

- `cerebro_dev_flags`

The cookie shape maps to `DevModeConfig`:

- `simulatedTier`
- `bypass3dGate`
- `bypassAiGate`
- `bypassSrsGate`

Legacy alias:

- `spoofedTier`

### Persistence boundaries

| Mechanism | Persistence | Scope |
|---|---|---|
| `cerebro_dev_flags` cookie | 7 days | server-readable dev override state |
| Zustand dev store | sessionStorage | client-only overlay/impersonation UI state |
| Supabase role/tier tables | database | persistent identity and entitlement data |

---

## 5. Identity Sources and Role Resolution

### Canonical role resolver

The canonical resolver is [`getUserRole()`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/admin/roles.ts).

It reads the current authenticated user and resolves the strongest recognized role across:

1. `app_metadata.role`
2. `user_metadata.role`
3. `profiles.role`
4. latest `user_roles.role`
5. legacy `ADMIN_EMAILS` fallback

### Recognized role precedence

From `ROLE_PRIORITY` in [`roles.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/admin/roles.ts):

| Role | Priority |
|---|---:|
| `super_admin` | 5 |
| `content_admin` | 4 |
| `developer` | 3 |
| `admin` | 3 |
| `ceo` | 3 |
| `sme_reviewer` | 2 |

### Development impersonation shortcut

If both are true:

- `NODE_ENV === 'development'`
- `DEV_FORCE_USER_ID` is set

then `getUserRole()` returns:

- `super_admin`

This is a local-only founder/developer bypass.

### Why this matters

The previous bug class came from treating `user_roles` as the only meaningful internal-role source. The current runtime model explicitly does not do that anymore.

---

## 6. Policy Layer and Access Helpers

### Canonical policy helpers

The explicit policy layer lives in [`src/lib/admin/access-policy.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/admin/access-policy.ts).

Current helpers:

- `canSeeDevToolbar(role)`
- `canUseInternalTierBypass(role)`

### Current role sets

Both helpers currently allow:

- `super_admin`
- `content_admin`
- `developer`
- `admin`
- `ceo`

Both helpers currently exclude:

- `sme_reviewer`
- `null`

### Important policy note

Even though the two helpers currently use identical role sets, they are intentionally separate APIs because:

- dev-toolbar visibility is a tooling-surface policy
- internal tier bypass is an entitlement-surface policy

Keeping them separate prevents future drift from collapsing back into one informal "internal access" concept.

### Legacy admin/content helpers

`roles.ts` still exports older admin-focused helpers:

- `isAdmin()`
- `isSuperAdmin()`
- `canManageContent()`
- `canReviewContent()`
- `canManageUsers()`

These remain active for admin/CMS authorization and should not be conflated with developer-mode tooling policy.

---

## 7. Tier Model and Effective Tier Resolution

### Canonical runtime tier model

The current `UserTier` union in [`src/types/app.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/types/app.ts) is:

- `free`
- `pro`
- `prime`
- `institutional`
- `enterprise`

### Effective tier runtime logic

`src/lib/admin/feature-flags.ts` exposes:

- `getEffectiveTier(actualTier, isAdmin, flags)`
- `hasTierAccess(requiredTier, actualTier, isAdmin, flags)`

These delegate to [`src/lib/dev/dev-mode.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/dev/dev-mode.ts).

### Effective tier precedence

From `resolveEffectiveTier()` in `dev-mode.ts`:

1. `DEV_FORCE_TIER` in development
2. `simulatedTier` from cookie
3. internal bypass (`isAdmin === true` in the helper signature, now effectively internal-tier-bypass role)
4. local mode default
5. raw DB tier

### Tier rank

Current rank order:

| Tier | Rank |
|---|---:|
| `free` | 0 |
| `pro` | 1 |
| `prime` | 2 |
| `institutional` | 3 |
| `enterprise` | 4 |

### Capability matrix

From `TIER_CAPABILITIES` in `dev-mode.ts`:

| Tier | 3D Lab | SRS | AI tutor | Custom banks |
|---|---|---|---|---|
| `free` | No | No | No | No |
| `pro` | Yes | Yes | No | Yes |
| `prime` | Yes | Yes | Yes | Yes |
| `institutional` | Yes | Yes | Yes | Yes |
| `enterprise` | Yes | Yes | Yes | Yes |

### Tier context

[`src/lib/context/tier-context.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/context/tier-context.tsx) exposes:

- raw `tier`
- `effectiveTier`
- `isDevMode`
- `capabilities`
- `hasAccess(requiredTier)`

This is the preferred client-side entitlement shape when the server has already computed effective tier.

---

## 8. Feature Flag and Dev Flag Architecture

### Two different flag systems exist

#### A. DB-backed product feature flags

Defined by the `feature_flags` table and read via [`src/lib/paywall/check-access.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/paywall/check-access.ts).

These flags are product-facing and usually check:

- `feature_flags.enabled`
- `feature_flags.target_tier`
- current subscription tier/status

#### B. Cookie-backed internal dev flags

Defined in [`src/lib/dev/dev-mode.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/dev/dev-mode.ts) and read via [`src/lib/admin/feature-flags.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/admin/feature-flags.ts).

These control:

- simulated tier
- 3D Lab gate bypass
- AI gate bypass
- SRS gate bypass

### Static payment master switch

[`src/lib/constants/feature-flags.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/constants/feature-flags.ts) defines:

- `FEATURE_PAYMENTS_ENABLED`

If false, paywall logic in `check-access.ts` short-circuits open or free behavior depending on the helper.

### Seeded DB feature keys

From historical migrations, especially:

- `supabase/migrations/020_populate_feature_flags.sql`
- `supabase/migrations/20260325_testing_review_schema_gaps.sql`

Observed keys include:

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

Also older/system keys:

- `paywall_enabled`
- `storm_mode_enabled`
- `proof_simulation_enabled`
- `endurance_mode_enabled`
- `custom_session_enabled`
- `subject_mode_enabled`
- `focus_review_enabled`
- `chill_mode_enabled`
- `ai_tutor_enabled`
- `calibration_enabled`

### Important inconsistency

The DB `feature_flags` seeds in old migrations still use legacy tier names like:

- `camp`
- `insurance`
- `institutional`

The live TypeScript tier model no longer uses `camp` or `insurance`.

This is part of the historical residual debt and should be documented, not normalized away in prose.

---

## 9. Gate Decision Flows

### Canonical internal/dev flow

```text
Supabase session
-> getUserRole()
-> policy helper (canSeeDevToolbar / canUseInternalTierBypass)
-> getFeatureFlags() from cookie
-> getEffectiveTier()
-> route/page/action enforcement
```

### Canonical DB-backed paywall flow

```text
Supabase session
-> user_subscriptions.tier + status
-> feature_flags row by key
-> target_tier.includes(userTier)
-> allow or deny
```

### Current reality

The codebase uses both flows today:

- internal/dev surfaces increasingly use the explicit policy + effective-tier path
- older product paywall helpers still use raw subscription status/tier checks

This is intentional to document as mixed-state architecture, not complete unification.

---

## 10. Product Feature Gates by Surface

### A. 3D Lab

Primary enforcement:

- [`src/app/dashboard/3d-lab/page.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/app/dashboard/3d-lab/page.tsx)
- [`src/app/dashboard/3d-lab/[moduleId]/page.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/app/dashboard/3d-lab/%5BmoduleId%5D/page.tsx)

Gate model:

- `hasTierAccess('pro', profile.tier, profile.hasInternalTierBypass, flags)`
- `flags.bypass3dGate` short-circuit

Restricted-state copy source:

- [`src/features/3d-lab/gate-copy.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/features/3d-lab/gate-copy.ts)

### B. Drills hub / testing hub

Primary entry:

- [`src/app/dashboard/drills/page.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/app/dashboard/drills/page.tsx)
- [`src/components/testing/hub/ReviewHub.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/components/testing/hub/ReviewHub.tsx)

Current model:

- server passes `effectiveTier`
- server passes `hasInternalTierBypass`
- client no longer invents dev-mode paid access from `NODE_ENV`

### C. Quiz session creation

Primary enforcement:

- [`src/lib/actions/quiz-v2/start-session.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/actions/quiz-v2/start-session.ts)

For Pro-only modes:

- raw subscription tier/status is read
- converted to `actualTier`
- `hasTierAccess('pro', actualTier, canUseInternalTierBypass(role), flags)` determines access

### D. Quiz review enrichments

Primary enforcement:

- [`src/lib/actions/quiz-v2/get-review-data.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/actions/quiz-v2/get-review-data.ts)

Pro-only extras are now gated through the same `hasTierAccess('pro', ...)` path, not raw `NODE_ENV` or raw `tier !== 'free'` logic.

### E. Generic DB-backed paywall features

Primary helper:

- [`src/lib/paywall/check-access.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/paywall/check-access.ts)

This is used for product-level feature gates where `feature_flags.target_tier` is the deciding source.

### F. Score reveal / daily cap

Related helpers still use raw subscription checks:

- `src/lib/paywall/score-reveal.ts`
- `src/lib/paywall/daily-cap.ts`

These are valid live behaviors but are not yet migrated to the new internal-bypass/effective-tier pattern.

### G. Residual raw-tier surfaces

Observed examples still using direct subscription checks include:

- `src/lib/actions/pods.ts`
- `src/lib/actions/dashboard-page.ts`
- `src/lib/actions/streak.ts`
- parts of `src/lib/subscription/get-tier.ts`

These are residual debt surfaces, not part of the fully unified path.

---

## 11. Developer Mode and Internal Tooling

### Root dashboard tooling surfaces

Primary shell:

- [`src/components/dashboard/DashboardLayoutContent.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/components/dashboard/DashboardLayoutContent.tsx)

Mounted when:

- `isDemoMode()` is true, or
- `canSeeDevToolbar(getUserRole())` is true

Current mounted tooling:

- `DevToolbar`
- `DevKeyboardProvider`

### Root-app dev overlays

From [`src/app/layout.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/app/layout.tsx):

- `DevModeOverlay` only renders when `NODE_ENV === 'development'`
- `DemoShell` only renders when `isDemo` is true

These are separate from entitlement policy. They are environment/UI overlays.

### Developer portal

Primary layout:

- [`src/app/developer/layout.tsx`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/app/developer/layout.tsx)

Current behavior:

- if `ALLOW_DEV_PORTAL_BYPASS === 'true'`, bypass allowed
- otherwise requires `getUserRole()` truthiness

This is broader than dev-toolbar access because it keys off any recognized internal role, not specifically `canSeeDevToolbar()`.
This is a current policy divergence, not an accidental mismatch in the implementation.

### DevToolbar behavior

Primary file:

- `src/components/dev/dev-toolbar.tsx`

Capabilities:

- view connection state
- simulate tier
- toggle bypass flags
- reset overrides
- link into developer tools

The toolbar itself is client UI. The ability to mount it is a server-side shell policy.

### API surface for dev flags

Route:

- [`src/app/api/admin/flags/route.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/app/api/admin/flags/route.ts)

Behavior:

- reads/writes `cerebro_dev_flags`
- requires admin authorization outside demo mode
- stores flags as an `httpOnly` cookie

---

## 12. Route and Component Enforcement Map

| Surface | File | Gate type | Source of truth |
|---|---|---|---|
| Dashboard dev toolbar | `src/components/dashboard/DashboardLayoutContent.tsx` | internal tooling visibility | `getUserRole()` + `canSeeDevToolbar()` |
| Developer portal | `src/app/developer/layout.tsx` | internal route gate | `getUserRole()` or `ALLOW_DEV_PORTAL_BYPASS` |
| Admin portal | `src/app/admin/layout.tsx` | role-based content/admin gate | `canReviewContent()` + `getUserRole()` |
| 3D Lab gallery | `src/app/dashboard/3d-lab/page.tsx` | effective-tier gate | `getAdminAwareProfile()` + `hasTierAccess()` |
| 3D Lab module page | `src/app/dashboard/3d-lab/[moduleId]/page.tsx` | effective-tier gate | same as above |
| Drills hub simulations | `src/components/testing/hub/ReviewHub.tsx` | effective-tier + readiness | server-derived props |
| Quiz mode creation | `src/lib/actions/quiz-v2/start-session.ts` | server-action gate | `hasTierAccess()` |
| Quiz review enhancements | `src/lib/actions/quiz-v2/get-review-data.ts` | server-action gate | `hasTierAccess()` |
| Paywall feature keys | `src/lib/paywall/check-access.ts` | DB-backed feature gate | `feature_flags` + `user_subscriptions` |

---

## 13. Server vs Client Enforcement Patterns

### Server-side enforcement

Most critical gates are enforced server-side in:

- routes/pages
- layouts
- server actions
- middleware

Examples:

- auth redirects in middleware
- 3D Lab route gate before render
- Pro-only mode rejection in `startSession`

### Client-side usage

Client components consume already-derived values:

- `effectiveTier`
- `hasInternalTierBypass`
- `capabilities`
- tool visibility booleans

### Historical bug pattern

The major regression class was:

- server and client deriving privilege from different sources
- raw `NODE_ENV` shortcuts in product entitlement code
- raw role/tier interpretation in leaf components

The current architecture is moving away from that, but not every surface is there yet.

---

## 14. Testing and Quiz Entitlement Flows

### Testing mode definitions

From [`src/lib/constants/testing-modes.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/lib/constants/testing-modes.ts):

Modes with `isPro: true` include:

- `subject`
- `focus-review`
- `custom`
- `storm`
- `simulation`
- `endurance`

Modes with `isPro: false` include:

- `camp`
- `chill`
- `article-review`

### Start-session behavior

`startSession()`:

1. parses input
2. checks mode definition
3. if the mode is Pro-only:
   - loads subscription row
   - loads internal role
   - loads dev flags
   - resolves `hasTierAccess('pro', ...)`
4. returns a structured tier error if blocked

### Review enrichment behavior

`getReviewData()` conditionally fetches per-question history only when the current user resolves to effective Pro access.

### Drills hub behavior

`drills/page.tsx` now passes:

- `effectiveTier`
- `hasInternalTierBypass`

into `ReviewHub`, which prevents the client from making its own environment-based paid-mode assumptions.

---

## 15. 3D Lab Gate and Copy Model

### Gate source

3D Lab routes rely on:

- `getAdminAwareProfile()`
- `getFeatureFlags()`
- `hasTierAccess('pro', ...)`

### Copy source

The current restricted-state copy is centralized in:

- [`src/features/3d-lab/gate-copy.ts`](C:/Users/Philip%20Lewis/Desktop/slatecamp/src/features/3d-lab/gate-copy.ts)

Current strings:

- title: `3D Interactive Lab`
- description: available on `Pro, Prime, Institutional, and Enterprise plans`
- CTA: `Upgrade to Pro`

Locked-state workspace copy is also sourced from the same file.

### Historical note

The previous 3D Lab gate copy used legacy plan terms:

- `Camp`
- `Insurance`
- `Institutional`

That wording drift has been removed from the active 3D Lab restricted states.

---

## 16. Environment and Config Dependencies

| Variable / config | Role |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Determines connected vs local mode |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Regular SSR auth client |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin/service access |
| `NEXT_PUBLIC_PAYMENTS_ENABLED` | Enables DB-backed paywall behavior |
| `DEV_FORCE_USER_ID` | Development founder bypass for auth/role |
| `DEV_FORCE_TIER` | Development forced effective tier |
| `ADMIN_EMAILS` | Legacy super-admin fallback |
| `ALLOW_DEV_PORTAL_BYPASS` | Developer portal bypass |
| `cerebro_dev_flags` | dev-mode cookie override state |
| `NEXT_PUBLIC_APP_URL` | affects environment labeling and metadata |

### Middleware behavior

`middleware.ts` adds `x-pathname` to the request for downstream layout logic.

`src/lib/supabase/middleware.ts` handles:

- public route bypass
- demo mode bypass
- `DEV_FORCE_USER_ID` local bypass
- authenticated redirects
- admin route role check against `user_roles`

### Important note

The admin route middleware still checks only `user_roles` for:

- `super_admin`
- `content_admin`
- `sme_reviewer`

This is valid for admin CMS protection, but it is narrower than the broader normalized internal-role model now used for developer-mode and internal tier bypass.

---

## 17. Known Risks, Gaps, and Open Questions

### Confirmed residual debt

1. **Mixed gating models still exist**  
   Some surfaces use:
   - effective tier + policy helpers
   while others still use:
   - raw subscription checks

2. **Legacy migration residue in DB feature flags**  
   Historical seeds still reference old tier labels like `camp` and `insurance`.

3. **Developer portal vs toolbar policy boundary differs**  
   `/developer` currently checks `getUserRole()` truthiness or env bypass, not `canSeeDevToolbar()`.

4. **`getAdminAwareProfile` is broader than the name implies**  
   It now carries a general internal-access payload, not just admin semantics.

### Open questions

- Should `sme_reviewer` ever gain dev-toolbar access?
- Should remaining raw-tier surfaces like pods and dashboard summary paths be migrated to the same effective-tier model?
- Should DB-backed `feature_flags.target_tier` be normalized to the current TypeScript tier vocabulary everywhere?

### NEEDS VERIFICATION

- Whether every historical `feature_flags` row in live environments has already been migrated off legacy tier labels.
- Whether any unscanned feature surfaces outside the audited entitlement paths still contain raw `NODE_ENV` paid-access shortcuts.

---

## 18. Verification Notes and Source Inventory

### Primary code sources used for this document

- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/get-admin-profile.ts`
- `src/lib/admin/feature-flags.ts`
- `src/lib/dev/dev-mode.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/subscription/get-tier.ts`
- `src/lib/context/tier-context.tsx`
- `src/components/dashboard/DashboardLayoutContent.tsx`
- `src/app/dashboard/3d-lab/page.tsx`
- `src/app/dashboard/3d-lab/[moduleId]/page.tsx`
- `src/features/3d-lab/gate-copy.ts`
- `src/app/dashboard/drills/page.tsx`
- `src/components/testing/hub/ReviewHub.tsx`
- `src/lib/actions/quiz-v2/start-session.ts`
- `src/lib/actions/quiz-v2/get-review-data.ts`
- `src/app/quiz/[mode]/setup/client.tsx`
- `middleware.ts`
- `src/lib/supabase/middleware.ts`
- `DATABASE_SCHEMA.sql`
- `supabase/migrations/020_populate_feature_flags.sql`
- `supabase/migrations/20260325_testing_review_schema_gaps.sql`
- `.ai/plans/2026-04-11_Dev-Mode-Audit.md`

### Verification standard

For every named item in this doc:

- helper names were matched to code
- file paths were verified to exist
- cookie and env var names were verified
- current restricted-copy source was verified
- mixed-state debt was left explicit rather than normalized away

---

## 19. Change History and Cross-References

### Recent relevant change window

Key recent work established the current architecture:

- entitlement/developer-mode audit and fix in `.ai/plans/2026-04-11_Dev-Mode-Audit.md`
- new explicit access-policy layer in `src/lib/admin/access-policy.ts`
- effective-tier alignment across:
  - 3D Lab
  - drills hub
  - quiz mode start
  - quiz review enrichments
- 3D Lab restricted copy centralization in `src/features/3d-lab/gate-copy.ts`

### Related docs

- [008-3d-lab-feature-specification.md](008-3d-lab-feature-specification.md)
- [009-admin-feature-specification.md](009-admin-feature-specification.md)
- [2026-04-11_Dev-Mode-Audit.md](</C:/Users/Philip Lewis/Desktop/slatecamp/.ai/plans/2026-04-11_Dev-Mode-Audit.md>)

---

*End of specification. This document is intentionally bounded to the live entitlement and developer-mode architecture as verified on 2026-04-11.*

---

## 20. Canonical Entitlement Contract (2026-04-11 execution update)

The canonical runtime entitlement boundary is now `src/lib/entitlements/`.

Canonical modules:
- `feature-keys.ts` for feature vocabulary
- `resolve-role.ts` for role resolution
- `policy.ts` for privileged policy
- `normalize-tier.ts` and `normalize-feature-flag.ts` for vocabulary normalization
- `dev-overrides.ts` for cookie and env-backed developer overrides
- `resolve-entitlements.ts` for effective tier, capabilities, and feature decisions
- `get-viewer-entitlements.ts` for the canonical server payload
- `audit.ts` for structured allow/deny and override event logging

Compatibility wrappers still exist in:
- `src/lib/admin/roles.ts`
- `src/lib/admin/access-policy.ts`
- `src/lib/admin/feature-flags.ts`
- `src/lib/admin/get-admin-profile.ts`
- `src/lib/paywall/check-access.ts`
- `src/lib/subscription/get-tier.ts`

These wrappers are temporary migration boundaries, not first-class engines.

### Banned patterns

Do not add new:
- raw `subscription.tier === 'free'` or `!== 'free'` checks in product/runtime surfaces
- direct `feature_flags.target_tier` interpretation outside `src/lib/entitlements/normalize-feature-flag.ts`
- privileged route gating by `getUserRole()` truthiness
- direct `DEV_FORCE_*` or `ALLOW_DEV_PORTAL_BYPASS` usage outside the canonical override/identity boundary

Governance check:
- `bun run check:entitlements`
