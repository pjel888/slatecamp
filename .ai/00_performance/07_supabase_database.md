# 07 — Supabase / Database Performance Audit

Generated: 2026-05-04T00:47:01.231Z

## Scope and safety
This pass statically scanned `src/`, `scripts/`, and `supabase/` for Supabase and SQL performance signals. It did **not** run live read/write database operations and did not print or persist secrets.

## Inventory summary
- Files scanned: 2175
- Supabase signal lines: 5014
- `.from(...)` query blocks: 580
- Tables/storage-like targets touched: 87
- Auth call signals: 48
- RPC call signals: 16
- Storage call signals: 8
- Realtime channel signals: 2
- `select('*')` candidates: 10
- Unbounded read candidates (no nearby `.limit`, `.range`, `.single`, or `.maybeSingle`): 165
- Client-side Supabase query blocks: 4

## Tables/functions detected from query code
| Table/target | Query block count |
| --- | ---: |
| `admin_draft_previews` | 1 |
| `ai_audit_all_question_overview` | 1 |
| `ai_audit_article_overview` | 1 |
| `ai_audit_dashboard_summary` | 1 |
| `ai_audit_finding_overview` | 3 |
| `ai_audit_findings` | 3 |
| `ai_audit_items` | 1 |
| `ai_audit_runs` | 5 |
| `ai_audit_status_cache` | 2 |
| `ai_change_proposals` | 4 |
| `ai_review_decisions` | 3 |
| `analytics_events` | 6 |
| `audit_logs` | 5 |
| `avatars` | 1 |
| `cage_binding_tokens` | 2 |
| `cage_verifications` | 1 |
| `calibration_snapshots` | 2 |
| `camp_trails` | 5 |
| `ceo_cash_balance_entries` | 1 |
| `ceo_financial_entries` | 3 |
| `ceo_team_members` | 4 |
| `code_updates` | 2 |
| `cognitive_state_indicators` | 1 |
| `daily_doses` | 4 |
| `design_problem_sessions` | 3 |
| `design_problems` | 4 |
| `design_questions` | 2 |
| `design_scenario_questions` | 2 |
| `design_scenarios` | 4 |
| `disciplines` | 5 |
| `exam_profiles` | 1 |
| `feature_flags` | 2 |
| `focus_review_queues` | 4 |
| `interaction_signal_traces` | 1 |
| `issued_nonces` | 3 |
| `models_3d` | 4 |
| `mv_churn_risk_distribution` | 1 |
| `mv_churn_signals` | 1 |
| `mv_cohort_retention` | 1 |
| `mv_engagement_snapshot` | 2 |
| `mv_time_to_value` | 1 |
| `note_folders` | 1 |
| `notes` | 7 |
| `notification_preferences` | 2 |
| `notifications` | 4 |
| `oath_taking_schedules` | 1 |
| `organizations` | 1 |
| `pod_members` | 3 |
| `processed_webhook_events` | 2 |
| `profiles` | 26 |
| `questions` | 54 |
| `quiz_interactions` | 1 |
| `quiz_sessions` | 43 |
| `readiness_score_snapshots` | 5 |
| `session_behavioral_summaries` | 1 |
| `session_predictions` | 5 |
| `session_questions` | 1 |
| `srs_queue` | 2 |
| `study_pods` | 2 |
| `submission_state_log` | 1 |
| `successive_relearning_cycles` | 7 |
| `taxonomy_cross_references` | 3 |
| `taxonomy_tree` | 54 |
| `teach_back_submissions` | 2 |
| `topic_teach_back_criteria` | 1 |
| `trail_day_completions` | 4 |
| `trail_days` | 4 |
| `trail_steps` | 1 |
| `user_computed_signals` | 2 |
| `user_global_stats` | 50 |
| `user_interactions` | 37 |
| `user_node_mastery` | 33 |
| `user_question_states` | 1 |
| `user_roles` | 6 |
| `user_subscriptions` | 11 |
| `user_theta` | 3 |
| `user_trail_enrollments` | 7 |
| `user_trail_progress` | 2 |
| `wiki_article_feedback` | 1 |
| `wiki_article_reads` | 4 |
| `wiki_article_sources` | 3 |
| `wiki_article_taxonomy` | 22 |
| `wiki_articles` | 47 |
| `wiki_bookmarks` | 2 |
| `wiki_ei_prompts` | 4 |
| `wiki_ei_responses` | 1 |
| `wiki_highlights` | 3 |

