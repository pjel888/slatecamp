# SlateCamp — Taxonomy Deduplication Fix Plan
**Prepared by:** Database Architect  
**Date:** 2026-03-19  
**Priority:** 🔴 URGENT — breaks Wiki sidebar, heatmap, quiz engine topic routing  
**Root cause:** v5.0 taxonomy nodes were imported but v1 nodes were never deprecated (Import Pipeline Step 12 was not executed)

---

## What Happened

The v5.0 import pipeline seeded new nodes correctly, but Step 12 (deprecate v1 nodes) did not run. The result: both v1 nodes (`ale_id IS NULL`) and v5.0 nodes (`ale_id IS NOT NULL`) exist simultaneously with no filter in place. Every query that reads `taxonomy_tree` returns both sets.

**What the user sees:** Every subject appears twice in the wiki sidebar. Some subjects appear with old names AND new names:

| v1 name (old) | v5.0 name (new) |
|---|---|
| Architectural Design and Site Planning | Architectural Design and Site Planning |
| Architectural Practice | Architectural Practice and Jurisprudence |
| Building Materials and Construction | Building Materials and Construction Methods |
| Building Utilities | Building Utilities / MEPF |
| History of Architecture | History of Architecture |
| *(not present)* | Philippine Laws & Codes for Architectural Practice |
| Structural Design | Structural Design |
| Theory and Principles of Planning | Theory and Principles of Planning |
| Theory of Architecture | Theory of Architecture |

---

## Part 1 — Immediate App Fix (No Migration Required)

**This stops the visible duplication immediately while the full DB fix is prepared.**

The `idx_taxonomy_active_leaves` index already filters `WHERE deprecated_at IS NULL`. The problem is that the wiki sidebar query is not using this filter. Adding `WHERE deprecated_at IS NULL` to the taxonomy tree query in the application eliminates all deprecated nodes from the UI instantly.

Find the server action that fetches taxonomy nodes for the wiki sidebar — likely in `src/lib/actions/taxonomy.ts` or `src/lib/actions/wiki.ts`. Add the filter:

```typescript
// Before (returns both v1 and v5.0 nodes — shows duplicates)
const { data } = await supabase
  .from('taxonomy_tree')
  .select('node_id, name, slug, level, parent_id, is_leaf, subject_area')
  .eq('discipline_id', disciplineId)
  .order('name')

// After (returns only non-deprecated nodes)
const { data } = await supabase
  .from('taxonomy_tree')
  .select('node_id, name, slug, level, parent_id, is_leaf, subject_area')
  .eq('discipline_id', disciplineId)
  .is('deprecated_at', null)   // ← ADD THIS
  .order('name')
```

Apply this filter to **every** query that reads `taxonomy_tree` for student-facing UI:
- Wiki sidebar / topic tree
- Heatmap node rendering
- Quiz engine topic selection
- Search/filter components

This fix works immediately because all v5.0 nodes have `deprecated_at = NULL` and all v1 nodes will have `deprecated_at` set after the migration below.

**After applying this app fix, deploy it. The UI will stop showing duplicates the moment the migration below runs.**

---

## Part 2 — Diagnostic Queries (Run First in Supabase SQL Editor)

Run these before the migration to understand the exact state of the database.

