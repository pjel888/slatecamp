# Data Models and Domain Entities

**Last audit:** 2026-04-29
**Source of truth:** `DATABASE_SCHEMA.sql` plus `supabase/migrations/` (92 SQL migration files).
**Coverage:** all 76 tables parsed from the current schema snapshot are individually listed below. Purposes are codebase/schema-derived descriptions, not legal or product-roadmap claims.

## Domain families

| Domain family | Table count | Tables |
| --- | --- | --- |
| Identity/access | 6 | `profiles`, `user_roles`, `user_subscriptions`, `organizations`, `organization_members`, `user_push_tokens` |
| Learning graph | 5 | `disciplines`, `taxonomy_tree`, `taxonomy_cross_references`, `taxonomy_prerequisites`, `taxonomy_sources` |
| Wiki/content | 9 | `wiki_articles`, `wiki_article_reads`, `wiki_article_sources`, `wiki_article_taxonomy`, `wiki_bookmarks`, `wiki_ei_prompts`, `wiki_ei_responses`, `wiki_highlights`, `wiki_article_feedback` |
| Quiz/mastery/readiness | 23 | `questions`, `quiz_sessions`, `user_interactions`, `user_question_responses`, `anon_diagnostic_sessions`, `user_node_mastery`, `user_mastery_history`, `user_srs_cards`, `user_theta`, `user_global_stats`, `user_endurance_profiles`, `focus_review_queues`, `teach_back_submissions`, `topic_teach_back_criteria`, `session_predictions`, `calibration_snapshots`, `successive_relearning_cycles`, `confusion_pairs`, `daily_doses`, `exam_outcomes`, `user_computed_signals`, `readiness_score_snapshots`, `user_question_states` |
| Trails | 7 | `camp_trails`, `trail_days`, `trail_steps`, `trail_day_completions`, `user_trail_enrollments`, `user_trail_progress`, `session_trail_credits` |
| 3D Lab | 2 | `models_3d`, `spatial_hotspots` |
| Design practice | 7 | `design_problems`, `design_questions`, `design_problem_sessions`, `design_scenarios`, `design_scenario_questions`, `design_scenario_interactions`, `design_scenario_sessions` |
| Operations/notifications | 13 | `analytics_events`, `notifications`, `notification_log`, `notification_preferences`, `feature_flags`, `code_updates`, `processed_webhook_events`, `oath_taking_schedules`, `study_pods`, `pod_members`, `notes`, `note_folders`, `campfire_testimonials` |
| CEO/business | 4 | `ceo_cash_balance_entries`, `ceo_financial_entries`, `ceo_gate_status`, `ceo_team_members` |

## Deferred schema cleanup note

`user_subscriptions` still contains dormant `lemonsqueezy_customer_id` and `lemonsqueezy_subscription_id` fields in the schema/types. LemonSqueezy runtime code was removed; see `.ai/db-cleanup-deferred.md` for the non-destructive cleanup plan.

## Complete schema table inventory

