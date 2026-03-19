# SlateCamp Wiki Embedded Interactives — Implementation Plan (Schema-Reconciled)
**Prepared by:** Database Architect  
**Date:** 2026-03-19  
**Schema version:** 44 tables · 13 enums · 9 functions · 31 triggers · 77 RLS policies · 128 indexes  
**Supersedes:** Previous EI plan (written against the 41-table schema)

---

## Part 1 — Reconciliation: What Changed in the New Schema

Comparing the new DATABASE_SCHEMA.sql against the schema the previous plan was written for reveals three categories of changes.

### What was already done (do NOT re-apply)

One item from the previous plan's Migration 030 is **already in production**:

| Item | Status |
|---|---|
| `tr_wiki_ei_prompts_updated_at` trigger | ✅ Live at line 1664 of the new schema |

The taxonomy v5.0 work is also fully applied — `taxonomy_node_type`, `exam_frequency_level`, `taxonomy_source_type`, `bloom_level_type` enums all present. `taxonomy_cross_references`, `taxonomy_sources`, `taxonomy_prerequisites` tables all present. All v5.0 `taxonomy_tree` columns present. This is schema-only and doesn't affect the EI plan.

### What's new in the schema that affects the EI plan

Two tables gained new columns that the EI implementation must account for:

**`user_interactions` now has `source_type TEXT DEFAULT 'quiz'`** — values: `quiz`, `3d_lab`, `assessment`, `blindspot`. This is directly relevant to Phase 2 of the EI plan (mastery signal from correct MCQ answers). When an EI interaction contributes to mastery, it should be tagged `source_type = 'ei_prompt'`. This value needs to be added to the CHECK constraint or accepted as an additional valid value. Currently the column has no CHECK constraint, only a DEFAULT, so inserting `'ei_prompt'` will work without a migration — but it should be documented.

**`spatial_hotspots` now has `phase`, `question_id`, `reveal_order`** — not directly relevant to EI, but confirms the pattern that content tables are growing richer with phased/sequenced delivery. The EI `sort_order` column follows the same pattern.

### What is confirmed still missing (all blockers from the previous plan)

The `wiki_ei_prompts` and `wiki_ei_responses` tables are **byte-for-byte identical** to what the previous plan analyzed. All 8 blockers remain. The previous plan's analysis was correct and complete — nothing has been fixed yet on these two tables except the `updated_at` trigger on `wiki_ei_prompts`.

---

## Part 2 — Confirmed Blockers (All 8 Still Present)

### Blocker 1 — `wiki_ei_responses` has no SELECT policy ❌ Still missing

**Evidence:** Lines 1268–1271 of new schema show only `eir_insert_own`. No SELECT policy exists.

`getUserEIResponsesForArticle` returns zero rows for every user. "Already answered" state never shows. Users are re-prompted every visit and accumulate duplicate response rows.

---

### Blocker 2 — No UNIQUE constraint on `(user_id, prompt_id)` ❌ Still missing

**Evidence:** `wiki_ei_responses` definition at lines 219–227. No UNIQUE constraint. No index covering both columns together.

Every article revisit creates a new response row. After 10 visits a user has 10 rows per prompt. Analytics is corrupted, "already answered" detection is unreliable even if SELECT is fixed.

---

### Blocker 3 — `wiki_ei_prompts` has no admin write policies ❌ Still missing

**Evidence:** Lines 1263–1266 show only `eip_select_all` (SELECT). No INSERT, UPDATE, DELETE policies.

No one can create prompts via the Supabase client. Service role bypasses RLS so direct DB access works, but any admin panel or server action using the authenticated client will silently fail.

**Updated note on admin policy pattern:** The new schema uses two different patterns for admin checks. The dominant pattern across the new taxonomy tables is:

```sql
EXISTS (
  SELECT 1 FROM auth.users
  WHERE users.id = auth.uid()
    AND (users.raw_app_meta_data ->> 'role') = 'admin'
)
```

