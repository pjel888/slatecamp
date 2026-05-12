# SlateCamp Feature Implementation Plan — Schema Reconciliation
**Date:** 2026-03-19
**Against:** DATABASE_SCHEMA.sql (44 tables, latest production)

---

## Summary

Yes, the plan needs updates. Three categories of issues: wrong migration numbers, missing schema additions that haven't been applied yet, and four SQL bugs that will cause runtime errors. The feature logic and implementation specs are all correct — only the schema layer needs fixing.

---

## 1 — Migration Numbering Conflict

The plan's migration summary assigns numbers that collide with migrations already reserved:

| Plan says | Reality |
|---|---|
| Migration 028 — session_questions (already planned) | Not applied. `session_questions` table does not exist in production. |
| Migration 029 — user_attribution (already planned) | Not applied. `user_attribution` table does not exist in production. |
| Migration 030 — profiles column additions | **CONFLICT.** Migration 030 is the Wiki EI schema fix (`030_wiki_ei_schema_fixes.sql`). |
| Migration 031 — design problems tables | **CONFLICT.** Migration 031 is the taxonomy deduplication fix (`031_taxonomy_deduplication.sql`). |

**Corrected numbering:**

| Correct # | Content |
|---|---|
| 028 | session_questions junction table |
| 029 | user_attribution split |
| 030 | Wiki EI schema fixes |
| 031 | Taxonomy deduplication |
| **032** | **profiles column additions** ← was labeled 030 |
| **033** | **design_problems + design_problem_sessions** ← was labeled 031 |
| **034** | **study_pods + pod_members** ← was labeled 032 |
| **035** | **oath_taking_schedules** ← was labeled 033 |
| **036** | **code_updates** ← was labeled 034 |
| **037** | **questions.practice_context** ← was labeled 036 |

---

## 2 — profiles Table: All New Columns Are Missing

The production `profiles` table has exactly these columns:
`id, full_name, display_name, avatar_url, user_type, discipline_id, target_exam_date, school_or_institution, onboarding_completed_at, created_at, updated_at, preferred_study_window`

Every column the plan proposes is absent:

| Column | Status | Tasks that need it |
|---|---|---|
| `reviewer_type` | ❌ Missing | 0.4 (Retaker Flow) |
| `previous_exam_subjects_struggled` | ❌ Missing | 0.4 (Retaker Flow) |
| `enrolled_review_center` | ❌ Missing | 1.5 (Review Center) |
| `comp_exam_scores` | ❌ Missing | 2.3 (Comp Exam Bridge) |
| `comp_exam_date` | ❌ Missing | 2.3 (Comp Exam Bridge) |
| `ale_result` | ❌ Missing | 0.7 (Results Day) |
| `oath_taking_date` | ❌ Missing | 0.7 (Results Day), 2.7 (Oath Email) |
| `account_mode` | ❌ Missing | 2.6 (Professional Mode) |

Sprint 0 Tasks 0.4 and 0.7 will fail at runtime until Migration 032 runs. None of these columns exist yet.

---

## 3 — New Tables: None Exist in Production

| Table | Status | Needed for |
|---|---|---|
| `design_problems` | ❌ Not created | Task 2.2 |
| `design_problem_sessions` | ❌ Not created | Task 2.2 |
| `oath_taking_schedules` | ❌ Not created | Task 2.7 |
| `code_updates` | ❌ Not created | Task 3.2 |
| `study_pods` | ❌ Not created | Task 3.4 |
| `pod_members` | ❌ Not created | Task 3.4 |

These are all Sprint 2/3 features so the missing tables don't block Sprint 0 or Sprint 1.

---

## 4 — Four SQL Bugs That Will Cause Runtime Errors

These are in the plan's schema change blocks and must be fixed before running the migrations.

### Bug 1 — `design_problem_sessions` references wrong column

**In the plan:**
```sql
user_id UUID REFERENCES public.profiles(user_id),  -- ❌ WRONG
```

**The problem:** `profiles` primary key is `id`, not `user_id`. There is no `user_id` column on `profiles`.

**Fix:**
```sql
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- ✅
```

---

### Bug 2 — `study_pods` references wrong column

**In the plan:**
```sql
created_by UUID REFERENCES profiles(user_id),  -- ❌ WRONG
```

**Fix:**
```sql
created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- ✅
```

---

### Bug 3 — `pod_members` references wrong column

**In the plan:**
```sql
pod_id UUID REFERENCES study_pods(pod_id),
user_id UUID REFERENCES profiles(user_id),  -- ❌ WRONG
```

**Fix:**
```sql
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- ✅
```

---

### Bug 4 — `user_bloom_breakdown` view has no RLS

The plan creates a VIEW that joins `user_interactions` with `taxonomy_tree`. Views in Postgres inherit the RLS of their underlying tables when accessed through the authenticated Supabase client — but only if the view is created with `security_invoker = true` (Postgres 15+).

Without this, the view runs as the view owner (typically `postgres`), bypassing all RLS on `user_interactions`. Every user can see every other user's bloom data.

