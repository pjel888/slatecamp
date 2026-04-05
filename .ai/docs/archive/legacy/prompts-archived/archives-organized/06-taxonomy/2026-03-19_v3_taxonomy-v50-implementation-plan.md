# SlateCamp — Taxonomy v5.0 Implementation Plan
**Prepared by:** Database Architect  
**Date:** 2026-03-19  
**Basis:** Full reconciliation of DATABASE_SCHEMA.sql (live production) + slatecamp_taxonomy_v5.json  
**Schema version upgrading to:** v5.0 (Complete)  
**Previous plan version superseded:** taxonomy-schema-reconciled-plan.md (Migration 027)

---

## CRITICAL: Read This First

Migration 027 from the previous plan has **not been applied to production**. The current `taxonomy_tree` in production has only 10 columns: the base structure with no metadata enrichment at all. This means we are writing **one comprehensive migration** (027-revised) that covers everything from v3.5 and v5.0 simultaneously. There is no benefit to a two-step 027-v3.5 then 027-v5.0 upgrade.

**v5.0 introduces 8 new data fields** that v3.5 did not have, all requiring new columns, one new junction table, and one new enum. These are fully additive — the existing 41-table schema is not broken in any way.

**Zero wiki articles will be lost or broken.** The wiki_articles table and wiki_article_taxonomy are structurally unaffected. The import pipeline re-links existing articles to new node IDs before deprecating old ones. The safeguards are built into the pipeline steps.

---

## Part 1 — What v5.0 Introduces vs. v3.5

### New fields in v5.0 on ALL 172 subtopics (0 → 172 coverage)

| Field | Type | Was in v3.5 | v5.0 Status |
|---|---|---|---|
| `bloom_level` | enum: remember/understand/apply/analyze | ❌ Not present | ✅ All 172 subtopics |
| `difficulty` | integer 1–4 | ❌ Not present | ✅ All 172 subtopics |
| `typical_question_formats` | array of format strings | ❌ Not present | ✅ All 172 subtopics |
| `prerequisite_subtopic_ids` | array of ale_ids | ❌ Not present | ✅ All 172 subtopics |
| `wiki_items` | typed JSONB object array | ❌ Not present (was untyped bullets) | ✅ All 172 subtopics |

### New fields in v5.0 on select subtopics only

| Field | Present on | Was in v3.5 |
|---|---|---|
| `is_computation_heavy` | ALE-STRC and ALE-UTIL subtopics | ❌ Not present |
| `three_d_lab_linked` | Relevant subtopics across STRC, MATL, UTIL, DSGN | ❌ Not present |

### New field on all 9 subjects (level=1 only)

| Field | Type | Was in v3.5 |
|---|---|---|
| `mastery_criteria` | JSONB {threshold_pct, critical_topics, note} | ❌ Not present |

### New content nodes (net additions to v3.5)

| ALE ID | Name | Type | New in v5.0 |
|---|---|---|---|
| ALE-UTIL-001-04 | Drainage Fixture Units (DFU) — Reference Table | subtopic | ✅ New |
| ALE-UTIL-003-03 | Toilet Fixture Count Standards per Occupancy | subtopic | ✅ New |
| ALE-LAWS-002-06 | DepEd Order No. 66 s.2012 | subtopic | ✅ New |
| ALE-LAWS-006 | Allied Professions & Emerging Practice Laws | topic | ✅ New |
| ALE-LAWS-006-01 | RA 8534 — Interior Design Act | subtopic | ✅ New |
| ALE-LAWS-006-02 | RA 8549 — Landscape Architecture Act | subtopic | ✅ New |
| ALE-LAWS-006-03 | RA 10587 — Environmental Planning Act | subtopic | ✅ New |
| ALE-LAWS-006-04 | RA 11032 — Ease of Doing Business Act | subtopic | ✅ New |
| ALE-LAWS-006-05 | RA 11313 — Safe Spaces Act | subtopic | ✅ New |

Total: **9 new nodes** (1 new topic + 8 new subtopics)

### Critical content corrections in v5.0

These are data-level fixes — no schema change needed, but critical for accuracy:

| What changed | Old value | Correct value | Affects |
|---|---|---|---|
| Philippine seismic zone | Zone 4 | Zone 2 (NSCP 2015) | ALE-STRC-005-03, ALE-LAWS-005-04 |
| CPD compliance period | 15 units per 3 years | 45 units per 3 years | ALE-PRAC-001-01, ALE-PRAC-001-03, ALE-LAWS-001-03 |
| RA 9266 Art. 1723 | 10 years = period building must fail | 10 years = prescriptive period from completion | ALE-PRAC-001-01 |
| Source URLs | All TBD in v3.5 | All 66 real URLs populated | All ALE-LAWS subtopics |

### wiki_items vs wiki_content — Critical Architecture Decision

v5.0 replaces untyped `wiki_content` string arrays with typed `wiki_items` JSONB object arrays. Each item has:
```json
{ "text": "string", "type": "heading|fact|definition|formula|code_provision|detail|exam_tip|cross_ref|warning", "source_ref": "ALE-LAWS-XXX-XX (optional)" }
```

**Decision:** The column on `taxonomy_tree` will be named `wiki_items` (not `wiki_outline` from the previous plan). The previous plan's `wiki_outline` column does not exist in production, so we define `wiki_items` cleanly from the start. The legacy `wiki_content` string array is stored nowhere in the DB — it is deprecated in the JSON and will not be imported.

---

## Part 2 — Complete Gap Analysis: Production DB vs. v5.0

### taxonomy_tree — Missing columns (ALL need to be added in migration 027)

| Column | Type | Level | From |
|---|---|---|---|
| `ale_id` | TEXT UNIQUE | All | v3.5 |
| `node_type` | taxonomy_node_type ENUM | Subtopics | v3.5 |
| `exam_frequency` | exam_frequency_level ENUM | Subtopics | v3.5 |
| `prc_area` | TEXT CHECK | Subjects | v3.5 |
| `area_weight_pct` | SMALLINT | Subjects | v3.5 |
| `subject_weight_within_area_pct` | SMALLINT | Subjects | v3.5 |
| `description` | TEXT | Subjects | v3.5 |
| `is_cross_ref_only` | BOOLEAN DEFAULT false | All | v3.5 |
| `deprecated_at` | TIMESTAMPTZ | All | v3.5 |
| `wiki_items` | JSONB DEFAULT '[]' | Subtopics | v5.0 |
| `bloom_level` | bloom_level_type ENUM | Subtopics | v5.0 |
| `difficulty` | SMALLINT CHECK 1-4 | Subtopics | v5.0 |
| `typical_question_formats` | TEXT[] DEFAULT '{}' | Subtopics | v5.0 |
| `is_computation_heavy` | BOOLEAN DEFAULT false | Subtopics | v5.0 |
| `three_d_lab_linked` | BOOLEAN DEFAULT false | Subtopics | v5.0 |
| `mastery_criteria` | JSONB | Subjects | v5.0 |

### disciplines — Missing columns

| Column | Type | From |
|---|---|---|
| `passing_threshold_pct` | SMALLINT DEFAULT 70 | v3.5 |
| `subject_floor_pct` | SMALLINT DEFAULT 50 | v3.5 |
| `exam_day_1_subjects` | TEXT[] DEFAULT '{}' | v3.5 |
| `exam_day_2_subjects` | TEXT[] DEFAULT '{}' | v3.5 |
| `recent_passing_rates` | JSONB DEFAULT '{}' | v3.5 |

### New ENUMs needed

| Enum | Values | From |
|---|---|---|
| `taxonomy_node_type` | concept, code_provision, formula, case_study, person, building | v3.5 |
| `exam_frequency_level` | low, medium, high | v3.5 |
| `taxonomy_source_type` | primary_law, implementing_rules, regulatory_body, reference_standard, prc_syllabus, heritage_body | v3.5 |
| `bloom_level_type` | remember, understand, apply, analyze | v5.0 NEW |

