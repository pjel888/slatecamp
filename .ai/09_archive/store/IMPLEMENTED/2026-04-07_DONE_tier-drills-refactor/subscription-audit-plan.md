# Subscription Tier Audit & Consolidation Plan

## 1. Executive Summary

**Current State:**
- Database (`subscription_tier` enum): Contains 6 values: `'free'`, `'pro'`, `'enterprise'`, `'camp'`, `'insurance'`, `'institutional'`
- TypeScript `UserTier` in `src/types/app.ts`: Correctly defines 5 tiers: `"free" | "pro" | "prime" | "institutional" | "enterprise"`
- Pricing constants: Define 4 individual tiers (`free`, `pro`, `prime`, `institutional`) - missing `enterprise`
- Paywall logic: `PAID_TIERS = ['pro', 'prime', 'institutional']` - missing `enterprise`

**Target State:**
- Strict 5-tier model ONLY: `"free" | "pro" | "prime" | "institutional" | "enterprise"`
- All code references, DB enums, and constants must align to this single source of truth

**Critical Issues Found:**
1. **DB Mismatch**: Database has `'camp'` and `'insurance'` which are NOT in the approved 5-tier list
2. **TypeScript Match**: `src/types/app.ts` line 1 defines correct 5 tiers (good!)
3. **Hardcoded 'camp'**: Multiple components incorrectly use `userTier="camp"` - this is a TEST MODE, not a subscription tier
4. **Enterprise Missing**: `PAID_TIERS` and `INDIVIDUAL_TIERS` exclude `enterprise`

---

## 2. Database Action Items

### 2.1 Tables/Columns to Update

| File | Issue | Action |
|------|-------|--------|
| `supabase/migrations/20260407_user_subscriptions.sql` (lines 14-25) | Enum has `'camp'`, `'insurance'` as extra values | **DEPRECATE** - these are invalid tiers |
| `supabase/migrations/019_application_layer_schema.sql` | `feature_flags` table uses `target_tier` ARRAY with invalid values | Update to use only valid tiers |
| `supabase/migrations/020_populate_feature_flags.sql` | Seeds `target_tier` with `'camp','insurance','institutional'` | Update seeds to valid tiers only |
| `supabase/migrations/20260407_query_optimization.sql` | `user_capabilities` view hardcodes `'free'` | Fix view to query actual tier |
| `supabase/01_RESET_AND_SEED.sql` (lines 23-25) | Enum definition `'free', 'pro', 'enterprise'` only - already has correct base | Align to full 5-tier list |

### 2.2 Additional SQL Findings (from audit)

| File | Finding |
|------|---------|
| `feature_flags` table | Uses `target_tier` column (ARRAY) for paywall gating - includes invalid values |
| `user_capabilities` view | Hardcodes `'free'` as subscription_tier - should query actual tier |
| RLS policies | No tier-based checks found in USING clauses - OK |

### 2.2 RLS Policies to Rewrite

| Table | Policy | Status |
|-------|--------|--------|
| `user_subscriptions` | Existing RLS policies check tier indirectly via status | No tier-based RLS found - OK |
| `feature_flags` | No RLS - internal admin table | OK |

### 2.3 Additional SQL Findings (from audit)

| File | Finding |
|------|---------|
| `feature_flags` table | Uses `target_tier` column (ARRAY) for paywall gating - includes invalid values |
| `user_capabilities` view | Hardcodes `'free'` as subscription_tier - should query actual tier |
| RLS policies | No tier-based checks found in USING clauses - OK |

### 2.3 Migration Required

```sql
-- DEPRECATED TIER MIGRATION (DO NOT RUN - FOR AUDIT ONLY)
-- These values must be migrated:
-- 'camp' → 'free' (camp is a TEST MODE, not a subscription tier)
-- 'insurance' → 'institutional' (map to nearest valid tier)

UPDATE user_subscriptions SET tier = 'free' WHERE tier = 'camp';
UPDATE user_subscriptions SET tier = 'institutional' WHERE tier = 'insurance';
```

---

## 3. Codebase Action Items

### 3.1 Types/Interfaces to Refactor

