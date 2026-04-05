# IMPL_19: Consolidated Schema Migrations

**Priority:** P0 — Run before any feature implementation  
**Effort:** ~2 hours  
**Note:** All migrations are additive. No existing columns are modified or dropped. Safe to run on production.

---

## Migration Order

Run these in sequence. Each migration is independent but ordered to satisfy foreign key dependencies.

---

### Migration 001: Core New Tables

```sql
-- ============================================
-- 001_prediction_and_calibration.sql
-- From: IMPL_01, IMPL_03
-- ============================================

-- Session predictions (pre/post-diction)
CREATE TABLE IF NOT EXISTS session_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  prediction_score SMALLINT NOT NULL CHECK (prediction_score BETWEEN 0 AND 100),
  postdiction_score SMALLINT CHECK (postdiction_score BETWEEN 0 AND 100),
  actual_score SMALLINT CHECK (actual_score BETWEEN 0 AND 100),
  prediction_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  postdiction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_session_predictions_user ON session_predictions(user_id, created_at DESC);

ALTER TABLE session_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own predictions" ON session_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own predictions" ON session_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own predictions" ON session_predictions FOR UPDATE USING (auth.uid() = user_id);

-- Calibration snapshots
CREATE TABLE IF NOT EXISTS calibration_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  calibration_score NUMERIC(5,2) NOT NULL,
  brier_score NUMERIC(5,4) NOT NULL,
  sample_size INTEGER NOT NULL,
  confident_accuracy NUMERIC(5,4),
  guessing_accuracy NUMERIC(5,4),
  overconfidence_index NUMERIC(5,4),
  underconfidence_index NUMERIC(5,4),
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_calibration_user ON calibration_snapshots(user_id, created_at DESC);

ALTER TABLE calibration_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own calibration" ON calibration_snapshots FOR SELECT USING (auth.uid() = user_id);
```

---

### Migration 002: Column Additions to Existing Tables

```sql
-- ============================================
-- 002_column_additions.sql
-- From: IMPL_02, IMPL_07, IMPL_09, IMPL_11, IMPL_12, IMPL_18
-- ============================================

-- Confidence tracking on interactions (IMPL_02)
ALTER TABLE user_interactions ADD COLUMN IF NOT EXISTS confidence SMALLINT CHECK (confidence IN (1, 2, 3));

-- Error classification (IMPL_09)
ALTER TABLE user_interactions ADD COLUMN IF NOT EXISTS error_category TEXT;
ALTER TABLE user_interactions ADD COLUMN IF NOT EXISTS error_confidence NUMERIC(3,2);

-- Generation question support (IMPL_07)
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'mcq'
  CHECK (question_type IN ('mcq', 'numeric', 'short_text', 'formula'));
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_value NUMERIC;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS value_tolerance NUMERIC DEFAULT 0;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS accepted_answers TEXT[];

-- Personalized forgetting (IMPL_11)
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS decay_rate NUMERIC(4,3) DEFAULT 0.3;
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS predicted_recall NUMERIC(4,3);
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS optimal_review_at TIMESTAMPTZ;

-- Storage/Retrieval strength (IMPL_12)
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS storage_strength NUMERIC(4,3) DEFAULT 0;
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS retrieval_strength NUMERIC(4,3) DEFAULT 0;
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS practice_count INTEGER DEFAULT 0;
ALTER TABLE user_node_mastery ADD COLUMN IF NOT EXISTS practice_contexts INTEGER DEFAULT 0;

-- Simulation tracking (IMPL_08)
ALTER TABLE user_global_stats ADD COLUMN IF NOT EXISTS simulation_count INTEGER DEFAULT 0;
ALTER TABLE user_global_stats ADD COLUMN IF NOT EXISTS last_simulation_score NUMERIC(5,2);
ALTER TABLE user_global_stats ADD COLUMN IF NOT EXISTS best_simulation_score NUMERIC(5,2);

-- Geographic data (IMPL_18)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS region TEXT;

-- 3D Lab quiz linking (IMPL_16)
ALTER TABLE spatial_hotspots ADD COLUMN IF NOT EXISTS linked_question_id UUID REFERENCES questions(id);
ALTER TABLE spatial_hotspots ADD COLUMN IF NOT EXISTS quiz_trigger_distance NUMERIC(6,2) DEFAULT 5.0;
ALTER TABLE spatial_hotspots ADD COLUMN IF NOT EXISTS unlock_order INTEGER;
```