The EI admin policy in Migration 030 must use this pattern, not `auth.jwt() -> 'app_metadata' ->> 'role'`, to match the rest of the schema.

---

### Blocker 4 — Missing composite index for `getUserEIResponsesForArticle` ❌ Still missing

**Evidence:** Line 1408 shows only `idx_ei_responses_user` on `(user_id, responded_at DESC)`. No `(user_id, prompt_id)` index.

The join query through `wiki_ei_prompts` to scope responses to an article cannot use the existing index efficiently. Needs `idx_ei_responses_user_prompt` on `(user_id, prompt_id)`.

---

### Blocker 5 — No `sort_order` column on `wiki_ei_prompts` ❌ Still missing

**Evidence:** Lines 207–217. Only 7 columns present. `sort_order` not among them.

Multiple prompts under the same heading render in undefined order.

---

### Blocker 6 — No `is_active` flag on `wiki_ei_prompts` ❌ Still missing

**Evidence:** Lines 207–217. `is_active` not present.

The only way to hide a prompt is to delete it, which cascades to all response data (once the FK cascade is fixed). No soft-disable available.

---

### Blocker 7 — No review workflow on `wiki_ei_prompts` ❌ Still missing

**Evidence:** Lines 207–217. No `status`, `reviewed_by`, `reviewed_at`, `reviewer_notes`.

Wrong exam answers can be published with no review gate. `wiki_articles` has this workflow. EI prompts carry higher risk than articles because they provide explicit answer confirmation.

---

### Blocker 8 — `wiki_ei_responses.prompt_id` FK has no ON DELETE CASCADE ❌ Still missing

**Evidence:** Line 223 shows `prompt_id UUID NOT NULL REFERENCES public.wiki_ei_prompts(prompt_id)` with no ON DELETE clause. Postgres defaults to NO ACTION (RESTRICT).

Any attempt to delete a prompt that has responses will fail with a FK violation. This locks content management once real users start responding.

---

## Part 3 — Migration 030 (Updated for New Schema)

**File:** `030_wiki_ei_schema_fixes.sql`  
**One item removed from the previous plan:** `tr_wiki_ei_prompts_updated_at` trigger is already live — removed from this migration.  
**One item updated:** Admin policy uses `raw_app_meta_data` pattern to match new taxonomy tables.  
**Everything else:** Identical to the previous plan's analysis — all 8 blockers still need resolution.

