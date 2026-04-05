# SlateCamp — Schema Gap Analysis: Full Implementation
## 7 Migrations. 22 Gaps. Dependency-Ordered. One Session.

---

## SOURCE

This prompt implements every gap identified in the **Schema Gap Analysis vs. UX Strategy** (2026-03-19). The analysis document contains complete, production-ready SQL for each gap. This prompt sequences it, adds verification, handles edge cases, and ensures nothing collides with what already exists.

**Feed this prompt + `schema-gap-analysis.md` + `DATABASE_SCHEMA.sql` to Claude Code.**

---

## ARCHITECTURE DECISIONS (Already Made in the Gap Analysis)

These decisions are FINAL. Do not second-guess them:

1. **Free-tier cap columns go on `user_subscriptions`** (not `user_global_stats`) — billing-tier behavior belongs with the subscription.
2. **Endurance Cycle gets its own table** (`user_endurance_profiles`) — avoids further God Table growth on `user_global_stats`.
3. **`endurance_gate_pct` is a GENERATED ALWAYS AS STORED column** — dashboard reads it directly, no computation on every render.
4. **Pre-auth diagnostic gets a dedicated `anon_diagnostic_sessions` table** — no nullable `user_id` on `quiz_sessions`.
5. **EI prompts get their own table** (`wiki_ei_prompts`) — not embedded as content tags. Enables analytics.
6. **`analysis_available_at` on `readiness_score_snapshots` is a GENERATED column** — 24-hour delay enforced at data layer.
7. **SRS uses SM-2 column names** (`next_review_at`, `review_interval_days`, `ease_factor`, `review_count`) — industry standard.

---

## TOOLS

- **Supabase MCP** — ALL verification queries and migration execution.
- **NO file system or grep needed.** This is pure SQL. No application code.

---

## PHASE 1: Pre-Flight Verification

Run ALL in one batch. Results determine which migration statements to skip.

```sql
-- ═══ COLUMNS THAT MAY ALREADY EXIST ═══

-- 1. score_reveal_shown_at
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats' AND column_name = 'score_reveal_shown_at';

-- 2. free tier cap columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name IN ('free_questions_today', 'free_cap_reset_date');

-- 3. SRS columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_node_mastery'
AND column_name IN ('next_review_at', 'review_interval_days', 'ease_factor', 'review_count',
                     'srs_due_at', 'srs_interval_days', 'srs_ease_factor');

-- 4. Endurance columns/table
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'user_endurance_profiles';

SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_computed_signals'
AND column_name LIKE 'endurance_%';

-- 5. is_endurance_session
SELECT column_name FROM information_schema.columns
WHERE table_name = 'quiz_sessions' AND column_name = 'is_endurance_session';

-- 6. Streak columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_trail_enrollments'
AND column_name IN ('current_streak', 'longest_streak', 'grace_days_used_this_week');

SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats'
AND column_name IN ('global_current_streak', 'global_longest_streak', 'last_active_date');

-- 7. Anon diagnostic
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'anon_diagnostic_sessions';

-- 8. Retaker / assessment_started_at
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats'
AND column_name IN ('is_retaker', 'onboarding_retaker_framing_shown', 'assessment_started_at', 'proof_simulation_unlocked_at');

-- 9. Calibration columns on user_computed_signals
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_computed_signals'
AND column_name IN ('calibration_score', 'calibration_updated_at', 'calibration_sessions_count');

-- 10. Notification tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('user_push_tokens', 'notification_log');

-- 11. Wiki read/EI tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('wiki_article_reads', 'wiki_ei_prompts', 'wiki_ei_responses');

-- 12. Campfire testimonials
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'campfire_testimonials';

-- 13. analysis_available_at on readiness_score_snapshots
SELECT column_name FROM information_schema.columns
WHERE table_name = 'readiness_score_snapshots' AND column_name = 'analysis_available_at';

-- 14. Milestones shown
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_trail_enrollments' AND column_name = 'milestones_shown';

-- 15. Feature flags current state
SELECT COUNT(*) as total_flags FROM feature_flags;

-- 16. Check for SRS index naming conflicts
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE '%srs%' OR indexname LIKE '%review%';
```

