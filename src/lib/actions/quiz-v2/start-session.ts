'use server'

import { randomBytes } from 'crypto'
import { MODE_DEFINITIONS } from '@/lib/constants/testing-modes'
import { startSessionInputSchema } from '@/lib/actions/quiz-v2/schemas'
import { selectQuestionsWithInterleaving } from '@/lib/quiz/interleaved-selection'
import { selectQuestionsWithRouting } from '@/lib/quiz/intelligent-routing'
import { mergeWithPreset } from '@/lib/quiz/mode-presets'
import { buildTaxonomyBreadcrumbMap, toClientQuestion } from '@/lib/quiz/to-client-question'
import { resolveTaxonomyDescendants } from '@/lib/actions/cached-queries'
import { filterQuestionsReadableForStage } from '@/lib/admin/editor-integrity/standard-question'
import { createServiceClient, getUser } from '@/lib/supabase/server'
import type {
  QuestionForClient,
  QuizSessionConfig,
  StartSessionInput,
  StartSessionResult,
} from '@/types/quiz-config'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'
import { ENTITLEMENT_FEATURE_KEYS } from '@/lib/entitlements/feature-keys'
import {
  logEntitlementAuditEvent,
  serializeOverrideState,
} from '@/lib/entitlements/audit'
import { logServerError } from '@/lib/logging/server'

const DIRECT_QUESTION_COLS =
  'question_id, article_id, topic_id, text, options, difficulty, prompt_image_url, question_type, rationale, explanation'

interface TaxonomyGraphNode {
  node_id: string
  parent_id: string | null
  is_leaf: boolean
  is_cross_ref_only: boolean
}

const generateCageSessionKey = (): string | null => {
  try {
    return randomBytes(32).toString('hex')
  } catch {
    return null
  }
}

const issueSessionNonces = async (
  sessionId: string,
  questionIds: string[],
  userId: string,
): Promise<Record<string, { nonce: string; expiresAt: string }>> => {
  try {
    const { issueNonceBatch } = await import('@/lib/cage/nonceService')
    const nonceMap = await issueNonceBatch(sessionId, questionIds, userId)
    return Object.fromEntries(nonceMap)
  } catch {
    return {}
  }
}

const resolveLiveTaxonomyDescendants = async (
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  selectedTopicIds: string[],
): Promise<string[]> => {
  if (selectedTopicIds.length === 0) return []

  const result = new Set<string>()
  const visited = new Set<string>()
  const queue = [...selectedTopicIds]

  while (queue.length > 0) {
    const batch = queue.splice(0, 100).filter((nodeId) => !visited.has(nodeId))
    if (batch.length === 0) continue
    batch.forEach((nodeId) => visited.add(nodeId))

    const [{ data: nodes }, { data: childNodes }] = await Promise.all([
      supabase
        .from('taxonomy_tree')
        .select('node_id, parent_id, is_leaf, is_cross_ref_only')
        .in('node_id', batch)
        .is('deprecated_at', null),
      supabase
        .from('taxonomy_tree')
        .select('node_id, parent_id, is_leaf, is_cross_ref_only')
        .in('parent_id', batch)
        .is('deprecated_at', null),
    ])

    const nodesById = new Map(
      ((nodes ?? []) as TaxonomyGraphNode[]).map((node) => [node.node_id, node]),
    )

    for (const nodeId of batch) {
      const node = nodesById.get(nodeId)
      if (!node) {
        result.add(nodeId)
      } else if (!node.is_cross_ref_only) {
        result.add(nodeId)
      }
    }

    for (const child of (childNodes ?? []) as TaxonomyGraphNode[]) {
      if (!child.is_cross_ref_only) queue.push(child.node_id)
    }

    const crossRefSources = ((nodes ?? []) as TaxonomyGraphNode[])
      .filter((node) => node.is_cross_ref_only)
      .map((node) => node.node_id)
    if (crossRefSources.length > 0) {
      const { data: crossRefs } = await supabase
        .from('taxonomy_cross_references')
        .select('target_node_id')
        .in('source_node_id', crossRefSources)

      for (const crossRef of (crossRefs ?? []) as { target_node_id: string }[]) {
        queue.push(crossRef.target_node_id)
      }
    }
  }

  return Array.from(result)
}

