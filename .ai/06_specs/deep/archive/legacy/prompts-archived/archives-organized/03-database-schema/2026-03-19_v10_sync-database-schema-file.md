# SlateCamp — Sync DATABASE_SCHEMA.sql With Live Database
## Query Supabase. Write the Truth. No Guessing.

---

## ROLE

You are a database documentation engineer. You query the LIVE database via Supabase MCP, extract the complete schema, and write it to `DATABASE_SCHEMA.sql` as the single source of truth. You never guess column names, types, or constraints — you query and document what actually exists.

---

## TASK

Generate a complete, accurate `DATABASE_SCHEMA.sql` file by querying the live Supabase database. This file is documentation — it is NOT a migration. It should read like a blueprint of the entire database at this moment in time.

---

## EXECUTION

### Step 1: Find the existing file

```bash
find . -name "DATABASE_SCHEMA*" -not -path "*/node_modules/*" | head -5
```

Note the path. You'll overwrite this file with the updated version.

### Step 2: Query EVERYTHING from Supabase MCP

Run these queries. Do NOT skip any. Batch them if possible.

```sql
-- A. All tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- B. All columns for every table (the big one)
SELECT
  t.table_name,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default,
  c.character_maximum_length
FROM information_schema.tables t
JOIN information_schema.columns c
  ON c.table_name = t.table_name AND c.table_schema = t.table_schema
WHERE t.table_schema = 'public'
ORDER BY t.table_name, c.ordinal_position;

-- C. All primary keys
SELECT
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- D. All foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS referenced_table,
  ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- E. All check constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
  AND tc.table_schema = 'public'
  AND tc.constraint_name NOT LIKE '%_not_null'
ORDER BY tc.table_name;

-- F. All indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- G. All triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- H. All functions
SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- I. All RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- J. All enums (custom types)
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY t.typname, e.enumsortorder;

-- K. Row counts per table (for context)
SELECT
  schemaname,
  relname AS table_name,
  n_live_tup AS estimated_row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;
```

### Step 3: Write DATABASE_SCHEMA.sql

Using ONLY the query results from Step 2, generate the complete file. Follow this exact format:

```sql
-- ============================================================
-- SlateCamp — Complete Database Schema
-- Auto-generated from live Supabase instance
-- Last updated: [CURRENT DATE AND TIME]
-- ============================================================
--
-- This file is DOCUMENTATION, not a migration.
-- It reflects the exact state of the production database.
-- Do not run this file against the database directly.
--
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────

-- [List every enum type with its values]


-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

-- For each table, write a CREATE TABLE statement that matches
-- the EXACT columns, types, defaults, and constraints found
-- in the query results. Include:
--   - Column name, type, nullable, default
--   - PRIMARY KEY
--   - FOREIGN KEY references
--   - CHECK constraints
--   - Inline comments for non-obvious columns

-- Example format:
-- CREATE TABLE public.quiz_sessions (
--   session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   test_mode TEXT NOT NULL,
--   status TEXT NOT NULL DEFAULT 'in_progress',
--   config JSONB DEFAULT '{}',        -- Session configuration (question count, filters, time limit)
--   score NUMERIC,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );


-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────

-- [List every index with its full CREATE INDEX statement]


-- ────────────────────────────────────────────────────────────
-- TRIGGERS
-- ────────────────────────────────────────────────────────────

-- [List every trigger: name, table, timing, event, function called]


-- ────────────────────────────────────────────────────────────
-- FUNCTIONS
-- ────────────────────────────────────────────────────────────

-- [List every function: name, return type, brief description]


-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY POLICIES
-- ────────────────────────────────────────────────────────────

-- [For each table with RLS enabled, list every policy:
--    name, command (SELECT/INSERT/UPDATE/DELETE), USING clause, WITH CHECK clause]


-- ────────────────────────────────────────────────────────────
-- TABLE STATISTICS (approximate row counts)
-- ────────────────────────────────────────────────────────────

-- [Table name → estimated row count, for context]


-- ────────────────────────────────────────────────────────────
-- RELATIONSHIPS SUMMARY
-- ────────────────────────────────────────────────────────────

-- [ASCII diagram of the core data flow:]
-- disciplines → taxonomy_tree → questions
--                                    ↓
-- auth.users → quiz_sessions → user_interactions → user_node_mastery
--         ↓                                              ↓
--     profiles                              user_mastery_history
--         ↓
--   user_global_stats → readiness_score_snapshots
--         ↓
--   user_subscriptions
--         ↓
--   organizations → organization_members
```

### Step 4: Write the file

Write the complete `DATABASE_SCHEMA.sql` to the path found in Step 1. If no file was found, create it at the project root.

### Step 5: Verify

```bash
# Confirm the file exists and has content
wc -l DATABASE_SCHEMA.sql
head -20 DATABASE_SCHEMA.sql
tail -10 DATABASE_SCHEMA.sql
```

---

## RULES

1. **EVERY column, type, and constraint comes from the Supabase query results.** If a query didn't return it, it doesn't go in the file.
2. **No guessing.** If a foreign key reference is ambiguous, note it with a `-- TODO: verify FK target` comment rather than guessing.
3. **Include the timestamp.** The file header must say when it was generated so anyone reading it knows how fresh it is.
4. **Include row counts.** They provide context on table usage and data volume.
5. **Include the relationships diagram.** Update it based on the actual foreign keys found, not the assumed relationships.
6. **Preserve readability.** Group tables logically (auth-related, quiz-related, analytics, billing). Add section headers.

---

## WHEN TO RUN THIS

Run this prompt AFTER any schema migration. It should be the LAST step of any database change workflow. The pattern is:

```
1. Write migration SQL
2. Run migration via Supabase
3. Verify migration succeeded
4. Run THIS prompt to update DATABASE_SCHEMA.sql
```

---

*Execute now. Query the live database and write the file.*
