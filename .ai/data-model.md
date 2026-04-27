# Data Model

**Last Updated:** 2026-04-27

## Overview

SlateCamp uses **Supabase (PostgreSQL 17)** as its primary data store. The schema includes 86 tables, 2 views, 39 functions, and extensive Row Level Security (RLS) policies.

### Authoritative Sources
- `DATABASE_SCHEMA.sql` — strongest snapshot (1,368 lines)
- `supabase/migrations/` — 92 migration files showing chronology
- **Caveat:** `DATABASE_SCHEMA.sql` may lag behind the latest RLS/authz migrations (notably April 2026 fixes). Verify recent migrations for the most current access-control state.

## Core Entities

### Users & Auth

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `profiles` | Extends `auth.users` with app-specific data | `id` (FK to `auth.users`), `full_name`, `display_name`, `user_type`, `discipline_id`, `target_exam_date`, `role`, `account_mode`, `onboarding_completed_at` |
| `user_roles` | Multi-role resolution | `user_id`, `role`, `assigned_by`, `assigned_at` |
| `user_subscriptions` | Subscription state | `user_id`, `tier` (free/pro/enterprise), `status`, `lemonsqueezy_customer_id`, `payrex_customer_id`, `trial_started_at`, `free_questions_today` |
| `organizations` | Group/institution accounts | `id`, `name`, `slug`, `owner_id` |
| `organization_members` | Org membership | `org_id`, `user_id`, `role` |
| `study_pods` | Study groups | `id`, `name`, `slug`, `created_by` |
| `pod_members` | Pod membership | `pod_id`, `user_id`, `role` |

### Content

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `questions` | Quiz questions | `topic_id`, `text`, `options` (JSONB), `correct_option_id`, `rationale`, `difficulty`, `irt_difficulty`, `bloom_level`, `question_type`, `code_citation` |
| `taxonomy_tree` | 6-level subject hierarchy | `node_id`, `parent_id`, `level`, `subject_area`, `slug`, `is_leaf`, `exam_frequency`, `bloom_level`, `area_weight_pct` |
| `taxonomy_cross_references` | Node relationships | `source_node_id`, `target_node_id`, `relationship_type` |
| `taxonomy_prerequisites` | Learning prerequisites | `node_id`, `prerequisite_node_id` |
| `taxonomy_sources` | Node reference sources | `node_id`, `source_type`, `source_url`, `source_citation` |
| `wiki_articles` | Knowledge base articles | `title`, `slug`, `content`, `status` (draft/published), `lea_tests_you`, `subject_label` |
| `wiki_article_taxonomy` | Article-to-node junction | `article_id`, `node_id` |
| `wiki_article_sources` | Article reference sources | `article_id`, `source_type`, `source_url`, `source_citation` |
| `wiki_bookmarks` | User bookmarks | `user_id`, `article_id` |
| `wiki_highlights` | User text highlights | `user_id`, `article_id`, `range_start`, `range_end`, `color` |
| `wiki_article_feedback` | Article ratings/comments | `user_id`, `article_id`, `rating`, `comment` |
| `wiki_ei_prompts` | Extended inquiry prompts | `article_id`, `prompt_text`, `prompt_type` |
| `wiki_ei_responses` | User inquiry responses | `user_id`, `prompt_id`, `response_text` |

### Quiz Engine

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `quiz_sessions` | Active/completed quiz sessions | `user_id`, `test_mode`, `status`, `config` (JSONB), `question_ids[]`, `started_at`, `completed_at` |
| `user_interactions` | Interaction events | `user_id`, `session_id`, `question_id`, `action_type`, `timestamp` |
| `user_question_responses` | Individual answers | `user_id`, `session_id`, `question_id`, `selected_option_id`, `is_correct`, `time_spent_ms`, `confidence`, `error_type` |
| `anon_diagnostic_sessions` | Unauthenticated diagnostics | `session_token`, `question_ids[]`, `responses` (JSONB) |