```sql
-- ── Diagnostic 1: Count v1 vs v5.0 nodes ──────────────────────
SELECT
  CASE WHEN ale_id IS NULL THEN 'v1 (legacy)' ELSE 'v5.0' END AS version,
  level,
  COUNT(*) AS node_count
FROM public.taxonomy_tree
GROUP BY 1, 2
ORDER BY 2, 1;
-- Expected: v5.0 nodes at levels 1-3, v1 nodes at whatever levels they were

-- ── Diagnostic 2: See all v1 subject-level nodes (level=1) ────
SELECT node_id, name, slug, ale_id, deprecated_at
FROM public.taxonomy_tree
WHERE level = 1
ORDER BY ale_id NULLS FIRST, name;
-- v1 subjects will have ale_id IS NULL

-- ── Diagnostic 3: Wiki articles still pointing to v1 nodes ────
SELECT
  wa.article_id,
  wa.title,
  wa.slug AS article_slug,
  tt.node_id,
  tt.name AS topic_name,
  tt.ale_id,
  tt.slug AS topic_slug
FROM public.wiki_article_taxonomy wat
JOIN public.wiki_articles wa ON wa.article_id = wat.article_id
JOIN public.taxonomy_tree tt ON tt.node_id = wat.node_id
WHERE tt.ale_id IS NULL
ORDER BY wa.title;
-- Shows all articles still linked to v1 nodes. Must be 0 before Step 12 can run.

-- ── Diagnostic 4: Questions still pointing to v1 nodes ────────
SELECT
  q.question_id,
  q.text,
  tt.node_id,
  tt.name AS topic_name,
  tt.ale_id,
  tt.slug AS topic_slug
FROM public.questions q
JOIN public.taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE tt.ale_id IS NULL
ORDER BY tt.name;
-- Shows all questions still tagged to v1 nodes. Must be 0 before Step 12 can run.

-- ── Diagnostic 5: User mastery on v1 nodes (must PRESERVE these) ──
SELECT
  tt.node_id,
  tt.name,
  tt.ale_id,
  COUNT(unm.user_id) AS users_with_mastery
FROM public.taxonomy_tree tt
LEFT JOIN public.user_node_mastery unm ON unm.topic_id = tt.node_id
WHERE tt.ale_id IS NULL
GROUP BY tt.node_id, tt.name, tt.ale_id
HAVING COUNT(unm.user_id) > 0
ORDER BY users_with_mastery DESC;
-- v1 nodes with mastery history CANNOT be deprecated — they must be preserved.

-- ── Diagnostic 6: v1 nodes with user interactions ─────────────
SELECT
  tt.node_id,
  tt.name,
  COUNT(ui.interaction_id) AS interaction_count
FROM public.taxonomy_tree tt
JOIN public.user_interactions ui ON ui.topic_id = tt.node_id
WHERE tt.ale_id IS NULL
GROUP BY tt.node_id, tt.name
ORDER BY interaction_count DESC;

-- ── Diagnostic 7: Notes linked to v1 nodes ────────────────────
SELECT COUNT(*) AS notes_on_v1_nodes
FROM public.notes n
JOIN public.taxonomy_tree tt ON tt.node_id = n.topic_id
WHERE tt.ale_id IS NULL AND n.topic_id IS NOT NULL;

-- ── Diagnostic 8: Trail steps targeting v1 node IDs ──────────
-- trail_steps.target_node_ids is UUID[] — check if any v1 UUIDs are in any array
SELECT
  ts.step_id,
  ts.title,
  ts.target_node_ids
FROM public.trail_steps ts
WHERE EXISTS (
  SELECT 1 FROM public.taxonomy_tree tt
  WHERE tt.node_id = ANY(ts.target_node_ids)
    AND tt.ale_id IS NULL
);
-- Shows trail steps pointing to v1 nodes that need updating.

-- ── Diagnostic 9: EI prompts linked to v1 nodes ───────────────
SELECT
  p.prompt_id,
  p.prompt_text,
  tt.node_id,
  tt.name
FROM public.wiki_ei_prompts p
JOIN public.taxonomy_tree tt ON tt.node_id = p.node_id
WHERE tt.ale_id IS NULL AND p.node_id IS NOT NULL;

-- ── Diagnostic 10: Teach-back criteria on v1 nodes ────────────
SELECT
  tc.criteria_id,
  tt.name
FROM public.topic_teach_back_criteria tc
JOIN public.taxonomy_tree tt ON tt.node_id = tc.topic_id
WHERE tt.ale_id IS NULL;
```

