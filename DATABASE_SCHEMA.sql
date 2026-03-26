-- ============================================================================
-- SlateCamp Database Schema — Generated 2026-03-26
-- 72 tables · 1 view(s) · Supabase (PostgreSQL 17)
-- ============================================================================

-- ============================================================================
-- 1. Core
-- ============================================================================

-- ─── Table: profiles ────────────────────────────────────────────────────
CREATE TABLE profiles (
  id                                       UUID NOT NULL,
  full_name                                TEXT,
  display_name                             TEXT,
  avatar_url                               TEXT,
  user_type                                TEXT DEFAULT 'reviewee',
  discipline_id                            UUID,
  target_exam_date                         DATE,
  school_or_institution                    TEXT,
  onboarding_completed_at                  TIMESTAMPTZ,
  created_at                               TIMESTAMPTZ DEFAULT now(),
  updated_at                               TIMESTAMPTZ DEFAULT now(),
  preferred_study_window                   TEXT DEFAULT 'any',
  reviewer_type                            TEXT DEFAULT 'first_taker',
  previous_exam_subjects_struggled         JSONB DEFAULT '[]'::JSONB,
  enrolled_review_center                   TEXT,
  comp_exam_scores                         JSONB,
  comp_exam_date                           DATE,
  ale_result                               TEXT,
  oath_taking_date                         DATE,
  account_mode                             TEXT DEFAULT 'review_mode',
  role                                     TEXT DEFAULT 'member',
  dae_work_contexts                        TEXT[] DEFAULT '{}',
  dae_contexts_updated_at                  TIMESTAMPTZ,
  school_name                              TEXT,
  region                                   TEXT
);

-- ─── Table: disciplines ─────────────────────────────────────────────────
CREATE TABLE disciplines (
  discipline_id                            UUID NOT NULL DEFAULT gen_random_uuid(),
  name                                     TEXT NOT NULL,
  acronym                                  TEXT NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  passing_threshold_pct                    SMALLINT NOT NULL DEFAULT 70,
  subject_floor_pct                        SMALLINT NOT NULL DEFAULT 50,
  exam_day_1_subjects                      TEXT[] DEFAULT '{}',
  exam_day_2_subjects                      TEXT[] DEFAULT '{}',
  recent_passing_rates                     JSONB DEFAULT '{}'::JSONB
);