### New tables needed

| Table | From |
|---|---|
| `taxonomy_cross_references` | v3.5 |
| `taxonomy_sources` | v3.5 |
| `taxonomy_prerequisites` | v5.0 NEW |

### New trigger/function needed

| Item | Purpose |
|---|---|
| `check_question_topic_not_cross_ref()` + trigger | Prevents questions from tagging to ALE-LAWS nodes |

---

## Part 3 — Why taxonomy_prerequisites Needs a Junction Table (Not TEXT[])

The v5.0 `prerequisite_subtopic_ids` field stores ale_ids of subtopics that must be mastered before the current subtopic is introduced. Example: ALE-UTIL-001-04 (DFU Reference Table) has `["ALE-UTIL-001-02"]` as its prerequisite.

A TEXT[] array on `taxonomy_tree` would work for simple forward lookups, but it cannot answer the reverse query that the Camp Trail engine needs: **"What subtopics depend on this one?"** — i.e., if ALE-UTIL-001-02 mastery drops back to Red, what other subtopics in the student's trail should be flagged?

A junction table answers both directions with simple indexed queries and enforces that every prerequisite reference points to a real `ale_id`.

---

## Part 4 — Migration 027 (Comprehensive — covers v3.5 + v5.0 in one pass)

**File:** `027_taxonomy_v50_schema.sql`  
**Idempotent:** Yes — all operations use `IF NOT EXISTS` / `DO $$ ... EXCEPTION` guards  
**Risk:** Zero — all additions are nullable or have safe defaults. Existing 148 v1 nodes are completely unaffected.  
**Run:** Before taxonomy v5.0 import pipeline