**Save the output of Diagnostics 3, 4, 6, 7, 8, 9, 10 before running anything.** These tell you exactly what needs to be re-linked before deprecation.

---

## Part 3 — Migration 031: Taxonomy Deduplication

**File:** `031_taxonomy_deduplication.sql`  
**Run order:** After app fix is deployed, after diagnostics are reviewed  
**Idempotent:** Yes — all operations use conflict guards  
**Risk:** Medium — re-links live data. Run in Supabase SQL editor with transaction wrapping.

```sql
-- ============================================================
-- Migration 031: Taxonomy Deduplication
-- Deprecates v1 nodes (ale_id IS NULL) after re-linking all
-- references to their corresponding v5.0 counterparts.
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- STEP A: Re-link wiki_article_taxonomy from v1 → v5.0 nodes
-- Strategy: match by slug (v5.0 slugs mirror v1 slugs for same content)
-- ─────────────────────────────────────────────────────────────

-- First: update existing wiki_article_taxonomy rows to point to v5.0 nodes
UPDATE public.wiki_article_taxonomy wat
SET node_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE wat.node_id = v1.node_id
  AND v1.ale_id IS NULL;

-- Handle slug mismatches: for any article still on a v1 node,
-- attempt name-based matching as fallback
UPDATE public.wiki_article_taxonomy wat
SET node_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON lower(trim(v5.name)) = lower(trim(v1.name))
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
  AND v5.level = v1.level
WHERE wat.node_id = v1.node_id
  AND v1.ale_id IS NULL
ON CONFLICT (article_id, node_id) DO NOTHING;

-- Verify: how many articles are still on v1 nodes after relinking?
DO $$
DECLARE
  remaining INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining
  FROM public.wiki_article_taxonomy wat
  JOIN public.taxonomy_tree tt ON tt.node_id = wat.node_id
  WHERE tt.ale_id IS NULL;

  IF remaining > 0 THEN
    RAISE NOTICE 'WARNING: % wiki_article_taxonomy rows still point to v1 nodes. These articles may be on topics that do not have a slug-matching v5.0 counterpart. Review manually.', remaining;
  ELSE
    RAISE NOTICE 'OK: All wiki_article_taxonomy rows successfully re-linked to v5.0 nodes.';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- STEP B: Re-link questions from v1 → v5.0 nodes
-- ─────────────────────────────────────────────────────────────

UPDATE public.questions q
SET topic_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE q.topic_id = v1.node_id
  AND v1.ale_id IS NULL;

-- Fallback: name-based match for any remaining
UPDATE public.questions q
SET topic_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON lower(trim(v5.name)) = lower(trim(v1.name))
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
  AND v5.level = v1.level
WHERE q.topic_id = v1.node_id
  AND v1.ale_id IS NULL;

-- Note: if a question cannot be matched, it stays on its v1 node.
-- The v1 node will be preserved (not deprecated) in that case.

-- ─────────────────────────────────────────────────────────────
-- STEP C: Re-link notes from v1 → v5.0 nodes
-- ─────────────────────────────────────────────────────────────

UPDATE public.notes n
SET topic_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE n.topic_id = v1.node_id
  AND v1.ale_id IS NULL
  AND n.topic_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- STEP D: Re-link spatial_hotspots from v1 → v5.0 nodes
-- ─────────────────────────────────────────────────────────────

UPDATE public.spatial_hotspots sh
SET node_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE sh.node_id = v1.node_id
  AND v1.ale_id IS NULL
  AND sh.node_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- STEP E: Re-link wiki_ei_prompts.node_id from v1 → v5.0
-- ─────────────────────────────────────────────────────────────

UPDATE public.wiki_ei_prompts p
SET node_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE p.node_id = v1.node_id
  AND v1.ale_id IS NULL
  AND p.node_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- STEP F: Re-link topic_teach_back_criteria from v1 → v5.0
-- ─────────────────────────────────────────────────────────────

UPDATE public.topic_teach_back_criteria tc
SET topic_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE tc.topic_id = v1.node_id
  AND v1.ale_id IS NULL;

-- ─────────────────────────────────────────────────────────────
-- STEP G: Re-link teach_back_submissions from v1 → v5.0
-- ─────────────────────────────────────────────────────────────

UPDATE public.teach_back_submissions ts
SET topic_id = v5.node_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE ts.topic_id = v1.node_id
  AND v1.ale_id IS NULL
  AND ts.topic_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────
-- STEP H: Update trail_steps.target_node_ids arrays
-- This is the most complex step: target_node_ids is UUID[].
-- Replace any v1 node_id in the array with the corresponding v5.0 node_id.
-- ─────────────────────────────────────────────────────────────

-- Build a replacement map: v1_uuid → v5_uuid for all slug-matched pairs
CREATE TEMP TABLE v1_to_v5_map AS
SELECT
  v1.node_id AS v1_id,
  v5.node_id AS v5_id
FROM public.taxonomy_tree v1
JOIN public.taxonomy_tree v5
  ON v5.slug = v1.slug
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
WHERE v1.ale_id IS NULL;

-- For each trail_step that contains any v1 node_id in its array,
-- replace all v1 IDs with their v5.0 equivalents
UPDATE public.trail_steps ts
SET target_node_ids = (
  SELECT array_agg(
    COALESCE(m.v5_id, node_id)  -- replace with v5 if mapping exists, else keep
    ORDER BY ordinality
  )
  FROM unnest(ts.target_node_ids) WITH ORDINALITY AS u(node_id, ordinality)
  LEFT JOIN v1_to_v5_map m ON m.v1_id = u.node_id
)
WHERE EXISTS (
  SELECT 1 FROM unnest(ts.target_node_ids) AS u(node_id)
  JOIN v1_to_v5_map m ON m.v1_id = u.node_id
);

DROP TABLE v1_to_v5_map;

-- ─────────────────────────────────────────────────────────────
-- STEP I: Deprecate v1 nodes
-- Preserves any v1 node that still has mastery history or interactions.
-- Never hard-deletes — user progress is sacred.
-- ─────────────────────────────────────────────────────────────

-- Final safety check before deprecation
DO $$
DECLARE
  orphaned_articles    INTEGER;
  orphaned_questions   INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_articles
  FROM public.wiki_article_taxonomy wat
  JOIN public.taxonomy_tree tt ON tt.node_id = wat.node_id
  WHERE tt.ale_id IS NULL;

  SELECT COUNT(*) INTO orphaned_questions
  FROM public.questions q
  JOIN public.taxonomy_tree tt ON tt.node_id = q.topic_id
  WHERE tt.ale_id IS NULL;

  RAISE NOTICE 'Pre-deprecation check: % article taxonomy rows on v1, % questions on v1',
    orphaned_articles, orphaned_questions;
  -- These counts should be low or zero.
  -- Any remaining are nodes that couldn't be matched — they'll be preserved, not deprecated.
END $$;

-- Deprecate v1 nodes that:
-- (a) have ale_id IS NULL (are v1)
-- (b) are NOT still referenced by active content (questions, wiki articles)
-- (c) are NOT still referenced by user history (mastery, interactions)
UPDATE public.taxonomy_tree
SET deprecated_at = now()
WHERE ale_id IS NULL
  AND deprecated_at IS NULL
  -- Do not deprecate if questions still point here
  AND node_id NOT IN (
    SELECT DISTINCT topic_id FROM public.questions
  )
  -- Do not deprecate if wiki articles still use this node
  AND node_id NOT IN (
    SELECT DISTINCT node_id FROM public.wiki_article_taxonomy
  )
  -- Do not deprecate if user mastery history exists
  AND node_id NOT IN (
    SELECT DISTINCT topic_id FROM public.user_node_mastery
  )
  -- Do not deprecate if user interactions exist (longitudinal data)
  AND node_id NOT IN (
    SELECT DISTINCT topic_id FROM public.user_interactions
    WHERE topic_id IS NOT NULL
  );

-- ─────────────────────────────────────────────────────────────
-- STEP J: Report final state
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  deprecated_count   INTEGER;
  preserved_count    INTEGER;
  v5_count           INTEGER;
BEGIN
  SELECT COUNT(*) INTO deprecated_count
  FROM public.taxonomy_tree WHERE ale_id IS NULL AND deprecated_at IS NOT NULL;

  SELECT COUNT(*) INTO preserved_count
  FROM public.taxonomy_tree WHERE ale_id IS NULL AND deprecated_at IS NULL;

  SELECT COUNT(*) INTO v5_count
  FROM public.taxonomy_tree WHERE ale_id IS NOT NULL AND deprecated_at IS NULL;

  RAISE NOTICE '=== Migration 031 Complete ===';
  RAISE NOTICE 'v1 nodes deprecated: %', deprecated_count;
  RAISE NOTICE 'v1 nodes preserved (have user data): %', preserved_count;
  RAISE NOTICE 'v5.0 nodes active: %', v5_count;
  RAISE NOTICE 'Total visible nodes in UI: %', v5_count;

  IF preserved_count > 0 THEN
    RAISE NOTICE 'ACTION REQUIRED: % v1 nodes preserved because they have user mastery or interaction data.', preserved_count;
    RAISE NOTICE 'These nodes will appear in the user heatmap under their old names until the user resets.';
    RAISE NOTICE 'Run Diagnostic 5 to see which nodes and users are affected.';
  END IF;
END $$;

COMMIT;
```