**Fix — add security invoker:**
```sql
CREATE OR REPLACE VIEW public.user_bloom_breakdown
WITH (security_invoker = true)   -- ← ADD THIS
AS
SELECT
  ui.user_id,
  tt.subject_area,
  tt.bloom_level,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN ui.is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(SUM(CASE WHEN ui.is_correct THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100) as accuracy_pct
FROM user_interactions ui
JOIN questions q ON q.question_id = ui.question_id
JOIN taxonomy_tree tt ON tt.node_id = q.topic_id
WHERE tt.bloom_level IS NOT NULL
  AND tt.is_cross_ref_only = false
GROUP BY ui.user_id, tt.subject_area, tt.bloom_level;
```

---

## 5 — One Missing CHECK Constraint on profiles

The plan adds `reviewer_type` and `ale_result` as TEXT columns but only `ale_result` has a CHECK. `reviewer_type` should also have one:

**In the plan (TASK 0.4):**
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reviewer_type TEXT DEFAULT 'first_taker'
    CHECK (reviewer_type IN ('first_taker', 'returning_reviewer', 'undergrad', 'dae'));
```

This is actually correct as written — no change needed here. Just confirming it's complete.

But `account_mode` (TASK 2.6) is also correct with its CHECK constraint. Both are fine.

---

## 6 — Corrected Migration 032 (profiles column additions)

This is the complete, corrected version to replace the plan's "Migration 030" block:

```sql
-- ============================================================
-- Migration 032: profiles column additions
-- (was labeled Migration 030 in original plan — number corrected)
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reviewer_type TEXT DEFAULT 'first_taker'
    CHECK (reviewer_type IN ('first_taker', 'returning_reviewer', 'undergrad', 'dae')),
  ADD COLUMN IF NOT EXISTS previous_exam_subjects_struggled JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enrolled_review_center TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ale_result TEXT DEFAULT NULL
    CHECK (ale_result IN ('passed', 'failed', 'pending', NULL)),
  ADD COLUMN IF NOT EXISTS oath_taking_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS account_mode TEXT DEFAULT 'review_mode'
    CHECK (account_mode IN ('review_mode', 'professional_mode', 'student_mode', 'dae_mode'));

COMMENT ON COLUMN public.profiles.reviewer_type IS
  'Onboarding type. first_taker = first ALE attempt. returning_reviewer = has reviewed before.
   NEVER use "retaker" or "failed" in user-facing copy. Use "returning reviewer" always.';

COMMENT ON COLUMN public.profiles.ale_result IS
  'Set by user on Results Day flow. ''failed'' is stored internally but NEVER shown to user.
   User-facing copy: "returning reviewer", "next cycle", "your data is saved".';

COMMENT ON COLUMN public.profiles.account_mode IS
  'review_mode = default (ALE prep). professional_mode = post-pass.
   student_mode = BSA student (Studio Mode). dae_mode = licensed architect in DAE period.';
```

---

## 7 — Corrected Sprint 2/3 Table SQL

These replace the buggy versions in the plan:

```sql
-- ============================================================
-- Migration 033: design problems tables
-- (was labeled Migration 031)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.design_problems (
  problem_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  building_type     TEXT NOT NULL
    CHECK (building_type IN ('residential', 'commercial', 'institutional', 'mixed_use', 'industrial')),
  difficulty        INTEGER CHECK (difficulty BETWEEN 1 AND 4),
  time_limit_minutes INTEGER DEFAULT 180,
  brief             TEXT NOT NULL,
  program           JSONB NOT NULL DEFAULT '{}'::jsonb,
  site_data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  code_references   TEXT[] DEFAULT '{}'::text[],
  is_published      BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.design_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dp_select_published" ON public.design_problems
  FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "dp_admin_manage" ON public.design_problems
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));

CREATE TABLE IF NOT EXISTS public.design_problem_sessions (
  session_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- FIXED: was profiles(user_id)
  problem_id             UUID NOT NULL REFERENCES public.design_problems(problem_id) ON DELETE CASCADE,
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at           TIMESTAMPTZ,
  time_elapsed_seconds   INTEGER,
  self_assessment_score  INTEGER CHECK (self_assessment_score BETWEEN 1 AND 5),
  checklist_completion   JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.design_problem_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dps_select_own" ON public.design_problem_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dps_insert_own" ON public.design_problem_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dps_update_own" ON public.design_problem_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_design_sessions_user ON public.design_problem_sessions (user_id, started_at DESC);
CREATE INDEX idx_design_sessions_problem ON public.design_problem_sessions (problem_id);

-- ============================================================
-- Migration 034: study pods
-- (was labeled Migration 032)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.study_pods (
  pod_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_name    TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- FIXED: was profiles(user_id)
  max_members INTEGER NOT NULL DEFAULT 6,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pod_members (
  pod_id     UUID NOT NULL REFERENCES public.study_pods(pod_id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- FIXED: was profiles(user_id)
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pod_id, user_id)
);

ALTER TABLE public.study_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pod_select_member" ON public.study_pods
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pod_members pm
    WHERE pm.pod_id = study_pods.pod_id AND pm.user_id = auth.uid()));