```sql
-- ============================================================
-- Migration 030: Wiki EI Schema Fixes
-- Resolves all 8 blockers before EI application code is written.
-- NOTE: tr_wiki_ei_prompts_updated_at trigger already exists — not re-created here.
-- Admin policy pattern matches raw_app_meta_data (consistent with taxonomy tables).
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. wiki_ei_prompts — new columns
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.wiki_ei_prompts
  ADD COLUMN IF NOT EXISTS sort_order    SMALLINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS status        TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT;

COMMENT ON COLUMN public.wiki_ei_prompts.sort_order IS
  'Display order when multiple prompts share the same insert_after_heading. Lower = first.
   Query order: (insert_after_heading position in article, sort_order ASC).';

COMMENT ON COLUMN public.wiki_ei_prompts.is_active IS
  'Soft disable. FALSE hides prompt without deleting it or its response data.
   getEIPromptsForArticle must filter WHERE is_active = true AND status = ''published''.';

COMMENT ON COLUMN public.wiki_ei_prompts.status IS
  'Review workflow state — mirrors wiki_articles.status pattern.
   draft     = being authored, invisible to students
   review    = submitted for SME approval
   published = live and visible to students
   archived  = retired (prefer is_active=false for temporary removal)
   CRITICAL: A wrong reveal_text trains incorrect exam answers. Review gate is mandatory.';

-- ─────────────────────────────────────────────────────────────
-- 2. wiki_ei_prompts — content integrity CHECK constraints
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_ei_prompt_not_empty'
  ) THEN
    ALTER TABLE public.wiki_ei_prompts
      ADD CONSTRAINT chk_ei_prompt_not_empty
      CHECK (length(trim(prompt_text)) > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_ei_reveal_not_empty'
  ) THEN
    ALTER TABLE public.wiki_ei_prompts
      ADD CONSTRAINT chk_ei_reveal_not_empty
      CHECK (length(trim(reveal_text)) > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'chk_ei_options_structure'
  ) THEN
    ALTER TABLE public.wiki_ei_prompts
      ADD CONSTRAINT chk_ei_options_structure
      CHECK (jsonb_typeof(options) = 'array');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 3. wiki_ei_responses — add updated_at column
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.wiki_ei_responses
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

COMMENT ON COLUMN public.wiki_ei_responses.updated_at IS
  'Timestamp of last answer revision (updated on ON CONFLICT DO UPDATE).
   responded_at = immutable first interaction time.
   updated_at = most recent revision. Equal to responded_at on first response.';

-- Add updated_at trigger for wiki_ei_responses
-- (wiki_ei_prompts already has tr_wiki_ei_prompts_updated_at in production)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tr_wiki_ei_responses_updated_at'
  ) THEN
    CREATE TRIGGER tr_wiki_ei_responses_updated_at
      BEFORE UPDATE ON public.wiki_ei_responses
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. wiki_ei_responses — fix FK to ON DELETE CASCADE
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  -- Drop existing FK (NO ACTION default)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'wiki_ei_responses'
      AND constraint_name = 'wiki_ei_responses_prompt_id_fkey'
  ) THEN
    ALTER TABLE public.wiki_ei_responses
      DROP CONSTRAINT wiki_ei_responses_prompt_id_fkey;
  END IF;

  -- Re-add with ON DELETE CASCADE
  ALTER TABLE public.wiki_ei_responses
    ADD CONSTRAINT wiki_ei_responses_prompt_id_fkey
    FOREIGN KEY (prompt_id)
    REFERENCES public.wiki_ei_prompts(prompt_id)
    ON DELETE CASCADE;
END $$;

COMMENT ON CONSTRAINT wiki_ei_responses_prompt_id_fkey ON public.wiki_ei_responses IS
  'ON DELETE CASCADE: deleting a prompt removes all its response rows.
   In practice, prefer is_active=false over deleting prompts to preserve response analytics.
   Cascade is the safety valve for hard deletes.';

-- ─────────────────────────────────────────────────────────────
-- 5. wiki_ei_responses — UNIQUE constraint (user_id, prompt_id)
-- ─────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'wiki_ei_responses'
      AND constraint_name = 'uq_ei_responses_user_prompt'
  ) THEN
    ALTER TABLE public.wiki_ei_responses
      ADD CONSTRAINT uq_ei_responses_user_prompt
      UNIQUE (user_id, prompt_id);
  END IF;
END $$;

COMMENT ON CONSTRAINT uq_ei_responses_user_prompt ON public.wiki_ei_responses IS
  'One response per user per prompt. submitEIResponse uses ON CONFLICT DO UPDATE to upsert.
   Prevents duplicate rows on article revisit. Required for correct "already answered" detection.';

-- ─────────────────────────────────────────────────────────────
-- 6. Indexes
-- ─────────────────────────────────────────────────────────────

-- Primary render query: published+active prompts for an article in sort order
-- This is the hot path — called on every wiki article page load
CREATE INDEX IF NOT EXISTS idx_ei_prompts_article_active
  ON public.wiki_ei_prompts (article_id, sort_order)
  WHERE status = 'published' AND is_active = true;

-- getUserEIResponsesForArticle: covers (user_id, prompt_id) join
CREATE INDEX IF NOT EXISTS idx_ei_responses_user_prompt
  ON public.wiki_ei_responses (user_id, prompt_id);

-- Admin analytics: response count and distribution per prompt
CREATE INDEX IF NOT EXISTS idx_ei_responses_prompt
  ON public.wiki_ei_responses (prompt_id);

-- Admin review queue: prompts awaiting review
CREATE INDEX IF NOT EXISTS idx_ei_prompts_status
  ON public.wiki_ei_prompts (status)
  WHERE status IN ('draft', 'review');

-- ─────────────────────────────────────────────────────────────
-- 7. RLS Policies
-- Admin pattern matches raw_app_meta_data — consistent with taxonomy_cross_references,
-- taxonomy_sources, taxonomy_prerequisites, topic_teach_back_criteria in new schema.
-- ─────────────────────────────────────────────────────────────

-- 7a. Users can SELECT their own responses (CRITICAL — getUserEIResponsesForArticle)
CREATE POLICY "eir_select_own"
  ON public.wiki_ei_responses FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- 7b. Users can UPDATE their own responses (MCQ answer revision)
CREATE POLICY "eir_update_own"
  ON public.wiki_ei_responses FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id);

-- 7c. Admins can INSERT/UPDATE/DELETE prompts
-- Pattern: raw_app_meta_data (matches taxonomy tables in this schema version)
CREATE POLICY "eip_admin_manage"
  ON public.wiki_ei_prompts FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));

-- 7d. Admins can SELECT all responses for analytics
CREATE POLICY "eir_admin_read"
  ON public.wiki_ei_responses FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE users.id = auth.uid()
      AND (users.raw_app_meta_data ->> 'role') = 'admin'
  ));

-- ─────────────────────────────────────────────────────────────
-- 8. Feature flag seed
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.feature_flags (key, description, enabled, target_tier) VALUES
  ('wiki_ei_prompts',
   'Embedded Interactive prompts within wiki articles — active reading with MCQ and open-ended formats',
   true, ARRAY['pro', 'enterprise'])
ON CONFLICT (key) DO NOTHING;
```