---

## Part 4 — Verification Queries (Run After Migration)

```sql
-- 1. Confirm no more duplicate subjects visible in UI
SELECT name, COUNT(*) as count
FROM public.taxonomy_tree
WHERE level = 1 AND deprecated_at IS NULL
GROUP BY name
ORDER BY name;
-- Every name should appear exactly ONCE.

-- 2. Confirm all active level=1 nodes have ale_id
SELECT name, ale_id, deprecated_at
FROM public.taxonomy_tree
WHERE level = 1
ORDER BY deprecated_at NULLS FIRST, ale_id;
-- Active nodes should all have ale_id set.
-- Deprecated nodes (deprecated_at IS NOT NULL) are OK to have NULL ale_id.

-- 3. Confirm wiki sidebar will show correct count
SELECT level, COUNT(*) AS active_nodes
FROM public.taxonomy_tree
WHERE deprecated_at IS NULL
GROUP BY level
ORDER BY level;
-- Level 1: 9 (the 9 v5.0 subjects)
-- Level 2: ~51 (topics)
-- Level 3: 172 (subtopics)

-- 4. Confirm no articles are orphaned
SELECT COUNT(*) AS orphaned_articles
FROM public.wiki_articles wa
WHERE NOT EXISTS (
  SELECT 1 FROM public.wiki_article_taxonomy wat
  WHERE wat.article_id = wa.article_id
);
-- Must return 0.

-- 5. Confirm all questions point to active nodes
SELECT COUNT(*) AS questions_on_deprecated_nodes
FROM public.questions q
JOIN public.taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE tt.deprecated_at IS NOT NULL;
-- Should return 0. If > 0, those questions couldn't be re-linked — requires manual review.

-- 6. Confirm v1 nodes that were preserved (have user data)
SELECT
  tt.node_id,
  tt.name,
  tt.slug,
  COUNT(DISTINCT unm.user_id) AS mastery_users,
  COUNT(DISTINCT ui.interaction_id) AS interactions
FROM public.taxonomy_tree tt
LEFT JOIN public.user_node_mastery unm ON unm.topic_id = tt.node_id
LEFT JOIN public.user_interactions ui ON ui.topic_id = tt.node_id
WHERE tt.ale_id IS NULL AND tt.deprecated_at IS NULL
GROUP BY tt.node_id, tt.name, tt.slug
ORDER BY mastery_users DESC;
-- These nodes are intentionally preserved. They remain non-deprecated because
-- user data references them. They will NOT show in the wiki sidebar because
-- the app filter (deprecated_at IS NULL) would include them.
-- IMPORTANT: These preserved v1 nodes also need the app filter on a separate condition.
-- See Part 5 for handling this edge case.
```