**Output:** A complete truth table. For EACH migration below, Claude knows exactly what to skip.

**STOP.** "Phase 1 Complete. [X] items already exist, [Y] need creation. Reply 'Proceed.'"

---

## PHASE 2: Migration 019 — Sprint 1 Revenue Unblocking

**Skip any statement where Phase 1 confirmed the column/row already exists.**

```sql
-- ============================================================
-- Migration 019: Sprint 1 Monetization Schema
-- Blocks: Paywall, Score Reveal, Free Tier Cap, Onboarding State
-- ============================================================

-- ── 1.1 Score Reveal Shown-Once Enforcement ───────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS score_reveal_shown_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_global_stats.score_reveal_shown_at IS
  'Set when free user views Score Reveal for first time. NULL = not yet seen. Enforces shown-once mechanic.';


-- ── 1.2 Free Tier Daily Question Cap ──────────────────────────

ALTER TABLE public.user_subscriptions
  ADD COLUMN IF NOT EXISTS free_questions_today INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS free_cap_reset_date DATE;

COMMENT ON COLUMN public.user_subscriptions.free_questions_today IS
  'Questions answered today by free user. Reset daily. Enforced when tier = free.';
COMMENT ON COLUMN public.user_subscriptions.free_cap_reset_date IS
  'Date of last reset. If today > this date, reset counter to 0.';


-- ── 2.1 Retaker State for Onboarding Copy ────────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS is_retaker BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_retaker_framing_shown BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.user_global_stats.is_retaker IS
  'Set during onboarding: "Have you taken the ALE before?" Activates retaker framing.';


-- ── 2.2 Assessment Dropout Recovery State ─────────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS assessment_started_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_global_stats.assessment_started_at IS
  'Set when assessment quiz session is created. Used for dropout recovery: "Your score is 60% complete."';


-- ── 3.3 Proof Simulation Unlock Timestamp ─────────────────────

ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS proof_simulation_unlocked_at TIMESTAMPTZ;

COMMENT ON COLUMN public.user_global_stats.proof_simulation_unlocked_at IS
  'Set when both Proof Simulation gates pass (node coverage + endurance). Triggers unlock notification.';


-- ── 1.4 Endurance Session Flag ────────────────────────────────

ALTER TABLE public.quiz_sessions
  ADD COLUMN IF NOT EXISTS is_endurance_session BOOLEAN NOT NULL DEFAULT false;


-- ── D1 Feature Flags Seed Data ────────────────────────────────

INSERT INTO public.feature_flags (key, description, enabled, target_tier)
SELECT v.key, v.description, v.enabled, v.target_tier
FROM (VALUES
  ('live_readiness_score',  'Live score updating after every session',    true, '{pro,enterprise}'::text[]),
  ('full_heatmap',          'Full unblurred taxonomy heatmap',            true, '{pro,enterprise}'::text[]),
  ('trail_library',         'Full trail library beyond ALE Starter',      true, '{pro,enterprise}'::text[]),
  ('blindspot_protocol',    'Blindspot Protocol remediation',             true, '{pro,enterprise}'::text[]),
  ('proof_simulation',      'Proof Simulation access',                    true, '{pro,enterprise}'::text[]),
  ('unlimited_questions',   'No daily question cap',                      true, '{pro,enterprise}'::text[]),
  ('additional_grace_days', 'Extra grace days per week (2 vs 1)',         true, '{pro,enterprise}'::text[])
) AS v(key, description, enabled, target_tier)
WHERE NOT EXISTS (SELECT 1 FROM public.feature_flags f WHERE f.key = v.key);
```

**Verify 019:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats'
AND column_name IN ('score_reveal_shown_at', 'is_retaker', 'assessment_started_at', 'proof_simulation_unlocked_at');
-- Should return 4 rows

SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
AND column_name IN ('free_questions_today', 'free_cap_reset_date');
-- Should return 2 rows

SELECT COUNT(*) FROM feature_flags;
-- Should be ≥ 7
```

**STOP.** "Migration 019 complete. Reply 'Proceed.'"

---

## PHASE 3: Migration 020 — SRS & Streaks

```sql
-- ============================================================
-- Migration 020: SRS Scheduling + Study Streaks
-- Blocks: Spaced Repetition, Streak Widget, Grace Days
-- ============================================================

-- ── 1.3 SRS Columns on user_node_mastery ──────────────────────
-- ADAPT: Phase 1 query #3 may show srs_due_at / srs_interval_days / srs_ease_factor
-- already exist from a previous migration. If so, rename them to match the SM-2 standard
-- names OR skip and use the existing names consistently.

ALTER TABLE public.user_node_mastery
  ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_interval_days INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ease_factor NUMERIC NOT NULL DEFAULT 2.50,
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_node_mastery_user_review
  ON public.user_node_mastery(user_id, next_review_at)
  WHERE next_review_at IS NOT NULL;

COMMENT ON COLUMN public.user_node_mastery.next_review_at IS
  'SM-2: When this node is next due for spaced review. NULL = not yet scheduled.';
COMMENT ON COLUMN public.user_node_mastery.review_interval_days IS
  'SM-2: Current inter-review interval in days. Starts at 1.';
COMMENT ON COLUMN public.user_node_mastery.ease_factor IS
  'SM-2: Ease factor (EF). Default 2.50. Min 1.30. Adjusts per review quality.';
COMMENT ON COLUMN public.user_node_mastery.review_count IS
  'SM-2: Total successful reviews. Controls interval growth curve.';


-- ── 1.5 Streak Columns ───────────────────────────────────────

-- Per-trail streak
ALTER TABLE public.user_trail_enrollments
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS grace_days_used_this_week INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS streak_grace_week_start DATE;

COMMENT ON COLUMN public.user_trail_enrollments.grace_days_used_this_week IS
  'Resets every Monday. Free: max 1 grace day/week. Pro: max 2/week.';

-- Global streak
ALTER TABLE public.user_global_stats
  ADD COLUMN IF NOT EXISTS global_current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS global_longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date DATE;

COMMENT ON COLUMN public.user_global_stats.last_active_date IS
  'Date of most recent completed study session. Used to detect missed days for streak logic.';


-- ── 2.6 Trail Milestone Tracking ──────────────────────────────

ALTER TABLE public.user_trail_enrollments
  ADD COLUMN IF NOT EXISTS milestones_shown JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.user_trail_enrollments.milestones_shown IS
  'Day numbers where milestone screen fired. e.g. [7,14,28]. Prevents repeat triggers.';
```

**Verify 020:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_node_mastery'
AND column_name IN ('next_review_at', 'review_interval_days', 'ease_factor', 'review_count');

SELECT indexname FROM pg_indexes WHERE indexname = 'idx_node_mastery_user_review';

SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_trail_enrollments'
AND column_name IN ('current_streak', 'longest_streak', 'grace_days_used_this_week', 'milestones_shown');

SELECT column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats'
AND column_name IN ('global_current_streak', 'global_longest_streak', 'last_active_date');
```

**STOP.** "Migration 020 complete. Reply 'Proceed.'"

---

## PHASE 4: Migration 021 — Endurance Cycle