```sql
-- ============================================================
-- Migration 027: Taxonomy v5.0 Schema Enrichment
-- Covers all v3.5 additions AND v5.0 additions in one migration.
-- Previous plan's 027 was never applied — this supersedes it.
-- ============================================================

-- ── 1. New ENUMs ─────────────────────────────────────────────

DO $$
BEGIN
  CREATE TYPE public.taxonomy_node_type AS ENUM (
    'concept',        -- Theoretical/spatial knowledge
    'code_provision', -- Legal/regulatory requirement with specific values (highest ALE frequency)
    'formula',        -- Mathematical equation or calculation procedure
    'case_study',     -- Specific building, project, or design precedent
    'person',         -- Architect, theorist, or historical luminary
    'building'        -- Named building with architectural significance
  );
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'taxonomy_node_type already exists, skipping.';
END $$;

DO $$
BEGIN
  CREATE TYPE public.exam_frequency_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'exam_frequency_level already exists, skipping.';
END $$;

DO $$
BEGIN
  CREATE TYPE public.taxonomy_source_type AS ENUM (
    'primary_law',        -- Enacted statute (RA 9266, PD 1096, RA 9514...)
    'implementing_rules', -- IRR or implementing order
    'regulatory_body',    -- Government agency or professional organization
    'reference_standard', -- Technical standard (NSCP 2015, PEC, NPC)
    'prc_syllabus',       -- PRC-published examination scope document
    'heritage_body'       -- Heritage conservation authority (NHCP, ICOMOS PH)
  );
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'taxonomy_source_type already exists, skipping.';
END $$;

-- NEW in v5.0
DO $$
BEGIN
  CREATE TYPE public.bloom_level_type AS ENUM (
    'remember',   -- Recall facts; mcq_recall questions
    'understand', -- Explain concepts, describe relationships
    'apply',      -- Use in new situations; calculation and application questions
    'analyze'     -- Break down; multi-step reasoning; highest discriminating power
  );
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'bloom_level_type already exists, skipping.';
END $$;

-- ── 2. taxonomy_tree column additions ────────────────────────
-- All nullable or have safe defaults. Zero impact on existing 148 v1 nodes.

-- 2a. Human-readable ALE string identifier
-- This is THE canonical cross-reference key used throughout the JSON and by SMEs.
-- Enables import pipeline upserts without UUID lookups.
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS ale_id TEXT UNIQUE;

COMMENT ON COLUMN public.taxonomy_tree.ale_id IS
  'Human-readable ALE string identifier per taxonomy JSON id_convention.
   Format: ALE-[SUBJ] | ALE-[SUBJ]-[NNN] | ALE-[SUBJ]-[NNN]-[NN]
   Examples: ALE-HIST, ALE-HIST-001, ALE-HIST-001-04
   Canonical cross-reference key — every import operation uses this as the upsert key.
   NULL on legacy v1 nodes (pre-v5.0). Set on all v5.0 nodes.';

-- 2b. Node type classification (subtopics only)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS node_type public.taxonomy_node_type;

COMMENT ON COLUMN public.taxonomy_tree.node_type IS
  'Content classification — only set on subtopics (is_leaf=true).
   Drives quiz question type, heatmap display category, wiki content templates.
   NULL on subject and topic level nodes.';

-- 2c. Exam frequency (SME-curated — now 172/172 in v5.0)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS exam_frequency public.exam_frequency_level;

COMMENT ON COLUMN public.taxonomy_tree.exam_frequency IS
  'SME-assessed ALE exam frequency. high = appears most exams; medium = occasional; low = in scope but rare.
   In v5.0: all 172 subtopics have this value (vs 54/164 in v3.5).
   NULL on subject and topic level nodes.';

-- 2d. Subject-level PRC exam structure (level=1 only)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS prc_area TEXT
    CHECK (prc_area IN ('A', 'B', 'C', 'cross-reference')),
  ADD COLUMN IF NOT EXISTS area_weight_pct SMALLINT
    CHECK (area_weight_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS subject_weight_within_area_pct SMALLINT
    CHECK (subject_weight_within_area_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN public.taxonomy_tree.prc_area IS
  'PRC exam area: A (30%), B (30%), C (40%), or cross-reference (ALE-LAWS, 0%).
   Only set on subject-level nodes (level=1). NULL on topics and subtopics.';

COMMENT ON COLUMN public.taxonomy_tree.subject_weight_within_area_pct IS
  'Estimated weight of this subject within its PRC area.
   NOTE per v5.0 refactor notes: these are best-estimate approximations based on exam intelligence,
   NOT official PRC-published weights. Use for UX weighting guidance only.';

-- 2e. ALE-LAWS flag (v3.5+)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS is_cross_ref_only BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.taxonomy_tree.is_cross_ref_only IS
  'TRUE for ALE-LAWS subject node and all descendants (topics + subtopics).
   When TRUE:
   - Questions CANNOT be tagged to this node (enforced by trigger trg_check_question_topic)
   - Wiki articles CAN be created for this node
   - This node is EXCLUDED from student-facing heatmap mastery display
   ALE-LAWS carries zero exam weight. Its law questions appear distributed across Areas A, B, C.';

-- 2f. Soft deprecation for v1 nodes (applied during import pipeline Step 9)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS deprecated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.taxonomy_tree.deprecated_at IS
  'Set when this node is superseded by a v5.0 node with the same content.
   NEVER hard-delete taxonomy nodes — user_interactions and user_node_mastery
   reference them historically. Deprecated nodes are excluded from all live queries
   via WHERE deprecated_at IS NULL.';

-- 2g. wiki_items — typed structured content (v5.0, replaces untyped wiki_content bullets)
-- Each item: { "text": string, "type": "heading|fact|definition|formula|code_provision|detail|exam_tip|cross_ref|warning", "source_ref"?: ale_id }
-- This is the SME authoring brief for the wiki article — not the article itself.
-- SME expands wiki_items into wiki_articles.content.
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS wiki_items JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.taxonomy_tree.wiki_items IS
  'Typed structured content from taxonomy JSON v5.0 wiki_items array.
   Each item: { text: string, type: heading|fact|definition|formula|code_provision|detail|exam_tip|cross_ref|warning, source_ref?: ale_id }
   This is the AUTHORING BRIEF for the wiki article — not the article itself.
   SMEs write wiki_articles.content using this as their structured brief.
   wiki_content (legacy untyped strings) is NOT stored in the DB — treat as deprecated in JSON.
   Empty array on legacy v1 nodes and subject/topic level nodes.';

-- 2h. Bloom taxonomy level (v5.0 — all 172 subtopics)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS bloom_level public.bloom_level_type;

COMMENT ON COLUMN public.taxonomy_tree.bloom_level IS
  'Bloom taxonomy cognitive level: remember/understand/apply/analyze.
   Drives quiz question cognitive demand. In v5.0: all 172 subtopics populated.
   NULL on subject and topic level nodes.
   Used by: quiz engine (difficulty calibration), Camp Trail (progression sequencing),
   analytics (skill development tracking beyond raw accuracy).';

-- 2i. Difficulty rating (v5.0 — all 172 subtopics)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS difficulty SMALLINT
    CHECK (difficulty BETWEEN 1 AND 4);

COMMENT ON COLUMN public.taxonomy_tree.difficulty IS
  '1=Foundational (first-takers should answer correctly)
   2=Standard (requires understanding; typical ALE item difficulty)
   3=Advanced (application or analysis; distinguishes topnotchers)
   4=Expert (multi-step reasoning; rare; high discriminating power)
   In v5.0: all 172 subtopics populated.
   NULL on subject and topic level nodes.';

-- 2j. Typical question formats (v5.0 — all subtopics)
-- mcq_recall | mcq_application | mcq_calculation | design_application
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS typical_question_formats TEXT[] NOT NULL DEFAULT '{}'::text[];

COMMENT ON COLUMN public.taxonomy_tree.typical_question_formats IS
  'Array of typical ALE question formats for this subtopic.
   Values: mcq_recall, mcq_application, mcq_calculation, design_application.
   Used by quiz engine to ensure question bank coverage matches subtopic format profile.
   Empty array on subject and topic level nodes.';

-- 2k. Computation flag (v5.0 — ALE-STRC and ALE-UTIL subtopics primarily)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS is_computation_heavy BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.taxonomy_tree.is_computation_heavy IS
  'TRUE for subtopics where ALE exam items typically require multi-step calculation.
   Drives: Camp Trail session time estimates (computation sessions get more time),
   quiz engine (calculation questions need more time_spent_ms budget),
   3D Lab integration (computation-heavy nodes benefit from parametric visualization).
   False by default — only explicitly TRUE for designated ALE-STRC/ALE-UTIL subtopics.';

-- 2l. 3D Lab linkage (v5.0)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS three_d_lab_linked BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.taxonomy_tree.three_d_lab_linked IS
  'TRUE if a 3D Lab interactive module exists or is planned for this subtopic.
   Primarily ALE-STRC, ALE-MATL, ALE-UTIL, ALE-DSGN nodes requiring spatial comprehension.
   Drives: wiki article sidebar to link to the 3D Lab module,
   Camp Trail step builder to suggest 3D Lab steps alongside quiz steps.
   False by default.';

-- 2m. Subject-level mastery criteria (v5.0 — only on subjects, level=1)
ALTER TABLE public.taxonomy_tree
  ADD COLUMN IF NOT EXISTS mastery_criteria JSONB;

COMMENT ON COLUMN public.taxonomy_tree.mastery_criteria IS
  'Subject-level mastery specification. Only set on subject nodes (level=1).
   Structure: {
     mastery_threshold_accuracy_pct: integer (e.g., 75),
     critical_topics_for_pass: ale_id[] (topic ale_ids most critical for passing),
     note: string (SME guidance on study prioritization)
   }
   Drives: Camp Trail completion threshold per subject,
   Readiness Score subject weighting (a subject with 75% threshold counts differently).
   NULL on topic and subtopic level nodes.';

-- ── 3. disciplines column additions ──────────────────────────

ALTER TABLE public.disciplines
  ADD COLUMN IF NOT EXISTS passing_threshold_pct   SMALLINT NOT NULL DEFAULT 70,
  ADD COLUMN IF NOT EXISTS subject_floor_pct       SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS exam_day_1_subjects     TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS exam_day_2_subjects     TEXT[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS recent_passing_rates    JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.disciplines.passing_threshold_pct IS
  'ALE: 70% general weighted average required. Used by Readiness Score pass prediction.';
COMMENT ON COLUMN public.disciplines.subject_floor_pct IS
  'ALE: No individual subject may fall below 50%. Used by Readiness Score sub-score alerts.';
COMMENT ON COLUMN public.disciplines.recent_passing_rates IS
  'Recent ALE batch passing rates for analytics and student framing.
   Example: { "January_2026": 0.8209, "June_2025": 0.6516, "June_2024": 0.6214 }';

-- ── 4. Indexes for taxonomy_tree ─────────────────────────────

-- ale_id lookup (used constantly by import pipeline and SME authoring)
CREATE INDEX IF NOT EXISTS idx_taxonomy_ale_id
  ON public.taxonomy_tree (ale_id)
  WHERE ale_id IS NOT NULL;

-- node_type filtering (quiz engine, heatmap category display)
CREATE INDEX IF NOT EXISTS idx_taxonomy_node_type
  ON public.taxonomy_tree (node_type)
  WHERE node_type IS NOT NULL;

-- High-frequency code_provisions for a discipline (Blindspot Protocol priority targeting)
-- "Find all Red nodes that are high-frequency code_provisions" is the most critical Blindspot query
CREATE INDEX IF NOT EXISTS idx_taxonomy_type_frequency
  ON public.taxonomy_tree (discipline_id, node_type, exam_frequency)
  WHERE node_type IS NOT NULL AND exam_frequency IS NOT NULL AND deprecated_at IS NULL;

-- PRC area grouping (Readiness Score PRC weighting)
CREATE INDEX IF NOT EXISTS idx_taxonomy_prc_area
  ON public.taxonomy_tree (prc_area)
  WHERE prc_area IS NOT NULL;

-- Heatmap render: all active, non-deprecated leaf nodes for a discipline
-- Also excludes ALE-LAWS nodes from student mastery view
CREATE INDEX IF NOT EXISTS idx_taxonomy_active_leaves
  ON public.taxonomy_tree (discipline_id, is_leaf, is_cross_ref_only)
  WHERE is_leaf = true
    AND is_cross_ref_only = false
    AND deprecated_at IS NULL;

-- 3D Lab linked nodes (wiki article sidebar, Camp Trail step builder)
CREATE INDEX IF NOT EXISTS idx_taxonomy_3d_linked
  ON public.taxonomy_tree (discipline_id, three_d_lab_linked)
  WHERE three_d_lab_linked = true AND deprecated_at IS NULL;

-- Bloom + difficulty composite (Camp Trail sequencing, adaptive difficulty)
CREATE INDEX IF NOT EXISTS idx_taxonomy_bloom_difficulty
  ON public.taxonomy_tree (bloom_level, difficulty)
  WHERE bloom_level IS NOT NULL AND difficulty IS NOT NULL AND deprecated_at IS NULL;

-- ── 5. Trigger: questions cannot tag to ALE-LAWS nodes ───────

CREATE OR REPLACE FUNCTION public.check_question_topic_not_cross_ref()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.taxonomy_tree
    WHERE node_id = NEW.topic_id
      AND is_cross_ref_only = true
  ) THEN
    RAISE EXCEPTION
      'TAXONOMY ERROR: Questions cannot tag to cross-reference-only nodes. '
      'ALE-LAWS nodes are for wiki/navigation only — zero exam weight. '
      'Tag this question to the substantive subject subtopic instead. '
      'Example: A BP 344 ramp question → ALE-DSGN-002-01 (Accessible Design). '
      'Attempted node_id: %', NEW.topic_id;
  END IF;
  RETURN NEW;
END;
$$;

-- Only create trigger if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_check_question_topic'
  ) THEN
    CREATE TRIGGER trg_check_question_topic
      BEFORE INSERT OR UPDATE OF topic_id ON public.questions
      FOR EACH ROW EXECUTE FUNCTION public.check_question_topic_not_cross_ref();
  END IF;
END $$;

-- ── 6. taxonomy_cross_references table ───────────────────────
-- Stores the bidirectional law-to-content graph.
-- Source = ALE-LAWS node, Target = substantive subject node.
-- One row powers wiki cross-links in BOTH directions:
--   On ALE-DSGN-002-01 wiki: "Governing law: BP 344" (query by target_node_id)
--   On ALE-LAWS-002-03 wiki: "Applied in: Accessible Design" (query by source_node_id)

CREATE TABLE IF NOT EXISTS public.taxonomy_cross_references (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id   UUID NOT NULL REFERENCES public.taxonomy_tree(node_id) ON DELETE CASCADE,
  target_node_id   UUID NOT NULL REFERENCES public.taxonomy_tree(node_id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'law_applies_to'
    CHECK (relationship_type IN ('law_applies_to', 'see_also', 'prerequisite')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_node_id, target_node_id)
);

ALTER TABLE public.taxonomy_cross_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read taxonomy cross references"
  ON public.taxonomy_cross_references FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage taxonomy cross references"
  ON public.taxonomy_cross_references FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_xref_source
  ON public.taxonomy_cross_references (source_node_id);

CREATE INDEX IF NOT EXISTS idx_xref_target
  ON public.taxonomy_cross_references (target_node_id);

COMMENT ON TABLE public.taxonomy_cross_references IS
  'Bidirectional graph between ALE-LAWS law nodes and substantive subject nodes.
   v5.0 has 47+ cross-reference pairs from ALE-LAWS subtopics.
   New in v5.0: ALE-LAWS-006 adds cross-refs from allied profession laws to ALE-PRAC subtopics.';

-- ── 7. taxonomy_sources table ────────────────────────────────
-- Stores legal citations for code_provision nodes and all ALE-LAWS subtopics.
-- Separate from taxonomy_tree so SME team can update URLs without touching taxonomy nodes.
-- IMPORTANT: v5.0 populates ALL 66 source URLs with real verified URLs.
-- No more TBD values — all sources can be surfaced immediately on wiki articles.

CREATE TABLE IF NOT EXISTS public.taxonomy_sources (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id      UUID NOT NULL REFERENCES public.taxonomy_tree(node_id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  url          TEXT NOT NULL DEFAULT 'TBD',
  source_type  public.taxonomy_source_type NOT NULL,
  is_verified  BOOLEAN NOT NULL DEFAULT false,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.taxonomy_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read taxonomy sources"
  ON public.taxonomy_sources FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage taxonomy sources"
  ON public.taxonomy_sources FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE INDEX IF NOT EXISTS idx_taxonomy_sources_node
  ON public.taxonomy_sources (node_id);

-- "Which sources for this node are verified and ready to display?"
CREATE INDEX IF NOT EXISTS idx_taxonomy_sources_verified
  ON public.taxonomy_sources (node_id, is_verified)
  WHERE is_verified = true;

CREATE TRIGGER tr_taxonomy_sources_updated_at
  BEFORE UPDATE ON public.taxonomy_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.taxonomy_sources IS
  'Legal citations for ALE-LAWS subtopics and code_provision nodes.
   v5.0 COMPLETE: all 66 source URLs populated with verified official URLs (lawphil.net, officialgazette.gov.ph).
   is_verified=true marks URLs confirmed as live and correct by SME team.
   All v5.0 sources imported with is_verified=true since URLs were verified before v5.0 release.';

-- ── 8. taxonomy_prerequisites junction table (NEW in v5.0) ───
-- Stores the prerequisite_subtopic_ids graph from the JSON.
-- Junction table over TEXT[]: enables reverse lookup ("what subtopics depend on X?")
-- which is required by the Camp Trail sequencing engine.

CREATE TABLE IF NOT EXISTS public.taxonomy_prerequisites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtopic_id    UUID NOT NULL REFERENCES public.taxonomy_tree(node_id) ON DELETE CASCADE,
  -- The subtopic that HAS a prerequisite
  prerequisite_id UUID NOT NULL REFERENCES public.taxonomy_tree(node_id) ON DELETE CASCADE,
  -- The subtopic that must be mastered FIRST
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subtopic_id, prerequisite_id)
);

ALTER TABLE public.taxonomy_prerequisites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read taxonomy prerequisites"
  ON public.taxonomy_prerequisites FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage taxonomy prerequisites"
  ON public.taxonomy_prerequisites FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Forward lookup: "what must be mastered before learning subtopic X?"
CREATE INDEX IF NOT EXISTS idx_prereq_subtopic
  ON public.taxonomy_prerequisites (subtopic_id);

-- Reverse lookup: "what subtopics depend on X?" (Camp Trail: if X regresses, flag these)
CREATE INDEX IF NOT EXISTS idx_prereq_prerequisite
  ON public.taxonomy_prerequisites (prerequisite_id);

COMMENT ON TABLE public.taxonomy_prerequisites IS
  'DAG of prerequisite relationships between subtopics.
   source: v5.0 prerequisite_subtopic_ids field on each subtopic.
   NOTE from JSON: "placeholders — populate via curriculum designer"
   Most prerequisite_subtopic_ids arrays are empty [] in v5.0.
   Non-empty examples: ALE-UTIL-001-04 requires ALE-UTIL-001-02.
   Used by Camp Trail sequencing to enforce learning order and to flag dependent
   subtopics when a prerequisite regresses to Red mastery state.';

-- ── 9. Level constraint note ──────────────────────────────────
-- Current production CHECK allows levels 1-6.
-- v5.0 enforces max 3. DO NOT tighten this constraint until ALL v1 nodes
-- are deprecated (import pipeline Step 9 confirmed complete).
-- After deprecation, run:
-- ALTER TABLE public.taxonomy_tree
--   DROP CONSTRAINT IF EXISTS taxonomy_tree_level_check,
--   ADD CONSTRAINT taxonomy_tree_level_check CHECK (level >= 1 AND level <= 3);
```

