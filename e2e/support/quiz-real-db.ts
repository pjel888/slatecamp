import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

export const QUIZ_REAL_USER_ID =
  process.env.PLAYWRIGHT_QUIZ_USER_ID ??
  process.env.PLAYWRIGHT_DRILLS_USER_ID ??
  process.env.DEV_FORCE_USER_ID ??
  '00000000-0000-4000-8000-00000000d111'

export const QUIZ_REAL_SEED = {
  disciplineId: '00000000-0000-4000-8000-00000000d100',
  subjectId: '00000000-0000-4000-8000-00000000d101',
  topicId: '00000000-0000-4000-8000-00000000d102',
  emptySubjectId: '00000000-0000-4000-8000-00000000d103',
  articleId: '00000000-0000-4000-8000-00000000d104',
  questionIds: [
    '00000000-0000-4000-8000-00000000d201',
    '00000000-0000-4000-8000-00000000d202',
    '00000000-0000-4000-8000-00000000d203',
  ],
  subjectName: 'Playwright Seeded Quiz Subject',
  emptySubjectName: 'Playwright Empty Quiz Subject',
} as const

export function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...parts] = trimmed.split('=')
    if (process.env[key]) continue
    process.env[key] = parts.join('=').replace(/^['"]|['"]$/g, '')
  }
}

