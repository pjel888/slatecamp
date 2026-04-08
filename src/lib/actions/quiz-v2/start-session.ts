'use server'

import { randomBytes } from 'crypto'
import { MODE_DEFINITIONS } from '@/lib/constants/testing-modes'
import { startSessionInputSchema } from '@/lib/actions/quiz-v2/schemas'
import { selectQuestionsWithInterleaving } from '@/lib/quiz/interleaved-selection'
import { selectQuestionsWithRouting } from '@/lib/quiz/intelligent-routing'
import { mergeWithPreset } from '@/lib/quiz/mode-presets'
import { buildTaxonomyBreadcrumbMap, toClientQuestion } from '@/lib/quiz/to-client-question'
import { resolveTaxonomyDescendants } from '@/lib/actions/cached-queries'
import { createServiceClient, getUser } from '@/lib/supabase/server'
import type {
  QuestionForClient,
  QuizSessionConfig,
  StartSessionInput,
  StartSessionResult,
} from '@/types/quiz-config'

const DB_TEST_MODE_BY_APP_MODE: Record<StartSessionInput['mode'], string> = {
  camp: 'camp',
  chill: 'chill',
  subject: 'practice',
  focused: 'blindspot',
  custom: 'custom',
  storm: 'storm',
  fullexam: 'proof_sim',
  extended: 'endurance',
  article_review: 'practice',
}

const issueSessionSecurity = async (
  sessionId: string,
  questionIds: string[],
  userId: string,
) => {
  let nonces: Record<string, { nonce: string; expiresAt: string }> = {}
  let sessionKey: string | null = null

  try {
    const { issueNonceBatch } = await import('@/lib/cage/nonceService')
    const nonceMap = await issueNonceBatch(sessionId, questionIds, userId)
    nonces = Object.fromEntries(nonceMap)
    sessionKey = randomBytes(32).toString('hex')
  } catch {
    nonces = {}
    sessionKey = null
  }

  return { nonces, sessionKey }
}