export const startSession = async (
  input: StartSessionInput,
): Promise<StartSessionResult> => {
  let userId: string | null = null

  try {
    const parsedInput = startSessionInputSchema.parse(input)
    const {
      data: { user },
    } = await getUser()
    userId = user?.id ?? null

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
      const entitlements = await getViewerEntitlements([
        ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
      ])
      const hasProAccess =
        entitlements.decisions[ENTITLEMENT_FEATURE_KEYS.questionsUnlimited]?.allowed ?? false

      if (!hasProAccess) {
        logEntitlementAuditEvent({
          eventName: 'entitlement.denied',
          timestamp: new Date().toISOString(),
          traceId: entitlements.traceId,
          userId: entitlements.userId,
          routeOrAction: `quiz-v2:start-session:${parsedInput.mode}`,
          featureKey: ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
          normalizedRole: entitlements.normalizedRole,
          roleSource: entitlements.roleResolution.resolvedFrom,
            rawTier: entitlements.rawTier,
            subscriptionStatus: entitlements.subscriptionStatus,
            effectiveTier: entitlements.effectiveTier,
            overrideState: serializeOverrideState(entitlements.overrides),
          decision: false,
          denialReason: 'insufficient_tier',
          decisionSource: 'quiz-v2.start-session',
          trace: [`mode:${parsedInput.mode}`],
        })
        return {
          success: false,
          error: 'TIER_INSUFFICIENT',
          errorCode: 'PRO_MODE_REQUIRED',
          message: `The ${modeDef.label} mode requires a Pro subscription.`,
          upgradeUrl: '/pricing',
          currentTier: entitlements.effectiveTier,
          requiredTier: 'pro',
        }
      }

      logEntitlementAuditEvent({
        eventName: 'entitlement.decision',
        timestamp: new Date().toISOString(),
        traceId: entitlements.traceId,
        userId: entitlements.userId,
        routeOrAction: `quiz-v2:start-session:${parsedInput.mode}`,
        featureKey: ENTITLEMENT_FEATURE_KEYS.questionsUnlimited,
        normalizedRole: entitlements.normalizedRole,
        roleSource: entitlements.roleResolution.resolvedFrom,
        rawTier: entitlements.rawTier,
        subscriptionStatus: entitlements.subscriptionStatus,
        effectiveTier: entitlements.effectiveTier,
        overrideState: serializeOverrideState(entitlements.overrides),
        decision: true,
        decisionSource: 'quiz-v2.start-session',
        trace: [`mode:${parsedInput.mode}`],
      })
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
    let selectedQuestions: any[] = []

    if (topics.length > 0) {
      const { data: directQuestionRows } = await supabase
        .from('questions')
        .select(DIRECT_QUESTION_COLS)
        .in('question_id', topics)

      const {
        questions: readableDirectQuestions,
        error: readableDirectQuestionsError,
      } = await filterQuestionsReadableForStage<any>(
        supabase,
        (directQuestionRows ?? []) as any[],
        'delivery',
      )

      if (!readableDirectQuestionsError && readableDirectQuestions.length === topics.length) {
        const byId = new Map(
          readableDirectQuestions.map((question) => [question.question_id, question]),
        )
        selectedQuestions = topics
          .map((questionId) => byId.get(questionId))
          .filter(Boolean)
      }
    }

    if (selectedQuestions.length === 0) {
      if (topics.length > 0) {
        // Cached in-memory traversal — replaces 4-7 sequential DB queries with zero on cache hit
        const resolved = await resolveTaxonomyDescendants(topics)
        topicIds = resolved.length > 0 ? resolved : topics
        if (topicIds.length <= topics.length) {
          const liveResolved = await resolveLiveTaxonomyDescendants(supabase, topics)
          if (liveResolved.length > topicIds.length) {
            topicIds = liveResolved
          }
        }
      } else if (disciplines.length > 0 && disciplines.length <= 3) {
        filterByDisciplineId = disciplines[0]
      } else if (disciplineId) {
        filterByDisciplineId = disciplineId
      }
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

    if (selectedQuestions.length === 0 && topicIds.length === 0) {
      throw new Error('No topics selected or found for the current discipline.')
    }

    // Question Selection (Intelligent Routing vs Interleaving) — chunked for large topic sets
    if (selectedQuestions.length === 0 && mergedConfig.interleave === true) {
      selectedQuestions = await selectQuestionsWithInterleaving({
        primaryTopicIds: topicIds,
        totalCount: questionCount,
        interleaveRatio: mergedConfig.interleave_ratio ?? 0.3,
        excludeQuestionIds: recentQuestionIds,
        difficultyRange,
      })
    } else if (selectedQuestions.length === 0) {
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

    // Generate CAGE session key before insert (sync, no dependencies)
    const sessionKey = generateCageSessionKey()
    const sessionInsertPayload = {
      user_id: user.id,
      discipline_id: disciplineId,
      test_mode: parsedInput.mode,
      status: 'in_progress',
      config: mergedConfig,
      question_ids: questionIds,
      subject_ids: uniqueTopicIds,
      current_question_index: 0,
      started_at: new Date().toISOString(),
      cage_session_key: sessionKey,
      is_full_exam: parsedInput.mode === 'full_exam',
      is_endurance: parsedInput.mode === 'endurance',
    }

    const insertQuizSession = async (payload: typeof sessionInsertPayload) => {
      const response = await supabase
        .from('quiz_sessions')
        .insert(payload)
        .select('session_id')
        .single()

      if (response.error?.code === 'PGRST204') {
        const { is_endurance: _isEndurance, is_full_exam: _isFullExam, ...legacyCompatiblePayload } = payload
        return supabase
          .from('quiz_sessions')
          .insert(legacyCompatiblePayload)
          .select('session_id')
          .single()
      }

      return response
    }

    // Parallel: breadcrumb map + session insert (independent operations)
    const [taxonomyMap, { data: session, error: sessionError }] = await Promise.all([
      buildTaxonomyBreadcrumbMap(supabase, uniqueTopicIds),
      insertQuizSession(sessionInsertPayload),
    ])

    if (sessionError || !session) {
      throw sessionError ?? new Error('Failed to create session')
    }

    const clientQuestions: QuestionForClient[] = selectedQuestions.map((question, index) =>
      toClientQuestion(
        {
          ...question,
          breadcrumb: taxonomyMap.get(question.topic_id) ?? '',
          is_interleaved: (question as { is_interleaved?: boolean }).is_interleaved ?? false,
        },
        index + 1,
      ),
    )

    // Issue nonces after insert (needs session_id from insert result)
    const nonces = await issueSessionNonces(
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
    await logServerError({
      family: 'quiz',
      eventName: 'start_session_failed',
      message: 'Failed to start quiz session.',
      context: {
        routeOrAction: 'quiz-v2:start-session',
        userId,
        metadata: {
          mode: input.mode,
          trailDayId: input.trailDayId ?? null,
        },
      },
      error,
    })

    return {
      success: false as const,
      error: 'UNKNOWN' as const,
      message: error instanceof Error ? error.message : 'Failed to start session',
    }
  }
}