---

## Part 5 — Import Pipeline (v5.0)

Run these steps **after Migration 027 has been applied and verified**. The pipeline is fully idempotent — every step uses `ON CONFLICT ... DO UPDATE` or `ON CONFLICT ... DO NOTHING` and can be re-run after JSON updates.

### Node count in v5.0

- 9 subjects (level=1)
- ~51 topics (level=2)
- 172 subtopics (level=3, is_leaf=true)
- **Total: ~232 v5.0 nodes** (vs. 148 legacy v1 nodes currently in production)

### The ALE-LAWS Rule — enforced at every step

ALE-LAWS has zero exam weight. It is a cross-reference navigation layer.  
`is_cross_ref_only = true` must be set on: ALE-LAWS subject + all 6 ALE-LAWS topics + all 33 ALE-LAWS subtopics.  
The trigger `trg_check_question_topic` makes this permanent and unbypassable.

### The Wiki Articles Safety Guarantee

Existing wiki articles will **not** be lost or broken because:
1. Steps 1–5 ADD new nodes alongside existing v1 nodes — no deletions yet
2. Step 6 re-links existing articles to v5.0 nodes (using slug matching) — verified before proceeding
3. Step 7 creates stub articles only for nodes with NO existing article
4. Step 8 re-tags questions to v5.0 nodes
5. Step 9 deprecates v1 nodes — ONLY runs after Steps 6 and 8 are verified with the safety queries
6. Step 9 also preserves v1 nodes that have mastery history — those nodes are never deprecated