---

### Migration 003: Successive Relearning

```sql
-- ============================================
-- 003_successive_relearning.sql
-- From: IMPL_05
-- ============================================

CREATE TABLE IF NOT EXISTS successive_relearning_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES taxonomy_tree(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'criterion_met', 'spacing', 'durable', 'reset')),
  consecutive_correct INTEGER NOT NULL DEFAULT 0,
  current_spacing_interval INTEGER,
  spacing_level INTEGER NOT NULL DEFAULT 0,
  next_retest_at TIMESTAMPTZ,
  total_resets INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);
CREATE INDEX idx_sr_cycles_user_due ON successive_relearning_cycles(user_id, next_retest_at)
  WHERE status = 'spacing';

ALTER TABLE successive_relearning_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own SR cycles" ON successive_relearning_cycles FOR ALL USING (auth.uid() = user_id);
```

---

### Migration 004: Confusion Pairs & Daily Doses

```sql
-- ============================================
-- 004_confusion_pairs_and_doses.sql
-- From: IMPL_09, IMPL_13
-- ============================================

CREATE TABLE IF NOT EXISTS confusion_pairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_a UUID NOT NULL REFERENCES taxonomy_tree(id),
  topic_b UUID NOT NULL REFERENCES taxonomy_tree(id),
  co_failure_rate NUMERIC(5,4) NOT NULL,
  sample_size INTEGER NOT NULL,
  disambiguation_article_id UUID REFERENCES wiki_articles(id),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_a, topic_b)
);

CREATE TABLE IF NOT EXISTS daily_doses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dose_date DATE NOT NULL,
  activities JSONB NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  rationale TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, dose_date)
);

ALTER TABLE daily_doses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own doses" ON daily_doses FOR ALL USING (auth.uid() = user_id);
```

---

### Migration 005: Exam Outcomes

```sql
-- ============================================
-- 005_exam_outcomes.sql
-- From: IMPL_14
-- ============================================

CREATE TABLE IF NOT EXISTS exam_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  passed BOOLEAN NOT NULL,
  overall_score NUMERIC(5,2),
  area_scores JSONB,
  readiness_score_at_exam NUMERIC(5,2),
  calibration_score_at_exam NUMERIC(5,2),
  study_hours_total NUMERIC(7,1),
  sessions_completed INTEGER,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);

ALTER TABLE exam_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcomes" ON exam_outcomes FOR ALL USING (auth.uid() = user_id);
```

---

### Migration 006: Enum Additions

```sql
-- ============================================
-- 006_enum_additions.sql
-- From: IMPL_04
-- ============================================

-- Add prequestion mode to test_mode enum
-- Note: Check if enum exists first; ALTER TYPE ADD VALUE is idempotent with IF NOT EXISTS
DO $$
BEGIN
  ALTER TYPE test_mode ADD VALUE IF NOT EXISTS 'prequestion';
  ALTER TYPE test_mode ADD VALUE IF NOT EXISTS 'lab_quiz';
  ALTER TYPE test_mode ADD VALUE IF NOT EXISTS 'successive_relearning';
EXCEPTION
  WHEN invalid_parameter_value THEN NULL; -- Already exists
END $$;
```

---

### Migration 007: pg_cron Jobs

```sql
-- ============================================
-- 007_cron_jobs.sql
-- From: IMPL_09 (confusion pairs), IMPL_11 (recall recalc), IMPL_13 (daily dose)
-- Requires pg_cron extension enabled in Supabase
-- ============================================

-- Nightly Focus Review scan (already specced in IP_EXECUTION_PLAN)
SELECT cron.schedule(
  'nightly-focus-review',
  '0 16 * * *', -- 00:00 PHT = 16:00 UTC
  $$SELECT generate_focus_review_queues()$$
);

-- Nightly predicted recall recalculation
SELECT cron.schedule(
  'nightly-recall-update',
  '5 16 * * *', -- 00:05 PHT
  $$UPDATE user_node_mastery SET
    predicted_recall = CASE
      WHEN last_reviewed_at IS NULL THEN 0
      ELSE GREATEST(0, LEAST(1, EXP(-decay_rate * EXTRACT(EPOCH FROM (NOW() - last_reviewed_at)) / 86400)))
    END,
    optimal_review_at = CASE
      WHEN last_reviewed_at IS NULL THEN NOW()
      ELSE last_reviewed_at + (INTERVAL '1 day' * GREATEST(1, (1.0 / GREATEST(decay_rate, 0.1)) * 2))
    END
  WHERE last_reviewed_at IS NOT NULL$$
);

-- Nightly daily dose pre-generation
SELECT cron.schedule(
  'nightly-daily-dose',
  '10 16 * * *', -- 00:10 PHT
  $$SELECT generate_daily_doses_for_active_users()$$
);

-- Weekly confusion pair detection
SELECT cron.schedule(
  'weekly-confusion-pairs',
  '0 17 * * 0', -- Sunday 01:00 PHT
  $$INSERT INTO confusion_pairs (topic_a, topic_b, co_failure_rate, sample_size)
    SELECT * FROM detect_confusion_pairs()
    ON CONFLICT (topic_a, topic_b) DO UPDATE SET
      co_failure_rate = EXCLUDED.co_failure_rate,
      sample_size = EXCLUDED.sample_size,
      detected_at = NOW()$$
);
```

