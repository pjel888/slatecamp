# SlateCamp — RLS Policy Patterns & Security Reference
## Row Level Security Conventions · Pre-Implementation Baseline
### 2026-03-26

---

## Purpose

This document defines every RLS pattern used in SlateCamp, establishes naming conventions, provides copy-paste templates for new features, and catalogs all existing policies. Every table in the `public` schema must have RLS enabled. No exceptions.

---

## How to Audit Current RLS State

```sql
-- 1. Find tables WITHOUT RLS enabled (these are security holes)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT tablename FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE c.relrowsecurity = true
  );

-- 2. List ALL RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- 3. Find tables with RLS enabled but NO policies (locked to everyone)
SELECT c.relname
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relrowsecurity = true
  AND c.relname NOT IN (
    SELECT tablename FROM pg_policies WHERE schemaname = 'public'
  );
```

---

## Naming Convention

All RLS policies follow this pattern:

```
"{Subject} can {action} {scope}"
```

Examples:
- `"Users can select own sessions"`
- `"Users can insert own interactions"`
- `"Anyone can read taxonomy"`
- `"Admin can update all articles"`
- `"Authenticated users can read published articles"`
- `"Institution admins can view own institution students"`

Rules:
- Sentence case (capitalize first word only)
- Use "own" for user-scoped data
- Use "all" for admin-scoped data
- Use "published" or other filters when scope is conditional
- One policy per operation per access pattern — don't combine SELECT + UPDATE

---

## Critical Performance Rule

**Always wrap `auth.uid()` in a subselect on high-traffic tables:**

```sql
-- ✅ CORRECT — Postgres caches the result per-statement
USING ((select auth.uid()) = user_id)

-- ❌ WRONG — calls auth.uid() on EVERY ROW
USING (auth.uid() = user_id)
```

On `user_interactions` with 1M+ rows, this is the difference between 2ms and 2000ms. Apply this to **all** user-scoped policies on tables expected to grow large.

Tables that MUST use `(select auth.uid())`:
- `user_interactions`
- `user_node_mastery`
- `user_mastery_history`
- `quiz_sessions`
- `readiness_score_snapshots`
- `srs_schedules`
- `analytics_events`
- All new tables expected to grow with usage (Campfire threads/replies, etc.)

---

## Pattern Templates

### Pattern 1: User-Scoped Data (Most Common)

Use for any table where each user can only see/modify their own rows.

**Tables using this pattern:** `quiz_sessions`, `user_interactions`, `user_node_mastery`, `user_mastery_history`, `readiness_score_snapshots`, `user_global_stats`, `srs_schedules`, `notes`, `note_folders`, `user_trail_enrollments`, `user_trail_progress`, `trail_day_completions`, `blindspot_queues`

```sql
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- SELECT: Users see only their own rows
CREATE POLICY "Users can select own {table_name}"
  ON public.{table_name} FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- INSERT: Users can only insert rows with their own user_id
CREATE POLICY "Users can insert own {table_name}"
  ON public.{table_name} FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE: Users can only update their own rows
CREATE POLICY "Users can update own {table_name}"
  ON public.{table_name} FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- NO DELETE POLICY — use soft delete (archived_at) instead
-- Exception: junction tables where hard delete is acceptable
```

---

### Pattern 2: Public Read-Only Content

Use for reference data that all users (including anonymous) can read but only admins can write.

**Tables using this pattern:** `taxonomy_tree`, `questions`, `disciplines`, `camp_trails`, `trail_days`, `trail_steps`, `models_3d`, `spatial_hotspots`, `feature_flags`

```sql
ALTER TABLE public.{table_name} ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can read (including anonymous users)
CREATE POLICY "Anyone can read {table_name}"
  ON public.{table_name} FOR SELECT
  TO public
  USING (true);

-- No INSERT/UPDATE/DELETE policies for public role
-- Admin writes via service_role key (bypasses RLS entirely)
```

---

### Pattern 3: Published Content Filter

Use for content that has a publish lifecycle — drafts visible only to admins, published content visible to all.

**Tables using this pattern:** `wiki_articles`