export const startSession = async (
  input: StartSessionInput,
): Promise<StartSessionResult> => {
  try {
    const parsedInput = startSessionInputSchema.parse(input)
    const dbTestMode = DB_TEST_MODE_BY_APP_MODE[parsedInput.mode]
    const {
      data: { user },
    } = await getUser()

    if (!user) {
      return {
        success: false,
        error: 'UNAUTHORIZED',
        message: 'You must be logged in to start a session.',
      }
    }

    const supabase = await createServiceClient()
    const modeDef = MODE_DEFINITIONS[parsedInput.mode]

    if (modeDef?.isPro) {
      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .maybeSingle()

      const isPro = subscription?.tier !== 'free' && subscription?.status === 'active'
      const isDevBypass = process.env.NODE_ENV === 'development'

      if (!isPro && !isDevBypass) {
        return {
          success: false,
          error: 'TIER_INSUFFICIENT',
          errorCode: 'PRO_MODE_REQUIRED',
          message: `The ${modeDef.label} mode requires a Pro subscription.`,
          upgradeUrl: '/pricing',
          currentTier: subscription?.tier || 'free',
          requiredTier: 'camp',
        }
      }
    }

    const mergedConfig = mergeWithPreset(
      parsedInput.mode,
      parsedInput.config as Partial<QuizSessionConfig>,
    )

    if (parsedInput.trailDayId) {
      mergedConfig.setup.trailDayId = parsedInput.trailDayId
      mergedConfig.setup.isTrailSession = true
    }

    const { questionCount, topics, disciplines, initialDifficulty } = mergedConfig.setup

    const { data: globalStats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score, current_discipline_id')
      .eq('user_id', user.id)
      .single()

    const readinessScoreBefore = globalStats?.global_readiness_score ?? 0
    const disciplineId: string | null = globalStats?.current_discipline_id ?? null

    const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentInteractions } = await supabase
      .from('user_interactions')
      .select('question_id')
      .eq('user_id', user.id)
      .gte('interaction_timestamp', recentCutoff)
      .limit(1000)

    const recentQuestionIds = (recentInteractions ?? []).map(
      (interaction: { question_id: string }) => interaction.question_id,
    )

    let topicIds: string[] = []
    let filterByDisciplineId: string | null = null

    if (topics.length > 0) {
      // Cached in-memory traversal — replaces 4-7 sequential DB queries with zero on cache hit
      const resolved = await resolveTaxonomyDescendants(topics)
      topicIds = resolved.length > 0 ? resolved : topics
    } else if (disciplines.length > 0 && disciplines.length <= 3) {
      filterByDisciplineId = disciplines[0]
    } else if (disciplineId) {
      filterByDisciplineId = disciplineId
    }

    let difficultyRange: { min: number; max: number } | null = null
    if (initialDifficulty === 'easy') difficultyRange = { min: 0, max: 0.4 }
    else if (initialDifficulty === 'medium') difficultyRange = { min: 0.4, max: 0.7 }
    else if (initialDifficulty === 'hard') difficultyRange = { min: 0.7, max: 1 }

    // Resolve discipline to leaf topics if no specific topics selected
    if (filterByDisciplineId && topicIds.length === 0) {
      const { data: leafNodes } = await supabase
        .from('taxonomy_tree')
        .select('node_id')
        .eq('discipline_id', filterByDisciplineId)
        .eq('is_leaf', true)
        .eq('is_cross_ref_only', false)
        .is('deprecated_at', null)

      topicIds = (leafNodes ?? []).map((node: { node_id: string }) => node.node_id)
    }

    if (topicIds.length === 0) {
      throw new Error('No topics selected or found for the current discipline.')
    }

    // Question Selection (Intelligent Routing vs Interleaving) — chunked for large topic sets
    let selectedQuestions: any[] = []

    if (mergedConfig.interleave === true) {
      selectedQuestions = await selectQuestionsWithInterleaving({
        primaryTopicIds: topicIds,
        totalCount: questionCount,
        interleaveRatio: mergedConfig.interleave_ratio ?? 0.3,
        excludeQuestionIds: recentQuestionIds,
        difficultyRange,
      })
    } else {
      // DEFAULT: Intelligent Routing (60/30/10)
      selectedQuestions = await selectQuestionsWithRouting({
        supabase,
        userId: user.id,
        topicIds,
        questionCount,
        difficultyRange,
        excludeQuestionIds: recentQuestionIds,
      })
    }

    if (selectedQuestions.length === 0) {
      return {
        success: false as const,
        error: 'NO_QUESTIONS' as const,
        message: 'No questions found. Try widening your selection or changing difficulty.',
      }
    }

    const questionIds = selectedQuestions.map((q) => q.question_id)
    const uniqueTopicIds = [...new Set(selectedQuestions.map((q) => q.topic_id))] as string[]

    // Parallel: breadcrumb map + session insert (independent operations)
    const [taxonomyMap, { data: session, error: sessionError }] = await Promise.all([
      buildTaxonomyBreadcrumbMap(supabase, uniqueTopicIds),
      supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          discipline_id: disciplineId,
          test_mode: dbTestMode,
          status: 'in_progress',
          config: mergedConfig,
          question_ids: questionIds,
          subject_ids: uniqueTopicIds,
          current_question_index: 0,
          started_at: new Date().toISOString(),
        })
        .select('session_id')
        .single(),
    ])

    if (sessionError || !session) {
      throw sessionError ?? new Error('Failed to create session')
    }

    const clientQuestions: QuestionForClient[] = selectedQuestions.map((question, index) =>
      toClientQuestion(
        {
          ...question,
          breadcrumb: taxonomyMap.get(question.topic_id) ?? '',
          is_interleaved: (question as any).is_interleaved ?? false,
        },
        index + 1,
      ),
    )

    const { nonces, sessionKey } = await issueSessionSecurity(
      session.session_id,
      clientQuestions.map((question) => question.question_id),
      user.id,
    )

    return {
      success: true as const,
      sessionId: session.session_id,
      config: mergedConfig,
      questions: clientQuestions,
      totalQuestions: clientQuestions.length,
      readinessScoreBefore,
      nonces,
      sessionKey,
    }
  } catch (error) {
    console.error('[quiz-v2/start-session] Failed:', error)
    return {
      success: false as const,
      error: 'UNKNOWN' as const,
      message: error instanceof Error ? error.message : 'Failed to start session',
    }
  }
}