---

### Migration 008: SQL Functions

```sql
-- ============================================
-- 008_functions.sql
-- Supporting functions for the cron jobs above
-- ============================================

-- Prequestion selector (IMPL_04)
CREATE OR REPLACE FUNCTION select_prequestions(
  p_topic_id UUID,
  p_user_id UUID,
  p_count INTEGER DEFAULT 3
)
RETURNS SETOF questions AS $$
  SELECT q.*
  FROM questions q
  WHERE q.topic_id = p_topic_id
    AND q.status = 'published'
    AND q.difficulty_rating <= 0.6
    AND (
      p_user_id IS NULL
      OR q.id NOT IN (
        SELECT ui.question_id FROM user_interactions ui
        WHERE ui.user_id = p_user_id
        AND ui.created_at > NOW() - INTERVAL '7 days'
      )
    )
  ORDER BY RANDOM()
  LIMIT p_count;
$$ LANGUAGE SQL STABLE;

-- Confusion pair detector (IMPL_09)
CREATE OR REPLACE FUNCTION detect_confusion_pairs()
RETURNS TABLE(topic_a UUID, topic_b UUID, co_failure_rate NUMERIC, sample_size INTEGER) AS $$
  WITH failures AS (
    SELECT user_id, topic_id
    FROM user_node_mastery
    WHERE current_mastery_weight < 0.5
  ),
  pairs AS (
    SELECT a.topic_id AS topic_a, b.topic_id AS topic_b,
      COUNT(DISTINCT a.user_id) AS co_fail_count
    FROM failures a
    JOIN failures b ON a.user_id = b.user_id AND a.topic_id < b.topic_id
    GROUP BY a.topic_id, b.topic_id
    HAVING COUNT(DISTINCT a.user_id) >= 10
  )
  SELECT
    pairs.topic_a, pairs.topic_b,
    pairs.co_fail_count::NUMERIC / GREATEST(
      (SELECT COUNT(DISTINCT user_id) FROM failures WHERE topic_id = pairs.topic_a), 1
    ) AS co_failure_rate,
    pairs.co_fail_count AS sample_size
  FROM pairs
  WHERE pairs.co_fail_count::NUMERIC / GREATEST(
    (SELECT COUNT(DISTINCT user_id) FROM failures WHERE topic_id = pairs.topic_a), 1
  ) > 0.5
  ORDER BY co_failure_rate DESC;
$$ LANGUAGE SQL;
```

---

## Rollback Plan

Every migration uses `IF NOT EXISTS` / `IF NOT EXISTS` guards. To rollback:

```sql
-- Drop new tables (reverse order of creation)
DROP TABLE IF EXISTS exam_outcomes CASCADE;
DROP TABLE IF EXISTS daily_doses CASCADE;
DROP TABLE IF EXISTS confusion_pairs CASCADE;
DROP TABLE IF EXISTS successive_relearning_cycles CASCADE;
DROP TABLE IF EXISTS calibration_snapshots CASCADE;
DROP TABLE IF EXISTS session_predictions CASCADE;

-- Drop new columns (safe — doesn't affect existing data in other columns)
ALTER TABLE user_interactions DROP COLUMN IF EXISTS confidence;
ALTER TABLE user_interactions DROP COLUMN IF EXISTS error_category;
ALTER TABLE user_interactions DROP COLUMN IF EXISTS error_confidence;
-- ... etc for all added columns
```