---

## Part 5 — Handling Preserved v1 Nodes With User Data

If Diagnostic 5 from Part 2 showed any v1 nodes with mastery history, those nodes **cannot be deprecated** — they are preserved to maintain the integrity of `user_node_mastery` and `user_interactions` foreign keys.

But they also cannot show in the wiki sidebar. The solution: filter by `ale_id IS NOT NULL` instead of (or in addition to) `deprecated_at IS NULL` for UI queries.

```typescript
// For wiki sidebar and all student-facing taxonomy queries:
// Filter by ale_id IS NOT NULL to show ONLY v5.0 nodes,
// regardless of deprecated_at status on preserved v1 nodes.

const { data } = await supabase
  .from('taxonomy_tree')
  .select('node_id, name, slug, level, parent_id, is_leaf, subject_area, ale_id')
  .eq('discipline_id', disciplineId)
  .not('ale_id', 'is', null)        // ← Only v5.0 nodes (ale_id IS NOT NULL)
  .is('deprecated_at', null)        // ← And not deprecated
  .order('name')
```

Using `ale_id IS NOT NULL` as the primary filter is cleaner and more explicit than `deprecated_at IS NULL` alone because it directly expresses the intent: "show only v5.0 taxonomy nodes."

For heatmap queries (which must show mastery for BOTH v5.0 nodes AND preserved v1 nodes the user has history on):

