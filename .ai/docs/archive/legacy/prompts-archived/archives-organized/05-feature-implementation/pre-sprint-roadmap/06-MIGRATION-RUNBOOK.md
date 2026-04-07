# SlateCamp — Migration Runbook
## Safe Database Migration Protocol for Live Production
### 2026-03-26

---

## Purpose

17 migrations (039–055) are planned against a live Supabase database with real user data. This document defines how to test, apply, verify, and roll back migrations safely. The most dangerous migration in the plan is the `snapshot_readiness_on_session_complete` trigger modification (Feature 5) — if it breaks, every user's readiness score stops updating silently.

---

## Tooling

| Tool | Command | Purpose |
|---|---|---|
| Supabase CLI | `supabase` | Local dev, migrations, type generation |
| Local Supabase | `supabase start` / `supabase stop` | Local PostgreSQL instance for testing |
| Migration push | `supabase db push` | Apply migrations to linked project |
| Type generation | `npx supabase gen types typescript --local > src/types/database.ts` | Regenerate TypeScript types after schema changes |
| DB dump | `supabase db dump` | Export current schema for reference |

---

## Migration File Convention

```
supabase/migrations/
├── 20260326_039_add_theta_to_user_global_stats.sql
├── 20260326_040_create_user_streaks.sql
├── 20260327_041_create_heatmap_snapshots.sql
└── ...
```

**Naming format:** `YYYYMMDD_NNN_short_description.sql`
- `YYYYMMDD` — date created
- `NNN` — sequential migration number (matches roadmap numbering 039–055)
- `short_description` — snake_case, describes the change

---

## Pre-Migration Checklist (EVERY Migration)

Run this checklist before applying ANY migration to production:

### 1. Backup
```bash
# Create a point-in-time backup via Supabase dashboard
# Dashboard → Settings → Database → Backups → Create backup

# OR dump the specific tables being modified
pg_dump -h db.[project-ref].supabase.co -U postgres \
  -t {table_name} \
  --data-only \
  -f backup_{table_name}_$(date +%Y%m%d).sql
```

**Rule:** Never apply a migration without a backup taken within the last hour.

### 2. Test Locally
```bash
# Start local Supabase
supabase start

# Apply the migration locally
supabase db push

# Verify: no errors
# Verify: schema matches expectations
supabase db dump --local > /tmp/local_schema.sql

# Run the application against local DB
bun run dev
# Test the feature that depends on this migration
```

### 3. Review the SQL
Before applying, read the migration file line by line:

