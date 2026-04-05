import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/shared/CodeBlock'

export const metadata = {
  title: 'Architecture — SlateCamp Developer Portal',
  description:
    'System architecture, database schema, authentication, data flow, and deployment for SlateCamp.',
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const techStack = [
  { component: 'Framework',  pkg: 'next',                            version: '16.1.6',             notes: 'App Router, Server Components' },
  { component: 'Runtime',    pkg: 'react / react-dom',               version: '19.2.4',             notes: '' },
  { component: 'Language',   pkg: 'typescript',                      version: '5.9.3',              notes: 'strict: false' },
  { component: 'Styling',    pkg: 'tailwindcss',                     version: '4.2.2',              notes: 'CSS-first config' },
  { component: 'UI',         pkg: '@base-ui/react + shadcn',         version: '1.3.0 / 4.1.0',     notes: 'Radix-based' },
  { component: 'Database',   pkg: '@supabase/supabase-js',           version: '2.100.0',            notes: 'PostgreSQL' },
  { component: 'SSR Auth',   pkg: '@supabase/ssr',                   version: '0.9.0',              notes: 'Cookie-based' },
  { component: '3D',         pkg: 'three / @react-three/fiber / drei', version: '0.183.2 / 9.5.0 / 10.7.7', notes: '' },
  { component: 'Animation',  pkg: 'framer-motion',                   version: '12.38.0',            notes: '' },
  { component: 'State',      pkg: 'zustand',                         version: '5.0.12',             notes: '2 stores' },
  { component: 'Charts',     pkg: 'recharts',                        version: '3.8.0',              notes: '' },
  { component: 'AI',         pkg: '@anthropic-ai/sdk',               version: '0.78.0',             notes: 'Claude, temp=0' },
  { component: 'Payments',   pkg: 'stripe + payrex-node',            version: '20.4.1 / 1.7.3',    notes: '' },
  { component: 'Validation', pkg: 'zod',                             version: '4.3.6',              notes: '' },
  { component: 'Content',    pkg: 'next-mdx-remote + @mdx-js/mdx',  version: '6.0.0 / 3.1.1',     notes: '' },
]

const dbClusters = [
  {
    label: 'Taxonomy & Content',
    variant: 'primary' as const,
    tables: [
      { name: 'disciplines',           desc: 'name, acronym, passing_threshold_pct',            access: 'Public read' },
      { name: 'taxonomy_tree',         desc: 'level, name, ale_id, node_type, bloom_level',     access: 'Public read' },
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
      { name: 'user_subscriptions',  desc: 'tier, status, stripe IDs',                      access: 'Own-user + admin' },
      { name: 'organizations',       desc: 'name, type, max_seats',                         access: 'Org members' },
      { name: 'user_roles',          desc: 'role enum',                                     access: 'Admin only' },
      { name: 'audit_logs',          desc: 'actor_id, event_type, content_snapshot',        access: 'Super admin' },
    ],
  },
]

const dbFunctions = [
  { name: 'update_updated_at_column()',               desc: 'Auto-update timestamps' },
  { name: 'snapshot_readiness_on_session_complete()', desc: 'Auto-snapshot on quiz complete' },
  { name: 'flag_lucky_guess_on_insert()',              desc: 'Detect lucky guesses' },
  { name: 'log_mastery_history_on_update()',           desc: 'Track mastery changes' },
  { name: 'check_question_topic_not_cross_ref()',      desc: 'Prevent cross-ref questions' },
]

const roleMatrix = [
  { permission: 'Manage Questions', super_admin: true,  content_admin: true,  sme_reviewer: false },
  { permission: 'Manage Wiki',      super_admin: true,  content_admin: true,  sme_reviewer: false },
  { permission: 'Review Content',   super_admin: true,  content_admin: true,  sme_reviewer: true  },
  { permission: 'Manage Users',     super_admin: true,  content_admin: false, sme_reviewer: false },
  { permission: 'View Audit Log',   super_admin: true,  content_admin: false, sme_reviewer: false },
]

const authGuards = [
  'isAdmin()',
  'isSuperAdmin()',
  'canManageContent()',
  'canReviewContent()',
  'canManageUsers()',
]

const masteryLoopCode = `Student Interaction (quiz answer, wiki read, 3D Lab)
  → user_interactions (immutable event log)
  → user_node_mastery (EMA weight, updated via trigger)
  → Readiness Score + Taxonomy Heatmap
  → Progression (Blindspot, Endurance, Proof, Trail)
  → Student returns tomorrow`

const sessionLifecycleCode = `createQuizSession
  → getSessionQuestions
  → [loop: render → saveInteraction]
  → updateQuizSession
  → snapshot readiness`

const cronCode = `blindspot-scan   → 16:00 UTC  — queue focus-review topics per user
compute-signals  → 16:30 UTC  — aggregate mastery signals + update readiness`

const middlewareCode = `// middleware.ts
// 1. Refresh Supabase session cookie
// 2. Inject x-pathname header for RSC layout awareness
// 3. Redirect unauthenticated users from protected routes`

const envVars = {
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ],
  server: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'PAYREX_SECRET_KEY',
  ],
}