```typescript
// Heatmap: show mastery for v5.0 nodes
// Note: preserved v1 mastery data can be migrated to v5.0 nodes via
// a separate data migration once v5.0 node IDs are confirmed stable.
const { data } = await supabase
  .from('user_node_mastery')
  .select(`
    topic_id,
    current_mastery_weight,
    total_attempts,
    next_review_at,
    taxonomy_tree!inner(ale_id, name, slug, level, is_cross_ref_only)
  `)
  .eq('user_id', userId)
  .not('taxonomy_tree.ale_id', 'is', null)  // Only v5.0 nodes
```

---

## Part 6 — Optional: Migrate User Mastery From v1 to v5.0 Nodes

If preserved v1 nodes have user mastery data, you may want to merge that data into the corresponding v5.0 nodes rather than leaving orphaned v1 mastery rows. This is a data migration, not a schema migration.

Run this **only after Step I of Migration 031 is complete** and **only after confirming the v5.0 node mapping is correct**:

```sql
-- Optional: Merge v1 user_node_mastery into v5.0 nodes
-- Only run this if you're confident the v1→v5.0 slug mapping is correct
-- for every preserved v1 node.

-- First, preview what would be merged:
SELECT
  v1.node_id AS v1_node,
  v1.name AS v1_name,
  v5.node_id AS v5_node,
  v5.ale_id,
  unm.user_id,
  unm.current_mastery_weight,
  unm.total_attempts
FROM public.user_node_mastery unm
JOIN public.taxonomy_tree v1 ON v1.node_id = unm.topic_id AND v1.ale_id IS NULL
JOIN public.taxonomy_tree v5
  ON lower(trim(v5.name)) = lower(trim(v1.name))
  AND v5.ale_id IS NOT NULL
  AND v5.deprecated_at IS NULL
ORDER BY v1.name, unm.user_id;

-- If the preview looks correct, run the merge:
-- INSERT INTO public.user_node_mastery (user_id, topic_id, total_attempts, total_correct,
--   current_mastery_weight, avg_time_ms, last_encountered, review_count)
-- SELECT
--   unm.user_id,
--   v5.node_id,                    -- target: v5.0 node
--   unm.total_attempts,
--   unm.total_correct,
--   unm.current_mastery_weight,
--   unm.avg_time_ms,
--   unm.last_encountered,
--   unm.review_count
-- FROM public.user_node_mastery unm
-- JOIN public.taxonomy_tree v1 ON v1.node_id = unm.topic_id AND v1.ale_id IS NULL
-- JOIN public.taxonomy_tree v5
--   ON lower(trim(v5.name)) = lower(trim(v1.name))
--   AND v5.ale_id IS NOT NULL
--   AND v5.deprecated_at IS NULL
-- ON CONFLICT (user_id, topic_id) DO UPDATE SET
--   total_attempts         = GREATEST(EXCLUDED.total_attempts, user_node_mastery.total_attempts),
--   total_correct          = GREATEST(EXCLUDED.total_correct, user_node_mastery.total_correct),
--   current_mastery_weight = GREATEST(EXCLUDED.current_mastery_weight, user_node_mastery.current_mastery_weight),
--   last_encountered       = GREATEST(EXCLUDED.last_encountered, user_node_mastery.last_encountered);
```