- [ ] All `CREATE TABLE` statements have `ENABLE ROW LEVEL SECURITY`
- [ ] All new tables have appropriate RLS policies
- [ ] All new FK columns have indexes
- [ ] All `NOT NULL` columns have `DEFAULT` values
- [ ] No `DROP TABLE` or `DROP COLUMN` statements (use soft deprecation)
- [ ] No `DELETE FROM` statements (data preservation)
- [ ] `updated_at` trigger added if new table has `updated_at` column
- [ ] JSONB columns have reasonable defaults (not bare `NULL` if they'll be read without null checks)

### 4. Assess Risk Level

| Risk Level | Criteria | Protocol |
|---|---|---|
| **LOW** | Additive only: new tables, new columns with defaults, new indexes | Apply during low-traffic window. No rollback plan needed beyond backup. |
| **MEDIUM** | Modifying existing columns, adding constraints, changing defaults | Apply during low-traffic window. Prepare rollback SQL. Monitor for 1 hour. |
| **HIGH** | Modifying triggers, altering functions, changing RLS policies, adding NOT NULL without default | Apply during maintenance window (2-4 AM PHT). Prepare rollback SQL. Monitor for 4 hours. Notify users if possible. |
| **CRITICAL** | Anything touching `snapshot_readiness_on_session_complete`, `user_interactions` trigger, or mastery computation | Full maintenance window. Tested locally AND on a staging project clone. Rollback SQL prepared and tested. One developer watching production for 8 hours. |

---

## Migration Risk Assessment: Planned Migrations

| # | Migration | Risk | Rationale |
|---|---|---|---|
| 039 | `ALTER user_global_stats ADD theta FLOAT DEFAULT 0.0` | LOW | Additive column with default |
| 040 | `CREATE user_streaks` | LOW | New table |
| 041 | `CREATE heatmap_snapshots` | LOW | New table |
| 042 | `CREATE notification_preferences` | LOW | New table |
| 043 | `CREATE reengagement_emails` | LOW | New table |
| 044 | `CREATE referral_codes + referral_conversions` | LOW | New tables |
| 045 | `CREATE study_schedule` | LOW | New table |
| 046 | `CREATE campfire_threads + campfire_replies + campfire_votes` | LOW | New tables |
| 047 | `CREATE passer_profiles + hall_of_passers` | LOW | New tables |
| 048 | `CREATE exam_outcomes` | LOW | New table |
| 049 | `CREATE nps_responses` | LOW | New table |
| 050 | `CREATE user_consents` | LOW | New table |
| 051 | `CREATE guarantee_tracking` | LOW | New table |
| 052 | `CREATE institutions + institution_memberships + institution_licenses` | LOW | New tables |
| 053 | `CREATE brand_configs` | LOW | New table |
| 054 | `ALTER wiki_articles ADD search_vector + GIN index` | MEDIUM | Altering existing table, adding generated column. GIN index creation may lock table briefly. |
| 055 | `CREATE MATERIALIZED VIEW activation_funnel` | MEDIUM | MATERIALIZED VIEW creation — verify it doesn't block reads. Needs REFRESH strategy. |
| — | **Fix `snapshot_readiness_on_session_complete` trigger** | **🔴 CRITICAL** | Modifying a live trigger that fires on every session completion. If broken, readiness scores stop updating silently. |
| — | Missing index additions (10 indexes) | MEDIUM | `CREATE INDEX CONCURRENTLY` recommended to avoid table locks |

---

## Post-Migration Checklist (EVERY Migration)

After applying a migration to production:

### 1. Verify Schema
```bash
# Regenerate types — confirms schema is as expected
npx supabase gen types typescript --linked > src/types/database.ts

# Compare with expected types
git diff src/types/database.ts
```

### 2. Verify RLS
```sql
-- For each new table, verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('new_table_1', 'new_table_2');
-- rowsecurity should be 'true' for all

-- Verify policies exist
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('new_table_1', 'new_table_2');
```

### 3. Verify Application
```bash
# Rebuild and check for type errors
bun run build
# Should be zero errors

# If the migration adds columns read by existing code,
# test those code paths manually
```

### 4. Monitor (Risk-Appropriate Duration)
- LOW risk: 30 minutes of normal usage
- MEDIUM risk: 1 hour, check error tracking
- HIGH risk: 4 hours, watch Supabase dashboard for query errors
- CRITICAL risk: 8 hours, verify readiness scores are updating for active users

---

## Rollback Procedures

### For Additive Migrations (New Tables/Columns)

Rollback is rarely needed because additive changes don't break existing code. If needed:

```sql
-- Drop a new table (no data loss since it's new)
DROP TABLE IF EXISTS public.new_table CASCADE;

-- Drop a new column
ALTER TABLE public.existing_table DROP COLUMN IF EXISTS new_column;
```

### For Trigger Modifications (CRITICAL)

**Always prepare the rollback BEFORE applying the change.**

For the `snapshot_readiness_on_session_complete` trigger fix:

```sql
-- ROLLBACK: Restore original trigger function
-- Save the ORIGINAL function body before modifying
-- Store in: supabase/migrations/rollback_snapshot_trigger.sql

CREATE OR REPLACE FUNCTION snapshot_readiness_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- ORIGINAL FUNCTION BODY HERE (copy before modifying)
  -- This reverts to the broken-but-stable version
  INSERT INTO readiness_score_snapshots (user_id, score, sub_scores)
  VALUES (NEW.user_id, (
    SELECT global_readiness_score FROM user_global_stats WHERE user_id = NEW.user_id
  ), '{}'::jsonb);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Test the rollback locally before applying the forward migration.**

### For Index Additions

Index creation can be rolled back by dropping the index:
```sql
DROP INDEX IF EXISTS idx_name;
```

However, if the index was created with `CREATE INDEX CONCURRENTLY`, it may have been created as `INVALID` if interrupted. Check:
```sql
SELECT indexname, indisvalid
FROM pg_indexes
JOIN pg_index ON pg_indexes.indexname = pg_index.indexrelid::regclass::text
WHERE tablename = 'table_name';
```

---

## Special Procedures

### Adding Indexes to Large Tables

For tables with 100K+ rows (e.g., `user_interactions`, `quiz_sessions`), use `CONCURRENTLY`:

```sql
-- This does NOT lock the table during creation
CREATE INDEX CONCURRENTLY idx_user_interactions_user_id
  ON public.user_interactions(user_id);
```

**Note:** `CONCURRENTLY` cannot run inside a transaction. If using Supabase migrations, you may need to apply this directly via the SQL editor, not the migration file. Document the manual step.

### Modifying the Sub-Scores Trigger (Feature 5)

This is the highest-risk migration in the entire plan. Follow this exact procedure:

1. **Extract current trigger function body:**
```sql
SELECT prosrc FROM pg_proc WHERE proname = 'snapshot_readiness_on_session_complete';
```

2. **Save to rollback file:** `supabase/migrations/rollback/revert_sub_scores_trigger.sql`

3. **Write the new trigger function** that computes sub-scores (see Five Critical Features doc, Feature 5, Part 1)

4. **Test locally:**
   - Start local Supabase
   - Apply migration
   - Complete a quiz session
   - Verify `readiness_score_snapshots.sub_scores` contains real data, not `{}`
   - Verify the overall `score` is still correct

5. **Test on staging project clone** (if available):
   - Clone the production project to a staging project
   - Apply migration
   - Complete a quiz session
   - Verify same as step 4

6. **Apply to production during 2-4 AM PHT** (lowest traffic)

7. **Monitor for 8 hours:**
   ```sql
   -- Check that new snapshots have populated sub_scores
   SELECT id, user_id, score, sub_scores, created_at
   FROM readiness_score_snapshots
   WHERE created_at > now() - interval '8 hours'
   ORDER BY created_at DESC
   LIMIT 20;
   -- sub_scores should NOT be '{}' for any row after migration
   ```

8. **If sub_scores is still `{}` or errors appear:** Apply rollback immediately.

### Materialized View Refresh Strategy (Migration 055)

```sql
-- Create with initial data
CREATE MATERIALIZED VIEW activation_funnel AS
  -- ... query ...
WITH DATA;

-- Schedule refresh (Supabase cron via pg_cron)
SELECT cron.schedule(
  'refresh_activation_funnel',
  '0 6 * * *',  -- daily at 6 AM PHT
  'REFRESH MATERIALIZED VIEW CONCURRENTLY activation_funnel'
);
```

**Note:** `REFRESH MATERIALIZED VIEW` locks the view during refresh. Use `CONCURRENTLY` (requires a unique index on the view) to allow reads during refresh.

---

## Migration Ordering Dependencies

Some migrations must be applied in order due to FK dependencies:

```
039 (theta) — no dependencies, can apply immediately
040-045 — independent of each other, any order
046 (campfire) — independent
047 (passer) — depends on profiles columns being ready
048 (exam_outcomes) — independent
049-050 — independent
051 (guarantee) — depends on user_subscriptions
052 (institutions) — independent
053 (brand_configs) — depends on 052 (institutions FK)
054 (wiki search_vector) — independent
055 (activation_funnel) — depends on having sufficient data in related tables
```

**Recommended batch order:**
1. **Batch 1 (Phase 1):** 039, missing indexes, trigger fixes
2. **Batch 2 (Phase 2):** 045, 054
3. **Batch 3 (Phase 3):** 040, 041, 042, 043
4. **Batch 4 (Phase 4):** 044, 055
5. **Batch 5 (Phase 5):** 046, 047, passer_stories, community_channels, study_pods
6. **Batch 6 (Phase 7):** 048, 049, 050
7. **Batch 7 (Phase 8):** 051, 052, 053

---

## Emergency Contacts & Escalation

| Situation | Action |
|---|---|
| Migration fails mid-apply | Check Supabase dashboard for partial application. If table was partially created, drop it and retry. |
| Production queries start failing after migration | Check if new NOT NULL constraint was added without DEFAULT. Fix with `ALTER COLUMN SET DEFAULT`. |
| Readiness scores stop updating | Apply sub-scores trigger rollback immediately. |
| Table is locked (long-running index creation) | `SELECT pg_cancel_backend(pid)` on the index creation process. |
| Supabase is down | Wait. Do not attempt local workarounds against production. |

---

*Document version: 2026-03-26*
*Update after each migration is applied — mark as APPLIED with date.*