### Mastery & Learning

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `user_node_mastery` | Per-topic mastery state | `user_id`, `node_id`, `current_mastery_weight`, `ease_factor`, `next_review_at`, `consecutive_correct_streak`, `predicted_recall`, `storage_strength`, `retrieval_strength` |
| `user_mastery_history` | Mastery change history | `user_id`, `node_id`, `old_weight`, `new_weight`, `trigger_event` |
| `user_srs_cards` | Spaced repetition cards | `user_id`, `node_id`, `interval_days`, `ease_factor`, `due_at`, `reps`, `lapses` |
| `user_theta` | IRT ability estimates | `user_id`, `theta_estimate`, `uncertainty`, `updated_at` |
| `user_global_stats` | Aggregated user stats | `user_id`, `total_questions_answered`, `total_correct`, `current_streak`, `longest_streak` |
| `user_endurance_profiles` | Endurance test data | `user_id`, `session_count`, `average_accuracy`, `fatigue_curve` |
| `focus_review_queues` | Daily weak-node queues | `user_id`, `node_id`, `priority`, `expires_at` |
| `teach_back_submissions` | Student explanation evaluations | `user_id`, `node_id`, `submission_text`, `evaluation_score`, `feedback` |
| `topic_teach_back_criteria` | Evaluation rubrics | `node_id`, `criterion_text`, `weight` |

### Metacognitive

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `session_predictions` | Pre-session confidence | `user_id`, `session_id`, `predicted_score`, `predicted_time` |
| `calibration_snapshots` | Calibration tracking | `user_id`, `prediction_accuracy`, `overconfidence_score` |
| `successive_relearning_cycles` | Relearning schedule | `user_id`, `node_id`, `cycle_number`, `scheduled_at` |
| `confusion_pairs` | Common misconception pairs | `node_a_id`, `node_b_id`, `frequency` |
| `daily_doses` | Daily recommended content | `user_id`, `date`, `dose_items` (JSONB) |
| `exam_outcomes` | User exam results | `user_id`, `exam_date`, `score`, `passed`, `section_scores` (JSONB) |

### Analytics & Signals

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `analytics_events` | Structured event log | `user_id`, `event_family`, `event_name`, `payload` (JSONB), `severity`, `trace_id` |
| `user_computed_signals` | Derived engagement metrics | `user_id`, `score_velocity_7d`, `churn_risk_score`, `days_since_last_session`, `sessions_last_7d` |
| `readiness_score_snapshots` | Readiness score history | `user_id`, `global_readiness_score`, `sub_scores` (JSONB), `computed_at` |

### 3D Lab

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `models_3d` | 3D model registry | `name`, `slug`, `url`, `thumbnail`, `metadata` (JSONB), `status`, `supported_phases`, `has_challenge_mode` |
| `spatial_hotspots` | In-3D annotation points | `model_id`, `position_x`, `position_y`, `position_z`, `phase`, `label`, `content`, `question_id` |

### Trails

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `camp_trails` | Study path definitions | `trail_type`, `intensity`, `duration_days`, `title`, `description` |
| `trail_days` | Daily trail content | `trail_id`, `day_number`, `title`, `focus_areas` |
| `trail_steps` | Individual steps | `day_id`, `step_order`, `step_type` (quiz/wiki/lab/review), `content_id` |
| `user_trail_enrollments` | User enrollments | `user_id`, `trail_id`, `status` (active/paused/completed/abandoned), `current_streak` |
| `user_trail_progress` | Step completion tracking | `user_id`, `trail_id`, `day_id`, `step_id`, `completed_at` |
| `session_trail_credits` | Trail credit grants | `user_id`, `trail_id`, `credits_granted`, `reason` |

### Notifications

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `notifications` | User notifications | `user_id`, `type`, `title`, `body`, `data` (JSONB), `read_at`, `action_url` |
| `notification_log` | Delivery log | `notification_id`, `channel`, `status`, `error_message` |
| `notification_preferences` | User preferences | `user_id`, `channel`, `enabled`, `quiet_hours_start`, `quiet_hours_end` |

