# SlateCamp — Schema Verification, Constraint Fixes, and Full Regeneration
## The Doc Drifted From Production. Verify, Fix, Regenerate.

---

## THE PROBLEM

The last `DATABASE_SCHEMA.sql` regeneration dropped content. The doc no longer matches production. Specifically:

1. **2 tables missing entirely** — `user_roles` and `audit_logs` exist in production but aren't in the doc
2. **Status columns missing** — `wiki_articles` and `models_3d` had columns added by migrations 005/006 (`status`, `reviewed_by`, `reviewed_at`, etc.) that aren't in the doc
3. **Entire INDEXES section gone** — 20+ indexes exist in production, zero appear in the doc
4. **5 UNIQUE constraints on trail tables may be missing** — the doc doesn't show them, need to verify if they're also missing in production
5. **2 FK references missing** — `user_mastery_history.user_id` and `teach_back_submissions.user_id` may lack `REFERENCES auth.users`
6. **`models_3d.slug` UNIQUE constraint missing** — doc shows `TEXT NOT NULL` without `UNIQUE`

**Some of these may be doc-only gaps (production is fine). Some may be real production gaps.** Phase 1 verifies which is which. Phase 2 fixes production. Phase 3 regenerates the doc correctly.

---

## TOOLS

- **Supabase MCP** — Every verification query and every fix runs through this. This is a database-only prompt.

---

## PHASE 1: Verify Production State (Read-Only — 1 Batch)

Run ALL of these via Supabase MCP. These determine what's a doc gap vs a real production gap.

```sql
-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION: What actually exists in production?
-- ═══════════════════════════════════════════════════════════════

-- 1. Do user_roles and audit_logs tables exist?
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_roles', 'audit_logs')
ORDER BY table_name;

-- 2. What columns do user_roles and audit_logs have?
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('user_roles', 'audit_logs')
ORDER BY table_name, ordinal_position;

-- 3. Wiki articles — does it have status columns from migration 005?
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'wiki_articles'
ORDER BY ordinal_position;

-- 4. Models_3d — does it have status columns from migration 006?
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'models_3d'
ORDER BY ordinal_position;

-- 5. Models_3d.slug — is it UNIQUE?
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'models_3d' AND constraint_type = 'UNIQUE';

-- 6. ALL UNIQUE constraints on trail tables
SELECT tc.table_name, tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('trail_days', 'trail_steps', 'user_trail_enrollments', 'user_trail_progress', 'trail_day_completions')
AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- 7. FK references on user_mastery_history and teach_back_submissions
SELECT tc.table_name, tc.constraint_name, kcu.column_name,
  ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name IN ('user_mastery_history', 'teach_back_submissions')
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;

-- 8. ALL indexes in production (the section entirely missing from the doc)
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 9. ALL triggers (to verify audit triggers from migration 007 exist)
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. ALL functions (to verify audit_trigger_function and has_admin_role exist)
SELECT routine_name, data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 11. ALL RLS policies (complete, for doc regeneration)
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 12. Audit triggers specifically
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name ILIKE '%audit%';

-- 13. has_admin_role function
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'has_admin_role';

-- 14. Row counts for context
SELECT schemaname, relname as table_name, n_live_tup as estimated_rows
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

**Output:** A complete truth table:

```
| Item | In Doc? | In Production? | Action Needed |
|------|---------|----------------|---------------|
| user_roles table | ❌ | ? | Doc gap / Create |
| audit_logs table | ❌ | ? | Doc gap / Create |
| wiki_articles.status | ❌ | ? | Doc gap / ALTER |
| models_3d.status | ❌ | ? | Doc gap / ALTER |
| models_3d.slug UNIQUE | ❌ | ? | Doc gap / ADD CONSTRAINT |
| trail_days UNIQUE | ❌ | ? | Doc gap / ADD CONSTRAINT |
| trail_steps UNIQUE | ❌ | ? | ... |
| user_trail_enrollments UNIQUE | ❌ | ? | ... |
| user_trail_progress UNIQUE | ❌ | ? | ... |
| trail_day_completions UNIQUE | ❌ | ? | ... |
| user_mastery_history.user_id FK | ❌ | ? | ... |
| teach_back_submissions.user_id FK | ❌ | ? | ... |
| Indexes section | ❌ | ? | ... |
| Audit triggers | ❌ | ? | ... |
```

**STOP.** "Phase 1 Complete. Here's what's in production vs what's in the doc. [X] items are doc-only gaps, [Y] items need production fixes. Reply 'Proceed.'"

---

## PHASE 2: Fix Production Gaps

Based on Phase 1 results, run ONLY the statements for items that are MISSING FROM PRODUCTION. Skip anything that already exists.

### File: `supabase/migrations/YYYYMMDDHHMMSS_constraint_and_structural_fixes.sql`

```sql
-- ============================================================
-- SlateCamp: Constraint and Structural Fixes
-- Fixes production gaps found by comparing doc vs live schema.
-- All statements guarded. Safe to run multiple times.
-- ============================================================