```sql
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;

-- SELECT: Anyone can read PUBLISHED articles
CREATE POLICY "Anyone can read published articles"
  ON public.wiki_articles FOR SELECT
  TO public
  USING (status = 'published');

-- SELECT: Admins can read ALL articles (including drafts)
-- This requires an admin check function
CREATE POLICY "Admin can read all articles"
  ON public.wiki_articles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.role = 'admin'
    )
  );

-- INSERT/UPDATE via service_role
```

---

### Pattern 4: User-Scoped + Shared Read (NEW — Needed for Campfire)

Use for content created by one user but readable by others under certain conditions.

**Tables needing this pattern:** `campfire_threads`, `campfire_replies`, `passer_stories`

```sql
ALTER TABLE public.passer_stories ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can read their own stories + published stories from others
CREATE POLICY "Users can read own stories"
  ON public.passer_stories FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can read published stories"
  ON public.passer_stories FOR SELECT
  TO authenticated
  USING (is_published = true);

-- INSERT: Users can insert their own stories
CREATE POLICY "Users can insert own stories"
  ON public.passer_stories FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE: Users can update their own stories only
CREATE POLICY "Users can update own stories"
  ON public.passer_stories FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
```

---

### Pattern 5: Access-Controlled by Profile Field (NEW — Needed for Retaker Channel)

Use when access to data depends on a value in the user's profile, not the data's `user_id`.

**Tables needing this pattern:** `community_channels` (retaker channel)

```sql
ALTER TABLE public.community_channels ENABLE ROW LEVEL SECURITY;

-- SELECT: Retaker channel visible only to returning reviewers
CREATE POLICY "Returning reviewers can access retaker channels"
  ON public.community_channels FOR SELECT
  TO authenticated
  USING (
    channel_type != 'retaker_private'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.reviewer_type = 'returning_reviewer'
    )
  );
```

**Design note:** This policy allows all users to see non-retaker channels, and restricts retaker channels to users with `reviewer_type = 'returning_reviewer'`. It avoids exposing the channel's existence to non-retaker users entirely.

---

### Pattern 6: Aggregate-Only (No Individual Exposure) (NEW — Needed for School Cohorts)

Use when users can see aggregate data about a group but never individual rows.

**Implementation:** This is NOT an RLS pattern — it's a query pattern. School cohort heatmaps (Feature 1c) are computed views, not direct table access. The query itself enforces the `HAVING COUNT(DISTINCT user_id) >= 5` privacy gate. RLS on `user_node_mastery` prevents any user from seeing another user's individual mastery data.

The aggregate query runs via **server action** using the service role key, computes the aggregate, and returns only the aggregate to the client. No individual data crosses the wire.

---

### Pattern 7: Pod/Group Membership (NEW — Needed for Study Pods)

Use when users who are members of a shared group can see limited data about each other.

**Tables needing this pattern:** `study_pods`, `pod_members`

```sql
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

-- SELECT: Pod members can see other members in their pod
CREATE POLICY "Pod members can see own pod members"
  ON public.pod_members FOR SELECT
  TO authenticated
  USING (
    pod_id IN (
      SELECT pod_id FROM pod_members
      WHERE user_id = (select auth.uid())
    )
  );

-- INSERT: Only the pod creator can add members (via invite acceptance)
CREATE POLICY "Users can join pods"
  ON public.pod_members FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);
```

**Critical constraint:** Pod members see **score deltas only**, never absolute scores. This is enforced at the query/server action layer, not RLS. The server action computes `current_score - readiness_score_at_join` and returns only the delta.

---

### Pattern 8: Institution-Scoped (NEW — Needed for Phase 8)

Use when institutional admins can see data for all users in their institution.

```sql
ALTER TABLE public.institution_memberships ENABLE ROW LEVEL SECURITY;

-- SELECT: Institution admins see their institution's members
CREATE POLICY "Institution admins can view own institution members"
  ON public.institution_memberships FOR SELECT
  TO authenticated
  USING (
    institution_id IN (
      SELECT institution_id FROM institution_memberships
      WHERE user_id = (select auth.uid())
        AND role = 'admin'
    )
  );

-- SELECT: Users see their own membership
CREATE POLICY "Users can view own memberships"
  ON public.institution_memberships FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);
```

---

## Existing RLS Policies Catalog

### User-Scoped Tables (Pattern 1)

