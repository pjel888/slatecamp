# 01 — Blast-Radius Audit

## Method

Evidence gathered from:

- `.ai/03_plans/legacy-removal-plan.md`
- `.ai/10_state/cleanup-candidate-index.md`
- `.ai/02_audits/scripts-and-supabase-cleanup-audit.md`
- `.ai/00_system/DATA_BOUNDARY_MAP.md`
- source inspection via `rg` and file reads
- GitNexus impact checks

## Important GitNexus caveat

GitNexus impact returned low/zero for several exported arrow-function symbols, but literal import scans show broad live usage. Treat the literal import map as the more conservative blast-radius signal for this cleanup wave.

The one clear GitNexus high-risk signal was:

| Symbol | GitNexus result | Direct d=1 callers shown |
| --- | --- | --- |
| `getUserRole` in `src/lib/admin/roles.ts` | `risk: HIGH`, 9 impacted symbols | `isSuperAdmin`, `getUserRoles`, `src/app/admin/page.tsx:AdminDashboardPage`, `src/app/admin/layout.tsx:AdminLayout` |

## `L5-C02` — admin role compatibility wrappers

### Primary files

- `src/lib/admin/roles.ts`
- `src/lib/entitlements/resolve-role.ts`
- `src/lib/entitlements/policy.ts`
- `src/lib/supabase/middleware.ts`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/lib/audit/audit-queries.ts`
- `src/lib/audit/audit-actions.ts`

### Literal import blast radius

`@/lib/admin/roles` is imported by many admin routes/actions, including:

- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/activity/page.tsx`
- `src/app/admin/pipeline/page.tsx`
- `src/app/admin/reviews/page.tsx`
- `src/app/admin/settings/page.tsx`
- `src/app/admin/knowledge/**`
- `src/lib/actions/admin/**`
- `src/lib/audit/**`
- `src/app/auth/callback/route.ts`

### Current behavior to preserve before replacement

`src/lib/entitlements/resolve-role.ts` currently resolves roles in this order:

1. forced dev user override → `owner`
2. `user_roles` strongest role
3. `profiles.role`
4. `app_metadata.role`
5. `user_metadata.role`
6. `OWNER_EMAILS` / `ADMIN_EMAILS`
7. authenticated fallback → `member`
8. no identity → `anonymous`

Any wrapper migration must preserve the production role precedence intentionally or deliberately change it with tests.

### Risk classification

**High.** A mistake can lock out admins, accidentally grant access, break audit views, or make demo/dev auth behavior diverge from production.

## `L5-C03` — feature flag `target_roles` / legacy tier path

### Primary files

- `src/lib/entitlements/get-viewer-entitlements.ts`
- `src/lib/entitlements/normalize-feature-flag.ts`
- `src/lib/entitlements/normalize-tier.ts`
- `src/lib/entitlements/resolve-entitlements.ts`
- `DATABASE_SCHEMA.sql`
- `src/types/app.ts`
- `src/types/supabase.ts`
- `supabase/migrations/20260411_entitlement_finalization.sql`
- `src/app/api/admin/flags/route.ts`
- `scripts/check-entitlement-legacy-usage.ts`

### Current live behavior

`getViewerEntitlements()` still selects:

```ts
.select('key, enabled, target_tier, target_roles')
```

It logs an entitlement config mismatch when `target_roles` is present and treats it as ignored at runtime.

`normalizeFeatureFlagRecord()` still returns:

- `rawTargetTier`
- `rawTargetRoles`
- `normalizationTrace`
- a legacy paid shape normalization where `camp`, `insurance`, `institutional` maps to all paid tiers when no canonical paid tiers are present.

### Schema/type blast radius

`target_roles` exists in:

- `DATABASE_SCHEMA.sql`
- `src/types/supabase.ts`
- `src/types/app.ts`
- `supabase/migrations/20260411_entitlement_finalization.sql`
- older seed/review migrations

### Surfaces using `getViewerEntitlements()`

- paywall helpers
- CEO access
- developer access/layout
- quiz start/review flows
- dashboard layout and dashboard page actions
- 3D Lab pages
- settings
- pods actions/pages
- admin flags API
- payments checkout route, although payment work is deferred

### Risk classification

**High / schema-sensitive.** Removing `target_roles` from runtime before schema/type regeneration is safe only if reads no longer select it and all tests prove feature access decisions are unchanged.

## `L5-C06` — `pending_review` fallback retirement

### Primary files

- `src/lib/admin/editor-workflow.ts`
- `src/lib/actions/admin/pipeline.ts`
- `src/lib/actions/admin/pipeline.test.ts`
- `src/lib/actions/admin/content.ts`
- `src/lib/actions/admin/wiki.ts`
- `src/lib/admin/editor-workflow.test.ts`
- `supabase/migrations/20260412_normalize_admin_editor_statuses.sql`
- `supabase/migrations/005_add_wiki_content_status.sql`

### Current live behavior

`src/lib/admin/editor-workflow.ts` still defines:

- `LEGACY_REVIEW_STATUS_COMPAT.enabled = true`
- legacy storage value `pending_review`
- `REVIEW_QUEUE_STATUSES = ['review', 'pending_review', 'in_review']`
- `getStatusWriteCandidates('in_review')` returns `['in_review', 'pending_review']`

`src/lib/actions/admin/pipeline.ts` directly retries `pending_review` when canonical `in_review` is rejected by a DB status constraint.

`src/lib/actions/admin/pipeline.test.ts` intentionally behavior-locks that fallback.

### Risk classification

**High for admin content operations.** Removing this fallback before every environment accepts canonical `in_review` can break the review pipeline, admin wiki actions, and content save/status transitions.

## Combined blast-radius conclusion

This wave should be treated as a coordinated high-risk cleanup, not three tiny cleanup PRs. The safest sequence is:

1. Behavior-lock and observe.
2. Remove route/action wrapper usage without changing semantics.
3. Retire runtime ignored `target_roles` reads/logs while leaving schema intact.
4. Prove canonical status constraints everywhere.
5. Remove `pending_review` write fallback.
6. Only later consider schema/type/migration squashing.