```sql
-- ============================================================
-- Migration 021: Endurance Cycle
-- Creates: user_endurance_profiles table with generated gate column
-- Unblocks: Endurance Cycle + Proof Simulation gate
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_endurance_profiles (
  user_id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Baseline calibration (established in first 7 days)
  baseline_reliable_items     INTEGER,
  baseline_accuracy_decay_at  INTEGER,
  baseline_avg_accuracy       DOUBLE PRECISION,
  baseline_calibrated_at      TIMESTAMPTZ,

  -- Current endurance state
  current_endurance_target    INTEGER,
  endurance_window_minutes    DOUBLE PRECISION,
  endurance_sessions_completed INTEGER NOT NULL DEFAULT 0,

  -- Pacing Gauge
  avg_seconds_per_question    DOUBLE PRECISION,
  pacing_target_seconds       DOUBLE PRECISION NOT NULL DEFAULT 96,
  pacing_updated_at           TIMESTAMPTZ,

  -- Plateau detection
  consecutive_plateau_weeks   INTEGER NOT NULL DEFAULT 0,
  last_endurance_session_at   TIMESTAMPTZ,

  -- Proof Simulation gate (auto-computed)
  endurance_gate_pct          DOUBLE PRECISION GENERATED ALWAYS AS (
    CASE WHEN pacing_target_seconds > 0 AND baseline_reliable_items > 0
         THEN LEAST(
           endurance_window_minutes / (pacing_target_seconds * baseline_reliable_items / 60.0),
           1.0
         )
         ELSE 0
    END
  ) STORED,

  computed_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_endurance_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_endurance_profiles' AND policyname = 'ep_select_own') THEN
    CREATE POLICY ep_select_own ON public.user_endurance_profiles
      FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS tr_endurance_profiles_updated_at ON public.user_endurance_profiles;
CREATE TRIGGER tr_endurance_profiles_updated_at
  BEFORE UPDATE ON public.user_endurance_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_endurance_profiles_pacing
  ON public.user_endurance_profiles(user_id, avg_seconds_per_question);
```

**Verify 021:**
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'user_endurance_profiles' ORDER BY ordinal_position;
-- Should return ~16 columns including endurance_gate_pct

SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'user_endurance_profiles';
-- rowsecurity = true

SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'user_endurance_profiles';
-- tr_endurance_profiles_updated_at
```

**STOP.** "Migration 021 complete. Reply 'Proceed.'"

---

## PHASE 5: Migration 022 — Notifications

```sql
-- ============================================================
-- Migration 022: Push Notification Infrastructure
-- Creates: user_push_tokens, notification_log
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  token_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  platform   TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_push_tokens' AND policyname = 'pt_manage_own') THEN
    CREATE POLICY pt_manage_own ON public.user_push_tokens
      FOR ALL TO authenticated
      USING ((select auth.uid()) = user_id)
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_push_tokens_user
  ON public.user_push_tokens(user_id) WHERE is_active = true;

DROP TRIGGER IF EXISTS tr_push_tokens_updated_at ON public.user_push_tokens;
CREATE TRIGGER tr_push_tokens_updated_at
  BEFORE UPDATE ON public.user_push_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Notification Log ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notification_log (
  log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trigger_type   TEXT NOT NULL CHECK (trigger_type IN (
    'trail_day_available', 'assessment_score_ready', 'streak_at_risk',
    'srs_review_due', 'blindspot_triggered', 'proof_simulation_unlocked',
    'milestone_reached', 'inactive_7d', 'inactive_14d', 'exam_countdown'
  )),
  channel        TEXT NOT NULL CHECK (channel IN ('push', 'email', 'in_app')),
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent'
);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_log' AND policyname = 'nl_admin_read') THEN
    CREATE POLICY nl_admin_read ON public.notification_log
      FOR SELECT TO authenticated
      USING ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notif_log_user_day
  ON public.notification_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_trigger
  ON public.notification_log(trigger_type, sent_at DESC);
```

**Verify 022:** Same pattern — check both tables exist, RLS enabled, policies present, indexes created.

**STOP.** "Migration 022 complete. Reply 'Proceed.'"

---

## PHASE 6: Migration 023 — Wiki Engagement + Calibration

```sql
-- ============================================================
-- Migration 023: Wiki Read Tracking, EI Prompts, Calibration
-- ============================================================

-- ── Wiki Article Reads ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wiki_article_reads (
  read_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id    UUID NOT NULL REFERENCES public.wiki_articles(article_id),
  read_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_pct      SMALLINT NOT NULL DEFAULT 0 CHECK (read_pct BETWEEN 0 AND 100),
  time_spent_ms INTEGER,
  trail_step_id UUID REFERENCES public.trail_steps(step_id) ON DELETE SET NULL
);

