// Developer portal architecture data extracted from the route file to keep the page component focused on rendering.

/*  Data                                                               */
/* ------------------------------------------------------------------ */

export const dbClusters = [
  {
    label: 'Taxonomy & Content',
    variant: 'primary' as const,
    tables: [
      { name: 'disciplines',           desc: 'name, acronym, passing_threshold_pct',            access: 'Public read' },
      { name: 'taxonomy_tree',         desc: 'level, name, lea_id, node_type, bloom_level',     access: 'Public read' },
      { name: 'questions',             desc: 'text, options (JSONB), correct_option_id, topic_id', access: 'Public read' },
      { name: 'wiki_articles',         desc: 'title, slug, content (MDX), status',              access: 'Public read' },
      { name: 'wiki_article_taxonomy', desc: 'junction, is_primary',                            access: 'Public read' },
      { name: 'wiki_ei_prompts',       desc: 'prompt_text, reveal_text, options',               access: 'Auth read' },
      { name: 'models_3d',             desc: 'name, url, supported_phases',                     access: 'Public read' },
      { name: 'spatial_hotspots',      desc: 'position_xyz, phase',                             access: 'Public read' },
    ],
  },
  {
    label: 'Quiz Engine',
    variant: 'success' as const,
    tables: [
      { name: 'quiz_sessions',      desc: 'user_id, test_mode, status, question_ids[], config', access: 'Own-user' },
      { name: 'user_interactions',  desc: 'session_id, is_correct, time_spent_ms [Immutable]',  access: 'Own-user' },
    ],
  },
  {
    label: 'Mastery & Scoring',
    variant: 'warning' as const,
    tables: [
      { name: 'user_node_mastery',          desc: 'mastery_weight (EMA), next_review_at, ease_factor',  access: 'Own-user' },
      { name: 'user_mastery_history',       desc: 'snapshots with reason',                              access: 'Own-user' },
      { name: 'user_global_stats',          desc: 'global_readiness_score, sub_scores, streaks',        access: 'Own-user' },
      { name: 'readiness_score_snapshots',  desc: 'score, sub_scores [Append-only]',                    access: 'Own-user' },
      { name: 'blindspot_queues',           desc: 'node_ids[], status',                                 access: 'Own-user' },
    ],
  },
  {
    label: 'Trails & Progression',
    variant: 'purple' as const,
    tables: [
      { name: 'camp_trails',           desc: 'name, trail_type, intensity',                 access: 'Auth read' },
      { name: 'trail_days',            desc: 'day_number, estimated_minutes',               access: 'Auth read' },
      { name: 'trail_steps',           desc: 'step_type, target_node_ids[]',                access: 'Auth read' },
      { name: 'user_trail_enrollments', desc: 'status, current_day, streaks',              access: 'Own-user' },
    ],
  },
  {
    label: 'Identity & Billing',
    variant: 'danger' as const,
    tables: [
      { name: 'profiles',            desc: 'full_name, discipline_id, account_mode',        access: 'Own-user' },
      { name: 'user_subscriptions',  desc: 'tier, status, lemonsqueezy IDs',                      access: 'Own-user + admin' },
      { name: 'organizations',       desc: 'name, type, max_seats',                         access: 'Org members' },
      { name: 'user_roles',          desc: 'role enum',                                     access: 'Admin only' },
      { name: 'audit_logs',          desc: 'actor_id, event_type, content_snapshot',        access: 'Super admin' },
    ],
  },
]

export const dbFunctions = [
  { name: 'update_updated_at_column()',               desc: 'Auto-update timestamps' },
  { name: 'snapshot_readiness_on_session_complete()', desc: 'Auto-snapshot on quiz complete' },
  { name: 'flag_lucky_guess_on_insert()',              desc: 'Detect lucky guesses' },
  { name: 'log_mastery_history_on_update()',           desc: 'Track mastery changes' },
  { name: 'check_question_topic_not_cross_ref()',      desc: 'Prevent cross-ref questions' },
]

export const databaseStats = [
  { label: 'Tables', value: '50' },
  { label: 'RLS Policies', value: '89' },
  { label: 'Triggers', value: '31' },
  { label: 'Enums', value: '13' },
]

export const roleColumns = ['owner', 'super_admin', 'content_admin', 'sme_reviewer'] as const

type RoleColumn = (typeof roleColumns)[number]