-- ── UNIQUE CONSTRAINTS ON TRAIL TABLES ────────────────────────
-- These prevent duplicate enrollments, duplicate day completions,
-- and duplicate step credits under concurrent writes.
-- The Camp Trail logic depends on idempotent upserts against these.
-- SKIP any that Phase 1 query #6 confirmed already exist.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'trail_days' AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%trail_id_day_number%'
  ) THEN
    ALTER TABLE public.trail_days
      ADD CONSTRAINT uq_trail_days_trail_day UNIQUE (trail_id, day_number);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'trail_steps' AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%day_id_step_order%'
  ) THEN
    ALTER TABLE public.trail_steps
      ADD CONSTRAINT uq_trail_steps_day_order UNIQUE (day_id, step_order);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_trail_enrollments' AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%user_id_trail_id%'
  ) THEN
    ALTER TABLE public.user_trail_enrollments
      ADD CONSTRAINT uq_trail_enrollments_user_trail UNIQUE (user_id, trail_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_trail_progress' AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%enrollment_id_step_id%'
  ) THEN
    ALTER TABLE public.user_trail_progress
      ADD CONSTRAINT uq_trail_progress_enrollment_step UNIQUE (enrollment_id, step_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'trail_day_completions' AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%enrollment_id_day_id%'
  ) THEN
    ALTER TABLE public.trail_day_completions
      ADD CONSTRAINT uq_trail_day_completions_enrollment_day UNIQUE (enrollment_id, day_id);
  END IF;
END $$;


-- ── MODELS_3D.SLUG UNIQUE ─────────────────────────────────────
-- SKIP if Phase 1 query #5 confirmed it already exists.

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'models_3d' AND constraint_type = 'UNIQUE'
  ) THEN
    ALTER TABLE public.models_3d
      ADD CONSTRAINT uq_models_3d_slug UNIQUE (slug);
  END IF;
END $$;


-- ── MISSING FOREIGN KEYS ──────────────────────────────────────
-- SKIP any that Phase 1 query #7 confirmed already exist.

-- user_mastery_history.user_id → auth.users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'user_mastery_history'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE public.user_mastery_history
      ADD CONSTRAINT fk_mastery_history_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- teach_back_submissions.user_id → auth.users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'teach_back_submissions'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
  ) THEN
    ALTER TABLE public.teach_back_submissions
      ADD CONSTRAINT fk_teach_back_user
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;


-- ── MISSING STATUS COLUMNS (if not in production) ─────────────
-- SKIP if Phase 1 queries #3 and #4 confirmed they already exist.

-- wiki_articles status columns (from migration 005)
ALTER TABLE public.wiki_articles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewer_comments TEXT;

-- models_3d status columns (from migration 006)
ALTER TABLE public.models_3d
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
```

**Verify after running:**
```sql
-- UNIQUE constraints
SELECT tc.table_name, tc.constraint_name
FROM information_schema.table_constraints tc
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_name IN ('trail_days', 'trail_steps', 'user_trail_enrollments', 'user_trail_progress', 'trail_day_completions', 'models_3d')
ORDER BY tc.table_name;
-- Should return 6 rows

-- FKs
SELECT tc.table_name, kcu.column_name, ccu.table_name as ref_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_name IN ('user_mastery_history', 'teach_back_submissions')
AND tc.constraint_type = 'FOREIGN KEY'
AND kcu.column_name = 'user_id';
-- Should return 2 rows, both referencing auth.users