---

## Part 4 — Verification Queries (Run After Migration)

Run these in Supabase SQL editor after applying Migration 030. All must pass before writing any application code.

```sql
-- 1. Confirm new columns on wiki_ei_prompts
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'wiki_ei_prompts'
  AND column_name IN ('sort_order', 'is_active', 'status', 'reviewed_by', 'reviewed_at', 'reviewer_notes')
ORDER BY column_name;
-- Must return 6 rows.

-- 2. Confirm updated_at on wiki_ei_responses
SELECT column_name FROM information_schema.columns
WHERE table_name = 'wiki_ei_responses' AND column_name = 'updated_at';
-- Must return 1 row.

-- 3. Confirm UNIQUE constraint exists
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'wiki_ei_responses' AND constraint_name = 'uq_ei_responses_user_prompt';
-- Must return 1 row.

-- 4. Confirm FK is now ON DELETE CASCADE
SELECT rc.delete_rule
FROM information_schema.referential_constraints rc
JOIN information_schema.table_constraints tc ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'wiki_ei_responses'
  AND rc.constraint_name = 'wiki_ei_responses_prompt_id_fkey';
-- Must return 'CASCADE'.

-- 5. Confirm all 4 new RLS policies exist
SELECT policyname FROM pg_policies
WHERE tablename IN ('wiki_ei_prompts', 'wiki_ei_responses')
  AND policyname IN ('eir_select_own', 'eir_update_own', 'eip_admin_manage', 'eir_admin_read')
ORDER BY policyname;
-- Must return 4 rows.

-- 6. Confirm all 4 new indexes exist
SELECT indexname FROM pg_indexes
WHERE tablename IN ('wiki_ei_prompts', 'wiki_ei_responses')
  AND indexname IN (
    'idx_ei_prompts_article_active',
    'idx_ei_responses_user_prompt',
    'idx_ei_responses_prompt',
    'idx_ei_prompts_status'
  )
ORDER BY indexname;
-- Must return 4 rows.

-- 7. Confirm feature flag seeded
SELECT key, enabled, target_tier FROM public.feature_flags WHERE key = 'wiki_ei_prompts';
-- Must return 1 row with enabled=true.

-- 8. Confirm both updated_at triggers exist (prompts already had one, responses is new)
SELECT tgname FROM pg_trigger
WHERE tgname IN ('tr_wiki_ei_prompts_updated_at', 'tr_wiki_ei_responses_updated_at');
-- Must return 2 rows.
```