const migrations = [
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

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-1">
    {children}
  </p>
)

const TableHeader = ({ cols }: { cols: string[] }) => (
  <thead>
    <tr className="border-b border-border">
      {cols.map((col) => (
        <th
          key={col}
          className="px-3 py-2 text-left font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]"
        >
          {col}
        </th>
      ))}
    </tr>
  </thead>
)

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <SectionLabel>Documentation</SectionLabel>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground">
          Architecture Overview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tech stack, database schema, authentication model, data flow, and deployment configuration.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tech-stack">
        <TabsList variant="underline" className="w-full justify-start">
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="auth">Auth &amp; Roles</TabsTrigger>
          <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        {/* ---- Tab 1: Tech Stack ---- */}
        <TabsContent value="tech-stack" className="pt-5">
          <Card variant="default" size="sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <TableHeader cols={['Component', 'Package', 'Version', 'Notes']} />
                <tbody>
                  {techStack.map((row, i) => (
                    <tr
                      key={row.pkg}
                      className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                    >
                      <td className="px-3 py-2 font-medium text-foreground text-[11px] whitespace-nowrap">
                        {row.component}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-primary">
                        {row.pkg}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground whitespace-nowrap">
                        {row.version}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Tab 2: Database ---- */}
        <TabsContent value="database" className="pt-5 space-y-4">
          {/* Stats row */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Tables', value: '50' },
              { label: 'RLS Policies', value: '89' },
              { label: 'Triggers', value: '31' },
              { label: 'Enums', value: '13' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-dm-mono)] text-lg font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Domain clusters */}
          {dbClusters.map((cluster) => (
            <Card key={cluster.label} variant="default" size="sm">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border">
                  <Badge variant={cluster.variant} size="sm">
                    {cluster.label}
                  </Badge>
                </div>
                <table className="w-full text-sm">
                  <TableHeader cols={['Table', 'Columns / Notes', 'Access']} />
                  <tbody>
                    {cluster.tables.map((t, i) => (
                      <tr
                        key={t.name}
                        className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                      >
                        <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-foreground whitespace-nowrap">
                          {t.name}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">
                          {t.desc}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                          {t.access}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}

          {/* DB Functions */}
          <div>
            <SectionLabel>Database Functions</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <TableHeader cols={['Function', 'Description']} />
                  <tbody>
                    {dbFunctions.map((fn, i) => (
                      <tr
                        key={fn.name}
                        className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                      >
                        <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-foreground whitespace-nowrap">
                          {fn.name}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">
                          {fn.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- Tab 3: Auth & Roles ---- */}
        <TabsContent value="auth" className="pt-5 space-y-5">
          {/* Provider info */}
          <Card variant="default" size="sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <TableHeader cols={['Property', 'Value']} />
                <tbody>
                  {[
                    { k: 'Provider',  v: 'Supabase Auth' },
                    { k: 'OAuth',     v: 'Google OAuth 2.0' },
                    { k: 'Session',   v: 'Cookie-based via @supabase/ssr' },
                    { k: 'JWT',       v: 'RS256, rotated on refresh' },
                  ].map((row, i) => (
                    <tr key={row.k} className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                      <td className="px-3 py-2 font-medium text-[11px] text-foreground whitespace-nowrap">
                        {row.k}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {row.v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Role matrix */}
          <div>
            <SectionLabel>Role Permissions</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]">
                        Permission
                      </th>
                      {['super_admin', 'content_admin', 'sme_reviewer'].map((role) => (
                        <th
                          key={role}
                          className="px-3 py-2 text-center font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]"
                        >
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roleMatrix.map((row, i) => (
                      <tr
                        key={row.permission}
                        className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                      >
                        <td className="px-3 py-2 text-[11px] text-foreground">
                          {row.permission}
                        </td>
                        {[row.super_admin, row.content_admin, row.sme_reviewer].map((allowed, j) => (
                          <td key={j} className="px-3 py-2 text-center text-[13px]">
                            {allowed ? (
                              <span className="text-emerald-600">●</span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Auth guard functions */}
          <div>
            <SectionLabel>Auth Guard Functions</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="flex flex-wrap gap-2 py-3">
                {authGuards.map((fn) => (
                  <code
                    key={fn}
                    className="font-[family-name:var(--font-dm-mono)] text-[11px] px-2 py-1 rounded bg-muted text-foreground border border-border"
                  >
                    {fn}
                  </code>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Route protection */}
          <div>
            <SectionLabel>Route Protection Flow</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  {['middleware', 'layout', 'page-level'].map((step, i) => (
                    <span key={step} className="flex items-center gap-2">
                      <code className="font-[family-name:var(--font-dm-mono)] px-2 py-1 rounded bg-muted text-foreground border border-border">
                        {step}
                      </code>
                      {i < 2 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- Tab 4: Data Flow ---- */}
        <TabsContent value="data-flow" className="pt-5 space-y-5">
          <div>
            <SectionLabel>Mastery Loop</SectionLabel>
            <CodeBlock code={masteryLoopCode} filename="mastery-loop" />
          </div>

          <div>
            <SectionLabel>Quiz Session Lifecycle</SectionLabel>
            <CodeBlock code={sessionLifecycleCode} filename="session-lifecycle" />
          </div>

          {/* IRT note */}
          <Card variant="accent-left" size="sm" className="border-l-primary">
            <CardContent className="py-3">
              <p className="text-[11px] font-medium text-foreground mb-1">IRT Mandate</p>
              <p className="text-[11px] text-muted-foreground">
                All mastery calculations use the Item Response Theory (IRT) 2-parameter logistic model.
                Parameters: <code className="font-[family-name:var(--font-dm-mono)] text-[11px]">theta</code> (student ability),{' '}
                <code className="font-[family-name:var(--font-dm-mono)] text-[11px]">discrimination</code>,{' '}
                <code className="font-[family-name:var(--font-dm-mono)] text-[11px]">difficulty</code>.
                Mastery weight updates use EMA (Exponential Moving Average).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Tab 5: Deployment ---- */}
        <TabsContent value="deployment" className="pt-5 space-y-5">
          {/* Platform */}
          <Card variant="default" size="sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <TableHeader cols={['Property', 'Value']} />
                <tbody>
                  {[
                    { k: 'Platform', v: 'Vercel (serverless)' },
                    { k: 'Build',    v: 'next build with Turbopack' },
                    { k: 'Runtime',  v: 'Node.js (default)' },
                    { k: 'Region',   v: 'iad1 (US East)' },
                  ].map((row, i) => (
                    <tr key={row.k} className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                      <td className="px-3 py-2 font-medium text-[11px] text-foreground whitespace-nowrap">
                        {row.k}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {row.v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cron jobs */}
          <div>
            <SectionLabel>Cron Jobs</SectionLabel>
            <CodeBlock code={cronCode} filename="vercel.json crons" />
          </div>

          {/* Middleware */}
          <div>
            <SectionLabel>Middleware</SectionLabel>
            <CodeBlock code={middlewareCode} filename="middleware.ts" language="typescript" />
          </div>

          {/* Environment variables */}
          <div>
            <SectionLabel>Environment Variables</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card variant="default" size="sm">
                <CardContent className="p-0">
                  <div className="px-3 pt-3 pb-2 border-b border-border">
                    <Badge variant="info" size="sm">Public (NEXT_PUBLIC_*)</Badge>
                  </div>
                  <ul className="py-2">
                    {envVars.public.map((v) => (
                      <li key={v} className="px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {v}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card variant="default" size="sm">
                <CardContent className="p-0">
                  <div className="px-3 pt-3 pb-2 border-b border-border">
                    <Badge variant="danger" size="sm">Server-only</Badge>
                  </div>
                  <ul className="py-2">
                    {envVars.server.map((v) => (
                      <li key={v} className="px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {v}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Migrations */}
          <div>
            <SectionLabel>Migration Files ({migrations.length})</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {migrations.map((m) => (
                    <li key={m} className="px-3 py-1.5 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                      {m}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
