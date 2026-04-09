# Implementation Plan: user_subscriptions Table & Tier Alignment

**Created:** 2026-04-07
**Status:** Migration created, wiring plan pending execution

## Problem Statement

The `user_subscriptions` table is referenced in **26 files** across the codebase but has no migration file. It exists in `DATABASE_SCHEMA.sql` (reference dump) and was likely created via Supabase dashboard/seed. Additionally, there's a **tier enum mismatch**:

| Source | Values |
|--------|--------|
| DB enum (`subscription_tier`) | `free`, `pro`, `enterprise` |
| App type (`UserTier` in `app.ts`) | `free`, `camp`, `insurance`, `institutional` |
| Dev store presets | `free`, `camp`, `insurance`, `institutional` |
| Webhooks write | Whatever `session.metadata.tier` contains |

## What Was Done (This Session)

### Migration Created: `20260407_user_subscriptions.sql`
- Safe `IF NOT EXISTS` table creation matching `DATABASE_SCHEMA.sql` schema
- Enum extension: added `camp`, `insurance`, `institutional` to `subscription_tier`
- Unique index on `user_id` (required for bootstrap upsert)
- Performance indexes based on query audit (user+status, active-only, cancelled)
- RLS policies (users read own, admins read all, service role for webhooks)
- Updated_at trigger

## Remaining Work (Ordered by Priority)

### Phase 1: Tier Enum Alignment (CRITICAL)

**Problem:** The app uses `UserTier = "free" | "camp" | "insurance" | "institutional"` but the DB enum has `"free" | "pro" | "enterprise"`. Code writes "camp" to a column that only accepts "free/pro/enterprise" — this silently fails or errors.

**Decision Required:** Choose one canonical set of tier names.

| Option | Pros | Cons |
|--------|------|------|
| A: Keep app values (`camp/insurance/institutional`) | Matches UI, dev store, webhook metadata | Requires DB enum update (done in migration) |
| B: Keep DB values (`pro/enterprise`) | Simpler enum | Requires updating 26+ files, dev store presets, webhooks |

**Recommendation:** Option A — the migration already extends the enum. Update `supabase.ts` types after running migration.

**Files to update:**
- `src/types/supabase.ts` — regenerate with `bun run supabase gen types typescript`

### Phase 2: Verify Existing Data (HIGH)

Before relying on the table, verify the live database state:

```sql
-- Check if table exists and has data
SELECT count(*) FROM user_subscriptions;

-- Check what tier values are actually in use
SELECT tier, count(*) FROM user_subscriptions GROUP BY tier;

-- Check for users without subscriptions (bootstrap gaps)
SELECT u.id FROM auth.users u
LEFT JOIN user_subscriptions us ON u.id = us.user_id
WHERE us.user_id IS NULL;
```

### Phase 3: Fix Webhook Tier Values (HIGH)

**Files:**
- `src/app/api/webhooks/lemonsqueezy/route.ts` (line 41)
- `src/app/api/webhooks/payrex/route.ts` (line 37)

Both write `tier` from webhook metadata. Ensure values match the canonical enum:
```typescript
// Validate tier before writing
const VALID_TIERS = ['free', 'camp', 'insurance', 'institutional'] as const
const tier = VALID_TIERS.includes(rawTier) ? rawTier : 'camp'
```

### Phase 4: Update user_capabilities View (MEDIUM)

The `user_capabilities` view (created in `20260407_query_optimization.sql`) currently hardcodes `'free'::TEXT AS subscription_tier`. Update to join with `user_subscriptions`:

```sql
CREATE OR REPLACE VIEW user_capabilities AS
SELECT
  p.user_id,
  p.email,
  COALESCE(us.tier::TEXT, 'free') AS subscription_tier,
  ur.role AS user_role
FROM profiles p
LEFT JOIN user_subscriptions us ON p.user_id = us.user_id
LEFT JOIN user_roles ur ON p.user_id = ur.user_id;
```

### Phase 5: Centralized Tier Provider (LOW)

**Current state:** 17 files independently query `user_subscriptions` for `tier`.
**Improvement:** Create server-side `getUserTier()` cached function (like `getUserRole()` in roles.ts).

```typescript
// src/lib/subscription/get-tier.ts
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getUserTier = cache(async (): Promise<UserTier> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 'free'

  const { data } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  return (data?.tier as UserTier) ?? 'free'
})
```

This replaces scattered queries with a single cached function, similar to how `getUserRole()` works.

### Phase 6: SubscriptionProvider for Client Components (LOW)

**Problem:** Client components like `ReviewHub` receive `userTier` as prop-drilled string.
**Solution:** Create `<SubscriptionProvider>` populated at dashboard layout, consumed via `useTier()` hook.

**Note:** `TierProvider` already exists in `src/lib/context/tier-context.tsx` and accepts `tier` as a prop. The improvement is ensuring it's always populated from the server, not from localStorage.

## Query Pattern Summary (26 Files)

| Pattern | Count | Example Files |
|---------|-------|---------------|
| Read tier for access gating | 11 | paywall/check-access.ts, start-session.ts |
| Read tier for UI display | 4 | dashboard-page.ts, DashboardLayoutContent.tsx |
| Read tier for analytics | 6 | financial-queries.ts, export-actions.ts |
| Write tier (webhook) | 2 | lemonsqueezy/route.ts, payrex/route.ts |
| Write (bootstrap) | 1 | bootstrap.ts |
| Read email prefs | 1 | email-preferences.ts |
| Write email prefs | 1 | email-preferences.ts |

## Acceptance Criteria

- [ ] Migration runs successfully on fresh and existing databases
- [ ] `subscription_tier` enum includes `camp`, `insurance`, `institutional`
- [ ] All 26 files' queries succeed without errors
- [ ] RLS allows users to read own subscription, admins to read all
- [ ] Bootstrap creates subscription for new users
- [ ] Webhooks write valid tier values
- [ ] `supabase.ts` types regenerated to match new enum