## Over-broad select candidates
These require human review: some may intentionally target tiny static tables or be constrained by RLS.

| Location | Table | Side |
| --- | --- | --- |
| `src/lib/queries/admin-ai-audit.ts:226` | `ai_audit_dashboard_summary` | server-or-build |
| `src/lib/cage/verifyBindingToken.ts:63` | `issued_nonces` | server-or-build |
| `src/lib/design-scenarios.ts:52` | `design_scenarios` | server-or-build |
| `src/lib/design-scenarios.ts:82` | `design_scenarios` | server-or-build |
| `src/lib/actions/wiki-interactions.ts:61` | `wiki_highlights` | server-or-build |
| `scripts/test-supabase.ts:11` | `taxonomy_cross_references` | unknown |
| `scripts/db-audit-comprehensive.ts:12` | `quiz_sessions` | unknown |
| `scripts/test-db.ts:9` | `taxonomy_tree` | unknown |
| `supabase/check_db.ts:11` | `wiki_article_taxonomy` | unknown |
| `supabase/check_db2.ts:11` | `wiki_articles` | unknown |

## Missing-limit / broad-read candidates
| Location | Table | Side | Has order |
| --- | --- | --- | --- |
| `src/app/developer/tools/console/page.tsx:16` | `feature_flags` | server-or-build | no |
| `src/app/developer/page.tsx:66` | `profiles` | server-or-build | no |
| `src/app/admin/knowledge/new/page.tsx:17` | `taxonomy_tree` | server-or-build | yes |
| `src/app/admin/knowledge/questions/new/page.tsx:25` | `taxonomy_tree` | server-or-build | yes |
| `src/app/admin/preview/[previewId]/page.tsx:106` | `wiki_article_sources` | server-or-build | yes |
| `src/app/dashboard/quiz/[mode]/setup/page.tsx:173` | `taxonomy_tree` | server-or-build | yes |
| `src/app/dashboard/quiz/_components/QuizSessionRoute.tsx:58` | `user_interactions` | server-or-build | no |
| `src/app/dashboard/notes/page.tsx:18` | `notes` | server-or-build | yes |
| `src/app/api/cron/focus-review-scan/route.ts:68` | `quiz_sessions` | server-or-build | no |
| `src/app/api/cron/focus-review-scan/route.ts:136` | `user_node_mastery` | server-or-build | no |
| `src/app/api/cron/focus-review-scan/route.ts:179` | `taxonomy_tree` | server-or-build | no |
| `src/app/(auth)/onboarding/page.tsx:32` | `disciplines` | server-or-build | yes |
| `src/components/dashboard/ReviewCalendarServer.tsx:35` | `user_node_mastery` | unknown | no |
| `src/components/dashboard/BloomTrackerServer.tsx:11` | `quiz_sessions` | unknown | no |
| `src/lib/admin/editor-integrity/standard-question.ts:183` | `wiki_article_taxonomy` | server-or-build | no |
| `src/lib/admin/editor-integrity/standard-question.ts:244` | `wiki_article_taxonomy` | server-or-build | no |
| `src/lib/queries/ceo/financial-queries.ts:91` | `user_subscriptions` | server-or-build | no |
| `src/lib/queries/ceo/financial-queries.ts:168` | `user_subscriptions` | server-or-build | no |
| `src/lib/queries/ceo/financial-queries.ts:195` | `user_subscriptions` | server-or-build | no |
| `src/lib/queries/ceo/financial-queries.ts:226` | `user_subscriptions` | server-or-build | no |
| `src/lib/queries/ceo/financial-queries.ts:296` | `quiz_sessions` | server-or-build | no |
| `src/lib/queries/ceo/team-queries.ts:8` | `ceo_team_members` | server-or-build | yes |
| `src/lib/queries/ceo/user-queries.ts:46` | `user_global_stats` | server-or-build | no |
| `src/lib/queries/ceo/user-queries.ts:81` | `mv_cohort_retention` | server-or-build | yes |
| `src/lib/queries/ceo/user-queries.ts:134` | `mv_churn_risk_distribution` | server-or-build | no |
| `src/lib/queries/ceo/user-queries.ts:243` | `mv_churn_signals` | server-or-build | yes |
| `src/lib/queries/ceo/analytics/get-coverage-gap.ts:26` | `taxonomy_tree` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-learning-velocity.ts:63` | `taxonomy_tree` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-pass-rate.ts:21` | `user_global_stats` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-engagement-depth.ts:55` | `wiki_highlights` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-question-health.ts:23` | `user_interactions` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-cage-quality.ts:22` | `cage_verifications` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-cage-quality.ts:49` | `quiz_sessions` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-study-cohorts.ts:22` | `quiz_sessions` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-content-effectiveness.ts:25` | `quiz_interactions` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-adoption-funnel.ts:27` | `profiles` | server-or-build | no |
| `src/lib/queries/ceo/analytics/get-adoption-funnel.ts:52` | `quiz_sessions` | server-or-build | no |
| `src/lib/queries/trails.ts:34` | `camp_trails` | server-or-build | yes |
| `src/lib/queries/trails.ts:62` | `trail_days` | server-or-build | yes |
| `src/lib/queries/trails.ts:147` | `user_trail_progress` | server-or-build | no |
| `src/lib/queries/trails.ts:176` | `trail_day_completions` | server-or-build | yes |
| `src/lib/queries/trails.ts:248` | `trail_day_completions` | server-or-build | yes |
| `src/lib/queries/trails.ts:360` | `user_node_mastery` | server-or-build | no |
| `src/lib/quiz/to-client-question.ts:64` | `taxonomy_tree` | server-or-build | no |
| `src/lib/quiz/interleaved-selection.ts:234` | `taxonomy_tree` | server-or-build | no |
| `src/lib/design-scenarios.ts:52` | `design_scenarios` | server-or-build | yes |
| `src/lib/audit/audit-queries.ts:233` | `audit_logs` | server-or-build | no |
| `src/lib/actions/dashboard-page.ts:305` | `taxonomy_cross_references` | server-or-build | no |
| `src/lib/actions/progress-report/actions.ts:84` | `quiz_sessions` | server-or-build | yes |
| `src/lib/actions/progress-report/generate.ts:37` | `user_interactions` | server-or-build | yes |
| `src/lib/actions/progress-report/generate.ts:110` | `user_node_mastery` | server-or-build | no |
| `src/lib/actions/pods.ts:252` | `pod_members` | server-or-build | no |
| `src/lib/actions/pods.ts:343` | `pod_members` | server-or-build | no |
| `src/lib/actions/comp-exam-onboarding.ts:56` | `taxonomy_tree` | server-or-build | no |
| `src/lib/actions/comp-exam-onboarding.ts:88` | `taxonomy_tree` | server-or-build | no |
| `src/lib/actions/ei-prompts.ts:31` | `wiki_ei_prompts` | server-or-build | yes |
| `src/lib/actions/session-actions.ts:185` | `taxonomy_tree` | server-or-build | no |
| `src/lib/actions/analytics.ts:72` | `taxonomy_tree` | server-or-build | yes |
| `src/lib/actions/analytics.ts:259` | `quiz_sessions` | server-or-build | no |
| `src/lib/actions/dae-mode.ts:109` | `quiz_sessions` | server-or-build | no |
| `src/lib/actions/streak.ts:213` | `quiz_sessions` | server-or-build | no |
| `src/lib/actions/mastery/cramming-detector.ts:29` | `user_interactions` | server-or-build | no |
| `src/lib/actions/analytics-data.ts:131` | `user_interactions` | server-or-build | no |
| `src/lib/actions/analytics-data.ts:233` | `user_interactions` | server-or-build | no |
| `src/lib/actions/analytics-data.ts:331` | `user_interactions` | server-or-build | no |
| `src/lib/actions/calibration-score-update.ts:41` | `user_interactions` | server-or-build | no |
| `src/lib/actions/stats-actions.ts:194` | `user_node_mastery` | server-or-build | no |
| `src/lib/actions/design-problems.ts:51` | `design_problems` | server-or-build | yes |
| `src/lib/actions/admin/wiki-queries.ts:173` | `wiki_article_taxonomy` | server-or-build | no |
| `src/lib/actions/admin/question-queries.ts:117` | `wiki_article_taxonomy` | server-or-build | no |
| `src/lib/actions/admin/question-queries.ts:217` | `wiki_articles` | server-or-build | no |
| `src/lib/actions/admin/question-queries.ts:315` | `taxonomy_tree` | server-or-build | yes |
| `src/lib/actions/admin/design-problems.ts:44` | `design_problems` | server-or-build | yes |
| `src/lib/actions/admin/taxonomy.ts:16` | `taxonomy_tree` | server-or-build | yes |
| `src/lib/actions/admin/content.ts:128` | `questions` | server-or-build | no |
| `src/lib/actions/admin/content.ts:257` | `questions` | server-or-build | no |
| `src/lib/actions/admin/content.ts:400` | `wiki_article_taxonomy` | server-or-build | yes |
| `src/lib/actions/admin/content.ts:440` | `questions` | server-or-build | yes |
| `src/lib/actions/admin/content.ts:605` | `wiki_ei_prompts` | server-or-build | yes |
| `src/lib/actions/admin/dashboard.ts:14` | `questions` | server-or-build | no |
| `src/lib/actions/admin/dashboard.ts:98` | `taxonomy_tree` | server-or-build | no |
| `src/lib/actions/admin/dashboard.ts:130` | `questions` | server-or-build | no |
| `src/lib/actions/admin/dashboard.ts:187` | `wiki_articles` | server-or-build | no |
| `src/lib/actions/admin/dashboard.ts:227` | `taxonomy_tree` | server-or-build | yes |
| `src/lib/actions/admin/design-scenarios.ts:45` | `design_scenarios` | server-or-build | yes |
| `src/lib/actions/admin/coverage.ts:32` | `taxonomy_tree` | server-or-build | yes |
| `src/lib/actions/admin/coverage.ts:63` | `wiki_article_taxonomy` | server-or-build | no |
| `src/lib/actions/admin/roles.ts:37` | `user_roles` | server-or-build | yes |
| `src/lib/actions/notes-actions.ts:31` | `notes` | server-or-build | yes |
| `src/lib/actions/bloom-tracker.ts:43` | `user_interactions` | server-or-build | no |
| `src/lib/actions/taxonomy.ts:35` | `taxonomy_tree` | server-or-build | yes |
| `src/lib/actions/taxonomy.ts:82` | `wiki_article_taxonomy` | server-or-build | no |
| `src/lib/actions/srs-dashboard.ts:20` | `srs_queue` | server-or-build | no |
| `src/lib/actions/srs-dashboard.ts:52` | `srs_queue` | server-or-build | no |
| `src/lib/actions/srs-review.ts:23` | `user_node_mastery` | server-or-build | no |
| `src/lib/actions/wiki/get-prequestions.ts:79` | `wiki_articles` | server-or-build | no |
| `src/lib/actions/session-insights.ts:48` | `user_interactions` | server-or-build | no |
| `src/lib/actions/assessment/get-questions.ts:20` | `questions` | server-or-build | no |
| `src/lib/actions/social-proof.ts:17` | `user_interactions` | server-or-build | no |
| `src/lib/actions/ceo/admin-role-actions.ts:44` | `user_roles` | server-or-build | yes |

## Auth/session wait signals
Repeated auth/session calls can materially affect app-start-to-auth-known wait time.

| Location | Side | Code signal |
| --- | --- | --- |
| `src/app/(admin-public)/admin/login/page-client.tsx:19` | client | `const { data, error: oauthError } = await supabase.auth.signInWithOAuth({` |
| `src/app/auth/reset-password/page.tsx:41` | client | `const { error: updateError } = await supabase.auth.updateUser({ password })` |
| `src/app/auth/callback/route.ts:34` | server-or-build | `const { error } = await supabase.auth.exchangeCodeForSession(code);` |
| `src/app/auth/callback/route.ts:44` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/app/dashboard/notifications/page.tsx:11` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/app/(protected)/ceo/layout.tsx:18` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/app/api/payments/checkout/route.ts:43` | server-or-build | `} = await supabase.auth.getUser();` |
| `src/app/api/ai/embed/route.ts:16` | server-or-build | `} = await supabase.auth.getUser();` |
| `src/app/api/ai/study-agent/route.ts:31` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/app/api/ai/tutor/route.ts:11` | server-or-build | `const { data: { user } } = await supabase.auth.getUser();` |
| `src/app/api/ai/generate-questions/route.ts:30` | server-or-build | `} = await supabase.auth.getUser();` |
| `src/app/api/ai/socratic/route.ts:120` | server-or-build | `} = await supabase.auth.getUser()` |
| `src/app/(auth)/register/register-form.tsx:20` | client | `const { data, error: oauthError } = await supabase.auth.signInWithOAuth({` |
| `src/app/(auth)/forgot-password/page.tsx:28` | client | `const { error: resetError } = await supabase.auth.resetPasswordForEmail(` |
| `src/app/(auth)/login/login-form.tsx:31` | client | `const { data, error: oauthError } = await supabase.auth.signInWithOAuth({` |
| `src/components/shared/LogoutButton.tsx:21` | client | `await realSupabase.auth.signOut()` |
| `src/components/shared/LogoutButton.tsx:26` | client | `await supabase.auth.signOut()` |
| `src/lib/context/discipline-context.tsx:55` | client | `const { data: { user } } = await supabase.auth.getUser();` |
| `src/lib/analytics.ts:22` | client | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/queries/ceo/auth.ts:12` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/queries/ceo/auth.ts:40` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/supabase/middleware.ts:157` | server-or-build | `} = await supabase.auth.getUser();` |
| `src/lib/supabase/server.ts:132` | server-or-build | `return await supabase.auth.getUser()` |
| `src/lib/actions/ei-prompts.ts:87` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-bookmarks.ts:20` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-bookmarks.ts:48` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-bookmarks.ts:71` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/notifications.ts:14` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/notifications.ts:35` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/notifications.ts:57` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/notifications.ts:78` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/notifications.ts:97` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-interactions.ts:11` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-interactions.ts:38` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-interactions.ts:57` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-interactions.ts:82` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-interactions.ts:105` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/admin/wiki.ts:104` | server-or-build | `const { data: { user } } = await authClient.auth.getUser()` |
| `src/lib/actions/admin/wiki.ts:214` | server-or-build | `const { data: { user } } = await authClient.auth.getUser()` |
| `src/lib/actions/admin/wiki.ts:279` | server-or-build | `const { data: { user } } = await authClient.auth.getUser()` |
| `src/lib/actions/admin/questions.ts:148` | server-or-build | `const { data: { user } } = await authClient.auth.getUser()` |
| `src/lib/actions/admin/questions.ts:218` | server-or-build | `const { data: { user } } = await authClient.auth.getUser()` |
| `src/lib/actions/taxonomy.ts:31` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/taxonomy.ts:166` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-reads.ts:14` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/wiki-reads.ts:45` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/actions/sync-notifications.ts:22` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |
| `src/lib/api/require-admin.ts:24` | server-or-build | `const { data: { user } } = await supabase.auth.getUser()` |

## Live latency measurements
Live Supabase latency measurement is currently marked blocked in `.ai/00_performance/results/supabase_latency_results.json` because this audit avoids unaudited live credential/database access by default. Use a read-only test role or local seeded Supabase before running query timing or `EXPLAIN ANALYZE`.

## Manual EXPLAIN template
Use only for read-only query shapes and redact parameters before sharing output:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT explicit_column_list
FROM target_table
WHERE user_id = '<test-user-uuid>'
ORDER BY created_at DESC
LIMIT 50;
```

## Raw evidence
- Query inventory: `.ai/00_performance/results/supabase_query_inventory.json`
- Latency/blocker record: `.ai/00_performance/results/supabase_latency_results.json`