CREATE POLICY "pod_insert_own" ON public.study_pods
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "pm_select_own_pod" ON public.pod_members
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pod_members self
    WHERE self.pod_id = pod_members.pod_id AND self.user_id = auth.uid()));
CREATE POLICY "pm_insert_own" ON public.pod_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pm_delete_own" ON public.pod_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_pod_members_user ON public.pod_members (user_id);
CREATE INDEX idx_pod_members_pod ON public.pod_members (pod_id);

-- ============================================================
-- Migration 035: oath_taking_schedules
-- (was labeled Migration 033)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.oath_taking_schedules (
  schedule_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oath_date    DATE NOT NULL,
  region       TEXT NOT NULL,
  venue        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.oath_taking_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ots_select_all" ON public.oath_taking_schedules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "ots_admin_manage" ON public.oath_taking_schedules
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));

-- ============================================================
-- Migration 036: code_updates
-- (was labeled Migration 034)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.code_updates (
  update_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ale_id          TEXT REFERENCES public.taxonomy_tree(ale_id) ON DELETE SET NULL,
  summary         TEXT NOT NULL,
  previous_value  TEXT,
  new_value       TEXT,
  effective_date  DATE,
  is_ale_testable BOOLEAN NOT NULL DEFAULT true,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.code_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cu_select_all" ON public.code_updates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cu_admin_manage" ON public.code_updates
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'));

CREATE INDEX idx_code_updates_ale_id ON public.code_updates (ale_id)
  WHERE ale_id IS NOT NULL;
CREATE INDEX idx_code_updates_published ON public.code_updates (published_at DESC);

-- ============================================================
-- Migration 037: questions.practice_context
-- (was labeled Migration 036)
-- ============================================================

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS practice_context TEXT[] DEFAULT '{}'::text[];

COMMENT ON COLUMN public.questions.practice_context IS
  'DAE Mode context tags. Values: building_permit, construction_supervision, design_development,
   pre_design, government_practice, contract_administration.
   Used by DAE Mode (Task 3.1) to surface contextually relevant questions.';

CREATE INDEX IF NOT EXISTS idx_questions_practice_context
  ON public.questions USING gin (practice_context)
  WHERE array_length(practice_context, 1) > 0;
```

---

## 8 — What Does NOT Need Updating

These parts of the plan are correct as written and need no changes:

- All Sprint 0 implementation specs (Tasks 0.1–0.7) — logic is correct
- All Sprint 1 implementation specs (Tasks 1.1–1.6) — logic is correct, no schema changes needed
- All Sprint 2 implementation specs except the SQL blocks above
- All Sprint 3 implementation specs except the SQL blocks above
- All acceptance criteria throughout
- Global rules section
- Environment variables section
- All file path references

---

## 9 — Updated Schema Migration Summary (Replace the plan's version)

```sql
-- Migration 028: session_questions junction table (NOT YET APPLIED)
-- Migration 029: user_attribution split (NOT YET APPLIED)
-- Migration 030: wiki_ei_prompts schema fixes (NOT YET APPLIED)
-- Migration 031: taxonomy deduplication fix (NOT YET APPLIED)

-- Migration 032: profiles column additions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reviewer_type TEXT DEFAULT 'first_taker'
    CHECK (reviewer_type IN ('first_taker', 'returning_reviewer', 'undergrad', 'dae')),
  ADD COLUMN IF NOT EXISTS previous_exam_subjects_struggled JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS enrolled_review_center TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS comp_exam_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ale_result TEXT DEFAULT NULL
    CHECK (ale_result IN ('passed', 'failed', 'pending', NULL)),
  ADD COLUMN IF NOT EXISTS oath_taking_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS account_mode TEXT DEFAULT 'review_mode'
    CHECK (account_mode IN ('review_mode', 'professional_mode', 'student_mode', 'dae_mode'));

-- Migration 033: design_problems + design_problem_sessions (see corrected SQL above)
-- Migration 034: study_pods + pod_members (see corrected SQL above)
-- Migration 035: oath_taking_schedules (see corrected SQL above)
-- Migration 036: code_updates (see corrected SQL above)
-- Migration 037: questions.practice_context + GIN index (see corrected SQL above)
```

---

## Execution Order for Sprint 0

Migration 032 (profiles columns) must run before coding Tasks 0.4 and 0.7. Everything else in Sprint 0 and Sprint 1 works without any migration — the data columns needed (`prc_area`, `bloom_level`, `difficulty`, `exam_frequency`, `node_type`, `is_cross_ref_only`, `deprecated_at`, `wiki_items`) all already exist in `taxonomy_tree` from the v5.0 schema.

Sprint 0 is otherwise unblocked on the schema side. Start with Task 0.2 (heatmap filter) — it's a 5-line code change with zero schema dependency, and it's marked BLOCKING.

---

*SlateCamp Feature Implementation Plan — Schema Reconciliation*
*DB Architect + Philip · 2026-03-19*