| Table | Domain family | Field count | Representative fields | Purpose / current use |
| --- | --- | --- | --- | --- |
| profiles | Identity/access | 25 | `id`, `full_name`, `display_name`, `avatar_url`, `user_type`, `discipline_id`, `target_exam_date`, `school_or_institution` (+10) | User profile, exam-prep preferences, discipline target, onboarding status, school/reviewer metadata. |
| disciplines | Learning graph | 10 | `discipline_id`, `name`, `acronym`, `created_at`, `updated_at`, `passing_threshold_pct`, `subject_floor_pct`, `exam_day_1_subjects` (+2) | Exam discipline catalog and discipline-level passing/subject metadata. |
| organizations | Identity/access | 8 | `org_id`, `name`, `slug`, `type`, `logo_url`, `max_seats`, `created_at`, `updated_at` | Institution/team records for organization-based access and seat limits. |
| organization_members | Identity/access | 5 | `id`, `org_id`, `user_id`, `role`, `joined_at` | Join table assigning users to organizations with an organization role. |
| user_roles | Identity/access | 5 | `id`, `user_id`, `role`, `created_at`, `created_by` | Canonical app role assignments and role audit creator for admin/developer/CEO access. |
| user_subscriptions | Identity/access | 19 | `subscription_id`, `user_id`, `tier`, `status`, `email_notifications_enabled`, `marketing_emails_enabled`, `lemonsqueezy_customer_id`, `lemonsqueezy_subscription_id` (+10) | Entitlement/subscription state, notification preferences, and payment-provider identifiers. |
| user_push_tokens | Identity/access | 7 | `token_id`, `user_id`, `token`, `platform`, `is_active`, `created_at`, `updated_at` | Registered push-notification tokens by user/platform and active status. |
| oath_taking_schedules | Operations/notifications | 5 | `schedule_id`, `oath_date`, `region`, `venue`, `created_at` | Oath-taking schedule reference data by date, region, and venue. |
| study_pods | Operations/notifications | 6 | `pod_id`, `pod_name`, `created_by`, `max_members`, `created_at`, `invite_code` | Study pod groups with creator, capacity, and invite code. |
| pod_members | Operations/notifications | 3 | `pod_id`, `user_id`, `joined_at` | Study pod membership join table. |
| questions | Quiz/mastery/readiness | 27 | `question_id`, `topic_id`, `text`, `options`, `correct_option_id`, `rationale`, `difficulty`, `difficulty_rating` (+10) | Question bank items with options, correct answer, rationale, difficulty, and source metadata. |
| taxonomy_tree | Learning graph | 27 | `node_id`, `discipline_id`, `parent_id`, `level`, `name`, `subject_area`, `slug`, `is_leaf` (+10) | Learning taxonomy nodes, hierarchy, subject areas, slugs, and node metadata. |
| taxonomy_cross_references | Learning graph | 5 | `id`, `source_node_id`, `target_node_id`, `relationship_type`, `created_at` | Non-hierarchical taxonomy relationships between source and target nodes. |
| taxonomy_prerequisites | Learning graph | 4 | `id`, `subtopic_id`, `prerequisite_id`, `created_at` | Prerequisite relationships between subtopics. |
| taxonomy_sources | Learning graph | 9 | `id`, `node_id`, `label`, `url`, `source_type`, `is_verified`, `sort_order`, `created_at` (+1) | Reference/source citations attached to taxonomy nodes. |
| wiki_articles | Wiki/content | 15 | `article_id`, `title`, `slug`, `content`, `created_at`, `updated_at`, `status`, `reviewed_by` (+7) | Wiki article content, publication/review status, and reviewer metadata. |
| wiki_article_reads | Wiki/content | 7 | `read_id`, `user_id`, `article_id`, `read_at`, `read_pct`, `time_spent_ms`, `trail_step_id` | Per-user wiki reading progress and time-spent tracking. |
| wiki_article_sources | Wiki/content | 10 | `source_id`, `article_id`, `label`, `url`, `source_type`, `description`, `sort_order`, `is_verified` (+2) | Article-level citations and source metadata. |
| wiki_article_taxonomy | Wiki/content | 4 | `article_id`, `node_id`, `is_primary`, `sort_order` | Join table mapping wiki articles to taxonomy nodes with primary/sort flags. |
| wiki_bookmarks | Wiki/content | 4 | `bookmark_id`, `user_id`, `article_id`, `created_at` | User bookmarks for wiki articles. |
| wiki_ei_prompts | Wiki/content | 15 | `prompt_id`, `article_id`, `node_id`, `insert_after_heading`, `prompt_text`, `reveal_text`, `options`, `created_at` (+7) | Embedded interactive prompts attached to wiki articles or taxonomy nodes. |
| wiki_ei_responses | Wiki/content | 7 | `response_id`, `user_id`, `prompt_id`, `response_text`, `selected_option_index`, `responded_at`, `updated_at` | User responses to embedded interactive wiki prompts. |
| wiki_highlights | Wiki/content | 7 | `id`, `user_id`, `article_id`, `highlight_text`, `color`, `created_at`, `updated_at` | User-highlighted wiki article text and color metadata. |
| wiki_article_feedback | Wiki/content | 6 | `id`, `article_id`, `user_id`, `is_helpful`, `created_at`, `updated_at` | Helpfulness feedback for wiki articles. |
| quiz_sessions | Quiz/mastery/readiness | 18 | `session_id`, `user_id`, `discipline_id`, `test_mode`, `status`, `config`, `question_ids`, `subject_ids` (+10) | Quiz/session runtime state, config, question ordering, status, and timing. |
| user_interactions | Quiz/mastery/readiness | 22 | `interaction_id`, `user_id`, `session_id`, `question_id`, `topic_id`, `selected_option_id`, `is_correct`, `time_spent_ms` (+10) | Detailed per-question interaction telemetry during quiz sessions. |
| user_question_responses | Quiz/mastery/readiness | 9 | `response_id`, `user_id`, `question_id`, `session_id`, `answered_at`, `is_correct`, `selected_option`, `time_taken_ms` (+1) | Normalized user answer records with correctness, time, and confidence. |
| anon_diagnostic_sessions | Quiz/mastery/readiness | 8 | `anon_session_id`, `browser_session_id`, `question_ids`, `answers`, `questions_answered`, `started_at`, `expires_at`, `converted_user_id` | Anonymous diagnostic quiz state prior to conversion into a user account. |
| user_node_mastery | Quiz/mastery/readiness | 26 | `user_id`, `topic_id`, `total_attempts`, `total_correct`, `current_mastery_weight`, `avg_time_ms`, `last_encountered`, `updated_at` (+10) | Per-user mastery metrics by taxonomy node/topic, including attempts and teach-back signals. |
| user_mastery_history | Quiz/mastery/readiness | 9 | `id`, `user_id`, `topic_id`, `mastery_weight`, `total_correct`, `total_attempts`, `session_id`, `snapshot_reason` (+1) | Historical mastery snapshots and reasons for mastery changes. |
| user_srs_cards | Quiz/mastery/readiness | 11 | `id`, `user_id`, `node_id`, `ease_factor`, `interval_days`, `repetitions`, `quality_last`, `next_review_at` (+3) | SM-2/SRS scheduling state for user-node review cards. |
| user_theta | Quiz/mastery/readiness | 8 | `id`, `user_id`, `discipline_id`, `theta`, `theta_se`, `responses_count`, `created_at`, `updated_at` | IRT theta estimate and uncertainty per user/discipline. |
| user_global_stats | Quiz/mastery/readiness | 42 | `user_id`, `current_discipline_id`, `global_readiness_score`, `target_exam_date`, `final_stretch_upsell_shown`, `updated_at`, `signup_source`, `utm_campaign` (+10) | Aggregate readiness, usage, acquisition, streak, and subscription-facing user metrics. |
| user_endurance_profiles | Quiz/mastery/readiness | 16 | `user_id`, `baseline_reliable_items`, `baseline_accuracy_decay_at`, `baseline_avg_accuracy`, `baseline_calibrated_at`, `current_endurance_target`, `endurance_window_minutes`, `endurance_sessions_completed` (+8) | Endurance/pacing baseline and current target state for long quiz/exam practice. |
| focus_review_queues | Quiz/mastery/readiness | 13 | `queue_id`, `user_id`, `session_id`, `node_ids`, `question_count`, `generated_at`, `deferred_until`, `completed_at` (+5) | Generated focus-review queue records and before/after mastery context. |
| teach_back_submissions | Quiz/mastery/readiness | 14 | `submission_id`, `user_id`, `topic_id`, `entry_point`, `trail_day_id`, `prompt_text`, `student_response`, `evaluation_result` (+6) | Teach-back prompt submissions, evaluation result, gaps, and revision state. |
| topic_teach_back_criteria | Quiz/mastery/readiness | 9 | `criteria_id`, `topic_id`, `required_concepts`, `required_exceptions`, `common_misconceptions`, `code_citations`, `authored_by`, `created_at` (+1) | Topic-specific criteria used to evaluate teach-back responses. |
| session_predictions | Quiz/mastery/readiness | 9 | `id`, `user_id`, `session_id`, `prediction_score`, `postdiction_score`, `actual_score`, `prediction_at`, `postdiction_at` (+1) | Prediction/postdiction calibration scores for quiz sessions. |
| calibration_snapshots | Quiz/mastery/readiness | 12 | `id`, `user_id`, `calibration_score`, `brier_score`, `sample_size`, `confident_accuracy`, `guessing_accuracy`, `overconfidence_index` (+4) | Confidence-calibration/Brier snapshots over a time window. |
| successive_relearning_cycles | Quiz/mastery/readiness | 11 | `id`, `user_id`, `topic_id`, `status`, `consecutive_correct`, `current_spacing_interval`, `spacing_level`, `next_retest_at` (+3) | Successive relearning state and spaced retest scheduling per topic. |
| confusion_pairs | Quiz/mastery/readiness | 7 | `id`, `topic_a`, `topic_b`, `co_failure_rate`, `sample_size`, `disambiguation_article_id`, `detected_at` | Detected topic-pair confusion/co-failure relationships. |
| daily_doses | Quiz/mastery/readiness | 9 | `id`, `user_id`, `dose_date`, `activities`, `estimated_minutes`, `rationale`, `started_at`, `completed_at` (+1) | Daily activity recommendation/dose plans, rationale, and completion timing. |
| exam_outcomes | Quiz/mastery/readiness | 17 | `outcome_id`, `user_id`, `discipline_id`, `exam_batch`, `result`, `self_reported_score`, `peak_readiness_score`, `readiness_score_at_7d_before` (+9) | Self-reported exam outcomes and readiness/session metrics near exam time. |
| analytics_events | Operations/notifications | 8 | `id`, `user_id`, `event_name`, `event_properties`, `page_path`, `session_id`, `created_at`, `referrer` | Application analytics events with user, path, session, and properties. |
| user_computed_signals | Quiz/mastery/readiness | 17 | `user_id`, `score_velocity_7d`, `score_velocity_updated_at`, `churn_risk_score`, `churn_risk_updated_at`, `days_since_last_session`, `sessions_last_7d`, `computed_at` (+9) | Derived risk, velocity, endurance, and lifecycle metrics for a user. |
| readiness_score_snapshots | Quiz/mastery/readiness | 8 | `snapshot_id`, `user_id`, `score`, `sub_scores`, `computed_at`, `session_id`, `is_full_exam`, `analysis_available_at` | Readiness score snapshots with sub-scores and related session context. |
| models_3d | 3D Lab | 16 | `model_id`, `name`, `slug`, `url`, `thumbnail`, `created_at`, `updated_at`, `status` (+8) | 3D model asset catalog, review status, metadata, and URLs. |
| spatial_hotspots | 3D Lab | 16 | `hotspot_id`, `model_id`, `node_id`, `title`, `description`, `position_x`, `position_y`, `position_z` (+8) | 3D model hotspot positions and linked taxonomy/content metadata. |
| camp_trails | Trails | 18 | `trail_id`, `discipline_id`, `name`, `slug`, `description`, `trail_type`, `intensity`, `duration_days` (+10) | Camp/trail learning programs with discipline, type, intensity, duration, and publish state. |
| trail_days | Trails | 12 | `day_id`, `trail_id`, `day_number`, `title`, `description`, `estimated_minutes`, `created_at`, `subject_focus` (+4) | Day-level trail curriculum units and subject focus metadata. |
| trail_steps | Trails | 18 | `step_id`, `day_id`, `step_order`, `step_type`, `title`, `description`, `target_node_ids`, `question_count` (+10) | Ordered activities within trail days, including step type and targets. |
| trail_day_completions | Trails | 10 | `day_completion_id`, `enrollment_id`, `day_id`, `user_id`, `completed_at`, `readiness_score_at_completion`, `mastery_before`, `mastery_after` (+2) | Completion records for a trail day and readiness/mastery deltas. |
| user_trail_enrollments | Trails | 23 | `enrollment_id`, `user_id`, `trail_id`, `status`, `current_day`, `days_completed`, `last_activity_at`, `started_at` (+10) | Per-user trail enrollment state, current day, status, and progress counters. |
| user_trail_progress | Trails | 7 | `progress_id`, `enrollment_id`, `user_id`, `step_id`, `completed_at`, `session_id`, `time_spent_ms` | Step-level trail progress and credited quiz session/time. |
| session_trail_credits | Trails | 4 | `session_id`, `enrollment_id`, `step_id`, `credited_at` | Join table crediting quiz sessions to trail enrollment steps. |
| notifications | Operations/notifications | 9 | `id`, `user_id`, `type`, `title`, `body`, `metadata`, `read_at`, `created_at` (+1) | User notification records, metadata, read state, and timestamps. |
| notification_log | Operations/notifications | 6 | `log_id`, `user_id`, `trigger_type`, `channel`, `sent_at`, `delivery_status` | Notification delivery attempts by trigger, channel, and delivery status. |
| notification_preferences | Operations/notifications | 16 | `id`, `user_id`, `score_changes`, `trail_ready`, `focus_review`, `milestones`, `campfire`, `content_updates` (+8) | Per-user notification preference switches across product trigger types. |
| design_problems | Design practice | 11 | `problem_id`, `title`, `building_type`, `difficulty`, `time_limit_minutes`, `brief`, `program`, `site_data` (+3) | Area C design problem briefs, program/site/code references, and publish status. |
| design_questions | Design practice | 16 | `question_id`, `scenario_id`, `number`, `type`, `question_stem`, `options`, `correct_answer_index`, `rationale` (+8) | Questions attached to design problem scenarios with options/rationale/code citations. |
| design_problem_sessions | Design practice | 7 | `session_id`, `user_id`, `problem_id`, `started_at`, `completed_at`, `time_elapsed_seconds`, `self_assessment_score` | User sessions for design problems and self-assessment score/timing. |
| design_scenarios | Design practice | 13 | `scenario_id`, `title`, `building_type`, `difficulty`, `trap_count`, `time_limit_minutes`, `brief`, `site_data` (+5) | Design scenario briefs including traps, program, site data, and code references. |
| design_scenario_questions | Design practice | 13 | `question_id`, `scenario_id`, `question_number`, `question_type`, `question_stem`, `options`, `correct_answer_index`, `rationale` (+5) | Questions for design scenarios including trap/difficulty metadata. |
| design_scenario_interactions | Design practice | 11 | `interaction_id`, `user_id`, `session_id`, `question_id`, `scenario_id`, `selected_answer_index`, `is_correct`, `time_spent_ms` (+3) | Per-question user interactions for design scenarios and trap fall-through tracking. |
| design_scenario_sessions | Design practice | 10 | `session_id`, `user_id`, `scenario_id`, `started_at`, `completed_at`, `answers`, `score`, `total_questions` (+2) | User design-scenario session answers, score, traps, and elapsed time. |
| ceo_cash_balance_entries | CEO/business | 6 | `id`, `balance_date`, `amount_php`, `notes`, `created_by`, `created_at` | CEO cash balance records for business cockpit financial tracking. |
| ceo_financial_entries | CEO/business | 10 | `id`, `entry_date`, `entry_type`, `category`, `amount_php`, `description`, `is_recurring`, `created_by` (+2) | CEO revenue/expense entries, recurrence flag, and category tracking. |
| ceo_gate_status | CEO/business | 7 | `id`, `gate_number`, `entered_at`, `exit_conditions_met`, `notes`, `created_by`, `created_at` | CEO gate progression/status records and exit-condition notes. |
| ceo_team_members | CEO/business | 11 | `id`, `user_id`, `display_name`, `role_title`, `department`, `monthly_cost_php`, `system_role`, `start_date` (+3) | CEO/team cost roster and system-role metadata for operating model tracking. |
| feature_flags | Operations/notifications | 9 | `id`, `key`, `description`, `enabled`, `target_tier`, `target_roles`, `created_by`, `created_at` (+1) | Database-backed feature flags, target tiers, and target roles. |
| code_updates | Operations/notifications | 8 | `update_id`, `lea_id`, `summary`, `previous_value`, `new_value`, `effective_date`, `is_lea_testable`, `published_at` | LEA/code update reference records with effective/testable status. |
| notes | Operations/notifications | 16 | `note_id`, `user_id`, `folder_id`, `topic_id`, `title`, `content`, `source_url`, `created_at` (+8) | User notes linked to folders/topics/source URLs with pin/archive status. |
| note_folders | Operations/notifications | 5 | `folder_id`, `user_id`, `name`, `created_at`, `updated_at` | User note folder names and timestamps. |
| campfire_testimonials | Operations/notifications | 12 | `testimonial_id`, `user_id`, `display_name`, `school_name`, `starting_score`, `final_score`, `passed`, `exam_batch` (+4) | Campfire/testimonial records with scores, pass status, quote, and featured flag. |
| processed_webhook_events | Operations/notifications | 5 | `id`, `provider`, `event_id`, `event_type`, `processed_at` | Webhook idempotency ledger by provider/event/type. |
| user_question_states | Quiz/mastery/readiness | 7 | `user_id`, `question_id`, `last_seen_at`, `last_is_correct`, `total_attempts`, `total_time_ms`, `avg_time_ms` | Per-user/per-question rollup of last seen/correct and aggregate attempts/time. |

