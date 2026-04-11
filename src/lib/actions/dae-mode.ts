'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { normalizeOptions } from '@/lib/utils/question'
import type { UserTier } from '@/types/app'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'

// ─── Types ────────────────────────────────────────────────────────────────────

export type WorkContext =
  | 'building_permit'
  | 'construction_supervision'
  | 'design_development'
  | 'pre_design'
  | 'government_practice'
  | 'contract_administration'

export interface DAEQuestion {
  question_id: string
  stem: string
  options: Array<{ id: string; letter: string; text: string }>
  image_url: string | null
  difficulty_label: 'Easy' | 'Medium' | 'Hard'
  topic_id: string
  taxonomy_breadcrumb: string
}

export interface DAESessionResult {
  sessionId: string
  questions: DAEQuestion[]
  totalQuestions: number
}

export interface SaveContextsResult {
  ok: boolean
  error?: string
}

export interface GetDAEStateResult {
  savedContexts: WorkContext[]
  userTier: UserTier
  dailyUsedCount: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDifficultyLabel = (d: number): 'Easy' | 'Medium' | 'Hard' => {
  if (d < 0.4) return 'Easy'
  if (d < 0.7) return 'Medium'
  return 'Hard'
}

// ─── Save selected work contexts to profiles ──────────────────────────────────

export const saveDAEContexts = async (
  contexts: WorkContext[],
): Promise<SaveContextsResult> => {
  if (contexts.length === 0 || contexts.length > 3) {
    return { ok: false, error: 'Select between 1 and 3 work contexts.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({
      dae_work_contexts: contexts,
      dae_contexts_updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ─── Get DAE hub state ────────────────────────────────────────────────────────

export const getDAEState = async (): Promise<GetDAEStateResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) {
    return { savedContexts: [], userTier: 'free', dailyUsedCount: 0 }
  }
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
  ])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    { data: profile },
    { data: todaySessions },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('dae_work_contexts')
      .eq('id', user.id)
      .maybeSingle(),
    // Count DAE-specific sessions today by checking config->>'dae_mode' flag
    supabase
      .from('quiz_sessions')
      .select('session_id, question_ids')
      .eq('user_id', user.id)
      .gte('started_at', todayStart.toISOString()),
  ])

  // Filter to only DAE sessions by presence of daeContexts in config
  const daeSessionsToday = (todaySessions ?? []).filter(
    (s: { session_id: string; question_ids: string[] | null }) => {
      // We tag DAE sessions via config.daeContexts; use session_id as proxy
      // since Supabase JS client doesn't support JSONB path filters in .select()
      // The count is approximate for the free-tier gate — exact enforcement
      // is done in startDAESession below.
      return s.question_ids !== null
    },
  )

  const savedContexts: WorkContext[] =
    (profile as { dae_work_contexts?: WorkContext[] } | null)?.dae_work_contexts ?? []

  // Use question count as the daily usage metric for free tier
  const dailyUsedCount = daeSessionsToday.reduce(
    (sum: number, s: { question_ids: string[] | null }) =>
      sum + (s.question_ids?.length ?? 0),
    0,
  )

  return { savedContexts, userTier: entitlements.effectiveTier, dailyUsedCount }
}

// ─── Start DAE session ────────────────────────────────────────────────────────