| File | Line | Current | Required Fix |
|------|------|---------|---------------|
| `src/types/app.ts` | 1 | `UserTier = "free" \| "pro" \| "prime" \| "institutional" \| "enterprise"` | **CORRECT** - Single source of truth |
| `src/lib/validations/index.ts` | 78 | `z.enum(["pro", "prime", "institutional"])` | Add `"free"` and `"enterprise"` |
| `src/lib/paywall/check-access.ts` | 27 | `PAID_TIERS = ['pro', 'prime', 'institutional']` | Add `'enterprise'` to PAID_TIERS |

### 3.2 Constants to Update

| File | Issue | Action |
|------|-------|--------|
| `src/lib/constants/pricing.ts` | `INDIVIDUAL_TIERS` missing `'enterprise'` | Add enterprise tier to INDIVIDUAL_TIERS |
| `src/lib/constants/pricing.ts` | Lines 21-97 define 4 tiers | Expand to include all 5 approved tiers |

### 3.3 Middleware/API Routes to Update

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `middleware.ts` | N/A | No tier gating in middleware | Not required - tier checks are in paywall layer |
| `src/app/api/payments/checkout/route.ts` | 27 | `if (tier === "free")` - direct string check | Use `UserTier` type import |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | 90 | Uses `'free'` string literal | Use typed `UserTier` |

### 3.4 UI Components to Update (CRITICAL - 'camp' misuse)

| File | Lines | Issue | Fix |
|------|-------|-------|-----|
| `src/components/3d/Workspace.tsx` | 375 | `userTier="camp"` | WRONG - change to valid tier |
| `src/features/3d-lab/components/ModuleViewer.tsx` | 213, 229 | `userTier="camp"` | WRONG - change to valid tier |
| `src/components/ui/badge.stories.tsx` | 71 | `mode="camp"` | OK - this is TestMode, not tier |

**Note**: `'camp'` is a TEST MODE (`TestMode` enum), NOT a subscription tier. Components using `userTier="camp"` are buggy.

---

## 4. Proposed Execution Steps

### Phase 1: Type Safety First (Prevents Regression)
1. Update `src/lib/validations/index.ts` to include all 5 tiers in z.enum
2. Update `src/lib/paywall/check-access.ts` to include `'enterprise'` in PAID_TIERS
3. Add TypeScript strictness to prevent string literal tier checks

### Phase 2: Constants Alignment
1. Update `src/lib/constants/pricing.ts` to include `'enterprise'` in INDIVIDUAL_TIERS
2. Verify all constant arrays contain exactly the 5 approved tiers

### Phase 3: Component Fixes (Hardcoded 'camp' Removal)
1. Fix `src/components/3d/Workspace.tsx` line 375 - replace `userTier="camp"` with proper tier lookup
2. Fix `src/features/3d-lab/components/ModuleViewer.tsx` lines 213, 229 - replace `userTier="camp"` with proper tier

### Phase 4: Database Migration (If Required)
1. Create migration to remove deprecated `'camp'` and `'insurance'` from enum
2. Migrate existing data: `'camp' → 'free'`, `'insurance' → 'institutional'`
3. Update seed files to only use valid tiers

### Phase 5: Validation
1. Run `bun run type-check` to verify all tier references use `UserTier` type
2. Run `bun run lint` to catch any missed string literal tier usages
3. Verify `bun run build` passes

---

## 5. File Summary

### Files to Modify (8 total)
1. `src/lib/validations/index.ts` - Add missing tiers to enum
2. `src/lib/paywall/check-access.ts` - Add enterprise to PAID_TIERS
3. `src/lib/constants/pricing.ts` - Add enterprise tier
4. `src/components/3d/Workspace.tsx` - Fix userTier="camp" bug
5. `src/features/3d-lab/components/ModuleViewer.tsx` - Fix userTier="camp" bug
6. `src/app/api/payments/checkout/route.ts` - Use typed tier
7. `src/app/api/webhooks/lemonsqueezy/route.ts` - Use typed tier

### Files to Audit Later (Database)
- `supabase/migrations/20260407_user_subscriptions.sql` - Deprecated enum values
- `supabase/migrations/019_application_layer_schema.sql` - feature_flags tier references

---

*Generated: 2026-04-07 | Audit Type: Subscription Tier Consolidation*