## Relationship notes

- User/account surfaces center on `profiles.id` and Supabase auth user IDs; role and entitlement checks use `user_roles`, profile role fields, metadata fallbacks, and subscription records.
- Learning content connects `disciplines` -> `taxonomy_tree` -> `questions`, `wiki_articles`, `models_3d`/`spatial_hotspots`, and trail/design-practice surfaces.
- Quiz and mastery records connect session-level state (`quiz_sessions`) to per-question responses (`user_interactions`, `user_question_responses`) and derived mastery/readiness signals (`user_node_mastery`, `user_theta`, `readiness_score_snapshots`, `user_global_stats`).
- Trails connect `camp_trails`, `trail_days`, and `trail_steps` to per-user enrollment/progress/completion records.
- Area C design practice uses separate design problem/scenario/session/interaction tables rather than the main quiz session tables.
- Payment/webhook idempotency touches `user_subscriptions` and `processed_webhook_events`; provider-specific secrets are documented only as environment variable names.

## Validation/business-rule pointers

- Database schema: `DATABASE_SCHEMA.sql` and `supabase/migrations/`.
- Supabase query/action implementation: `src/lib/actions/`, `src/lib/queries/`, `src/lib/supabase/`.
- Entitlement and role logic: `src/lib/entitlements/`, `src/lib/admin/`, `src/lib/developer/access.ts`, `src/lib/ceo/access.ts`.
- Quiz/mastery logic: `src/lib/quiz/`, `src/lib/srs/`, `src/lib/focus-review/`, `src/lib/actions/quiz*.ts`, `src/lib/actions/quiz-v2/`.
- Content/admin workflows: `src/lib/actions/admin/`, `src/components/admin/`, `src/components/wiki/`.

## Not verified from current codebase

- Exact production RLS behavior beyond schema/migration text was not live-tested against a Supabase instance during this documentation audit.
- Live external payment, email, AI, and push integrations were not exercised because credentials and remote services were intentionally not used.