---

## Part 5 — Server Actions (Exact Implementation)

### `getEIPromptsForArticle`

```typescript
// src/lib/actions/ei-prompts.ts
'use server'

import { createClient } from '@/lib/supabase/server'

export type EIPrompt = {
  prompt_id: string
  node_id: string | null
  insert_after_heading: string
  prompt_text: string
  reveal_text: string
  options: Array<{ text: string; is_correct: boolean }>
  sort_order: number
}

export async function getEIPromptsForArticle(articleId: string): Promise<EIPrompt[]> {
  const supabase = createClient()

  const { data } = await supabase
    .from('wiki_ei_prompts')
    .select('prompt_id, node_id, insert_after_heading, prompt_text, reveal_text, options, sort_order')
    .eq('article_id', articleId)
    .eq('status', 'published')      // status column added in migration 030
    .eq('is_active', true)          // is_active column added in migration 030
    .order('sort_order', { ascending: true })

  return (data ?? []) as EIPrompt[]
}
```

Uses `idx_ei_prompts_article_active` partial index — covers article_id + sort_order WHERE published AND active. The most common case (no prompts) returns empty array, not an error. WikiArticle renders normally.

---

### `submitEIResponse`

```typescript
export async function submitEIResponse(params: {
  promptId: string
  responseText?: string
  selectedOptionIndex?: number
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('wiki_ei_responses')
    .upsert(
      {
        user_id: user.id,
        prompt_id: params.promptId,
        response_text: params.responseText ?? null,
        selected_option_index: params.selectedOptionIndex ?? null,
        updated_at: new Date().toISOString(),
        // responded_at intentionally excluded:
        // On INSERT — DB default fires, records first interaction time
        // On UPDATE (conflict) — DB skips responded_at, preserving original timestamp
      },
      {
        onConflict: 'user_id, prompt_id',  // hits uq_ei_responses_user_prompt
        ignoreDuplicates: false,            // DO UPDATE, not DO NOTHING
      }
    )

  if (error) {
    console.error('[EI] submitEIResponse failed:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true }
}
```

Upsert semantics: first call = INSERT (responded_at set by DB). Subsequent calls = UPDATE (responded_at preserved, updated_at and answer updated). One row per user per prompt, enforced by UNIQUE constraint.

---

### `getUserEIResponsesForArticle`

```typescript
export type EIResponseMap = Record<string, {
  response_text: string | null
  selected_option_index: number | null
  responded_at: string
  updated_at: string
}>

export async function getUserEIResponsesForArticle(
  articleId: string
): Promise<EIResponseMap> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  // Join through wiki_ei_prompts to scope to this article.
  // idx_ei_responses_user_prompt covers (user_id, prompt_id).
  const { data } = await supabase
    .from('wiki_ei_responses')
    .select(`
      prompt_id,
      response_text,
      selected_option_index,
      responded_at,
      updated_at,
      wiki_ei_prompts!inner(article_id)
    `)
    .eq('user_id', user.id)
    .eq('wiki_ei_prompts.article_id', articleId)

  // Return as { [prompt_id]: response } map for O(1) lookup in WikiArticle
  return Object.fromEntries(
    (data ?? []).map(r => [r.prompt_id, {
      response_text: r.response_text,
      selected_option_index: r.selected_option_index,
      responded_at: r.responded_at,
      updated_at: r.updated_at,
    }])
  )
}
```