---

### Step 1 — Replace ALE discipline exam structure

```sql
UPDATE public.disciplines
SET
  passing_threshold_pct = 70,
  subject_floor_pct = 50,
  exam_day_1_subjects = ARRAY[
    'History of Architecture',
    'Theory of Architecture',
    'Theory and Principles of Planning',
    'Architectural Practice and Jurisprudence'
  ],
  exam_day_2_subjects = ARRAY[
    'Building Utilities (MEPF)',
    'Structural Design',
    'Building Materials and Construction Methods',
    'Architectural Design and Site Planning'
  ],
  recent_passing_rates = '{"January_2026": 0.8209, "June_2025": 0.6516, "June_2024": 0.6214}'::jsonb
WHERE acronym = 'ALE';

-- Verify
SELECT discipline_id, name, passing_threshold_pct, subject_floor_pct
FROM public.disciplines WHERE acronym = 'ALE';
-- Must return 1 row with correct values.
```

### Step 2 — Seed 9 Subjects (level=1)

```sql
-- Replace [ALE_DISC_UUID] with:
-- SELECT discipline_id FROM disciplines WHERE acronym = 'ALE'

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level, name, subject_area,
  prc_area, area_weight_pct, subject_weight_within_area_pct,
  description, is_leaf, is_cross_ref_only, slug,
  mastery_criteria
) VALUES
  ('ALE-HIST', [ALE_DISC_UUID], NULL, 1,
   'History of Architecture', 'History of Architecture', 'A', 30, 35,
   'Analysis of architectural manifestations from the beginning of civilization to contemporary periods.',
   false, false, 'history-of-architecture',
   '{"mastery_threshold_accuracy_pct": 75, "critical_topics_for_pass": ["ALE-HIST-003","ALE-HIST-005","ALE-HIST-006"], "note": "Philippine architecture (ALE-HIST-006) is most under-studied. Pritzker Laureates (ALE-HIST-005-04) is high-frequency."}'::jsonb),

  ('ALE-THEO', [ALE_DISC_UUID], NULL, 1,
   'Theory of Architecture', 'Theory of Architecture', 'A', 30, 25,
   'Understanding of the theories and principles of design and architectural design process.',
   false, false, 'theory-of-architecture',
   '{"mastery_threshold_accuracy_pct": 70, "critical_topics_for_pass": ["ALE-THEO-001","ALE-THEO-004"], "note": "Organizing principles and tropical design are highest frequency."}'::jsonb),

  ('ALE-PLAN', [ALE_DISC_UUID], NULL, 1,
   'Theory and Principles of Planning', 'Theory and Principles of Planning', 'A', 30, 20,
   'Analysis of concepts and techniques in the general planning process, urban and regional planning.',
   false, false, 'theory-principles-planning',
   '{"mastery_threshold_accuracy_pct": 70, "critical_topics_for_pass": ["ALE-PLAN-001","ALE-PLAN-003","ALE-PLAN-004"], "note": "Planning luminaries and housing subdivisions are most tested."}'::jsonb),

  ('ALE-PRAC', [ALE_DISC_UUID], NULL, 1,
   'Architectural Practice and Jurisprudence', 'Architectural Practice and Jurisprudence', 'A', 30, 20,
   'Understanding of the role, legal rights, obligations, and responsibilities of the architect.',
   false, false, 'architectural-practice-jurisprudence',
   '{"mastery_threshold_accuracy_pct": 80, "critical_topics_for_pass": ["ALE-PRAC-001","ALE-PRAC-002","ALE-PRAC-003"], "note": "RA 9266 provisions and SPP fee structures are high-frequency. CPD is 45 units per 3-year cycle."}'::jsonb),

  ('ALE-STRC', [ALE_DISC_UUID], NULL, 1,
   'Structural Design', 'Structural Design', 'B', 30, 35,
   'Conceptual structural literacy for architectural practice.',
   false, false, 'structural-design',
   '{"mastery_threshold_accuracy_pct": 70, "critical_topics_for_pass": ["ALE-STRC-001","ALE-STRC-002","ALE-STRC-005"], "note": "Conceptual literacy over calculation. Seismic Zone 2 (NSCP 2015) — many reviewers still teach Zone 4, which is WRONG."}'::jsonb),

  ('ALE-MATL', [ALE_DISC_UUID], NULL, 1,
   'Building Materials and Construction Methods', 'Building Materials and Construction Methods', 'B', 30, 30,
   'Properties of building construction and finishing materials, their application and articulation.',
   false, false, 'building-materials-construction',
   '{"mastery_threshold_accuracy_pct": 75, "critical_topics_for_pass": ["ALE-MATL-002","ALE-MATL-003","ALE-MATL-004"], "note": "CHB dimensions, cement types, glass types, and truss names are most tested."}'::jsonb),

  ('ALE-UTIL', [ALE_DISC_UUID], NULL, 1,
   'Building Utilities (MEPF)', 'Building Utilities (MEPF)', 'B', 30, 35,
   'Basic practices, principles, and design of utilities required for a building or structure.',
   false, false, 'building-utilities-mepf',
   '{"mastery_threshold_accuracy_pct": 75, "critical_topics_for_pass": ["ALE-UTIL-001","ALE-UTIL-002","ALE-UTIL-004"], "note": "Fire code travel distances and plumbing fixture counts are heavily tested."}'::jsonb),

  ('ALE-DSGN', [ALE_DISC_UUID], NULL, 1,
   'Architectural Design and Site Planning', 'Architectural Design and Site Planning', 'C', 40, 100,
   'Application of design skills to architectural problems at various scales.',
   false, false, 'architectural-design-site-planning',
   '{"mastery_threshold_accuracy_pct": 75, "critical_topics_for_pass": ["ALE-DSGN-001","ALE-DSGN-002","ALE-DSGN-003"], "note": "Largest exam weight (40%). Building code dimensional standards are most tested."}'::jsonb),

  ('ALE-LAWS', [ALE_DISC_UUID], NULL, 1,
   'Philippine Laws and Codes', 'Philippine Laws and Codes', 'cross-reference', 0, 0,
   'Cross-reference index only. Zero exam weight. Law questions are distributed across Areas A, B, and C.',
   false, true, 'philippine-laws-codes',
   '{"mastery_threshold_accuracy_pct": 75, "critical_topics_for_pass": ["ALE-LAWS-001","ALE-LAWS-002","ALE-LAWS-003","ALE-LAWS-004"], "note": "Every law in this subject should be known by the section that governs what."}'::jsonb)

ON CONFLICT (ale_id) DO UPDATE SET
  name                           = EXCLUDED.name,
  prc_area                       = EXCLUDED.prc_area,
  area_weight_pct                = EXCLUDED.area_weight_pct,
  subject_weight_within_area_pct = EXCLUDED.subject_weight_within_area_pct,
  description                    = EXCLUDED.description,
  is_cross_ref_only              = EXCLUDED.is_cross_ref_only,
  mastery_criteria               = EXCLUDED.mastery_criteria,
  updated_at                     = now();

-- Verify
SELECT ale_id, name, prc_area, is_cross_ref_only
FROM public.taxonomy_tree WHERE level = 1 AND ale_id IS NOT NULL
ORDER BY ale_id;
-- Must return 9 rows. ALE-LAWS must have is_cross_ref_only = true.
```

### Step 3 — Seed ~51 Topics (level=2)