-- Status columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'wiki_articles' AND column_name IN ('status', 'reviewed_by', 'reviewed_at', 'reviewer_comments');
-- Should return 4 rows

SELECT column_name FROM information_schema.columns
WHERE table_name = 'models_3d' AND column_name IN ('status', 'metadata', 'reviewed_by', 'reviewed_at');
-- Should return 4 rows
```

**STOP.** "Phase 2 Complete. Production constraints fixed. Reply 'Proceed' for full doc regeneration."

---

## PHASE 3: Regenerate DATABASE_SCHEMA.sql Correctly

This is the critical phase. The previous regeneration tool missed ALTER TABLE changes and the entire indexes section. This time, query EVERYTHING from production and write the complete doc.

### Run the full extraction queries:

```sql
-- A. All tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- B. All columns for every table
SELECT t.table_name, c.column_name, c.data_type, c.udt_name,
  c.is_nullable, c.column_default, c.character_maximum_length
FROM information_schema.tables t
JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- C. All primary keys
SELECT tc.table_name, kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- D. All foreign keys
SELECT tc.table_name, kcu.column_name,
  ccu.table_name AS referenced_table, ccu.column_name AS referenced_column,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- E. All UNIQUE constraints
SELECT tc.table_name, tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- F. All CHECK constraints
SELECT tc.table_name, tc.constraint_name, cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK' AND tc.table_schema = 'public'
AND tc.constraint_name NOT LIKE '%_not_null'
ORDER BY tc.table_name;

-- G. ALL INDEXES (the section that was entirely missing)
SELECT tablename, indexname, indexdef
FROM pg_indexes WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- H. All triggers
SELECT trigger_name, event_manipulation, event_object_table, action_timing, action_statement
FROM information_schema.triggers WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- I. All functions
SELECT routine_name, data_type as return_type
FROM information_schema.routines WHERE routine_schema = 'public'
ORDER BY routine_name;

-- J. All RLS policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- K. All enums
SELECT t.typname as enum_name, e.enumlabel as enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- L. Column comments (for deprecated markers)
SELECT c.table_name, c.column_name, pgd.description
FROM information_schema.columns c
JOIN pg_catalog.pg_statio_user_tables st ON st.relname = c.table_name
JOIN pg_catalog.pg_description pgd ON pgd.objoid = st.relid
  AND pgd.objsubid = c.ordinal_position
WHERE c.table_schema = 'public' AND pgd.description IS NOT NULL
ORDER BY c.table_name, c.ordinal_position;

-- M. Row counts
SELECT relname as table_name, n_live_tup as estimated_rows
FROM pg_stat_user_tables WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### Write the complete DATABASE_SCHEMA.sql

Using ONLY the query results above, generate the full file. Follow this structure:

```sql
-- ============================================================
-- SlateCamp — Complete Database Schema
-- Regenerated from live Supabase instance: [TODAY'S DATE]
-- ============================================================
--
-- This file is DOCUMENTATION, not a migration.
-- It reflects the exact state of the production database.
--
-- [X] tables · [X] enums · [X] functions · [X] triggers · [X] policies
-- ============================================================

-- ENUMS
-- (from query K)

-- TABLES (grouped logically)
--   Core: disciplines, taxonomy_tree, profiles
--   Content: questions, wiki_articles, wiki_article_taxonomy, models_3d, spatial_hotspots
--   Quiz Engine: quiz_sessions, user_interactions
--   Mastery: user_node_mastery, user_mastery_history, user_global_stats,
--            readiness_score_snapshots, user_computed_signals
--   Trails: camp_trails, trail_days, trail_steps, user_trail_enrollments,
--           user_trail_progress, trail_day_completions, session_trail_credits
--   Notes: note_folders, notes
--   Organizations: organizations, organization_members
--   Billing: user_subscriptions
--   Analytics: analytics_events, exam_outcomes
--   Blindspot: blindspot_queues
--   Teach-Back: teach_back_submissions, topic_teach_back_criteria
--   Admin: user_roles, audit_logs       ← MUST NOT BE MISSING THIS TIME
--   Feature Management: feature_flags

-- INDEXES (from query G — THE ENTIRE SECTION)
--   Group by table, include full CREATE INDEX statement

-- TRIGGERS (from query H)

-- FUNCTIONS (from query I)

-- RLS POLICIES (from query J)
--   Group by table

-- COLUMN COMMENTS (from query L — deprecated markers)

-- TABLE STATISTICS (from query M)

-- RELATIONSHIPS DIAGRAM (update to include user_roles, audit_logs)
```