| Table | SELECT | INSERT | UPDATE | DELETE | Notes |
|---|---|---|---|---|---|
| `quiz_sessions` | ✅ own | ✅ own | ✅ own | ❌ none | Soft delete via status |
| `user_interactions` | ✅ own | ✅ own | ❌ none | ❌ none | Append-only, immutable |
| `user_node_mastery` | ✅ own | ✅ own | ✅ own | ❌ none | |
| `user_mastery_history` | ✅ own | ✅ own | ❌ none | ❌ none | Append-only |
| `readiness_score_snapshots` | ✅ own | Service role | ❌ none | ❌ none | Written by trigger |
| `user_global_stats` | ✅ own | Service role | ✅ own | ❌ none | |
| `srs_schedules` | ✅ own | ✅ own | ✅ own | ❌ none | |
| `notes` | ✅ own | ✅ own | ✅ own | ❌ none | Soft delete via archived_at |
| `note_folders` | ✅ own | ✅ own | ✅ own | ✅ own | |
| `profiles` | ✅ own | Auto (auth) | ✅ own | ❌ none | Created by auth trigger |
| `user_trail_enrollments` | ✅ own | ✅ own | ✅ own | ❌ none | |
| `user_trail_progress` | ✅ own | ✅ own | ✅ own | ❌ none | |
| `trail_day_completions` | ✅ own | ✅ own | ❌ none | ❌ none | |
| `blindspot_queues` | ✅ own | Service role | ✅ own | ❌ none | |

### Public Read-Only Tables (Pattern 2)

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `taxonomy_tree` | ✅ public | Service role | Service role | Service role |
| `questions` | ✅ public | Service role | Service role | Service role |
| `disciplines` | ✅ public | Service role | Service role | Service role |
| `camp_trails` | ✅ public (published) | Service role | Service role | Service role |
| `trail_days` | ✅ public | Service role | Service role | Service role |
| `trail_steps` | ✅ public | Service role | Service role | Service role |
| `models_3d` | ✅ public (published) | Service role | Service role | Service role |
| `spatial_hotspots` | ✅ public | Service role | Service role | Service role |
| `feature_flags` | ✅ public | Service role | Service role | Service role |

### Content Tables (Pattern 3)

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `wiki_articles` | ✅ public (published) + admin (all) | Service role | Service role | Service role |

### Known RLS Bugs

| Table | Bug | Fix |
|---|---|---|
| `analytics_events` | INSERT policy blocks anonymous events (`user_id IS NULL`) | Allow `user_id IS NULL` in INSERT policy |
| `user_interactions` | Verify `(select auth.uid())` wrapping | Audit and fix if bare `auth.uid()` |

---

## RLS Testing Protocol

Before shipping any new RLS policy:

```sql
-- 1. Test as the target user
SET role authenticated;
SET request.jwt.claims = '{"sub": "user-uuid-here"}';
SELECT * FROM {table_name}; -- should return only own rows

-- 2. Test as a different user
SET request.jwt.claims = '{"sub": "different-user-uuid"}';
SELECT * FROM {table_name}; -- should return zero rows (for user-scoped)

-- 3. Test as anonymous
SET role anon;
SELECT * FROM {table_name}; -- should work for public tables, fail for user-scoped

-- 4. Test INSERT with wrong user_id
SET role authenticated;
SET request.jwt.claims = '{"sub": "user-a"}';
INSERT INTO {table_name} (user_id, ...) VALUES ('user-b', ...); -- should FAIL

-- 5. Reset
RESET role;
```

**Automated RLS testing:** Consider adding RLS tests to the migration runbook (Document 6). Every migration that adds or modifies RLS policies must include test queries that verify the policy works as intended.

---

## Red Lines

- ❌ Any table in `public` schema without `ENABLE ROW LEVEL SECURITY`
- ❌ Bare `auth.uid()` (without subselect) on high-traffic tables
- ❌ RLS policies referencing columns without indexes
- ❌ Using `raw_user_metadata` for authorization checks (user-editable)
- ❌ DELETE policies on `user_interactions` or `user_node_mastery` (data loss corrupts analytics)
- ❌ Exposing individual user data through aggregate queries (must enforce minimum cohort size ≥5)
- ❌ Hardcoding admin user IDs in policies — use profile role column

---

*Document version: 2026-03-26 · Pre-implementation baseline*
*Regenerate by running the audit queries in section 1 after any RLS changes.*