Returns `{}` for unauthenticated users and for articles with no prior responses — both handled identically by `WikiArticle` (renders prompts as unanswered).

---

## Part 6 — Component Changes (DB-Relevant Notes Only)

The implementation plan's component upgrade is correct. Three things from the DB layer that must be reflected in the component:

### 1. `options` JSONB structure must be followed exactly

MCQ options are stored as: `[{ "text": "string", "is_correct": boolean }]`. The component renders option buttons based on `text` and shows correct/incorrect feedback based on `is_correct`. The correct option index should NOT be inferred by position — always use `is_correct` from the JSONB.

```typescript
// Correct: use is_correct from the data
const isCorrect = prompt.options[selectedIndex]?.is_correct === true

// Wrong: assume first option is always correct
// Wrong: use selectedOptionIndex === 0 as correctness indicator
```

### 2. `updated_at` vs `responded_at` in "already answered" display

Both timestamps are now on `wiki_ei_responses`. Use them for different purposes:

- `responded_at` — "You first answered this on [date]" (immutable)
- `updated_at` — "Last updated [date]" (changes on revision)
- Show the answered indicator based on `responded_at IS NOT NULL`
- Show "revised" indicator if `updated_at > responded_at`

### 3. `source_type` for future Phase 2 mastery signal

When the Phase 2 mastery signal is implemented (correct MCQ EI response → `user_node_mastery` update), the interaction must be tagged with `source_type = 'ei_prompt'` in `user_interactions`. The column exists in production with no CHECK constraint — `'ei_prompt'` is a valid value today. No schema change needed for Phase 2.

---

## Part 7 — Complete Final Schema State After Migration 030

### `wiki_ei_prompts`

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `prompt_id` | UUID PK | | |
| `article_id` | UUID FK → wiki_articles | ON DELETE CASCADE | |
| `node_id` | UUID FK → taxonomy_tree | Nullable | For Phase 2 mastery linkage |
| `insert_after_heading` | TEXT NOT NULL | chk_ei_prompt_not_empty | Matched to article heading at render |
| `prompt_text` | TEXT NOT NULL | chk_ei_prompt_not_empty | The question shown to the student |
| `reveal_text` | TEXT NOT NULL | chk_ei_reveal_not_empty | Shown on reveal — must not be empty |
| `options` | JSONB DEFAULT '[]' | chk_ei_options_structure (must be array) | `[{text, is_correct}]` for MCQ; `[]` for open-ended |
| `sort_order` | SMALLINT DEFAULT 0 | **NEW** | Ordering within same heading |
| `is_active` | BOOLEAN DEFAULT true | **NEW** | Soft disable |
| `status` | TEXT DEFAULT 'draft' | **NEW** CHECK (draft/review/published/archived) | Review gate |
| `reviewed_by` | UUID FK → auth.users | **NEW** ON DELETE SET NULL | SME reviewer |
| `reviewed_at` | TIMESTAMPTZ | **NEW** | Review timestamp |
| `reviewer_notes` | TEXT | **NEW** | Feedback to author |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Auto via `tr_wiki_ei_prompts_updated_at` (already live) |

