-- ==========================================================================
-- SlateCamp DATABASE SCHEMA
-- Auto-generated from Supabase production database: 2026-03-26
-- 64 tables in public schema
-- ==========================================================================

-- ── disciplines ────────────────────────────────────────────────
-- Rows: 1 | RLS: enabled
CREATE TABLE public.disciplines (
  discipline_id                            uuid DEFAULT gen_random_uuid(),
  name                                     text UNIQUE,
  acronym                                  text,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  passing_threshold_pct                    smallint DEFAULT 70,
  subject_floor_pct                        smallint DEFAULT 50,
  exam_day_1_subjects                      ARRAY DEFAULT '{}'::text[],
  exam_day_2_subjects                      ARRAY DEFAULT '{}'::text[],
  recent_passing_rates                     jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public.disciplines ENABLE ROW LEVEL SECURITY;

-- ── models_3d ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.models_3d (
  model_id                                 uuid DEFAULT gen_random_uuid(),
  name                                     text,
  slug                                     text UNIQUE,
  url                                      text,
  thumbnail                                text,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  status                                   text DEFAULT 'draft'::text,
  metadata                                 jsonb DEFAULT '{}'::jsonb,
  reviewed_by                              uuid,
  reviewed_at                              timestamp with time zone,
  context_scenario                         text,
  ale_question_count                       integer,
  ale_question_type                        text,
  supported_phases                         ARRAY DEFAULT '{guided}'::text[],
  has_challenge_mode                       boolean DEFAULT false
);
ALTER TABLE public.models_3d ENABLE ROW LEVEL SECURITY;

-- ── note_folders ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.note_folders (
  folder_id                                uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  name                                     text,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.note_folders ENABLE ROW LEVEL SECURITY;

-- ── notes ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.notes (
  note_id                                  uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  folder_id                                uuid,
  topic_id                                 uuid,
  title                                    text DEFAULT 'Untitled Note'::text,
  content                                  jsonb DEFAULT '[]'::jsonb,
  source_url                               text,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  is_pinned                                boolean DEFAULT false,
  question_id                              uuid,
  session_id                               uuid,
  article_id                               uuid,
  note_type                                text DEFAULT 'standard'::text,
  tags                                     ARRAY DEFAULT '{}'::text[],
  color                                    text
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- ── questions ────────────────────────────────────────────────
-- Rows: 4847 | RLS: enabled
CREATE TABLE public.questions (
  question_id                              uuid DEFAULT gen_random_uuid(),
  topic_id                                 uuid,
  text                                     text,
  options                                  jsonb DEFAULT '[]'::jsonb,
  correct_option_id                        text,
  rationale                                jsonb,
  difficulty                               numeric DEFAULT 0.50,
  difficulty_rating                        numeric,
  discrimination_rating                    numeric,
  created_at                               timestamp with time zone DEFAULT now(),
  prompt_image_url                         text,
  explanation                              text,
  code_citation                            text,
  model_id                                 text,
  is_assessment                            boolean DEFAULT false,
  updated_at                               timestamp with time zone DEFAULT now(),
  application_context                      text,
  practice_context                         ARRAY DEFAULT '{}'::text[],
  bloom_level                              text,
  irt_difficulty                           double precision DEFAULT 0.0,
  irt_discrimination                       double precision DEFAULT 1.0,
  irt_guessing                             double precision DEFAULT 0.0,
  irt_calibrated_at                        timestamp with time zone
);
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- ── quiz_sessions ────────────────────────────────────────────────
-- Rows: 22 | RLS: enabled
CREATE TABLE public.quiz_sessions (
  session_id                               uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  discipline_id                            uuid,
  test_mode                                USER-DEFINED DEFAULT 'camp'::test_mode,
  status                                   USER-DEFINED DEFAULT 'in_progress'::session_status,
  config                                   jsonb DEFAULT '{}'::jsonb,
  question_ids                             ARRAY DEFAULT '{}'::uuid[],
  subject_ids                              ARRAY DEFAULT '{}'::uuid[],
  current_question_index                   integer DEFAULT 0,
  started_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  completed_at                             timestamp with time zone,
  pre_session_confidence_ratings           jsonb DEFAULT '{}'::jsonb,
  is_proof_simulation                      boolean DEFAULT false,
  is_endurance_session                     boolean DEFAULT false,
  accuracy_by_block                        jsonb DEFAULT '[]'::jsonb,
  session_discovery                        jsonb,
  mastery_snapshot_at_start                jsonb
);
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;

-- ── readiness_score_snapshots ────────────────────────────────────────────────
-- Rows: 2 | RLS: enabled
CREATE TABLE public.readiness_score_snapshots (
  snapshot_id                              uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  score                                    double precision,
  sub_scores                               jsonb DEFAULT '{}'::jsonb,
  computed_at                              timestamp with time zone DEFAULT now(),
  session_id                               uuid,
  is_proof_simulation                      boolean DEFAULT false,
  analysis_available_at                    timestamp with time zone
);
ALTER TABLE public.readiness_score_snapshots ENABLE ROW LEVEL SECURITY;

-- ── spatial_hotspots ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.spatial_hotspots (
  hotspot_id                               uuid DEFAULT gen_random_uuid(),
  model_id                                 uuid,
  node_id                                  uuid,
  title                                    text,
  description                              text,
  position_x                               double precision,
  position_y                               double precision,
  position_z                               double precision,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  phase                                    text DEFAULT 'guided'::text,
  question_id                              uuid,
  reveal_order                             integer DEFAULT 1
);
ALTER TABLE public.spatial_hotspots ENABLE ROW LEVEL SECURITY;

-- ── taxonomy_tree ────────────────────────────────────────────────
-- Rows: 560 | RLS: enabled
CREATE TABLE public.taxonomy_tree (
  node_id                                  uuid DEFAULT gen_random_uuid(),
  discipline_id                            uuid,
  parent_id                                uuid,
  level                                    smallint,
  name                                     text,
  subject_area                             text,
  slug                                     text UNIQUE,
  is_leaf                                  boolean DEFAULT false,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  ale_id                                   text UNIQUE,
  node_type                                USER-DEFINED,
  exam_frequency                           USER-DEFINED,
  prc_area                                 text,
  area_weight_pct                          smallint,
  subject_weight_within_area_pct           smallint,
  description                              text,
  is_cross_ref_only                        boolean DEFAULT false,
  deprecated_at                            timestamp with time zone,
  wiki_items                               jsonb DEFAULT '[]'::jsonb,
  bloom_level                              USER-DEFINED,
  difficulty                               smallint,
  typical_question_formats                 ARRAY DEFAULT '{}'::text[],
  is_computation_heavy                     boolean DEFAULT false,
  three_d_lab_linked                       boolean DEFAULT false,
  mastery_criteria                         jsonb,
  sort_order                               smallint
);
ALTER TABLE public.taxonomy_tree ENABLE ROW LEVEL SECURITY;

-- ── user_global_stats ────────────────────────────────────────────────
-- Rows: 1 | RLS: enabled
CREATE TABLE public.user_global_stats (
  user_id                                  uuid,
  current_discipline_id                    uuid,
  global_readiness_score                   double precision DEFAULT 0.0,
  target_exam_date                         timestamp with time zone,
  final_stretch_upsell_shown               boolean DEFAULT false,
  updated_at                               timestamp with time zone DEFAULT now(),
  signup_source                            text,
  utm_campaign                             text,
  utm_medium                               text,
  utm_content                              text,
  referral_code                            text,
  first_session_at                         timestamp with time zone,
  onboarding_completed_at                  timestamp with time zone,
  assessment_completed_at                  timestamp with time zone,
  assessment_score                         double precision,
  first_touch_source                       text,
  first_touch_campaign                     text,
  last_touch_source                        text,
  last_touch_campaign                      text,
  acquisition_touchpoints                  jsonb DEFAULT '[]'::jsonb,
  exam_attempt_number                      integer DEFAULT 1,
  previous_exam_result                     text,
  customer_archetype                       text,
  churn_risk_score                         double precision DEFAULT 0,
  churn_risk_updated_at                    timestamp with time zone,
  score_velocity_7d                        double precision DEFAULT 0,
  score_velocity_updated_at                timestamp with time zone,
  free_questions_today                     integer DEFAULT 0,
  free_questions_reset_date                date DEFAULT CURRENT_DATE,
  score_reveal_shown_at                    timestamp with time zone,
  global_current_streak                    integer DEFAULT 0,
  global_longest_streak                    integer DEFAULT 0,
  last_study_date                          date,
  is_retaker                               boolean DEFAULT false,
  onboarding_retaker_framing_shown         boolean DEFAULT false,
  assessment_started_at                    timestamp with time zone,
  proof_simulation_unlocked_at             timestamp with time zone,
  last_active_date                         date,
  readiness_sub_scores                     jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public.user_global_stats ENABLE ROW LEVEL SECURITY;

-- ── user_interactions ────────────────────────────────────────────────
-- Rows: 113 | RLS: enabled
CREATE TABLE public.user_interactions (
  interaction_id                           uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  session_id                               uuid,
  question_id                              uuid,
  topic_id                                 uuid,
  selected_option_id                       text,
  is_correct                               boolean,
  time_spent_ms                            integer DEFAULT 0,
  interaction_timestamp                    timestamp with time zone DEFAULT now(),
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  is_flagged                               boolean DEFAULT false,
  answer_changes                           integer DEFAULT 0,
  options_eliminated                       integer DEFAULT 0,
  confidence                               text,
  rationale_view_ms                        integer DEFAULT 0,
  error_type                               text,
  question_order                           integer,
  is_suspected_lucky_guess                 boolean DEFAULT false,
  source_type                              text DEFAULT 'quiz'::text
);
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- ── user_node_mastery ────────────────────────────────────────────────
-- Rows: 45 | RLS: enabled
CREATE TABLE public.user_node_mastery (
  user_id                                  uuid,
  topic_id                                 uuid,
  total_attempts                           integer DEFAULT 0,
  total_correct                            integer DEFAULT 0,
  current_mastery_weight                   double precision DEFAULT 0.0,
  avg_time_ms                              integer DEFAULT 0,
  last_encountered                         timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  teach_back_attempted                     boolean DEFAULT false,
  teach_back_gap_count                     integer DEFAULT 0,
  next_review_at                           timestamp with time zone,
  review_interval_days                     integer DEFAULT 1,
  ease_factor                              double precision DEFAULT 2.5,
  review_count                             integer DEFAULT 0,
  consecutive_correct_streak               integer DEFAULT 0,
  highest_difficulty_correct               smallint DEFAULT 0,
  has_bloom_apply_correct                  boolean DEFAULT false,
  has_bloom_analyze_correct                boolean DEFAULT false,
  distinct_questions_seen                  integer DEFAULT 0
);
ALTER TABLE public.user_node_mastery ENABLE ROW LEVEL SECURITY;

-- ── user_subscriptions ────────────────────────────────────────────────
-- Rows: 1 | RLS: enabled
CREATE TABLE public.user_subscriptions (
  subscription_id                          uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid UNIQUE,
  tier                                     USER-DEFINED DEFAULT 'free'::subscription_tier,
  status                                   USER-DEFINED DEFAULT 'active'::subscription_status,
  email_notifications_enabled              boolean DEFAULT true,
  marketing_emails_enabled                 boolean DEFAULT false,
  stripe_customer_id                       text,
  stripe_subscription_id                   text,
  payrex_customer_id                       text,
  payrex_reference                         text,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  converted_from_source                    text,
  trial_started_at                         timestamp with time zone,
  readiness_score_at_conversion            double precision,
  free_questions_today                     integer DEFAULT 0,
  free_cap_reset_date                      date,
  amount                                   numeric,
  cancelled_at                             timestamp with time zone
);
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ── wiki_article_taxonomy ────────────────────────────────────────────────
-- Rows: 464 | RLS: enabled
CREATE TABLE public.wiki_article_taxonomy (
  article_id                               uuid,
  node_id                                  uuid,
  is_primary                               boolean DEFAULT false
);
ALTER TABLE public.wiki_article_taxonomy ENABLE ROW LEVEL SECURITY;

-- ── wiki_articles ────────────────────────────────────────────────
-- Rows: 464 | RLS: enabled
CREATE TABLE public.wiki_articles (
  article_id                               uuid DEFAULT gen_random_uuid(),
  title                                    text,
  slug                                     text UNIQUE,
  content                                  text,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  status                                   text DEFAULT 'draft'::text,
  reviewed_by                              uuid,
  reviewed_at                              timestamp with time zone,
  reviewer_comments                        text,
  ale_tests_you                            text,
  updated_note                             text,
  subject_label                            text,
  difficulty_label                         text,
  read_time                                text
);
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;

-- ── feature_flags ────────────────────────────────────────────────
-- Rows: 27 | RLS: enabled
CREATE TABLE public.feature_flags (
  id                                       uuid DEFAULT gen_random_uuid(),
  key                                      text UNIQUE,
  description                              text,
  enabled                                  boolean DEFAULT false,
  target_tier                              ARRAY DEFAULT '{}'::text[],
  target_roles                             ARRAY DEFAULT '{}'::text[],
  created_by                               uuid,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- ── organizations ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.organizations (
  org_id                                   uuid DEFAULT gen_random_uuid(),
  name                                     text,
  slug                                     text UNIQUE,
  type                                     USER-DEFINED DEFAULT 'regular'::user_type,
  logo_url                                 text,
  max_seats                                integer DEFAULT 10,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ── organization_members ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.organization_members (
  id                                       uuid DEFAULT gen_random_uuid(),
  org_id                                   uuid,
  user_id                                  uuid,
  role                                     text,
  joined_at                                timestamp with time zone DEFAULT now()
);
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- ── profiles ────────────────────────────────────────────────
-- Rows: 1 | RLS: enabled
CREATE TABLE public.profiles (
  id                                       uuid,
  full_name                                text,
  display_name                             text,
  avatar_url                               text,
  user_type                                text DEFAULT 'reviewee'::text,
  discipline_id                            uuid,
  target_exam_date                         date,
  school_or_institution                    text,
  onboarding_completed_at                  timestamp with time zone,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  preferred_study_window                   text DEFAULT 'any'::text,
  reviewer_type                            text DEFAULT 'first_taker'::text,
  previous_exam_subjects_struggled         jsonb DEFAULT '[]'::jsonb,
  enrolled_review_center                   text,
  comp_exam_scores                         jsonb,
  comp_exam_date                           date,
  ale_result                               text,
  oath_taking_date                         date,
  account_mode                             text DEFAULT 'review_mode'::text,
  role                                     text DEFAULT 'member'::text,
  dae_work_contexts                        ARRAY DEFAULT '{}'::text[],
  dae_contexts_updated_at                  timestamp with time zone
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── user_mastery_history ────────────────────────────────────────────────
-- Rows: 110 | RLS: enabled
CREATE TABLE public.user_mastery_history (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  topic_id                                 uuid,
  mastery_weight                           numeric,
  total_correct                            integer DEFAULT 0,
  total_attempts                           integer DEFAULT 0,
  session_id                               uuid,
  snapshot_reason                          text DEFAULT 'session_complete'::text,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_mastery_history ENABLE ROW LEVEL SECURITY;

-- ── analytics_events ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.analytics_events (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  event_name                               text,
  event_properties                         jsonb DEFAULT '{}'::jsonb,
  page_path                                text,
  session_id                               uuid,
  created_at                               timestamp with time zone DEFAULT now(),
  referrer                                 text
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ── camp_trails ────────────────────────────────────────────────
-- Rows: 22 | RLS: enabled
CREATE TABLE public.camp_trails (
  trail_id                                 uuid DEFAULT gen_random_uuid(),
  discipline_id                            uuid,
  name                                     text,
  slug                                     text UNIQUE,
  description                              text,
  trail_type                               USER-DEFINED,
  intensity                                USER-DEFINED,
  duration_days                            integer,
  total_steps                              integer DEFAULT 0,
  is_published                             boolean DEFAULT false,
  is_featured                              boolean DEFAULT false,
  recommended_min_score                    double precision,
  recommended_max_score                    double precision,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  daily_time_estimate_minutes              integer DEFAULT 90,
  subjects_covered                         ARRAY DEFAULT '{}'::text[],
  is_free                                  boolean DEFAULT false
);
ALTER TABLE public.camp_trails ENABLE ROW LEVEL SECURITY;

-- ── trail_days ────────────────────────────────────────────────
-- Rows: 56 | RLS: enabled
CREATE TABLE public.trail_days (
  day_id                                   uuid DEFAULT gen_random_uuid(),
  trail_id                                 uuid,
  day_number                               integer,
  title                                    text,
  description                              text,
  estimated_minutes                        integer DEFAULT 60,
  created_at                               timestamp with time zone DEFAULT now(),
  subject_focus                            text,
  subject_color                            text,
  is_rest_day                              boolean DEFAULT false,
  is_phase_transition                      boolean DEFAULT false,
  phase_name                               text
);
ALTER TABLE public.trail_days ENABLE ROW LEVEL SECURITY;

-- ── trail_steps ────────────────────────────────────────────────
-- Rows: 130 | RLS: enabled
CREATE TABLE public.trail_steps (
  step_id                                  uuid DEFAULT gen_random_uuid(),
  day_id                                   uuid,
  step_order                               integer,
  step_type                                USER-DEFINED,
  title                                    text,
  description                              text,
  target_node_ids                          ARRAY DEFAULT '{}'::uuid[],
  question_count                           integer,
  difficulty_min                           double precision DEFAULT 0.0,
  difficulty_max                           double precision DEFAULT 1.0,
  article_id                               uuid,
  model_id                                 uuid,
  estimated_minutes                        integer DEFAULT 15,
  is_optional                              boolean DEFAULT false,
  preferred_time                           text,
  created_at                               timestamp with time zone DEFAULT now(),
  lab_phase                                text DEFAULT 'guided'::text,
  is_computation_heavy                     boolean DEFAULT false
);
ALTER TABLE public.trail_steps ENABLE ROW LEVEL SECURITY;

-- ── user_trail_enrollments ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.user_trail_enrollments (
  enrollment_id                            uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  trail_id                                 uuid,
  status                                   USER-DEFINED DEFAULT 'active'::trail_enrollment_status,
  current_day                              integer DEFAULT 1,
  days_completed                           integer DEFAULT 0,
  last_activity_at                         timestamp with time zone,
  started_at                               timestamp with time zone DEFAULT now(),
  paused_at                                timestamp with time zone,
  completed_at                             timestamp with time zone,
  target_completion_date                   timestamp with time zone,
  readiness_score_at_start                 double precision,
  pace_status                              text DEFAULT 'on_track'::text,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  current_streak                           integer DEFAULT 0,
  longest_streak                           integer DEFAULT 0,
  grace_days_used_this_week                integer DEFAULT 0,
  last_streak_date                         date,
  streak_grace_week_start                  date,
  milestones_shown                         jsonb DEFAULT '[]'::jsonb,
  days_completed_at_abandon                integer,
  abandoned_at                             timestamp with time zone
);
ALTER TABLE public.user_trail_enrollments ENABLE ROW LEVEL SECURITY;

-- ── user_trail_progress ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.user_trail_progress (
  progress_id                              uuid DEFAULT gen_random_uuid(),
  enrollment_id                            uuid,
  user_id                                  uuid,
  step_id                                  uuid,
  completed_at                             timestamp with time zone DEFAULT now(),
  session_id                               uuid,
  time_spent_ms                            integer
);
ALTER TABLE public.user_trail_progress ENABLE ROW LEVEL SECURITY;

-- ── trail_day_completions ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.trail_day_completions (
  day_completion_id                        uuid DEFAULT gen_random_uuid(),
  enrollment_id                            uuid,
  day_id                                   uuid,
  user_id                                  uuid,
  completed_at                             timestamp with time zone DEFAULT now(),
  readiness_score_at_completion            double precision,
  mastery_before                           jsonb,
  mastery_after                            jsonb,
  all_steps_completed                      boolean DEFAULT false,
  day_number                               integer
);
ALTER TABLE public.trail_day_completions ENABLE ROW LEVEL SECURITY;

-- ── session_trail_credits ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.session_trail_credits (
  session_id                               uuid,
  enrollment_id                            uuid,
  step_id                                  uuid,
  credited_at                              timestamp with time zone DEFAULT now()
);
ALTER TABLE public.session_trail_credits ENABLE ROW LEVEL SECURITY;

-- ── exam_outcomes ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.exam_outcomes (
  outcome_id                               uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  discipline_id                            uuid,
  exam_batch                               text,
  result                                   text,
  self_reported_score                      numeric,
  peak_readiness_score                     double precision,
  readiness_score_at_7d_before             double precision,
  avg_session_accuracy                     double precision,
  total_sessions_completed                 integer,
  total_questions_answered                 integer,
  days_active                              integer,
  signup_source                            text,
  customer_archetype                       text,
  reported_at                              timestamp with time zone DEFAULT now(),
  verified                                 boolean DEFAULT false,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.exam_outcomes ENABLE ROW LEVEL SECURITY;

-- ── blindspot_queues ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.blindspot_queues (
  queue_id                                 uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  session_id                               uuid,
  node_ids                                 ARRAY,
  question_count                           integer DEFAULT 12,
  generated_at                             timestamp with time zone DEFAULT now(),
  deferred_until                           timestamp with time zone,
  completed_at                             timestamp with time zone,
  status                                   text DEFAULT 'pending'::text,
  pre_queue_mastery                        jsonb DEFAULT '{}'::jsonb,
  post_queue_mastery                       jsonb DEFAULT '{}'::jsonb,
  nodes_improved                           integer DEFAULT 0,
  recommendation_type                      text DEFAULT 'quiz'::text
);
ALTER TABLE public.blindspot_queues ENABLE ROW LEVEL SECURITY;

-- ── user_computed_signals ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.user_computed_signals (
  user_id                                  uuid,
  score_velocity_7d                        double precision DEFAULT 0,
  score_velocity_updated_at                timestamp with time zone,
  churn_risk_score                         double precision DEFAULT 0,
  churn_risk_updated_at                    timestamp with time zone,
  days_since_last_session                  integer,
  sessions_last_7d                         integer DEFAULT 0,
  computed_at                              timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  endurance_baseline_items                 integer,
  endurance_window_items                   integer,
  endurance_target_items                   integer DEFAULT 150,
  endurance_last_updated                   timestamp with time zone,
  calibration_accuracy                     double precision,
  calibration_updated_at                   timestamp with time zone,
  calibration_score                        double precision,
  calibration_sessions_count               integer DEFAULT 0
);
ALTER TABLE public.user_computed_signals ENABLE ROW LEVEL SECURITY;

-- ── teach_back_submissions ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.teach_back_submissions (
  submission_id                            uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  topic_id                                 uuid,
  entry_point                              text,
  trail_day_id                             uuid,
  prompt_text                              text,
  student_response                         text,
  evaluation_result                        jsonb DEFAULT '{}'::jsonb,
  gaps_identified                          ARRAY DEFAULT '{}'::text[],
  revised_response                         text,
  submitted_at                             timestamp with time zone DEFAULT now(),
  revised_at                               timestamp with time zone,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.teach_back_submissions ENABLE ROW LEVEL SECURITY;

-- ── topic_teach_back_criteria ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.topic_teach_back_criteria (
  criteria_id                              uuid DEFAULT gen_random_uuid(),
  topic_id                                 uuid,
  required_concepts                        ARRAY DEFAULT '{}'::text[],
  required_exceptions                      ARRAY DEFAULT '{}'::text[],
  common_misconceptions                    ARRAY DEFAULT '{}'::text[],
  code_citations                           ARRAY DEFAULT '{}'::text[],
  authored_by                              uuid,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.topic_teach_back_criteria ENABLE ROW LEVEL SECURITY;

-- ── user_endurance_profiles ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.user_endurance_profiles (
  user_id                                  uuid,
  baseline_reliable_items                  integer,
  baseline_accuracy_decay_at               integer,
  baseline_avg_accuracy                    double precision,
  baseline_calibrated_at                   timestamp with time zone,
  current_endurance_target                 integer,
  endurance_window_minutes                 double precision,
  endurance_sessions_completed             integer DEFAULT 0,
  avg_seconds_per_question                 double precision,
  pacing_target_seconds                    double precision DEFAULT 96,
  pacing_updated_at                        timestamp with time zone,
  consecutive_plateau_weeks                integer DEFAULT 0,
  last_endurance_session_at                timestamp with time zone,
  endurance_gate_pct                       double precision DEFAULT 
CASE
    WHEN ((pacing_target_seconds > (0)::double precision) AND (baseline_reliable_items > 0)) THEN LEAST((endurance_window_minutes / ((pacing_target_seconds * (baseline_reliable_items)::double precision) / (60.0)::double precision)), (1.0)::double precision)
    ELSE (0)::double precision
END,
  computed_at                              timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_endurance_profiles ENABLE ROW LEVEL SECURITY;

-- ── user_push_tokens ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.user_push_tokens (
  token_id                                 uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  token                                    text UNIQUE,
  platform                                 text,
  is_active                                boolean DEFAULT true,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- ── notification_log ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.notification_log (
  log_id                                   uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  trigger_type                             text,
  channel                                  text,
  sent_at                                  timestamp with time zone DEFAULT now(),
  delivery_status                          text DEFAULT 'sent'::text
);
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;

-- ── wiki_article_reads ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.wiki_article_reads (
  read_id                                  uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  article_id                               uuid,
  read_at                                  timestamp with time zone DEFAULT now(),
  read_pct                                 smallint DEFAULT 0,
  time_spent_ms                            integer,
  trail_step_id                            uuid
);
ALTER TABLE public.wiki_article_reads ENABLE ROW LEVEL SECURITY;

-- ── wiki_ei_prompts ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.wiki_ei_prompts (
  prompt_id                                uuid DEFAULT gen_random_uuid(),
  article_id                               uuid,
  node_id                                  uuid,
  insert_after_heading                     text,
  prompt_text                              text,
  reveal_text                              text,
  options                                  jsonb DEFAULT '[]'::jsonb,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now(),
  sort_order                               smallint DEFAULT 0,
  is_active                                boolean DEFAULT true,
  status                                   text DEFAULT 'draft'::text,
  reviewed_by                              uuid,
  reviewed_at                              timestamp with time zone,
  reviewer_notes                           text
);
ALTER TABLE public.wiki_ei_prompts ENABLE ROW LEVEL SECURITY;

-- ── wiki_ei_responses ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.wiki_ei_responses (
  response_id                              uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  prompt_id                                uuid,
  response_text                            text,
  selected_option_index                    smallint,
  responded_at                             timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.wiki_ei_responses ENABLE ROW LEVEL SECURITY;

-- ── anon_diagnostic_sessions ────────────────────────────────────────────────
-- Rows: 0 | RLS: disabled
CREATE TABLE public.anon_diagnostic_sessions (
  anon_session_id                          uuid DEFAULT gen_random_uuid(),
  browser_session_id                       text,
  question_ids                             ARRAY DEFAULT '{}'::uuid[],
  answers                                  jsonb DEFAULT '{}'::jsonb,
  questions_answered                       integer DEFAULT 0,
  started_at                               timestamp with time zone DEFAULT now(),
  expires_at                               timestamp with time zone DEFAULT (now() + '02:00:00'::interval),
  converted_user_id                        uuid
);

-- ── campfire_testimonials ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.campfire_testimonials (
  testimonial_id                           uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  display_name                             text,
  school_name                              text,
  starting_score                           double precision,
  final_score                              double precision,
  passed                                   boolean,
  exam_batch                               text,
  quote                                    text,
  is_featured                              boolean DEFAULT false,
  is_verified                              boolean DEFAULT false,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.campfire_testimonials ENABLE ROW LEVEL SECURITY;

-- ── taxonomy_cross_references ────────────────────────────────────────────────
-- Rows: 14 | RLS: enabled
CREATE TABLE public.taxonomy_cross_references (
  id                                       uuid DEFAULT gen_random_uuid(),
  source_node_id                           uuid,
  target_node_id                           uuid,
  relationship_type                        text DEFAULT 'law_applies_to'::text,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.taxonomy_cross_references ENABLE ROW LEVEL SECURITY;

-- ── taxonomy_sources ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.taxonomy_sources (
  id                                       uuid DEFAULT gen_random_uuid(),
  node_id                                  uuid,
  label                                    text,
  url                                      text DEFAULT 'TBD'::text,
  source_type                              USER-DEFINED,
  is_verified                              boolean DEFAULT false,
  sort_order                               smallint DEFAULT 0,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.taxonomy_sources ENABLE ROW LEVEL SECURITY;

-- ── taxonomy_prerequisites ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.taxonomy_prerequisites (
  id                                       uuid DEFAULT gen_random_uuid(),
  subtopic_id                              uuid,
  prerequisite_id                          uuid,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.taxonomy_prerequisites ENABLE ROW LEVEL SECURITY;

-- ── design_problems ────────────────────────────────────────────────
-- Rows: 5 | RLS: enabled
CREATE TABLE public.design_problems (
  problem_id                               uuid DEFAULT gen_random_uuid(),
  title                                    text,
  building_type                            text,
  difficulty                               integer,
  time_limit_minutes                       integer DEFAULT 180,
  brief                                    text,
  program                                  jsonb DEFAULT '{}'::jsonb,
  site_data                                jsonb DEFAULT '{}'::jsonb,
  code_references                          ARRAY DEFAULT '{}'::text[],
  is_published                             boolean DEFAULT false,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.design_problems ENABLE ROW LEVEL SECURITY;

-- ── design_problem_sessions ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.design_problem_sessions (
  session_id                               uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  problem_id                               uuid,
  started_at                               timestamp with time zone DEFAULT now(),
  completed_at                             timestamp with time zone,
  time_elapsed_seconds                     integer,
  self_assessment_score                    integer,
  checklist_completion                     jsonb DEFAULT '{}'::jsonb
);
ALTER TABLE public.design_problem_sessions ENABLE ROW LEVEL SECURITY;

-- ── study_pods ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.study_pods (
  pod_id                                   uuid DEFAULT gen_random_uuid(),
  pod_name                                 text,
  created_by                               uuid,
  max_members                              integer DEFAULT 6,
  created_at                               timestamp with time zone DEFAULT now(),
  invite_code                              text UNIQUE DEFAULT encode(extensions.gen_random_bytes(6), 'hex'::text)
);
ALTER TABLE public.study_pods ENABLE ROW LEVEL SECURITY;

-- ── pod_members ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.pod_members (
  pod_id                                   uuid,
  user_id                                  uuid,
  joined_at                                timestamp with time zone DEFAULT now()
);
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;

-- ── oath_taking_schedules ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.oath_taking_schedules (
  schedule_id                              uuid DEFAULT gen_random_uuid(),
  oath_date                                date,
  region                                   text,
  venue                                    text,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.oath_taking_schedules ENABLE ROW LEVEL SECURITY;

-- ── code_updates ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.code_updates (
  update_id                                uuid DEFAULT gen_random_uuid(),
  ale_id                                   text,
  summary                                  text,
  previous_value                           text,
  new_value                                text,
  effective_date                           date,
  is_ale_testable                          boolean DEFAULT true,
  published_at                             timestamp with time zone DEFAULT now()
);
ALTER TABLE public.code_updates ENABLE ROW LEVEL SECURITY;

-- ── wiki_article_sources ────────────────────────────────────────────────
-- Rows: 1110 | RLS: enabled
CREATE TABLE public.wiki_article_sources (
  source_id                                uuid DEFAULT gen_random_uuid(),
  article_id                               uuid,
  label                                    text,
  url                                      text,
  source_type                              USER-DEFINED,
  description                              text,
  sort_order                               smallint DEFAULT 0,
  is_verified                              boolean DEFAULT false,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.wiki_article_sources ENABLE ROW LEVEL SECURITY;

-- ── wiki_bookmarks ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.wiki_bookmarks (
  bookmark_id                              uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  article_id                               uuid,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.wiki_bookmarks ENABLE ROW LEVEL SECURITY;

-- ── design_scenarios ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.design_scenarios (
  scenario_id                              uuid DEFAULT gen_random_uuid(),
  scenario_code                            text UNIQUE,
  title                                    text,
  building_type                            text,
  zone_code                                text,
  occupancy_category                       USER-DEFINED,
  difficulty                               smallint,
  time_limit_minutes                       smallint,
  brief                                    text,
  site_data                                jsonb,
  program                                  jsonb,
  computation_sheet                        jsonb,
  hidden_traps                             jsonb,
  code_references                          ARRAY DEFAULT '{}'::text[],
  question_count                           smallint DEFAULT 0,
  trap_count                               smallint DEFAULT 0,
  is_published                             boolean DEFAULT false,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.design_scenarios ENABLE ROW LEVEL SECURITY;

-- ── design_questions ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.design_questions (
  question_id                              uuid DEFAULT gen_random_uuid(),
  scenario_id                              uuid,
  number                                   smallint,
  type                                     USER-DEFINED,
  question_stem                            text,
  options                                  jsonb DEFAULT '[]'::jsonb,
  correct_answer_index                     smallint,
  rationale                                jsonb,
  solution_steps                           ARRAY DEFAULT '{}'::text[],
  code_citation                            text,
  wiki_ref                                 text,
  bloom_level                              text,
  is_trap_question                         boolean DEFAULT false,
  difficulty                               numeric DEFAULT 0.50,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.design_questions ENABLE ROW LEVEL SECURITY;

-- ── user_question_responses ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.user_question_responses (
  response_id                              uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  question_id                              uuid,
  session_id                               uuid,
  answered_at                              timestamp with time zone DEFAULT now(),
  is_correct                               boolean,
  selected_option                          text,
  time_taken_ms                            integer,
  confidence_level                         smallint
);
ALTER TABLE public.user_question_responses ENABLE ROW LEVEL SECURITY;

-- ── user_roles ────────────────────────────────────────────────
-- Rows: 1 | RLS: enabled
CREATE TABLE public.user_roles (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  role                                     character varying,
  created_at                               timestamp with time zone DEFAULT now(),
  created_by                               uuid
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ── ceo_financial_entries ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.ceo_financial_entries (
  id                                       uuid DEFAULT gen_random_uuid(),
  entry_date                               date,
  entry_type                               USER-DEFINED,
  category                                 text,
  amount_php                               numeric,
  description                              text,
  is_recurring                             boolean DEFAULT false,
  created_by                               uuid,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.ceo_financial_entries ENABLE ROW LEVEL SECURITY;

-- ── ceo_team_members ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.ceo_team_members (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  display_name                             text,
  role_title                               text,
  department                               USER-DEFINED,
  monthly_cost_php                         numeric,
  system_role                              USER-DEFINED DEFAULT 'member'::system_role_type,
  start_date                               date,
  end_date                                 date,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.ceo_team_members ENABLE ROW LEVEL SECURITY;

-- ── ceo_gate_status ────────────────────────────────────────────────
-- Rows: 1 | RLS: enabled
CREATE TABLE public.ceo_gate_status (
  id                                       uuid DEFAULT gen_random_uuid(),
  gate_number                              smallint,
  entered_at                               timestamp with time zone DEFAULT now(),
  exit_conditions_met                      jsonb DEFAULT '{}'::jsonb,
  notes                                    text,
  created_by                               uuid,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.ceo_gate_status ENABLE ROW LEVEL SECURITY;

-- ── ceo_cash_balance_entries ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.ceo_cash_balance_entries (
  id                                       uuid DEFAULT gen_random_uuid(),
  balance_date                             date,
  amount_php                               numeric,
  notes                                    text,
  created_by                               uuid,
  created_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.ceo_cash_balance_entries ENABLE ROW LEVEL SECURITY;

-- ── user_theta ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.user_theta (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  discipline_id                            uuid,
  theta                                    double precision DEFAULT 0.0,
  theta_se                                 double precision DEFAULT 1.0,
  responses_count                          integer DEFAULT 0,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_theta ENABLE ROW LEVEL SECURITY;

-- ── user_srs_cards ────────────────────────────────────────────────
-- Rows: 43 | RLS: enabled
CREATE TABLE public.user_srs_cards (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  node_id                                  text,
  ease_factor                              double precision DEFAULT 2.5,
  interval_days                            double precision DEFAULT 1.0,
  repetitions                              integer DEFAULT 0,
  quality_last                             integer,
  next_review_at                           timestamp with time zone DEFAULT now(),
  last_reviewed_at                         timestamp with time zone,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.user_srs_cards ENABLE ROW LEVEL SECURITY;

-- ── notifications ────────────────────────────────────────────────
-- Rows: 3 | RLS: enabled
CREATE TABLE public.notifications (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid,
  type                                     USER-DEFINED,
  title                                    text,
  body                                     text,
  metadata                                 jsonb DEFAULT '{}'::jsonb,
  read_at                                  timestamp with time zone,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── notification_preferences ────────────────────────────────────────────────
-- Rows: 0 | RLS: enabled
CREATE TABLE public.notification_preferences (
  id                                       uuid DEFAULT gen_random_uuid(),
  user_id                                  uuid UNIQUE,
  score_changes                            boolean DEFAULT true,
  trail_ready                              boolean DEFAULT true,
  blindspot                                boolean DEFAULT true,
  milestones                               boolean DEFAULT true,
  campfire                                 boolean DEFAULT true,
  content_updates                          boolean DEFAULT true,
  weekly_digest                            boolean DEFAULT true,
  coaching_tips                            boolean DEFAULT false,
  billing                                  boolean DEFAULT true,
  daily_digest                             boolean DEFAULT false,
  quiet_hours_start                        time without time zone,
  quiet_hours_end                          time without time zone,
  created_at                               timestamp with time zone DEFAULT now(),
  updated_at                               timestamp with time zone DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- End of schema