-- ─── Table: organizations ───────────────────────────────────────────────
CREATE TABLE organizations (
  org_id                                   UUID NOT NULL DEFAULT gen_random_uuid(),
  name                                     TEXT NOT NULL,
  slug                                     TEXT NOT NULL,
  type                                     USER_TYPE NOT NULL DEFAULT 'regular',
  logo_url                                 TEXT,
  max_seats                                INTEGER NOT NULL DEFAULT 10,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: organization_members ────────────────────────────────────────
CREATE TABLE organization_members (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  org_id                                   UUID NOT NULL,
  user_id                                  UUID NOT NULL,
  role                                     TEXT NOT NULL,
  joined_at                                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: user_roles ──────────────────────────────────────────────────
CREATE TABLE user_roles (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  role                                     VARCHAR(20) NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                               UUID
);

-- ─── Table: user_subscriptions ──────────────────────────────────────────
CREATE TABLE user_subscriptions (
  subscription_id                          UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  tier                                     SUBSCRIPTION_TIER NOT NULL DEFAULT 'free',
  status                                   SUBSCRIPTION_STATUS NOT NULL DEFAULT 'active',
  email_notifications_enabled              BOOLEAN DEFAULT TRUE,
  marketing_emails_enabled                 BOOLEAN DEFAULT FALSE,
  stripe_customer_id                       TEXT,
  stripe_subscription_id                   TEXT,
  payrex_customer_id                       TEXT,
  payrex_reference                         TEXT,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_from_source                    TEXT,
  trial_started_at                         TIMESTAMPTZ,
  readiness_score_at_conversion            DOUBLE PRECISION,
  free_questions_today                     INTEGER NOT NULL DEFAULT 0,
  free_cap_reset_date                      DATE,
  amount                                   NUMERIC(10,2),
  cancelled_at                             TIMESTAMPTZ
);

-- ─── Table: user_push_tokens ────────────────────────────────────────────
CREATE TABLE user_push_tokens (
  token_id                                 UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  token                                    TEXT NOT NULL,
  platform                                 TEXT NOT NULL,
  is_active                                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: oath_taking_schedules ───────────────────────────────────────
CREATE TABLE oath_taking_schedules (
  schedule_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  oath_date                                DATE NOT NULL,
  region                                   TEXT NOT NULL,
  venue                                    TEXT,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: study_pods ──────────────────────────────────────────────────
CREATE TABLE study_pods (
  pod_id                                   UUID NOT NULL DEFAULT gen_random_uuid(),
  pod_name                                 TEXT,
  created_by                               UUID,
  max_members                              INTEGER NOT NULL DEFAULT 6,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  invite_code                              TEXT DEFAULT encode(gen_random_bytes(6), 'hex'::text)
);

-- ─── Table: pod_members ─────────────────────────────────────────────────
CREATE TABLE pod_members (
  pod_id                                   UUID NOT NULL,
  user_id                                  UUID NOT NULL,
  joined_at                                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. Content
-- ============================================================================

-- ─── Table: questions ───────────────────────────────────────────────────
CREATE TABLE questions (
  question_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  topic_id                                 UUID NOT NULL,
  text                                     TEXT NOT NULL,
  options                                  JSONB NOT NULL DEFAULT '[]'::JSONB,
  correct_option_id                        TEXT NOT NULL,
  rationale                                JSONB,
  difficulty                               NUMERIC DEFAULT 0.50,
  difficulty_rating                        NUMERIC,
  discrimination_rating                    NUMERIC,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  prompt_image_url                         TEXT,
  explanation                              TEXT,
  code_citation                            TEXT,
  model_id                                 TEXT,
  is_assessment                            BOOLEAN DEFAULT FALSE,
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  application_context                      TEXT,
  practice_context                         TEXT[] DEFAULT '{}',
  bloom_level                              TEXT,
  irt_difficulty                           DOUBLE PRECISION DEFAULT 0.0,
  irt_discrimination                       DOUBLE PRECISION DEFAULT 1.0,
  irt_guessing                             DOUBLE PRECISION DEFAULT 0.0,
  irt_calibrated_at                        TIMESTAMPTZ,
  question_type                            TEXT DEFAULT 'mcq',
  correct_value                            NUMERIC,
  value_tolerance                          NUMERIC DEFAULT 0,
  accepted_answers                         TEXT[]
);

-- ─── Table: taxonomy_tree ───────────────────────────────────────────────
CREATE TABLE taxonomy_tree (
  node_id                                  UUID NOT NULL DEFAULT gen_random_uuid(),
  discipline_id                            UUID NOT NULL,
  parent_id                                UUID,
  level                                    SMALLINT NOT NULL,
  name                                     TEXT NOT NULL,
  subject_area                             TEXT NOT NULL,
  slug                                     TEXT,
  is_leaf                                  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  ale_id                                   TEXT,
  node_type                                TAXONOMY_NODE_TYPE,
  exam_frequency                           EXAM_FREQUENCY_LEVEL,
  prc_area                                 TEXT,
  area_weight_pct                          SMALLINT,
  subject_weight_within_area_pct           SMALLINT,
  description                              TEXT,
  is_cross_ref_only                        BOOLEAN NOT NULL DEFAULT FALSE,
  deprecated_at                            TIMESTAMPTZ,
  wiki_items                               JSONB NOT NULL DEFAULT '[]'::JSONB,
  bloom_level                              BLOOM_LEVEL_TYPE,
  difficulty                               SMALLINT,
  typical_question_formats                 TEXT[] NOT NULL DEFAULT '{}',
  is_computation_heavy                     BOOLEAN NOT NULL DEFAULT FALSE,
  three_d_lab_linked                       BOOLEAN NOT NULL DEFAULT FALSE,
  mastery_criteria                         JSONB,
  sort_order                               SMALLINT
);

-- ─── Table: taxonomy_cross_references ───────────────────────────────────
CREATE TABLE taxonomy_cross_references (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  source_node_id                           UUID NOT NULL,
  target_node_id                           UUID NOT NULL,
  relationship_type                        TEXT NOT NULL DEFAULT 'law_applies_to',
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: taxonomy_prerequisites ──────────────────────────────────────
CREATE TABLE taxonomy_prerequisites (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  subtopic_id                              UUID NOT NULL,
  prerequisite_id                          UUID NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: taxonomy_sources ────────────────────────────────────────────
CREATE TABLE taxonomy_sources (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  node_id                                  UUID NOT NULL,
  label                                    TEXT NOT NULL,
  url                                      TEXT NOT NULL DEFAULT 'TBD',
  source_type                              TAXONOMY_SOURCE_TYPE NOT NULL,
  is_verified                              BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order                               SMALLINT NOT NULL DEFAULT 0,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: wiki_articles ───────────────────────────────────────────────
CREATE TABLE wiki_articles (
  article_id                               UUID NOT NULL DEFAULT gen_random_uuid(),
  title                                    TEXT NOT NULL,
  slug                                     TEXT NOT NULL,
  content                                  TEXT NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  status                                   TEXT DEFAULT 'draft',
  reviewed_by                              UUID,
  reviewed_at                              TIMESTAMPTZ,
  reviewer_comments                        TEXT,
  ale_tests_you                            TEXT,
  updated_note                             TEXT,
  subject_label                            TEXT,
  difficulty_label                         TEXT,
  read_time                                TEXT
);

-- ─── Table: wiki_article_reads ──────────────────────────────────────────
CREATE TABLE wiki_article_reads (
  read_id                                  UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  article_id                               UUID NOT NULL,
  read_at                                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_pct                                 SMALLINT NOT NULL DEFAULT 0,
  time_spent_ms                            INTEGER,
  trail_step_id                            UUID
);

-- ─── Table: wiki_article_sources ────────────────────────────────────────
CREATE TABLE wiki_article_sources (
  source_id                                UUID NOT NULL DEFAULT gen_random_uuid(),
  article_id                               UUID NOT NULL,
  label                                    TEXT NOT NULL,
  url                                      TEXT,
  source_type                              TAXONOMY_SOURCE_TYPE NOT NULL,
  description                              TEXT,
  sort_order                               SMALLINT NOT NULL DEFAULT 0,
  is_verified                              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: wiki_article_taxonomy ───────────────────────────────────────
CREATE TABLE wiki_article_taxonomy (
  article_id                               UUID NOT NULL,
  node_id                                  UUID NOT NULL,
  is_primary                               BOOLEAN DEFAULT FALSE
);

-- ─── Table: wiki_bookmarks ──────────────────────────────────────────────
CREATE TABLE wiki_bookmarks (
  bookmark_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  article_id                               UUID NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: wiki_ei_prompts ─────────────────────────────────────────────
CREATE TABLE wiki_ei_prompts (
  prompt_id                                UUID NOT NULL DEFAULT gen_random_uuid(),
  article_id                               UUID NOT NULL,
  node_id                                  UUID,
  insert_after_heading                     TEXT NOT NULL,
  prompt_text                              TEXT NOT NULL,
  reveal_text                              TEXT NOT NULL,
  options                                  JSONB DEFAULT '[]'::JSONB,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  sort_order                               SMALLINT NOT NULL DEFAULT 0,
  is_active                                BOOLEAN NOT NULL DEFAULT TRUE,
  status                                   TEXT NOT NULL DEFAULT 'draft',
  reviewed_by                              UUID,
  reviewed_at                              TIMESTAMPTZ,
  reviewer_notes                           TEXT
);

-- ─── Table: wiki_ei_responses ───────────────────────────────────────────
CREATE TABLE wiki_ei_responses (
  response_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  prompt_id                                UUID NOT NULL,
  response_text                            TEXT,
  selected_option_index                    SMALLINT,
  responded_at                             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. Quiz Engine
-- ============================================================================

-- ─── Table: quiz_sessions ───────────────────────────────────────────────
CREATE TABLE quiz_sessions (
  session_id                               UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  discipline_id                            UUID,
  test_mode                                TEST_MODE NOT NULL DEFAULT 'camp',
  status                                   SESSION_STATUS NOT NULL DEFAULT 'in_progress',
  config                                   JSONB NOT NULL DEFAULT '{}'::JSONB,
  question_ids                             UUID[] NOT NULL DEFAULT '{}',
  subject_ids                              UUID[] NOT NULL DEFAULT '{}',
  current_question_index                   INTEGER NOT NULL DEFAULT 0,
  started_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                             TIMESTAMPTZ,
  pre_session_confidence_ratings           JSONB DEFAULT '{}'::JSONB,
  is_proof_simulation                      BOOLEAN DEFAULT FALSE,
  is_endurance_session                     BOOLEAN DEFAULT FALSE,
  accuracy_by_block                        JSONB DEFAULT '[]'::JSONB,
  session_discovery                        JSONB,
  mastery_snapshot_at_start                JSONB
);

-- ─── Table: user_interactions ───────────────────────────────────────────
CREATE TABLE user_interactions (
  interaction_id                           UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  session_id                               UUID NOT NULL,
  question_id                              UUID NOT NULL,
  topic_id                                 UUID,
  selected_option_id                       TEXT,
  is_correct                               BOOLEAN NOT NULL,
  time_spent_ms                            INTEGER DEFAULT 0,
  interaction_timestamp                    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_flagged                               BOOLEAN NOT NULL DEFAULT FALSE,
  answer_changes                           INTEGER NOT NULL DEFAULT 0,
  options_eliminated                       INTEGER NOT NULL DEFAULT 0,
  confidence                               TEXT,
  rationale_view_ms                        INTEGER DEFAULT 0,
  error_type                               TEXT,
  question_order                           INTEGER,
  is_suspected_lucky_guess                 BOOLEAN NOT NULL DEFAULT FALSE,
  source_type                              TEXT DEFAULT 'quiz',
  error_category                           TEXT,
  error_confidence                         NUMERIC(3,2)
);

-- ─── Table: user_question_responses ─────────────────────────────────────
CREATE TABLE user_question_responses (
  response_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  question_id                              UUID NOT NULL,
  session_id                               UUID,
  answered_at                              TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_correct                               BOOLEAN NOT NULL,
  selected_option                          TEXT,
  time_taken_ms                            INTEGER,
  confidence_level                         SMALLINT
);

-- ─── Table: anon_diagnostic_sessions ────────────────────────────────────
CREATE TABLE anon_diagnostic_sessions (
  anon_session_id                          UUID NOT NULL DEFAULT gen_random_uuid(),
  browser_session_id                       TEXT NOT NULL,
  question_ids                             UUID[] NOT NULL DEFAULT '{}',
  answers                                  JSONB NOT NULL DEFAULT '{}'::JSONB,
  questions_answered                       INTEGER NOT NULL DEFAULT 0,
  started_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                               TIMESTAMPTZ NOT NULL DEFAULT (now() + '02:00:00'::interval),
  converted_user_id                        UUID
);

-- ============================================================================
-- 4. Mastery & Learning
-- ============================================================================

-- ─── Table: user_node_mastery ───────────────────────────────────────────
CREATE TABLE user_node_mastery (
  user_id                                  UUID NOT NULL,
  topic_id                                 UUID NOT NULL,
  total_attempts                           INTEGER NOT NULL DEFAULT 0,
  total_correct                            INTEGER NOT NULL DEFAULT 0,
  current_mastery_weight                   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  avg_time_ms                              INTEGER NOT NULL DEFAULT 0,
  last_encountered                         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ DEFAULT now(),
  teach_back_attempted                     BOOLEAN DEFAULT FALSE,
  teach_back_gap_count                     INTEGER DEFAULT 0,
  next_review_at                           TIMESTAMPTZ,
  review_interval_days                     INTEGER DEFAULT 1,
  ease_factor                              DOUBLE PRECISION DEFAULT 2.5,
  review_count                             INTEGER NOT NULL DEFAULT 0,
  consecutive_correct_streak               INTEGER NOT NULL DEFAULT 0,
  highest_difficulty_correct               SMALLINT NOT NULL DEFAULT 0,
  has_bloom_apply_correct                  BOOLEAN NOT NULL DEFAULT FALSE,
  has_bloom_analyze_correct                BOOLEAN NOT NULL DEFAULT FALSE,
  distinct_questions_seen                  INTEGER NOT NULL DEFAULT 0,
  decay_rate                               NUMERIC(4,3) DEFAULT 0.3,
  predicted_recall                         NUMERIC(4,3),
  optimal_review_at                        TIMESTAMPTZ,
  storage_strength                         NUMERIC(4,3) DEFAULT 0,
  retrieval_strength                       NUMERIC(4,3) DEFAULT 0,
  practice_count                           INTEGER DEFAULT 0,
  practice_contexts                        INTEGER DEFAULT 0
);

-- ─── Table: user_mastery_history ────────────────────────────────────────
CREATE TABLE user_mastery_history (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  topic_id                                 UUID NOT NULL,
  mastery_weight                           NUMERIC(5,4) NOT NULL,
  total_correct                            INTEGER NOT NULL DEFAULT 0,
  total_attempts                           INTEGER NOT NULL DEFAULT 0,
  session_id                               UUID,
  snapshot_reason                          TEXT DEFAULT 'session_complete',
  created_at                               TIMESTAMPTZ DEFAULT now()
);

-- ─── Table: user_srs_cards ──────────────────────────────────────────────
CREATE TABLE user_srs_cards (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  node_id                                  TEXT NOT NULL,
  ease_factor                              DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  interval_days                            DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  repetitions                              INTEGER NOT NULL DEFAULT 0,
  quality_last                             INTEGER,
  next_review_at                           TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at                         TIMESTAMPTZ,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: user_theta ──────────────────────────────────────────────────
CREATE TABLE user_theta (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  discipline_id                            UUID,
  theta                                    DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  theta_se                                 DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  responses_count                          INTEGER NOT NULL DEFAULT 0,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: user_global_stats ───────────────────────────────────────────
CREATE TABLE user_global_stats (
  user_id                                  UUID NOT NULL,
  current_discipline_id                    UUID,
  global_readiness_score                   DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  target_exam_date                         TIMESTAMPTZ,
  final_stretch_upsell_shown               BOOLEAN DEFAULT FALSE,
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  signup_source                            TEXT,
  utm_campaign                             TEXT,
  utm_medium                               TEXT,
  utm_content                              TEXT,
  referral_code                            TEXT,
  first_session_at                         TIMESTAMPTZ,
  onboarding_completed_at                  TIMESTAMPTZ,
  assessment_completed_at                  TIMESTAMPTZ,
  assessment_score                         DOUBLE PRECISION,
  first_touch_source                       TEXT,
  first_touch_campaign                     TEXT,
  last_touch_source                        TEXT,
  last_touch_campaign                      TEXT,
  acquisition_touchpoints                  JSONB DEFAULT '[]'::JSONB,
  exam_attempt_number                      INTEGER DEFAULT 1,
  previous_exam_result                     TEXT,
  customer_archetype                       TEXT,
  churn_risk_score                         DOUBLE PRECISION DEFAULT 0,
  churn_risk_updated_at                    TIMESTAMPTZ,
  score_velocity_7d                        DOUBLE PRECISION DEFAULT 0,
  score_velocity_updated_at                TIMESTAMPTZ,
  free_questions_today                     INTEGER DEFAULT 0,
  free_questions_reset_date                DATE DEFAULT CURRENT_DATE,
  score_reveal_shown_at                    TIMESTAMPTZ,
  global_current_streak                    INTEGER NOT NULL DEFAULT 0,
  global_longest_streak                    INTEGER NOT NULL DEFAULT 0,
  last_study_date                          DATE,
  is_retaker                               BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_retaker_framing_shown         BOOLEAN NOT NULL DEFAULT FALSE,
  assessment_started_at                    TIMESTAMPTZ,
  proof_simulation_unlocked_at             TIMESTAMPTZ,
  last_active_date                         DATE,
  readiness_sub_scores                     JSONB NOT NULL DEFAULT '{}'::JSONB,
  simulation_count                         INTEGER DEFAULT 0,
  last_simulation_score                    NUMERIC(5,2),
  best_simulation_score                    NUMERIC(5,2)
);

-- ─── Table: user_endurance_profiles ─────────────────────────────────────
CREATE TABLE user_endurance_profiles (
  user_id                                  UUID NOT NULL,
  baseline_reliable_items                  INTEGER,
  baseline_accuracy_decay_at               INTEGER,
  baseline_avg_accuracy                    DOUBLE PRECISION,
  baseline_calibrated_at                   TIMESTAMPTZ,
  current_endurance_target                 INTEGER,
  endurance_window_minutes                 DOUBLE PRECISION,
  endurance_sessions_completed             INTEGER NOT NULL DEFAULT 0,
  avg_seconds_per_question                 DOUBLE PRECISION,
  pacing_target_seconds                    DOUBLE PRECISION NOT NULL DEFAULT 96,
  pacing_updated_at                        TIMESTAMPTZ,
  consecutive_plateau_weeks                INTEGER NOT NULL DEFAULT 0,
  last_endurance_session_at                TIMESTAMPTZ,
  endurance_gate_pct                       DOUBLE PRECISION,
  computed_at                              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: blindspot_queues ────────────────────────────────────────────
CREATE TABLE blindspot_queues (
  queue_id                                 UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  session_id                               UUID,
  node_ids                                 UUID[] NOT NULL,
  question_count                           INTEGER DEFAULT 12,
  generated_at                             TIMESTAMPTZ DEFAULT now(),
  deferred_until                           TIMESTAMPTZ,
  completed_at                             TIMESTAMPTZ,
  status                                   TEXT DEFAULT 'pending',
  pre_queue_mastery                        JSONB DEFAULT '{}'::JSONB,
  post_queue_mastery                       JSONB DEFAULT '{}'::JSONB,
  nodes_improved                           INTEGER DEFAULT 0,
  recommendation_type                      TEXT DEFAULT 'quiz'
);

-- ─── Table: teach_back_submissions ──────────────────────────────────────
CREATE TABLE teach_back_submissions (
  submission_id                            UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  topic_id                                 UUID,
  entry_point                              TEXT NOT NULL,
  trail_day_id                             UUID,
  prompt_text                              TEXT NOT NULL,
  student_response                         TEXT NOT NULL,
  evaluation_result                        JSONB DEFAULT '{}'::JSONB,
  gaps_identified                          TEXT[] DEFAULT '{}',
  revised_response                         TEXT,
  submitted_at                             TIMESTAMPTZ DEFAULT now(),
  revised_at                               TIMESTAMPTZ,
  created_at                               TIMESTAMPTZ DEFAULT now(),
  updated_at                               TIMESTAMPTZ DEFAULT now()
);

-- ─── Table: topic_teach_back_criteria ───────────────────────────────────
CREATE TABLE topic_teach_back_criteria (
  criteria_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  topic_id                                 UUID NOT NULL,
  required_concepts                        TEXT[] NOT NULL DEFAULT '{}',
  required_exceptions                      TEXT[] NOT NULL DEFAULT '{}',
  common_misconceptions                    TEXT[] NOT NULL DEFAULT '{}',
  code_citations                           TEXT[] NOT NULL DEFAULT '{}',
  authored_by                              UUID,
  created_at                               TIMESTAMPTZ DEFAULT now(),
  updated_at                               TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. Metacognitive System
-- ============================================================================

-- ─── Table: session_predictions ─────────────────────────────────────────
CREATE TABLE session_predictions (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  session_id                               UUID NOT NULL,
  prediction_score                         SMALLINT NOT NULL,
  postdiction_score                        SMALLINT,
  actual_score                             SMALLINT,
  prediction_at                            TIMESTAMPTZ NOT NULL DEFAULT now(),
  postdiction_at                           TIMESTAMPTZ,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: calibration_snapshots ───────────────────────────────────────
CREATE TABLE calibration_snapshots (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  calibration_score                        NUMERIC(5,2) NOT NULL,
  brier_score                              NUMERIC(5,4) NOT NULL,
  sample_size                              INTEGER NOT NULL,
  confident_accuracy                       NUMERIC(5,4),
  guessing_accuracy                        NUMERIC(5,4),
  overconfidence_index                     NUMERIC(5,4),
  underconfidence_index                    NUMERIC(5,4),
  window_start                             TIMESTAMPTZ NOT NULL,
  window_end                               TIMESTAMPTZ NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: successive_relearning_cycles ────────────────────────────────
CREATE TABLE successive_relearning_cycles (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  topic_id                                 UUID NOT NULL,
  status                                   TEXT NOT NULL DEFAULT 'active',
  consecutive_correct                      INTEGER NOT NULL DEFAULT 0,
  current_spacing_interval                 INTEGER,
  spacing_level                            INTEGER NOT NULL DEFAULT 0,
  next_retest_at                           TIMESTAMPTZ,
  total_resets                             INTEGER NOT NULL DEFAULT 0,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: confusion_pairs ─────────────────────────────────────────────
CREATE TABLE confusion_pairs (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  topic_a                                  UUID NOT NULL,
  topic_b                                  UUID NOT NULL,
  co_failure_rate                          NUMERIC(5,4) NOT NULL,
  sample_size                              INTEGER NOT NULL,
  disambiguation_article_id                UUID,
  detected_at                              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: daily_doses ─────────────────────────────────────────────────
CREATE TABLE daily_doses (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  dose_date                                DATE NOT NULL,
  activities                               JSONB NOT NULL,
  estimated_minutes                        INTEGER NOT NULL,
  rationale                                TEXT,
  started_at                               TIMESTAMPTZ,
  completed_at                             TIMESTAMPTZ,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: exam_outcomes ───────────────────────────────────────────────
CREATE TABLE exam_outcomes (
  outcome_id                               UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID,
  discipline_id                            UUID,
  exam_batch                               TEXT NOT NULL,
  result                                   TEXT NOT NULL,
  self_reported_score                      NUMERIC,
  peak_readiness_score                     DOUBLE PRECISION,
  readiness_score_at_7d_before             DOUBLE PRECISION,
  avg_session_accuracy                     DOUBLE PRECISION,
  total_sessions_completed                 INTEGER,
  total_questions_answered                 INTEGER,
  days_active                              INTEGER,
  signup_source                            TEXT,
  customer_archetype                       TEXT,
  reported_at                              TIMESTAMPTZ DEFAULT now(),
  verified                                 BOOLEAN DEFAULT FALSE,
  created_at                               TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. Analytics & Signals
-- ============================================================================

-- ─── Table: analytics_events ────────────────────────────────────────────
CREATE TABLE analytics_events (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID,
  event_name                               TEXT NOT NULL,
  event_properties                         JSONB DEFAULT '{}'::JSONB,
  page_path                                TEXT,
  session_id                               UUID,
  created_at                               TIMESTAMPTZ DEFAULT now(),
  referrer                                 TEXT
);

-- ─── Table: user_computed_signals ───────────────────────────────────────
CREATE TABLE user_computed_signals (
  user_id                                  UUID NOT NULL,
  score_velocity_7d                        DOUBLE PRECISION NOT NULL DEFAULT 0,
  score_velocity_updated_at                TIMESTAMPTZ,
  churn_risk_score                         DOUBLE PRECISION NOT NULL DEFAULT 0,
  churn_risk_updated_at                    TIMESTAMPTZ,
  days_since_last_session                  INTEGER,
  sessions_last_7d                         INTEGER NOT NULL DEFAULT 0,
  computed_at                              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  endurance_baseline_items                 INTEGER,
  endurance_window_items                   INTEGER,
  endurance_target_items                   INTEGER DEFAULT 150,
  endurance_last_updated                   TIMESTAMPTZ,
  calibration_accuracy                     DOUBLE PRECISION,
  calibration_updated_at                   TIMESTAMPTZ,
  calibration_score                        DOUBLE PRECISION,
  calibration_sessions_count               INTEGER NOT NULL DEFAULT 0
);

-- ─── Table: readiness_score_snapshots ───────────────────────────────────
CREATE TABLE readiness_score_snapshots (
  snapshot_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  score                                    DOUBLE PRECISION NOT NULL,
  sub_scores                               JSONB NOT NULL DEFAULT '{}'::JSONB,
  computed_at                              TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id                               UUID,
  is_proof_simulation                      BOOLEAN NOT NULL DEFAULT FALSE,
  analysis_available_at                    TIMESTAMPTZ
);

-- ============================================================================
-- 7. 3D Lab
-- ============================================================================

-- ─── Table: models_3d ───────────────────────────────────────────────────
CREATE TABLE models_3d (
  model_id                                 UUID NOT NULL DEFAULT gen_random_uuid(),
  name                                     TEXT NOT NULL,
  slug                                     TEXT NOT NULL,
  url                                      TEXT NOT NULL,
  thumbnail                                TEXT,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  status                                   TEXT DEFAULT 'draft',
  metadata                                 JSONB DEFAULT '{}'::JSONB,
  reviewed_by                              UUID,
  reviewed_at                              TIMESTAMPTZ,
  context_scenario                         TEXT,
  ale_question_count                       INTEGER,
  ale_question_type                        TEXT,
  supported_phases                         TEXT[] DEFAULT '{guided}',
  has_challenge_mode                       BOOLEAN DEFAULT FALSE
);

-- ─── Table: spatial_hotspots ────────────────────────────────────────────
CREATE TABLE spatial_hotspots (
  hotspot_id                               UUID NOT NULL DEFAULT gen_random_uuid(),
  model_id                                 UUID NOT NULL,
  node_id                                  UUID,
  title                                    TEXT NOT NULL,
  description                              TEXT,
  position_x                               DOUBLE PRECISION NOT NULL,
  position_y                               DOUBLE PRECISION NOT NULL,
  position_z                               DOUBLE PRECISION NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  phase                                    TEXT DEFAULT 'guided',
  question_id                              UUID,
  reveal_order                             INTEGER DEFAULT 1,
  linked_question_id                       UUID,
  quiz_trigger_distance                    NUMERIC(6,2) DEFAULT 5.0,
  unlock_order                             INTEGER
);

-- ============================================================================
-- 8. Trails & Gamification
-- ============================================================================

-- ─── Table: camp_trails ─────────────────────────────────────────────────
CREATE TABLE camp_trails (
  trail_id                                 UUID NOT NULL DEFAULT gen_random_uuid(),
  discipline_id                            UUID NOT NULL,
  name                                     TEXT NOT NULL,
  slug                                     TEXT NOT NULL,
  description                              TEXT,
  trail_type                               TRAIL_TYPE NOT NULL,
  intensity                                TRAIL_INTENSITY,
  duration_days                            INTEGER NOT NULL,
  total_steps                              INTEGER NOT NULL DEFAULT 0,
  is_published                             BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured                              BOOLEAN NOT NULL DEFAULT FALSE,
  recommended_min_score                    DOUBLE PRECISION,
  recommended_max_score                    DOUBLE PRECISION,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  daily_time_estimate_minutes              INTEGER NOT NULL DEFAULT 90,
  subjects_covered                         TEXT[] DEFAULT '{}',
  is_free                                  BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Table: trail_days ──────────────────────────────────────────────────
CREATE TABLE trail_days (
  day_id                                   UUID NOT NULL DEFAULT gen_random_uuid(),
  trail_id                                 UUID NOT NULL,
  day_number                               INTEGER NOT NULL,
  title                                    TEXT NOT NULL,
  description                              TEXT,
  estimated_minutes                        INTEGER DEFAULT 60,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  subject_focus                            TEXT,
  subject_color                            TEXT,
  is_rest_day                              BOOLEAN NOT NULL DEFAULT FALSE,
  is_phase_transition                      BOOLEAN NOT NULL DEFAULT FALSE,
  phase_name                               TEXT
);

-- ─── Table: trail_steps ─────────────────────────────────────────────────
CREATE TABLE trail_steps (
  step_id                                  UUID NOT NULL DEFAULT gen_random_uuid(),
  day_id                                   UUID NOT NULL,
  step_order                               INTEGER NOT NULL,
  step_type                                TRAIL_STEP_TYPE NOT NULL,
  title                                    TEXT NOT NULL,
  description                              TEXT,
  target_node_ids                          UUID[] DEFAULT '{}',
  question_count                           INTEGER,
  difficulty_min                           DOUBLE PRECISION DEFAULT 0.0,
  difficulty_max                           DOUBLE PRECISION DEFAULT 1.0,
  article_id                               UUID,
  model_id                                 UUID,
  estimated_minutes                        INTEGER DEFAULT 15,
  is_optional                              BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_time                           TEXT,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  lab_phase                                TEXT DEFAULT 'guided',
  is_computation_heavy                     BOOLEAN NOT NULL DEFAULT FALSE
);

-- ─── Table: trail_day_completions ───────────────────────────────────────
CREATE TABLE trail_day_completions (
  day_completion_id                        UUID NOT NULL DEFAULT gen_random_uuid(),
  enrollment_id                            UUID NOT NULL,
  day_id                                   UUID NOT NULL,
  user_id                                  UUID NOT NULL,
  completed_at                             TIMESTAMPTZ NOT NULL DEFAULT now(),
  readiness_score_at_completion            DOUBLE PRECISION,
  mastery_before                           JSONB,
  mastery_after                            JSONB,
  all_steps_completed                      BOOLEAN NOT NULL DEFAULT FALSE,
  day_number                               INTEGER
);

-- ─── Table: user_trail_enrollments ──────────────────────────────────────
CREATE TABLE user_trail_enrollments (
  enrollment_id                            UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  trail_id                                 UUID NOT NULL,
  status                                   TRAIL_ENROLLMENT_STATUS NOT NULL DEFAULT 'active',
  current_day                              INTEGER NOT NULL DEFAULT 1,
  days_completed                           INTEGER NOT NULL DEFAULT 0,
  last_activity_at                         TIMESTAMPTZ,
  started_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  paused_at                                TIMESTAMPTZ,
  completed_at                             TIMESTAMPTZ,
  target_completion_date                   TIMESTAMPTZ,
  readiness_score_at_start                 DOUBLE PRECISION,
  pace_status                              TEXT DEFAULT 'on_track',
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_streak                           INTEGER NOT NULL DEFAULT 0,
  longest_streak                           INTEGER NOT NULL DEFAULT 0,
  grace_days_used_this_week                INTEGER NOT NULL DEFAULT 0,
  last_streak_date                         DATE,
  streak_grace_week_start                  DATE,
  milestones_shown                         JSONB NOT NULL DEFAULT '[]'::JSONB,
  days_completed_at_abandon                INTEGER,
  abandoned_at                             TIMESTAMPTZ
);

-- ─── Table: user_trail_progress ─────────────────────────────────────────
CREATE TABLE user_trail_progress (
  progress_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  enrollment_id                            UUID NOT NULL,
  user_id                                  UUID NOT NULL,
  step_id                                  UUID NOT NULL,
  completed_at                             TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id                               UUID,
  time_spent_ms                            INTEGER
);

-- ─── Table: session_trail_credits ───────────────────────────────────────
CREATE TABLE session_trail_credits (
  session_id                               UUID NOT NULL,
  enrollment_id                            UUID NOT NULL,
  step_id                                  UUID NOT NULL,
  credited_at                              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. Notifications
-- ============================================================================

-- ─── Table: notifications ───────────────────────────────────────────────
CREATE TABLE notifications (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  type                                     NOTIFICATION_TYPE NOT NULL,
  title                                    TEXT NOT NULL,
  body                                     TEXT NOT NULL,
  metadata                                 JSONB NOT NULL DEFAULT '{}'::JSONB,
  read_at                                  TIMESTAMPTZ,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: notification_log ────────────────────────────────────────────
CREATE TABLE notification_log (
  log_id                                   UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  trigger_type                             TEXT NOT NULL,
  channel                                  TEXT NOT NULL,
  sent_at                                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status                          TEXT DEFAULT 'sent'
);

-- ─── Table: notification_preferences ────────────────────────────────────
CREATE TABLE notification_preferences (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  score_changes                            BOOLEAN NOT NULL DEFAULT TRUE,
  trail_ready                              BOOLEAN NOT NULL DEFAULT TRUE,
  blindspot                                BOOLEAN NOT NULL DEFAULT TRUE,
  milestones                               BOOLEAN NOT NULL DEFAULT TRUE,
  campfire                                 BOOLEAN NOT NULL DEFAULT TRUE,
  content_updates                          BOOLEAN NOT NULL DEFAULT TRUE,
  weekly_digest                            BOOLEAN NOT NULL DEFAULT TRUE,
  coaching_tips                            BOOLEAN NOT NULL DEFAULT FALSE,
  billing                                  BOOLEAN NOT NULL DEFAULT TRUE,
  daily_digest                             BOOLEAN NOT NULL DEFAULT FALSE,
  quiet_hours_start                        TIME,
  quiet_hours_end                          TIME,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 10. Design Problems
-- ============================================================================

-- ─── Table: design_problems ─────────────────────────────────────────────
CREATE TABLE design_problems (
  problem_id                               UUID NOT NULL DEFAULT gen_random_uuid(),
  title                                    TEXT NOT NULL,
  building_type                            TEXT NOT NULL,
  difficulty                               INTEGER,
  time_limit_minutes                       INTEGER DEFAULT 180,
  brief                                    TEXT NOT NULL,
  program                                  JSONB NOT NULL DEFAULT '{}'::JSONB,
  site_data                                JSONB NOT NULL DEFAULT '{}'::JSONB,
  code_references                          TEXT[] DEFAULT '{}',
  is_published                             BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: design_questions ────────────────────────────────────────────
CREATE TABLE design_questions (
  question_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  scenario_id                              UUID NOT NULL,
  number                                   SMALLINT NOT NULL,
  type                                     DESIGN_QUESTION_TYPE NOT NULL,
  question_stem                            TEXT NOT NULL,
  options                                  JSONB NOT NULL DEFAULT '[]'::JSONB,
  correct_answer_index                     SMALLINT NOT NULL,
  rationale                                JSONB,
  solution_steps                           TEXT[] NOT NULL DEFAULT '{}',
  code_citation                            TEXT,
  wiki_ref                                 TEXT,
  bloom_level                              TEXT,
  is_trap_question                         BOOLEAN NOT NULL DEFAULT FALSE,
  difficulty                               NUMERIC DEFAULT 0.50,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: design_problem_sessions ─────────────────────────────────────
CREATE TABLE design_problem_sessions (
  session_id                               UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  problem_id                               UUID NOT NULL,
  started_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at                             TIMESTAMPTZ,
  time_elapsed_seconds                     INTEGER,
  self_assessment_score                    INTEGER,
  checklist_completion                     JSONB DEFAULT '{}'::JSONB
);

-- ─── Table: design_scenarios ────────────────────────────────────────────
CREATE TABLE design_scenarios (
  scenario_id                              TEXT NOT NULL,
  title                                    TEXT NOT NULL,
  building_type                            TEXT NOT NULL,
  difficulty                               TEXT NOT NULL,
  trap_count                               INTEGER DEFAULT 0,
  time_limit_minutes                       INTEGER DEFAULT 180,
  brief                                    TEXT NOT NULL,
  site_data                                JSONB NOT NULL DEFAULT '{}'::JSONB,
  program                                  JSONB NOT NULL DEFAULT '{}'::JSONB,
  code_references                          TEXT[] DEFAULT '{}',
  computation_sheet                        JSONB DEFAULT '{}'::JSONB,
  hidden_traps                             JSONB DEFAULT '[]'::JSONB,
  created_at                               TIMESTAMPTZ DEFAULT now()
);

-- ─── Table: design_scenario_questions ───────────────────────────────────
CREATE TABLE design_scenario_questions (
  question_id                              UUID NOT NULL DEFAULT gen_random_uuid(),
  scenario_id                              TEXT NOT NULL,
  question_number                          INTEGER NOT NULL,
  question_type                            TEXT DEFAULT 'DC',
  question_stem                            TEXT NOT NULL,
  options                                  JSONB NOT NULL DEFAULT '[]'::JSONB,
  correct_answer_index                     INTEGER NOT NULL,
  rationale                                JSONB DEFAULT '{}'::JSONB,
  solution_steps                           TEXT[] DEFAULT '{}',
  code_citation                            TEXT,
  difficulty_rating                        NUMERIC DEFAULT 0.5,
  discrimination_rating                    NUMERIC DEFAULT 1.0,
  created_at                               TIMESTAMPTZ DEFAULT now()
);

-- ─── Table: design_scenario_interactions ────────────────────────────────
CREATE TABLE design_scenario_interactions (
  interaction_id                           UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  session_id                               UUID,
  question_id                              UUID,
  scenario_id                              TEXT,
  selected_answer_index                    INTEGER,
  is_correct                               BOOLEAN NOT NULL,
  time_spent_ms                            INTEGER,
  fell_for_trap                            BOOLEAN DEFAULT FALSE,
  trap_id                                  INTEGER,
  created_at                               TIMESTAMPTZ DEFAULT now()
);

-- ─── Table: design_scenario_sessions ────────────────────────────────────
CREATE TABLE design_scenario_sessions (
  session_id                               UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  scenario_id                              TEXT NOT NULL,
  started_at                               TIMESTAMPTZ DEFAULT now(),
  completed_at                             TIMESTAMPTZ,
  answers                                  JSONB DEFAULT '[]'::JSONB,
  score                                    INTEGER,
  total_questions                          INTEGER,
  traps_fallen_into                        INTEGER DEFAULT 0,
  time_elapsed_seconds                     INTEGER
);

-- ============================================================================
-- 11. CEO Dashboard
-- ============================================================================

-- ─── Table: ceo_cash_balance_entries ────────────────────────────────────
CREATE TABLE ceo_cash_balance_entries (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  balance_date                             DATE NOT NULL,
  amount_php                               NUMERIC(14,2) NOT NULL,
  notes                                    TEXT,
  created_by                               UUID NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: ceo_financial_entries ───────────────────────────────────────
CREATE TABLE ceo_financial_entries (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  entry_date                               DATE NOT NULL,
  entry_type                               FINANCIAL_ENTRY_TYPE NOT NULL,
  category                                 TEXT NOT NULL,
  amount_php                               NUMERIC(12,2) NOT NULL,
  description                              TEXT,
  is_recurring                             BOOLEAN NOT NULL DEFAULT FALSE,
  created_by                               UUID NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: ceo_gate_status ─────────────────────────────────────────────
CREATE TABLE ceo_gate_status (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  gate_number                              SMALLINT NOT NULL,
  entered_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  exit_conditions_met                      JSONB NOT NULL DEFAULT '{}'::JSONB,
  notes                                    TEXT,
  created_by                               UUID NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: ceo_team_members ────────────────────────────────────────────
CREATE TABLE ceo_team_members (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID,
  display_name                             TEXT NOT NULL,
  role_title                               TEXT NOT NULL,
  department                               TEAM_DEPARTMENT NOT NULL,
  monthly_cost_php                         NUMERIC(10,2),
  system_role                              SYSTEM_ROLE_TYPE NOT NULL DEFAULT 'member',
  start_date                               DATE NOT NULL,
  end_date                                 DATE,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 12. Other
-- ============================================================================

-- ─── Table: feature_flags ───────────────────────────────────────────────
CREATE TABLE feature_flags (
  id                                       UUID NOT NULL DEFAULT gen_random_uuid(),
  key                                      TEXT NOT NULL,
  description                              TEXT,
  enabled                                  BOOLEAN NOT NULL DEFAULT FALSE,
  target_tier                              TEXT[] DEFAULT '{}',
  target_roles                             TEXT[] DEFAULT '{}',
  created_by                               UUID,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: code_updates ────────────────────────────────────────────────
CREATE TABLE code_updates (
  update_id                                UUID NOT NULL DEFAULT gen_random_uuid(),
  ale_id                                   TEXT,
  summary                                  TEXT NOT NULL,
  previous_value                           TEXT,
  new_value                                TEXT,
  effective_date                           DATE,
  is_ale_testable                          BOOLEAN NOT NULL DEFAULT TRUE,
  published_at                             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: notes ───────────────────────────────────────────────────────
CREATE TABLE notes (
  note_id                                  UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  folder_id                                UUID,
  topic_id                                 UUID,
  title                                    TEXT NOT NULL DEFAULT 'Untitled Note',
  content                                  JSONB NOT NULL DEFAULT '[]'::JSONB,
  source_url                               TEXT,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_pinned                                BOOLEAN NOT NULL DEFAULT FALSE,
  question_id                              UUID,
  session_id                               UUID,
  article_id                               UUID,
  note_type                                TEXT NOT NULL DEFAULT 'standard',
  tags                                     TEXT[] DEFAULT '{}',
  color                                    TEXT
);

-- ─── Table: note_folders ────────────────────────────────────────────────
CREATE TABLE note_folders (
  folder_id                                UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID NOT NULL,
  name                                     TEXT NOT NULL,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Table: campfire_testimonials ───────────────────────────────────────
CREATE TABLE campfire_testimonials (
  testimonial_id                           UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id                                  UUID,
  display_name                             TEXT NOT NULL,
  school_name                              TEXT,
  starting_score                           DOUBLE PRECISION,
  final_score                              DOUBLE PRECISION,
  passed                                   BOOLEAN NOT NULL,
  exam_batch                               TEXT NOT NULL,
  quote                                    TEXT,
  is_featured                              BOOLEAN NOT NULL DEFAULT FALSE,
  is_verified                              BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 13. Views
-- ============================================================================

-- ─── Table: v_current_gate ──────────────────────────────────────────────
-- (Represented as a view in the database)
-- Columns:
--   id UUID
--   gate_number SMALLINT
--   entered_at TIMESTAMPTZ
--   exit_conditions_met JSONB
--   notes TEXT
--   created_by UUID
--   created_at TIMESTAMPTZ