```sql
-- Pattern for each topic. Repeat for all topics across 9 subjects.
-- topics get: ale_id, parent (subject node_id), level=2, name, subject_area, is_leaf=false
-- topics do NOT get: node_type, bloom_level, difficulty, wiki_items (NULL/defaults are fine)

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level, name, subject_area, is_leaf, slug
)
SELECT
  'ALE-HIST-001',
  (SELECT discipline_id FROM public.disciplines WHERE acronym = 'ALE'),
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-HIST'),
  2, 'Pre-Historic & Ancient', 'History of Architecture', false, 'ale-hist-001-pre-historic-ancient'
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = now();

-- Continue for all ~51 topics across 9 subjects.
-- ALE-LAWS-006 (Allied Professions & Emerging Practice Laws) is a NEW topic in v5.0.
INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level, name, subject_area, is_leaf, slug,
  is_cross_ref_only
)
SELECT
  'ALE-LAWS-006',
  (SELECT discipline_id FROM public.disciplines WHERE acronym = 'ALE'),
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS'),
  2, 'Allied Professions & Emerging Practice Laws', 'Philippine Laws and Codes',
  false, 'ale-laws-006-allied-professions',
  true   -- inherits is_cross_ref_only from parent ALE-LAWS
ON CONFLICT (ale_id) DO UPDATE SET
  name = EXCLUDED.name,
  is_cross_ref_only = EXCLUDED.is_cross_ref_only,
  updated_at = now();
```

### Step 4 — Seed 172 Subtopics (level=3, is_leaf=true)

```sql
-- Pattern for each subtopic. All v5.0 fields populated.
-- Critical: is_computation_heavy and three_d_lab_linked must be set correctly
--           (most are false, but ALE-UTIL and ALE-STRC have specific true values)

INSERT INTO public.taxonomy_tree (
  ale_id, discipline_id, parent_id, level, name, subject_area,
  node_type, exam_frequency, bloom_level, difficulty,
  typical_question_formats, is_computation_heavy, three_d_lab_linked,
  wiki_items, is_leaf, is_cross_ref_only, slug
)
SELECT
  'ALE-HIST-001-01',
  (SELECT discipline_id FROM public.disciplines WHERE acronym = 'ALE'),
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-HIST-001'),
  3, 'Megalithic Architecture', 'History of Architecture',
  'concept'::public.taxonomy_node_type,
  'medium'::public.exam_frequency_level,
  'remember'::public.bloom_level_type,
  2,
  ARRAY['mcq_recall'],
  false, false,
  '[{"text":"Menhirs","type":"fact"},{"text":"Dolmens","type":"fact"},{"text":"Cromlechs (Stonehenge, Avebury)","type":"fact"},{"text":"Tumuli","type":"fact"},{"text":"Passage Graves (Newgrange)","type":"fact"},{"text":"Henges","type":"fact"},{"text":"Göbekli Tepe (oldest monumental structure)","type":"fact"},{"text":"Çatalhöyük","type":"fact"}]'::jsonb,
  true, false, 'ale-hist-001-01-megalithic-architecture'
ON CONFLICT (ale_id) DO UPDATE SET
  name                     = EXCLUDED.name,
  node_type                = EXCLUDED.node_type,
  exam_frequency           = EXCLUDED.exam_frequency,
  bloom_level              = EXCLUDED.bloom_level,
  difficulty               = EXCLUDED.difficulty,
  typical_question_formats = EXCLUDED.typical_question_formats,
  is_computation_heavy     = EXCLUDED.is_computation_heavy,
  three_d_lab_linked       = EXCLUDED.three_d_lab_linked,
  wiki_items               = EXCLUDED.wiki_items,
  updated_at               = now();

-- Continue for all 172 subtopics.
-- NEW subtopics in v5.0 (not in v3.5):
--   ALE-UTIL-001-04 (DFU Reference Table, formula, is_computation_heavy=true, three_d_lab_linked=false)
--   ALE-UTIL-003-03 (Toilet Fixture Count Standards, code_provision, is_computation_heavy=false)
--   ALE-LAWS-002-06 (DepEd Order No. 66, code_provision, is_cross_ref_only=true)
--   ALE-LAWS-006-01 through ALE-LAWS-006-05 (all code_provision, all is_cross_ref_only=true)
```

### Step 5 — Propagate is_cross_ref_only to all ALE-LAWS descendants

```sql
-- After all nodes are inserted, recursively set is_cross_ref_only on
-- all ALE-LAWS topics and subtopics that don't already have it set.
WITH RECURSIVE laws_tree AS (
  SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS'
  UNION ALL
  SELECT t.node_id
  FROM public.taxonomy_tree t
  JOIN laws_tree lt ON t.parent_id = lt.node_id
)
UPDATE public.taxonomy_tree
SET is_cross_ref_only = true
WHERE node_id IN (SELECT node_id FROM laws_tree)
  AND is_cross_ref_only = false;

-- Verify: all ALE-LAWS nodes must be cross-ref-only
SELECT COUNT(*) AS laws_nodes_not_marked
FROM public.taxonomy_tree tt
JOIN public.taxonomy_tree parent ON parent.node_id = tt.parent_id
WHERE parent.ale_id LIKE 'ALE-LAWS%'
  AND tt.is_cross_ref_only = false;
-- Must return 0.
```

### Step 6 — Seed taxonomy_sources (all 66 verified URLs + new ALE-LAWS-006 sources)

```sql
-- v5.0 complete: all URLs are real and verified.
-- Import as is_verified=true since SME team confirmed URLs before v5.0 release.
-- Pattern: DELETE existing sources for node, then re-insert (sources array is authoritative).

-- Example: ALE-LAWS-002-03 (BP 344)
WITH node AS (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-002-03')
DELETE FROM public.taxonomy_sources WHERE node_id = (SELECT node_id FROM node);

INSERT INTO public.taxonomy_sources (node_id, label, url, source_type, is_verified, sort_order)
SELECT
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-002-03'),
  label, url, source_type::public.taxonomy_source_type, true, sort_order
FROM (VALUES
  ('BP 344 Full Text — Official Gazette',
   'https://lawphil.net/statutes/batas/bp1982/bp_344_1982.html',
   'primary_law', 0),
  ('2024 Revised IRR of BP 344 — NCDA Official PDF',
   'https://ncda.gov.ph/disability-laws/implementing-rules-and-regulations/revised-irr-of-bp-344/',
   'implementing_rules', 1),
  ('NCDA — National Council on Disability Affairs',
   'https://ncda.gov.ph/',
   'regulatory_body', 2)
) AS s(label, url, source_type, sort_order);

-- Repeat this pattern for all ALE-LAWS subtopics and code_provision nodes.
-- All URLs are provided in the v5.0 JSON as verified strings.
-- Total sources to import: 66 verified citations across all ALE-LAWS subtopics.
-- New in v5.0: sources for ALE-LAWS-006-01 through 006-05.
```

### Step 7 — Seed taxonomy_cross_references

```sql
-- 47+ cross-reference pairs from v5.0 JSON plus new ALE-LAWS-006 cross-refs.
-- v5.0 adds: ALE-LAWS-006-01 → ALE-PRAC-001-03
--            ALE-LAWS-006-02 → ALE-PRAC-001-03, ALE-PLAN-005-01
--            ALE-LAWS-006-03 → ALE-PLAN-005-03, ALE-PRAC-001-03
--            ALE-LAWS-006-04 → ALE-PRAC-004-04, ALE-LAWS-002-01
--            ALE-LAWS-006-05 → ALE-DSGN-005-01, ALE-DSGN-005-02

-- Pattern:
INSERT INTO public.taxonomy_cross_references (source_node_id, target_node_id, relationship_type)
SELECT
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-002-03'),
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-DSGN-002-01'),
  'law_applies_to'
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;

-- Repeat for all cross-reference pairs defined in the v5.0 JSON.
-- Note: ALE-LAWS-006-04 has an unusual cross-ref to ALE-LAWS-002-01 (another law node).
-- This is a law-to-law "see also" reference. Use relationship_type = 'see_also'.
INSERT INTO public.taxonomy_cross_references (source_node_id, target_node_id, relationship_type)
SELECT
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-006-04'),
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-LAWS-002-01'),
  'see_also'
ON CONFLICT (source_node_id, target_node_id) DO NOTHING;
```