### Design Problems

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `design_problems` | Architectural design prompts | `building_type`, `brief`, `program` (JSONB), `site_data` (JSONB), `hidden_traps`, `trap_count` |
| `design_questions` | Questions within a design problem | `problem_id`, `text`, `rationale`, `point_value` |
| `design_problem_sessions` | User design problem attempts | `user_id`, `problem_id`, `status`, `responses` (JSONB), `score` |
| `design_scenarios` | Scenario-based problems | `title`, `context`, `difficulty` |
| `design_scenario_questions` | Questions within scenarios | `scenario_id`, `text`, `options`, `correct_option_id` |
| `design_scenario_interactions` | User scenario interactions | `user_id`, `scenario_id`, `action_type`, `payload` |
| `design_scenario_sessions` | Scenario attempt sessions | `user_id`, `scenario_id`, `status`, `score`, `time_spent_ms` |

### CEO Dashboard

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `ceo_cash_balance_entries` | Cash tracking | `date`, `amount`, `currency`, `source` |
| `ceo_financial_entries` | Revenue/expense log | `date`, `type`, `amount`, `description`, `category` |
| `ceo_gate_status` | Milestone gates | `gate_name`, `status`, `target_date`, `completed_at` |
| `ceo_team_members` | Team org design | `name`, `role`, `department`, `start_date`, `status` |

### Other

| Table | Purpose |
|-------|---------|
| `feature_flags` | Runtime feature toggles |
| `code_updates` | Code change log |
| `notes` | User notes (content JSONB, linked to topics/questions/articles) |
| `note_folders` | Note organization |
| `campfire_testimonials` | User testimonials |
| `processed_webhook_events` | Idempotency guard for webhooks |
| `user_question_states` | Bookmarked or flagged questions |
| `oath_taking_schedules` | PRC oath-taking dates |
| `user_push_tokens` | Mobile push notification tokens |

## Views

| View | Purpose |
|------|---------|
| `v_current_gate` | Latest CEO gate status |
| `user_capabilities` | Joins `profiles` + `auth.users` + `user_subscriptions` + `user_roles` for entitlement resolution |

## Key Functions

| Function | Purpose |
|----------|---------|
| `get_article_with_node(slug)` | Single-roundtrip resolver for wiki article + taxonomy node |
| `has_admin_role()` | RBAC helper for admin checks |
| `is_super_admin()` | RBAC helper for super-admin checks |
| `update_updated_at_column()` | Generic `updated_at` trigger |
| `audit_trigger_function()` | Generic audit logging trigger |
| `match_wiki_articles(query_embedding, match_threshold, match_count)` | Vector similarity search for RAG |

## Custom Types (Enums)

| Type | Values |
|------|--------|
| `session_status` | `in_progress`, `completed`, `abandoned` |
| `subscription_status` | `active`, `cancelled`, `expired`, `trialing` |
| `subscription_tier` | `free`, `pro`, `enterprise` |
| `test_mode` | `camp`, `timed`, `subject`, `storm`, `chill`, `custom`, `focus_review`, `full_exam`, `endurance`, `article_review` |
| `trail_type` | Various trail classifications |
| `trail_intensity` | Intensity levels |
| `trail_step_type` | `quiz`, `wiki`, `lab`, `review` |
| `trail_enrollment_status` | `active`, `paused`, `completed`, `abandoned` |
| `financial_entry_type` | Revenue/expense categories |
| `team_department` | Org departments |
| `system_role_type` | Role classifications |

## Relationships

```
auth.users ←→ profiles (1:1)
profiles ←→ user_roles (1:N)
profiles ←→ user_subscriptions (1:1)
profiles ←→ user_node_mastery (1:N via taxonomy_tree)
profiles ←→ quiz_sessions (1:N)
quiz_sessions ←→ user_question_responses (1:N)
questions ←→ taxonomy_tree (N:1 via topic_id)
wiki_articles ←→ taxonomy_tree (N:N via wiki_article_taxonomy)
models_3d ←→ spatial_hotspots (1:N)
camp_trails ←→ trail_days (1:N)
trail_days ←→ trail_steps (1:N)
profiles ←→ user_trail_enrollments (1:N)
```

## Evidence

- Schema: `DATABASE_SCHEMA.sql`
- Migrations: `supabase/migrations/`
- Seed files: `supabase/01_RESET_AND_SEED.sql`, `supabase/02_RUN_ALL_SEEDS.sql`, `supabase/03_QUIZ SEED.sql`