**CRITICAL RULES FOR THE REGENERATION:**

1. **Every table from query A must appear.** If a table exists in production, it goes in the doc. Period. This is how `user_roles` and `audit_logs` got dropped last time — the tool skipped them.

2. **Every column from query B must appear on its table.** This is how `wiki_articles.status` and `models_3d.metadata` got dropped — ALTER TABLE additions were invisible to the previous tool.

3. **The INDEXES section must exist.** Query G returns the full `CREATE INDEX` statement for every index. Include ALL of them. This section was entirely missing from the last regeneration.

4. **UNIQUE constraints must appear on the CREATE TABLE** as inline `UNIQUE` or as separate constraint lines. Pull from query E.

5. **Foreign keys must appear on the CREATE TABLE** as `REFERENCES` clauses. Pull from query D. Include `ON DELETE` rules.

6. **CHECK constraints must appear.** Pull from query F.

7. **The header counts must be accurate.** Count tables from A, enums from K, functions from I, triggers from H, policies from J.

### Find and overwrite the existing file:

```bash
find . -name "DATABASE_SCHEMA*" -not -path "*/node_modules/*" | head -5
```

Overwrite with the new complete file.

**STOP.** "Phase 3 Complete. DATABASE_SCHEMA.sql fully regenerated from production. All tables, columns, indexes, triggers, and policies captured."

---

## PHASE 4: Final Verification

```sql
-- Count verification: doc header numbers match production
SELECT 'tables' as type, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT 'triggers', COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public'
UNION ALL
SELECT 'policies', COUNT(*) FROM pg_policies WHERE schemaname = 'public'
UNION ALL
SELECT 'functions', COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public'
UNION ALL
SELECT 'indexes', COUNT(*) FROM pg_indexes WHERE schemaname = 'public'
UNION ALL
SELECT 'enums', COUNT(DISTINCT t.typname) FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public';
```

Compare these counts against the header in the newly generated `DATABASE_SCHEMA.sql`. Every number must match.

Also manually verify:
- [ ] `user_roles` table appears in the doc
- [ ] `audit_logs` table appears in the doc
- [ ] `wiki_articles` has `status`, `reviewed_by`, `reviewed_at`, `reviewer_comments` columns
- [ ] `models_3d` has `status`, `metadata`, `reviewed_by`, `reviewed_at` columns
- [ ] `models_3d.slug` shows `UNIQUE`
- [ ] All 5 trail tables have their UNIQUE constraints
- [ ] `user_mastery_history.user_id` shows `REFERENCES auth.users`
- [ ] `teach_back_submissions.user_id` shows `REFERENCES auth.users`
- [ ] INDEXES section exists with 20+ entries
- [ ] Audit triggers appear in the triggers section
- [ ] `has_admin_role()` and `audit_trigger_function()` appear in functions section
- [ ] Deprecated column comments on `user_global_stats` are documented

**STOP.** "Phase 4 Complete. Schema doc verified against production. Zero drift."

---

## WHAT NOT TO DO

- **Don't blindly run Phase 2 ALTER statements.** Phase 1 determines which are needed. If a constraint already exists in production, adding it again will error (even with the DO $$ guard, verify first).
- **Don't manually write the DATABASE_SCHEMA.sql.** Query production and generate from results. The entire point is that the doc reflects reality, not what we THINK reality is.
- **Don't skip the indexes section again.** Query G returns complete `CREATE INDEX` statements. Include every single one.
- **Don't skip user_roles and audit_logs.** These tables exist because RLS policies reference `has_admin_role()` which queries `user_roles`. If the doc omits them, the next developer won't understand why admin writes work.
- **Don't change the admin check inconsistency in this migration.** The audit notes that `topic_teach_back_criteria` uses `raw_app_meta_data` while other tables use `has_admin_role()`. That's a future standardization task. Document it as a `-- TODO` comment in the RLS section, don't fix it now.

---

*Execute Phase 1 now. Query production to determine what's real.*