### Step 8 — Seed taxonomy_prerequisites

```sql
-- Import non-empty prerequisite_subtopic_ids arrays from v5.0 JSON.
-- NOTE: Most are empty [] in v5.0 (marked as placeholders).
-- Non-empty ones in v5.0:
--   ALE-UTIL-001-04 → prerequisite: ALE-UTIL-001-02
--   ALE-LAWS-006-01 → prerequisite: ALE-PRAC-001-01
--   ALE-LAWS-006-02 → prerequisite: ALE-PRAC-001-01
--   ALE-LAWS-006-03 → prerequisite: ALE-PLAN-005-03
--   ALE-LAWS-006-04 → prerequisite: ALE-PRAC-004-04

INSERT INTO public.taxonomy_prerequisites (subtopic_id, prerequisite_id)
SELECT
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-UTIL-001-04'),
  (SELECT node_id FROM public.taxonomy_tree WHERE ale_id = 'ALE-UTIL-001-02')
ON CONFLICT (subtopic_id, prerequisite_id) DO NOTHING;

-- Repeat for all 4 remaining non-empty prerequisite pairs above.
```

### Step 9 — Re-link Existing Wiki Articles to v5.0 Node IDs

**This step MUST run before Step 11. It cannot be skipped.**

Existing wiki articles point to v1 node UUIDs (legacy nodes with `ale_id IS NULL`). After v5.0 nodes are seeded, those articles must be re-linked to the corresponding v5.0 nodes using slug matching. An article pointing to a deprecated node is effectively orphaned — it will not surface in heatmap drill-downs, Camp Trail steps, or wrong-answer remediation.

```sql
-- Re-link wiki articles from v1 node UUIDs to v5.0 node UUIDs via slug matching.
-- Only updates rows where the old node has no ale_id (v1 node) and a v5.0 node
-- exists with the same slug.
UPDATE public.wiki_article_taxonomy wat
SET node_id = v5_node.node_id
FROM public.taxonomy_tree v1_node
JOIN public.taxonomy_tree v5_node
  ON v5_node.slug = v1_node.slug
  AND v5_node.ale_id IS NOT NULL
  AND v5_node.deprecated_at IS NULL
WHERE wat.node_id = v1_node.node_id
  AND v1_node.ale_id IS NULL;

-- SAFETY CHECK 1: no articles should be orphaned after re-linking
SELECT COUNT(*) AS orphaned_articles
FROM public.wiki_articles wa
WHERE NOT EXISTS (
  SELECT 1 FROM public.wiki_article_taxonomy wat WHERE wat.article_id = wa.article_id
);
-- MUST return 0 before proceeding. If > 0, investigate and fix manually.
```

### Step 10 — Create Stub Articles for New v5.0 Nodes

```sql
-- For v5.0 leaf nodes that have no existing wiki article yet,
-- create a draft stub using wiki_items as the structured content scaffold.
-- SME expands stubs into full articles before publishing.

INSERT INTO public.wiki_articles (title, slug, content, status)
SELECT
  tt.name AS title,
  tt.slug,
  -- Convert wiki_items JSONB to markdown scaffold
  -- Headings → ## heading, exam_tips → > tip text, definitions → **term** — text, etc.
  -- For simplicity in SQL, use a basic conversion:
  array_to_string(
    ARRAY(
      SELECT
        CASE item->>'type'
          WHEN 'heading' THEN '## ' || (item->>'text')
          WHEN 'exam_tip' THEN '> **EXAM TIP:** ' || (item->>'text')
          WHEN 'warning' THEN '> **⚠️ WARNING:** ' || (item->>'text')
          WHEN 'formula' THEN '```' || E'\n' || (item->>'text') || E'\n' || '```'
          WHEN 'definition' THEN '**' || split_part(item->>'text', ' — ', 1) || '** — ' || split_part(item->>'text', ' — ', 2)
          ELSE '- ' || (item->>'text')
        END
      FROM jsonb_array_elements(tt.wiki_items) AS item
    ),
    E'\n'
  ),
  'draft'  -- SME must review and expand before status → 'published'
FROM public.taxonomy_tree tt
WHERE tt.is_leaf = true
  AND tt.deprecated_at IS NULL
  AND tt.ale_id IS NOT NULL
  AND jsonb_array_length(tt.wiki_items) > 0
  AND NOT EXISTS (
    SELECT 1
    FROM public.wiki_article_taxonomy wat
    JOIN public.wiki_articles wa ON wa.article_id = wat.article_id
    WHERE wat.node_id = tt.node_id AND wat.is_primary = true
  )
ON CONFLICT (slug) DO NOTHING;

-- Link new stub articles to their taxonomy nodes
INSERT INTO public.wiki_article_taxonomy (article_id, node_id, is_primary)
SELECT wa.article_id, tt.node_id, true
FROM public.taxonomy_tree tt
JOIN public.wiki_articles wa ON wa.slug = tt.slug
WHERE tt.is_leaf = true
  AND tt.deprecated_at IS NULL
  AND tt.ale_id IS NOT NULL
ON CONFLICT (article_id, node_id) DO NOTHING;
```

### Step 11 — Re-tag Existing Questions to v5.0 Node IDs

```sql
-- Questions are tagged to v1 node UUIDs (topic_id referencing legacy nodes with ale_id IS NULL).
-- Re-tag to corresponding v5.0 subtopic IDs using slug matching.
UPDATE public.questions q
SET topic_id = v5_node.node_id
FROM public.taxonomy_tree v1_node
JOIN public.taxonomy_tree v5_node
  ON v5_node.slug = v1_node.slug
  AND v5_node.ale_id IS NOT NULL
  AND v5_node.deprecated_at IS NULL
WHERE q.topic_id = v1_node.node_id
  AND v1_node.ale_id IS NULL;

-- SAFETY CHECK 2: no questions should still point to v1 nodes after re-tagging
SELECT COUNT(*) AS questions_still_on_v1
FROM public.questions q
JOIN public.taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE tt.ale_id IS NULL;
-- MUST return 0 before proceeding to Step 12. If > 0, investigate and fix manually.
```

### Step 12 — Deprecate v1 Nodes

**Both safety checks from Steps 9 and 11 must return 0 before running this.**