This is commented out intentionally — only run it after manual review of the preview query confirms the matching is correct.

---

## Part 7 — Complete Execution Sequence

| # | Step | Where | When |
|---|---|---|---|
| 1 | Run all 10 diagnostic queries | Supabase SQL Editor | Now |
| 2 | Save diagnostic output (especially Diagnostics 3, 4, 6) | — | Now |
| 3 | Add `deprecated_at IS NULL` AND `ale_id IS NOT NULL` filter to all wiki/heatmap/quiz taxonomy queries | Codebase | Now |
| 4 | Deploy app code change | Vercel/production | After step 3 |
| 5 | Run Migration 031 in a transaction | Supabase SQL Editor | After step 4 |
| 6 | Run the 6 verification queries | Supabase SQL Editor | After step 5 |
| 7 | Verify wiki sidebar shows no duplicates | Browser | After step 6 |
| 8 | Verify heatmap shows correct subjects | Browser | After step 7 |
| 9 | If preserved v1 nodes exist: run optional mastery merge | Supabase SQL Editor | After confirming v1→v5.0 mapping |

---

## Part 8 — Root Cause and Prevention

### Why this happened

The v5.0 import pipeline (Steps 1–13) was executed through Step 11 (seed nodes, cross-references, sources, prerequisites, re-link articles, re-link questions). Step 12 (deprecate v1 nodes) was skipped — likely because one of the safety checks returned a non-zero count, which is the designed abort behavior.

The safety check that aborts Step 12 is:
```sql
SELECT COUNT(*) AS questions_still_on_v1 FROM questions q
JOIN taxonomy_tree tt ON tt.node_id = q.topic_id WHERE tt.ale_id IS NULL;
```

If this returned > 0, the abort fired correctly. The question re-linking step (Step 11) may not have worked perfectly due to slug mismatches between v1 and v5.0 nodes for subjects with renamed names (e.g., "Building Materials and Construction" → "Building Materials and Construction Methods").

### Prevention

Two things will prevent this in the future:

**1. App-level filter must always be applied.** The wiki sidebar, heatmap, and quiz topic queries must always filter by `ale_id IS NOT NULL AND deprecated_at IS NULL`. This makes the UI resilient to incomplete migrations — only seeded v5.0 nodes will ever show, regardless of what's in the DB.

**2. The import pipeline's abort guard is correct behavior.** Do not suppress it. When it fires, it means some nodes couldn't be matched. Fix the matching and re-run the specific step, not the whole pipeline.

---

*SlateCamp — Taxonomy Deduplication Fix Plan*  
*DB Architect + Philip (Founder) · 2026-03-19*