### `wiki_ei_responses`

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `response_id` | UUID PK | | |
| `user_id` | UUID FK → auth.users | ON DELETE CASCADE | |
| `prompt_id` | UUID FK → wiki_ei_prompts | **FIXED: ON DELETE CASCADE** | Was NO ACTION |
| `response_text` | TEXT | Nullable | Open-ended mode only |
| `selected_option_index` | SMALLINT | Nullable | MCQ mode only |
| `responded_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | First interaction — immutable after insert |
| `updated_at` | TIMESTAMPTZ | **NEW** NOT NULL DEFAULT now() | Last revision — auto via trigger |
| UNIQUE | (user_id, prompt_id) | **NEW** | One response per user per prompt |

### RLS policy summary (complete)

| Table | Policy name | Operation | Audience |
|---|---|---|---|
| `wiki_ei_prompts` | eip_select_all | SELECT | All authenticated |
| `wiki_ei_prompts` | eip_admin_manage | ALL | Admins (raw_app_meta_data) — **NEW** |
| `wiki_ei_responses` | eir_insert_own | INSERT | Own rows |
| `wiki_ei_responses` | eir_select_own | SELECT | Own rows — **NEW** |
| `wiki_ei_responses` | eir_update_own | UPDATE | Own rows — **NEW** |
| `wiki_ei_responses` | eir_admin_read | SELECT | Admins — **NEW** |

### Index summary (complete)

| Index | Table | Columns | Filter |
|---|---|---|---|
| `idx_ei_prompts_article` | wiki_ei_prompts | (article_id) | None (existing) |
| `idx_ei_prompts_article_active` | wiki_ei_prompts | (article_id, sort_order) | WHERE published AND active — **NEW** |
| `idx_ei_prompts_status` | wiki_ei_prompts | (status) | WHERE draft OR review — **NEW** |
| `idx_ei_responses_user` | wiki_ei_responses | (user_id, responded_at DESC) | None (existing) |
| `idx_ei_responses_user_prompt` | wiki_ei_responses | (user_id, prompt_id) | None — **NEW** |
| `idx_ei_responses_prompt` | wiki_ei_responses | (prompt_id) | None — **NEW** |

---

## Part 8 — Implementation Sequence

| Step | Action | Risk | Gate |
|---|---|---|---|
| 1 | Apply Migration 030 | Zero — additive | — |
| 2 | Run all 8 verification queries | Zero | All must pass |
| 3 | Insert 2–3 test prompts in DB with status='published', is_active=true | Zero | — |
| 4 | Build `getEIPromptsForArticle` server action | Zero | — |
| 5 | Build `getUserEIResponsesForArticle` server action | Zero | — |
| 6 | Build `submitEIResponse` server action | Zero | — |
| 7 | Upgrade `ElaborativeInterrogation.tsx` with new props | Low | — |
| 8 | Upgrade `WikiArticle.tsx` with `injectEIPrompts()` | Medium | Test inline fallback |
| 9 | Wire `page.tsx` to fetch prompts + responses | Medium | Two new server calls |
| 10 | Test: no prompts in DB → renders exactly as before | — | Must pass |
| 11 | Test: with prompts → appears after correct heading | — | Must pass |
| 12 | Test: MCQ correct → feedback shows, response row in DB | — | Must pass |
| 13 | Test: revisit article → "already answered" state shows | — | Must pass |
| 14 | Confirm UNIQUE constraint prevents duplicate rows | — | Must pass |
| 15 | Add `wiki_article_reads` tracking (no schema changes needed) | Low | — |
| 16 | Ship | — | — |

---

## Part 9 — Phase 2 Additions (Out of Scope for Initial Ship)

| Feature | What it needs | When |
|---|---|---|
| Mastery signal from correct MCQ answers | Call mastery update with `source_type = 'ei_prompt'` when `node_id IS NOT NULL` and answer is correct | After EI ships and response volume validates signal quality |
| EI prompt admin CRUD UI | Admin panel for creating/reviewing prompts (currently: direct DB only) | After initial prompt library is authored manually |
| EI analytics dashboard | Response rate, MCQ correct/incorrect distribution per prompt, using `idx_ei_responses_prompt` | After 30 days of response data |
| `options` structural validation trigger | Enforce `{text, is_correct}` keys on every MCQ option in the JSONB array | If malformed options become a content problem |
| Trail step EI completion credit | Completing all prompts in an article counts toward trail step progress | Requires trail schema additions |

---

*SlateCamp Wiki Embedded Interactives — Implementation Plan (Schema-Reconciled)*  
*DB Architect + Philip (Founder) · 2026-03-19*  
*Prerequisites: Migration 030 applied and all 8 verification queries pass before any application code is written*