export function hasQuizRealDbEnv() {
  loadLocalEnv()
  return Boolean(
    process.env.PLAYWRIGHT_QUIZ_REAL_DB === 'true' &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

function getAdminClient() {
  loadLocalEnv()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase URL/service role key for quiz real DB E2E seeding')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function assertNoError<T>(
  result: { data: T; error: { message?: string } | null },
  label: string,
) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message ?? 'unknown Supabase error'}`)
  }
  return result.data
}

export async function seedQuizRealDb() {
  const supabase = getAdminClient()
  const now = new Date().toISOString()

  const existingAuthUser = await supabase.auth.admin.getUserById(QUIZ_REAL_USER_ID)
  if (!existingAuthUser.data.user) {
    const createdAuthUser = await supabase.auth.admin.createUser({
      id: QUIZ_REAL_USER_ID,
      email: 'playwright-quiz@example.test',
      email_confirm: true,
      user_metadata: { full_name: 'Playwright Quiz', role: 'owner' },
    })
    if (createdAuthUser.error) {
      throw new Error(`create auth user: ${createdAuthUser.error.message}`)
    }
  }

  await assertNoError(
    await supabase.from('profiles').upsert(
      {
        id: QUIZ_REAL_USER_ID,
        display_name: 'Playwright Quiz',
        full_name: 'Playwright Quiz',
        role: 'owner',
        onboarding_completed_at: now,
        updated_at: now,
      },
      { onConflict: 'id' },
    ),
    'upsert profile',
  )

  await supabase.from('user_roles').upsert(
    {
      user_id: QUIZ_REAL_USER_ID,
      role: 'owner',
    },
    { onConflict: 'user_id,role' },
  )

  await assertNoError(
    await supabase.from('user_subscriptions').upsert(
      {
        user_id: QUIZ_REAL_USER_ID,
        tier: 'institutional',
        status: 'active',
        updated_at: now,
      },
      { onConflict: 'user_id' },
    ),
    'upsert user subscription',
  )

  await assertNoError(
    await supabase.from('disciplines').upsert(
      {
        discipline_id: QUIZ_REAL_SEED.disciplineId,
        name: 'Playwright Architecture Licensure Exam d100',
        acronym: 'PW-ALE-D100',
        updated_at: now,
      },
      { onConflict: 'discipline_id' },
    ),
    'upsert discipline',
  )

  await assertNoError(
    await supabase.from('user_global_stats').upsert(
      {
        user_id: QUIZ_REAL_USER_ID,
        current_discipline_id: QUIZ_REAL_SEED.disciplineId,
        global_readiness_score: 72,
        onboarding_completed_at: now,
        updated_at: now,
      },
      { onConflict: 'user_id' },
    ),
    'upsert user_global_stats',
  )

  await assertNoError(
    await supabase.from('taxonomy_tree').upsert(
      [
        {
          node_id: QUIZ_REAL_SEED.subjectId,
          discipline_id: QUIZ_REAL_SEED.disciplineId,
          parent_id: null,
          level: 1,
          name: QUIZ_REAL_SEED.subjectName,
          subject_area: 'Playwright Quiz',
          slug: 'playwright-seeded-quiz-subject',
          is_leaf: false,
          is_cross_ref_only: false,
          deprecated_at: null,
          sort_order: 1,
          lea_id: 'PW-QUIZ',
          updated_at: now,
        },
        {
          node_id: QUIZ_REAL_SEED.topicId,
          discipline_id: QUIZ_REAL_SEED.disciplineId,
          parent_id: QUIZ_REAL_SEED.subjectId,
          level: 2,
          name: 'Seeded Quiz Topic',
          subject_area: 'Playwright Quiz',
          slug: 'playwright-seeded-quiz-topic',
          is_leaf: true,
          is_cross_ref_only: false,
          deprecated_at: null,
          sort_order: 1,
          lea_id: 'PW-QUIZ-1',
          updated_at: now,
        },
        {
          node_id: QUIZ_REAL_SEED.emptySubjectId,
          discipline_id: QUIZ_REAL_SEED.disciplineId,
          parent_id: null,
          level: 1,
          name: QUIZ_REAL_SEED.emptySubjectName,
          subject_area: 'Playwright Empty',
          slug: 'playwright-empty-quiz-subject',
          is_leaf: false,
          is_cross_ref_only: false,
          deprecated_at: null,
          sort_order: 2,
          lea_id: 'PW-EMPTY',
          updated_at: now,
        },
      ],
      { onConflict: 'node_id' },
    ),
    'upsert taxonomy',
  )

  await assertNoError(
    await supabase.from('wiki_articles').upsert(
      {
        article_id: QUIZ_REAL_SEED.articleId,
        title: 'Playwright Seeded Quiz Article',
        slug: 'playwright-seeded-quiz-article',
        content: 'Seeded published article for real quiz E2E question delivery.',
        status: 'published',
        subject_label: 'Playwright Quiz',
        difficulty_label: 'Intermediate',
        updated_at: now,
      },
      { onConflict: 'article_id' },
    ),
    'upsert article',
  )

  await assertNoError(
    await supabase.from('wiki_article_taxonomy').upsert(
      {
        article_id: QUIZ_REAL_SEED.articleId,
        node_id: QUIZ_REAL_SEED.topicId,
        is_primary: true,
        sort_order: 1,
      },
      { onConflict: 'article_id,node_id' },
    ),
    'upsert article taxonomy mapping',
  )

  await assertNoError(
    await supabase.from('questions').upsert(
      QUIZ_REAL_SEED.questionIds.map((questionId, index) => ({
        question_id: questionId,
        article_id: QUIZ_REAL_SEED.articleId,
        topic_id: QUIZ_REAL_SEED.topicId,
        text: `Playwright seeded quiz question ${index + 1}: which option confirms the real session flow?`,
        options: [
          { id: 'A', text: `Correct seeded answer ${index + 1}` },
          { id: 'B', text: `Distractor seeded answer ${index + 1}` },
          { id: 'C', text: `Another distractor ${index + 1}` },
          { id: 'D', text: `Final distractor ${index + 1}` },
        ],
        correct_option_id: 'A',
        rationale: `Seeded rationale ${index + 1}: the E2E selected a real persisted question.`,
        explanation: `Seeded explanation ${index + 1}.`,
        difficulty: 0.55,
        question_type: 'mcq',
        prompt_image_url: null,
        updated_at: now,
      })),
      { onConflict: 'question_id' },
    ),
    'upsert questions',
  )

  await assertNoError(
    await supabase
      .from('quiz_sessions')
      .update({ status: 'abandoned', updated_at: now })
      .eq('user_id', QUIZ_REAL_USER_ID)
      .eq('status', 'in_progress'),
    'clear in-progress test sessions',
  )
}

export function assertQuizRealServerEnv() {
  if (process.env.PLAYWRIGHT_ALLOW_DEV_FORCE_USER_ID !== 'true') {
    throw new Error('PLAYWRIGHT_ALLOW_DEV_FORCE_USER_ID=true is required for real quiz E2E')
  }

  if ((process.env.DEV_FORCE_USER_ID ?? QUIZ_REAL_USER_ID) !== QUIZ_REAL_USER_ID) {
    throw new Error('Playwright server DEV_FORCE_USER_ID must match the seeded quiz user')
  }
}