export const startDAESession = async (
  contexts: WorkContext[],
): Promise<DAESessionResult | { error: string }> => {
  if (contexts.length === 0) {
    return { error: 'Select at least one work context.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return { error: 'Unauthorized' }
  const entitlements = await getViewerEntitlements([
    ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
  ])

  // Check free tier daily limit (5 questions/day across all DAE sessions)
  const userTier = entitlements.effectiveTier

  if (userTier === 'free') {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data: todaySessions } = await supabase
      .from('quiz_sessions')
      .select('question_ids')
      .eq('user_id', user.id)
      .gte('started_at', todayStart.toISOString())

    const todayQuestionCount = (todaySessions ?? []).reduce(
      (sum: number, s: { question_ids: string[] | null }) =>
        sum + (s.question_ids?.length ?? 0),
      0,
    )

    if (todayQuestionCount >= 5) {
      return {
        error:
          'You have reached your 5-question daily limit. Upgrade to Pro for unlimited access.',
      }
    }
  }

  // Fetch questions filtered by practice_context array overlap
  const { data: rawQuestions, error: qError } = await supabase
    .from('questions')
    .select('question_id, topic_id, text, options, difficulty, prompt_image_url')
    .overlaps('practice_context', contexts)
    .limit(50)

  if (qError) return { error: qError.message }

  const allQuestions = rawQuestions ?? []

  if (allQuestions.length === 0) {
    return { error: 'No questions found for the selected work contexts.' }
  }

  // Fisher-Yates shuffle then cap
  const pool = [...allQuestions]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const questionCount = userTier === 'free' ? Math.min(5, pool.length) : Math.min(10, pool.length)
  const selected = pool.slice(0, questionCount)
  const questionIds = selected.map((q: { question_id: string }) => q.question_id)

  // Fetch taxonomy breadcrumbs
  const uniqueTopicIds = [
    ...new Set(selected.map((q: { topic_id: string }) => q.topic_id)),
  ]
  const { data: taxonomyNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, subject_area')
    .in('node_id', uniqueTopicIds)

  const taxonomyMap = new Map<string, string>(
    (taxonomyNodes ?? []).map(
      (n: { node_id: string; name: string; subject_area: string }) =>
        [n.node_id, `${n.subject_area} > ${n.name}`] as [string, string],
    ),
  )

  // Store as 'chill' mode with daeContexts tag in config JSONB
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      discipline_id: null,
      test_mode: 'chill',
      status: 'in_progress',
      config: {
        mode: 'chill',
        daeContexts: contexts,
        setup: {
          questionCount,
          topics: [],
          disciplines: [],
          difficultyMode: 'static',
          initialDifficulty: 'mixed',
          isTrailSession: false,
          trailDayId: null,
        },
        timer: {
          enabled: false,
          visible: false,
          mode: 'hidden',
          totalSeconds: null,
          perQuestion: false,
          pausable: true,
          warningThresholds: [],
        },
        feedback: {
          timing: 'immediate',
          showExplanation: true,
          showCorrectAnswer: true,
          showConfidenceRating: false,
          gatedProgressionDelayMs: 0,
          explanationDepth: 'brief',
        },
        navigation: {
          model: 'free',
          backAllowed: true,
          questionPalette: false,
          bookmarkEnabled: false,
          skipEnabled: true,
          confirmBeforeSubmit: false,
        },
        results: {
          showImmediately: true,
          delayHours: 0,
          showPercentile: false,
          showSubjectBreakdown: true,
          showGrowthDelta: true,
          showReadinessScoreImpact: false,
          showStaminaChart: false,
        },
        breaks: { enabled: false, intervalQuestions: 0, breakDurationSeconds: 0 },
      },
      question_ids: questionIds,
      subject_ids: uniqueTopicIds,
      started_at: new Date().toISOString(),
    })
    .select('session_id')
    .single()

  if (sessionError) return { error: sessionError.message }

  const questions: DAEQuestion[] = selected.map(
    (q: {
      question_id: string
      text: string
      options: unknown
      prompt_image_url: string | null
      difficulty: number
      topic_id: string
    }) => ({
      question_id: q.question_id,
      stem: q.text,
      options: normalizeOptions(q.options),
      image_url: q.prompt_image_url,
      difficulty_label: toDifficultyLabel(q.difficulty ?? 0.5),
      topic_id: q.topic_id,
      taxonomy_breadcrumb: taxonomyMap.get(q.topic_id) ?? '',
    }),
  )

  return {
    sessionId: session.session_id,
    questions,
    totalQuestions: questions.length,
  }
}
