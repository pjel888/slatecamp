-- ============================================================
-- Taxonomy Expansion: Post-Migration Verification
-- Run AFTER all 9 migration files complete successfully.
-- ============================================================

-- 1. Final node counts
SELECT
  CASE WHEN level = 1 THEN 'Subject (cross_ref=false)'
       WHEN level = 2 THEN 'Topic (cross_ref=false)'
       WHEN level = 3 THEN 'Subtopic (cross_ref=false)'
  END as category,
  COUNT(*) as count
FROM public.taxonomy_tree
WHERE deprecated_at IS NULL AND is_cross_ref_only = false
GROUP BY level ORDER BY level;
-- Expected: Subjects=8, Topics=72, Subtopics=327 (non-LAWS)
-- If counts differ, run subject-specific verify step.

-- 2. ALE-LAWS counts
SELECT
  CASE WHEN ale_id LIKE 'ALE-LAWS-___-__'  THEN 'old (2-digit) deprecated'
       WHEN ale_id LIKE 'ALE-LAWS-___-___' THEN 'new (3-digit) active'
       WHEN level = 2                       THEN 'topic node'
       WHEN level = 1                       THEN 'subject node'
  END as category,
  COUNT(*) as count
FROM public.taxonomy_tree
WHERE ale_id LIKE 'ALE-LAWS%'
GROUP BY 1 ORDER BY 1;
-- Expected:
--   old (2-digit) deprecated:  48
--   new (3-digit) active:      55
--   topic node:                 8
--   subject node:               1

-- 3. No ALE-LAWS nodes are is_cross_ref_only=false
SELECT COUNT(*) as should_be_zero
FROM public.taxonomy_tree
WHERE ale_id LIKE 'ALE-LAWS%' AND is_cross_ref_only = false;
-- MUST return 0.

-- 4. No duplicate ale_ids (unique constraint protects this but verify)
SELECT ale_id, COUNT(*) FROM public.taxonomy_tree
WHERE deprecated_at IS NULL
GROUP BY ale_id HAVING COUNT(*) > 1;
-- MUST return 0 rows.

-- 5. All new subtopics have required fields populated
SELECT ale_id, 'missing node_type' as issue FROM public.taxonomy_tree
WHERE level = 3 AND deprecated_at IS NULL AND node_type IS NULL
UNION ALL
SELECT ale_id, 'missing bloom_level' FROM public.taxonomy_tree
WHERE level = 3 AND deprecated_at IS NULL AND bloom_level IS NULL
UNION ALL
SELECT ale_id, 'missing exam_frequency' FROM public.taxonomy_tree
WHERE level = 3 AND deprecated_at IS NULL AND exam_frequency IS NULL
UNION ALL
SELECT ale_id, 'empty wiki_items' FROM public.taxonomy_tree
WHERE level = 3 AND deprecated_at IS NULL AND (wiki_items IS NULL OR wiki_items = '[]')
ORDER BY ale_id;
-- Ideally 0 rows. Any rows need SME review.

-- 6. Confirm wiki sidebar will work: all subjects visible, no laws in main syllabus
SELECT name, ale_id, is_cross_ref_only
FROM public.taxonomy_tree
WHERE level = 1 AND deprecated_at IS NULL
ORDER BY is_cross_ref_only, name;
-- Should show: 8 subjects (is_cross_ref_only=false) + 1 ALE-LAWS (is_cross_ref_only=true)