ALTER TABLE public.wiki_article_reads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wiki_article_reads' AND policyname = 'war_insert_own') THEN
    CREATE POLICY war_insert_own ON public.wiki_article_reads FOR INSERT TO authenticated
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wiki_article_reads' AND policyname = 'war_select_own') THEN
    CREATE POLICY war_select_own ON public.wiki_article_reads FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_wiki_reads_user_article ON public.wiki_article_reads(user_id, article_id, read_at DESC);
CREATE INDEX IF NOT EXISTS idx_wiki_reads_user_recent ON public.wiki_article_reads(user_id, read_at DESC);


-- ── Elaborative Interrogation Prompts ─────────────────────────

CREATE TABLE IF NOT EXISTS public.wiki_ei_prompts (
  prompt_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id         UUID NOT NULL REFERENCES public.wiki_articles(article_id) ON DELETE CASCADE,
  node_id            UUID REFERENCES public.taxonomy_tree(node_id),
  insert_after_heading TEXT NOT NULL,
  prompt_text        TEXT NOT NULL,
  reveal_text        TEXT NOT NULL,
  options            JSONB DEFAULT '[]',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wiki_ei_prompts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wiki_ei_prompts' AND policyname = 'eip_select_all') THEN
    CREATE POLICY eip_select_all ON public.wiki_ei_prompts FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ei_prompts_article ON public.wiki_ei_prompts(article_id);

DROP TRIGGER IF EXISTS tr_wiki_ei_prompts_updated_at ON public.wiki_ei_prompts;
CREATE TRIGGER tr_wiki_ei_prompts_updated_at
  BEFORE UPDATE ON public.wiki_ei_prompts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ── EI Responses ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wiki_ei_responses (
  response_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id             UUID NOT NULL REFERENCES public.wiki_ei_prompts(prompt_id),
  response_text         TEXT,
  selected_option_index SMALLINT,
  responded_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wiki_ei_responses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'wiki_ei_responses' AND policyname = 'eir_insert_own') THEN
    CREATE POLICY eir_insert_own ON public.wiki_ei_responses FOR INSERT TO authenticated
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ei_responses_user ON public.wiki_ei_responses(user_id, responded_at DESC);


-- ── Calibration Score on user_computed_signals ────────────────

ALTER TABLE public.user_computed_signals
  ADD COLUMN IF NOT EXISTS calibration_score DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS calibration_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS calibration_sessions_count INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.user_computed_signals.calibration_score IS
  'Metacognitive calibration: 0–1, 1=perfectly calibrated. NULL until 5+ sessions with confidence ratings.';
```

**STOP.** "Migration 023 complete. Reply 'Proceed.'"

---

## PHASE 7: Migration 024 — Anonymous Diagnostics

```sql
-- ============================================================
-- Migration 024: Pre-Auth Anonymous Diagnostic Sessions
-- Enables: Duolingo-style delayed signup flow
-- ============================================================

CREATE TABLE IF NOT EXISTS public.anon_diagnostic_sessions (
  anon_session_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  browser_session_id TEXT NOT NULL,
  question_ids       UUID[] NOT NULL DEFAULT '{}',
  answers            JSONB NOT NULL DEFAULT '{}',
  questions_answered INTEGER NOT NULL DEFAULT 0,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at         TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '2 hours'),
  converted_user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- No RLS — server-side service role access only.
-- Browser session cookie matches records, not user auth.

CREATE INDEX IF NOT EXISTS idx_anon_diagnostic_browser
  ON public.anon_diagnostic_sessions(browser_session_id);
CREATE INDEX IF NOT EXISTS idx_anon_diagnostic_expires
  ON public.anon_diagnostic_sessions(expires_at)
  WHERE converted_user_id IS NULL;

COMMENT ON TABLE public.anon_diagnostic_sessions IS
  'Pre-auth diagnostic state for Duolingo-style delayed signup. Browser cookie links to session.
   On account creation, answers migrate to real quiz_sessions row. Nightly cleanup: DELETE WHERE expires_at < now() AND converted_user_id IS NULL.';
```

**STOP.** "Migration 024 complete. Reply 'Proceed.'"

---

## PHASE 8: Migration 025 — Proof Simulation + Campfire

```sql
-- ============================================================
-- Migration 025: Proof Simulation Enhancement + Campfire
-- ============================================================

-- ── 3.4 Proof Simulation 24-Hour Diagnostic Delay ─────────────

ALTER TABLE public.readiness_score_snapshots
  ADD COLUMN IF NOT EXISTS analysis_available_at TIMESTAMPTZ
    GENERATED ALWAYS AS (
      CASE WHEN is_proof_simulation THEN computed_at + INTERVAL '24 hours'
           ELSE computed_at
      END
    ) STORED;

COMMENT ON COLUMN public.readiness_score_snapshots.analysis_available_at IS
  'Proof simulations: 24 hours after score computed (Consolidation-Before-Analysis). Regular sessions: immediate.';


-- ── 3.2 Campfire Testimonials ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.campfire_testimonials (
  testimonial_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name   TEXT NOT NULL,
  school_name    TEXT,
  starting_score DOUBLE PRECISION,
  final_score    DOUBLE PRECISION,
  passed         BOOLEAN NOT NULL,
  exam_batch     TEXT NOT NULL,
  quote          TEXT,
  is_featured    BOOLEAN NOT NULL DEFAULT false,
  is_verified    BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.campfire_testimonials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campfire_testimonials' AND policyname = 'ct_select_featured') THEN
    CREATE POLICY ct_select_featured ON public.campfire_testimonials
      FOR SELECT TO public
      USING (is_featured = true AND is_verified = true);
  END IF;
END $$;
```

**STOP.** "Migration 025 complete. Reply 'Proceed' for full verification."

---

## PHASE 9: Full Verification

```sql
-- ═══════════════════════════════════════════════════════════════
-- COMPLETE VERIFICATION: Every gap, every table, every column
-- ═══════════════════════════════════════════════════════════════

-- 019: Monetization columns
SELECT '019' as mig, column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats'
AND column_name IN ('score_reveal_shown_at', 'is_retaker', 'assessment_started_at', 'proof_simulation_unlocked_at')
UNION ALL
SELECT '019', column_name FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name IN ('free_questions_today', 'free_cap_reset_date')
UNION ALL
SELECT '019', 'feature_flags: ' || COUNT(*)::text FROM feature_flags;

-- 020: SRS + Streaks
SELECT '020' as mig, column_name FROM information_schema.columns
WHERE table_name = 'user_node_mastery' AND column_name IN ('next_review_at', 'review_interval_days', 'ease_factor', 'review_count')
UNION ALL
SELECT '020', column_name FROM information_schema.columns
WHERE table_name = 'user_trail_enrollments' AND column_name IN ('current_streak', 'longest_streak', 'milestones_shown')
UNION ALL
SELECT '020', column_name FROM information_schema.columns
WHERE table_name = 'user_global_stats' AND column_name IN ('global_current_streak', 'last_active_date');

-- 021: Endurance
SELECT '021' as mig, column_name FROM information_schema.columns
WHERE table_name = 'user_endurance_profiles'
ORDER BY ordinal_position;

-- 022: Notifications
SELECT '022' as mig, table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('user_push_tokens', 'notification_log');

-- 023: Wiki + Calibration
SELECT '023' as mig, table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('wiki_article_reads', 'wiki_ei_prompts', 'wiki_ei_responses');

-- 024: Anon diagnostic
SELECT '024' as mig, table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'anon_diagnostic_sessions';

-- 025: Proof + Campfire
SELECT '025' as mig, column_name FROM information_schema.columns
WHERE table_name = 'readiness_score_snapshots' AND column_name = 'analysis_available_at'
UNION ALL
SELECT '025', table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'campfire_testimonials';

-- RLS on all new tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'user_endurance_profiles', 'user_push_tokens', 'notification_log',
  'wiki_article_reads', 'wiki_ei_prompts', 'wiki_ei_responses', 'campfire_testimonials'
);
-- All should be true (except anon_diagnostic_sessions which has no RLS by design)

-- Trigger coverage on new tables
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('user_endurance_profiles', 'user_push_tokens', 'wiki_ei_prompts');

-- Final count check
SELECT 'tables' as type, COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL SELECT 'indexes', COUNT(*) FROM pg_indexes WHERE schemaname = 'public'
UNION ALL SELECT 'triggers', COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public'
UNION ALL SELECT 'policies', COUNT(*) FROM pg_policies WHERE schemaname = 'public';
```

### Then: Regenerate DATABASE_SCHEMA.sql

Run the full extraction queries (A through N from the regeneration prompt) and overwrite. The header counts must match the final count check above.

**STOP.** "All 7 migrations complete. 22 gaps resolved. DATABASE_SCHEMA.sql regenerated."

---

## GAP REGISTER — FINAL STATUS

| # | Gap | Severity | Migration | Status |
|---|---|---|---|---|
| 1.1 | `score_reveal_shown_at` | 🔴 | 019 | ✅ |
| 1.2 | Free tier cap columns | 🔴 | 019 | ✅ |
| 1.3 | SRS columns | 🔴 | 020 | ✅ |
| 1.4 | Endurance Cycle table | 🔴 | 021 | ✅ |
| 1.5 | Study streak columns | 🔴 | 020 | ✅ |
| 1.6 | Anon diagnostic sessions | 🔴 | 024 | ✅ |
| 2.1 | `is_retaker` | 🟡 | 019 | ✅ |
| 2.2 | `assessment_started_at` | 🟡 | 019 | ✅ |
| 2.3 | Calibration score | 🟡 | 023 | ✅ |
| 2.4 | Push notification tables | 🟡 | 022 | ✅ |
| 2.5 | Wiki read tracking | 🟡 | 023 | ✅ |
| 2.6 | Trail milestone tracking | 🟡 | 020 | ✅ |
| 3.1 | EI prompts + responses | 🟠 | 023 | ✅ |
| 3.2 | Campfire testimonials | 🟠 | 025 | ✅ |
| 3.3 | `proof_simulation_unlocked_at` | 🟠 | 019 | ✅ |
| 3.4 | `analysis_available_at` generated | 🟠 | 025 | ✅ |
| D1 | Feature flags populated | 🔴 | 019 | ✅ |
| D2 | analytics_events empty | 🔴 | App code | ⏳ |
| D3 | exam_outcomes empty | 🟡 | Survey pipeline | ⏳ |
| D4 | profiles empty | 🔴 | App code | ⏳ |

**19 of 22 gaps resolved by schema. 3 remaining are application-code tasks (event instrumentation, onboarding profile writes, exam survey pipeline).**

---

## WHAT NOT TO DO

- **Don't combine migrations.** Run them in order (019 → 020 → 021 → 022 → 023 → 024 → 025). Each depends on the previous.
- **Don't skip the Phase 1 pre-flight.** Previous prompts may have added some of these columns under different names (`srs_due_at` vs `next_review_at`). Phase 1 catches collisions.
- **Don't add INSERT policies to `user_endurance_profiles`.** It's written by server-side logic only (service role).
- **Don't add RLS to `anon_diagnostic_sessions`.** It's accessed by service role only via browser session cookie matching. RLS would block server reads.
- **Don't drop `endurance_*` columns from `user_computed_signals`** if they exist from a previous migration. They can coexist with `user_endurance_profiles`. Deprecate them with COMMENT and migrate reads later.
- **Don't modify the `GENERATED ALWAYS AS` expression on `endurance_gate_pct`** — it's computed automatically and cannot be written to directly.
- **Don't seed EI prompt data.** Build the tables only. SMEs author prompts later.

---

*Execute Phase 1 now. Run the pre-flight queries.*