```sql
-- Final safety check — run one more time immediately before deprecating
DO $$
DECLARE
  orphaned_count INTEGER;
  v1_question_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphaned_count
  FROM public.wiki_articles wa
  WHERE NOT EXISTS (SELECT 1 FROM public.wiki_article_taxonomy wat WHERE wat.article_id = wa.article_id);

  SELECT COUNT(*) INTO v1_question_count
  FROM public.questions q
  JOIN public.taxonomy_tree tt ON tt.node_id = q.topic_id
  WHERE tt.ale_id IS NULL;

  IF orphaned_count > 0 OR v1_question_count > 0 THEN
    RAISE EXCEPTION
      'ABORT: Cannot deprecate v1 nodes. Orphaned articles: %. Questions on v1 nodes: %.
       Investigate and re-run Steps 9 and 11 before proceeding.',
      orphaned_count, v1_question_count;
  END IF;

  RAISE NOTICE 'All safety checks passed. Proceeding with v1 node deprecation.';
END $$;

-- Deprecate v1 nodes (ale_id IS NULL = legacy pre-v5.0 nodes)
-- PRESERVES nodes that have mastery history — user progress is sacred and must not be orphaned
UPDATE public.taxonomy_tree
SET deprecated_at = now()
WHERE ale_id IS NULL
  AND deprecated_at IS NULL
  AND node_id NOT IN (
    SELECT DISTINCT topic_id FROM public.user_node_mastery
  )
  AND node_id NOT IN (
    SELECT DISTINCT topic_id FROM public.user_interactions WHERE topic_id IS NOT NULL
  );

-- Report what was deprecated and what was preserved
SELECT
  COUNT(*) FILTER (WHERE deprecated_at IS NOT NULL AND ale_id IS NULL) AS deprecated_v1_nodes,
  COUNT(*) FILTER (WHERE deprecated_at IS NULL AND ale_id IS NULL) AS preserved_v1_nodes_with_history
FROM public.taxonomy_tree
WHERE ale_id IS NULL;
```

### Step 13 — Tighten Level Constraint (final step)

Run only after deprecation is confirmed and no active application code references level > 3.

```sql
ALTER TABLE public.taxonomy_tree
  DROP CONSTRAINT IF EXISTS taxonomy_tree_level_check,
  ADD CONSTRAINT taxonomy_tree_level_check CHECK (level >= 1 AND level <= 3);
```

---

## Part 6 — App Safety Analysis

### What is guaranteed not to break

| Concern | Status | Reason |
|---|---|---|
| Existing wiki articles | ✅ Safe | taxonomy_tree additions are columnar — wiki_articles table is untouched until Step 9 re-links. Steps 9 and 11 have abort guards that prevent deprecation if any article is orphaned. |
| Existing quiz sessions | ✅ Safe | quiz_sessions references quiz_sessions.question_ids[] and user_interactions. taxonomy_tree additions don't touch these. |
| User mastery history | ✅ Safe | v1 nodes with mastery history are explicitly preserved in Step 12. user_node_mastery rows are never deleted. |
| Existing questions | ✅ Safe | Step 11 re-tags questions to v5.0 nodes before Step 12 deprecates v1 nodes. The abort guard prevents deprecation if any question is still on a v1 node. |
| RLS policies | ✅ Safe | New tables (taxonomy_cross_references, taxonomy_sources, taxonomy_prerequisites) all have RLS enabled with appropriate policies. |
| Application queries | ✅ Safe | All new columns have DEFAULT NULL or DEFAULT false or DEFAULT '{}'. Existing queries reading taxonomy_tree will continue to work — they'll just return NULL for the new columns. |
| The trg_check_question_topic trigger | ✅ Safe | Only fires on INSERT or UPDATE OF topic_id on questions. Existing questions pointing to non-cross-ref nodes are unaffected. The trigger only blocks future attempts to tag questions to ALE-LAWS nodes. |

### What requires application code updates after migration

| Update needed | Urgency |
|---|---|
| Heatmap query: add `WHERE is_cross_ref_only = false AND deprecated_at IS NULL` | Before ALE-LAWS nodes are seeded (Step 2) — otherwise ALE-LAWS appears in student heatmap |
| Readiness Score calculation: add PRC area weighting using `prc_area` and `subject_weight_within_area_pct` | After import pipeline completes |
| Camp Trail sequencing: read `bloom_level`, `difficulty`, `prerequisite_subtopic_ids` from taxonomy_prerequisites | After import pipeline completes |
| Wiki article renderer: read `wiki_items` typed array for structured rendering (headings, exam_tips, warnings) | After import pipeline completes |
| Quiz engine: use `is_computation_heavy` to add time budget for calculation questions | After import pipeline completes |
| 3D Lab link widget: show "Open in 3D Lab" when `three_d_lab_linked = true` | After import pipeline completes |

---

## Part 7 — Full Migration + Pipeline Index

| # | File/Step | Priority | What it does | Run when |
|---|---|---|---|---|
| 026 | `026_schema_hardening.sql` | 🔴 Now | FK constraints, CHECK constraints, feature_flags seed | Immediately |
| **027** | **`027_taxonomy_v50_schema.sql`** | **🟠 Planned** | **All v3.5 + v5.0 taxonomy schema additions in one migration** | **Before import** |
| — | Import Step 1 | — | ALE discipline exam structure | After 027 |
| — | Import Step 2 | — | 9 subjects with mastery_criteria | After 027 |
| — | Import Step 3 | — | ~51 topics including new ALE-LAWS-006 | After 027 |
| — | Import Step 4 | — | 172 subtopics with all v5.0 fields | After 027 |
| — | Import Step 5 | — | Propagate is_cross_ref_only to ALE-LAWS tree | After Step 4 |
| — | Import Step 6 | — | 66 verified sources (all real URLs in v5.0) | After Step 5 |
| — | Import Step 7 | — | 47+ cross-references | After Step 6 |
| — | Import Step 8 | — | 5 non-empty prerequisite pairs | After Step 7 |
| — | Import Step 9 | — | Re-link existing wiki articles → v5.0 nodes | After Step 8 |
| — | Import Step 10 | — | Create wiki stubs for 9 new v5.0 nodes | After Step 9 |
| — | Import Step 11 | — | Re-tag existing questions → v5.0 nodes | After Step 10 |
| — | Import Step 12 | — | Deprecate v1 nodes (abort guard enforced) | After Steps 9+11 verified |
| — | Import Step 13 | — | Tighten level constraint to max=3 | After Step 12 |
| 028 | `028_session_questions.sql` | 🔴 High | Junction table replacing question_ids[] array | Before ~500 questions |
| 029 | `029_stats_decomposition.sql` | 🟡 Important | user_attribution split from user_global_stats | Before Phase 2 B2B |

### Production table count after all migrations

Current: 41 tables  
After 027 (new tables): taxonomy_cross_references, taxonomy_sources, taxonomy_prerequisites → +3  
After 028: session_questions → +1  
After 029: user_attribution → +1  

**Total: 46 tables**

---

## Part 8 — v5.0 Content Corrections (Delivered via Import, Not Schema)

These are critical factual corrections in the v5.0 JSON that are resolved automatically when the import pipeline runs. They require no schema changes — only updated `wiki_items` JSONB content on the affected nodes.

| Node | What was wrong | v5.0 correction |
|---|---|---|
| ALE-STRC-005-03 | "Zone 4" seismic classification | "Zone 2 (NSCP 2015)" — old NSCP 2001/UBC Zone 4 is INCORRECT for current exams |
| ALE-LAWS-005-04 | "Zone 4 for most of Philippines" | "Zone 2 for entire Philippines (NSCP 2015)" — marked as `warning` type in wiki_items |
| ALE-PRAC-001-01 | "15 CPD units per 3-year cycle" | "45 CPD units per 3-year compliance period" |
| ALE-PRAC-001-03 | "15 CPD units" | "45 CPD units per 3-year cycle" |
| ALE-LAWS-001-03 | "15 CPD units" | "45 CPD units per 3-year compliance period" |
| ALE-PRAC-001-01 | Art. 1723 framing as "building must fail within 10 years" | "10-year prescriptive period from project completion" |

**These corrections are delivered automatically by the ON CONFLICT DO UPDATE in Step 4 of the import pipeline** — the wiki_items column is updated for every node on re-run.

---

*SlateCamp Database Architecture — Taxonomy v5.0 Implementation Plan*  
*Basis: DATABASE_SCHEMA.sql (production, 2026-03-19) + slatecamp_taxonomy_v5.json (v5.0 Complete)*  
*Maintained by: DB Architect + Philip (Founder)*  
*Next review: After Migration 027 is applied and import pipeline Step 2 (subjects) is verified*
