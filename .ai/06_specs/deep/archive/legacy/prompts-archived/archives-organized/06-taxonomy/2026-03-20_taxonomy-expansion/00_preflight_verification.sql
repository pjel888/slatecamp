-- ============================================================
-- Taxonomy Expansion: Pre-Flight Verification Queries
-- Run ALL of these BEFORE any migration file.
-- All must return expected values. Stop if any fail.
-- ============================================================

-- 1. Confirm deduplication ran (no duplicate subjects in UI)
SELECT name, COUNT(*) as count
FROM public.taxonomy_tree
WHERE level = 1 AND deprecated_at IS NULL
GROUP BY name HAVING COUNT(*) > 1;
-- MUST return 0 rows. If any rows: run taxonomy deduplication fix first.

-- 2. Confirm v5/v6 base nodes exist (topics our new subtopics attach to)
SELECT ale_id, name FROM public.taxonomy_tree
WHERE ale_id IN (
  'ALE-HIST','ALE-HIST-001','ALE-HIST-004','ALE-HIST-005','ALE-HIST-006',
  'ALE-THEO','ALE-THEO-002','ALE-THEO-004','ALE-THEO-005','ALE-THEO-006',
  'ALE-PLAN','ALE-PLAN-001','ALE-PLAN-002','ALE-PLAN-003','ALE-PLAN-004','ALE-PLAN-005',
  'ALE-PRAC','ALE-PRAC-001','ALE-PRAC-005','ALE-PRAC-006',
  'ALE-STRC','ALE-STRC-001','ALE-STRC-002','ALE-STRC-003','ALE-STRC-004','ALE-STRC-005',
  'ALE-MATL','ALE-MATL-002','ALE-MATL-003',
  'ALE-UTIL','ALE-UTIL-001','ALE-UTIL-002','ALE-UTIL-003','ALE-UTIL-005','ALE-UTIL-006',
  'ALE-DSGN','ALE-DSGN-003','ALE-DSGN-004','ALE-DSGN-005','ALE-DSGN-006','ALE-DSGN-007',
  'ALE-LAWS','ALE-LAWS-001','ALE-LAWS-002','ALE-LAWS-003','ALE-LAWS-004',
  'ALE-LAWS-005','ALE-LAWS-006','ALE-LAWS-007','ALE-LAWS-008'
)
AND deprecated_at IS NULL
ORDER BY ale_id;
-- MUST return 49 rows. Any missing = prerequisite migration not run.

-- 3. Current node counts (baseline before migration)
SELECT
  CASE
    WHEN level = 1 THEN 'Subject'
    WHEN level = 2 THEN 'Topic'
    WHEN level = 3 THEN 'Subtopic'
  END as level_name,
  COUNT(*) as active_count
FROM public.taxonomy_tree
WHERE deprecated_at IS NULL AND is_cross_ref_only = false
GROUP BY level
ORDER BY level;
-- Record these counts. After all migrations:
-- Expected: Subjects=8, Topics=54+ (72 after expansion), Subtopics=219+ (327 after)

-- 4. Confirm no questions on ALE-LAWS nodes (safe for Option A deprecation)
SELECT COUNT(*) as questions_on_laws_nodes
FROM public.questions q
JOIN public.taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE tt.ale_id LIKE 'ALE-LAWS-%';
-- MUST return 0.

-- 5. Confirm UNIQUE constraint on ale_id (no conflicts possible)
SELECT column_name, constraint_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'taxonomy_tree' AND column_name = 'ale_id';
-- MUST return 1 row (the unique constraint).

-- 6. Confirm enums exist
SELECT typname FROM pg_type
WHERE typname IN ('taxonomy_node_type','exam_frequency_level','bloom_level_type');
-- MUST return 3 rows.