export const roleMatrix: Array<{
  permission: string
  access: Record<RoleColumn, boolean>
}> = [
  {
    permission: 'Manage Questions',
    access: { owner: true, super_admin: true, content_admin: true, sme_reviewer: false },
  },
  {
    permission: 'Manage Wiki',
    access: { owner: true, super_admin: true, content_admin: true, sme_reviewer: false },
  },
  {
    permission: 'Review Content',
    access: { owner: true, super_admin: true, content_admin: true, sme_reviewer: true },
  },
  {
    permission: 'Manage Users',
    access: { owner: true, super_admin: true, content_admin: false, sme_reviewer: false },
  },
  {
    permission: 'View Audit Log',
    access: { owner: true, super_admin: true, content_admin: false, sme_reviewer: false },
  },
]

export const authGuards = [
  'isAdmin()',
  'isSuperAdmin()',
  'canManageContent()',
  'canReviewContent()',
  'canManageUsers()',
]

export const routeProtectionSteps = ['middleware', 'layout', 'page-level']

export const authProviderRows = [
  { k: 'Provider', v: 'Supabase Auth' },
  { k: 'OAuth', v: 'Google OAuth 2.0' },
  { k: 'Session', v: 'Cookie-based via @supabase/ssr' },
  { k: 'JWT', v: 'RS256, rotated on refresh' },
]

export const deploymentRows = [
  { k: 'Platform', v: 'Vercel (serverless)' },
  { k: 'Build', v: 'next build with Turbopack' },
  { k: 'Runtime', v: 'Node.js (default)' },
  { k: 'Region', v: 'iad1 (US East)' },
]

export const masteryLoopCode = `Student Interaction (quiz answer, wiki read, 3D Lab)
  → user_interactions (immutable event log)
  → user_node_mastery (EMA weight, updated via trigger)
  → Readiness Score + Taxonomy Heatmap
  → Progression (Blindspot, Endurance, Proof, Trail)
  → Student returns tomorrow`

export const sessionLifecycleCode = `createQuizSession
  → getSessionQuestions
  → [loop: render → saveInteraction]
  → updateQuizSession
  → snapshot readiness`

export const cronCode = `blindspot-scan   → 16:00 UTC  — queue focus-review topics per user
compute-signals  → 16:30 UTC  — aggregate mastery signals + update readiness`

export const middlewareCode = `// middleware.ts
// 1. Refresh Supabase session cookie
// 2. Inject x-pathname header for RSC layout awareness
// 3. Redirect unauthenticated users from protected routes`

export const envVars = {
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_LEMONSQUEEZY_PUBLISHABLE_KEY',
  ],
  server: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'LEMONSQUEEZY_API_KEY',
    'LEMONSQUEEZY_WEBHOOK_SECRET',
    'PAYREX_SECRET_KEY',
  ],
}

export const migrations = [
  '004_add_user_roles.sql',
  '005_add_wiki_content_status.sql',
  '006_add_3d_asset_status.sql',
  '007_add_audit_logs.sql',
  '008_notes_overhaul.sql',
  '009_quiz_session_fixes.sql',
  '010_schema_hardening.sql',
  '011_marketing_attribution_and_mastery_trigger.sql',
  '012_camp_trail_and_assessment.sql',
  '013_analytics_infrastructure.sql',
  '014_learning_science_sprint1.sql',
  '015_learning_science_sprint2.sql',
  '016_learning_science_sprint3.sql',
  '017_fix_rls_and_fk.sql',
  '018_proof_simulation_and_signals.sql',
  '019_application_layer_schema.sql',
  '020_populate_feature_flags.sql',
  '021_study_streak_and_sprint2.sql',
  '032_profiles_column_additions.sql',
  '033_design_problems_tables.sql',
  '034_study_pods.sql',
  '035_oath_taking_schedules.sql',
  '036_code_updates.sql',
  '037_questions_practice_context.sql',
  '038_readiness_anti_inflation.sql',
  '20250315000000_add_test_mode_enum_values.sql',
  '20260320_wiki_article_hero_metadata.sql',
  '20260321_wiki_bookmarks.sql',
  '20260321_wiki_dsgn013_01.sql',
  '20260321_wiki_dsgn013_02.sql',
  '20260321_wiki_dsgn013_03.sql',
  '20260324_add_attribution_columns.sql',
  '20260324_add_check_user_admin_role_rpc.sql',
  '20260324_unify_rls_admin_patterns.sql',
]
