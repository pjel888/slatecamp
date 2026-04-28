'use server'

import { revalidatePath } from 'next/cache'
import { recomputeAndSaveReadinessScore } from '@/lib/actions/readiness-score-update'
import {
  triggerScoreChangeNotification,
  triggerZoneTransitionNotification,
} from '@/lib/actions/notification-triggers'
import { generateRecommendations } from '@/lib/actions/quiz-v2/generate-recommendations'
import { runPostSessionHooks } from '@/lib/actions/quiz-v2/post-session-hooks'
import { revalidateDashboardCacheTags } from '@/lib/actions/cache-tags'
import { writeUserTheta } from '@/lib/actions/analytics/write-theta'
import { endSessionInputSchema } from './schemas'
import {
  getOwnedSessionOrThrow,
  isTerminalSessionStatus,
} from './session-helpers'
import { createClient, getUser } from '@/lib/supabase/server'
import type { EndSessionInput, EndSessionResult, QuizSessionConfig, SessionStatus } from '@/types/quiz-config'

interface SessionRow {
  session_id: string
  user_id: string
  status: SessionStatus
  config: QuizSessionConfig | null
  question_ids: string[] | null
  started_at: string | null
  completed_at: string | null
  session_discovery: Record<string, unknown> | null
}

interface InteractionRow {
  interaction_id: string
  question_id: string
  is_correct: boolean
  topic_id: string | null
  time_spent_ms: number | null
}

const shouldRunCompletionHooks = (status: string) =>
  status === 'completed' || status === 'auto_submitted'

const getStoredFinalization = (session: SessionRow) => {
  const payload = session.session_discovery?._finalization
  if (!payload || typeof payload !== 'object') return null

  const data = payload as Record<string, unknown>
  return {
    readinessScoreBefore:
      typeof data.readinessScoreBefore === 'number' ? data.readinessScoreBefore : null,
    readinessScoreAfter:
      typeof data.readinessScoreAfter === 'number' ? data.readinessScoreAfter : null,
  }
}

const buildResultsAvailableAt = (
  session: SessionRow,
  referenceTime: Date,
) => {
  const config = session.config ?? null
  const delayHours = config?.results?.delayHours ?? 0

  return delayHours > 0
    ? new Date(referenceTime.getTime() + delayHours * 60 * 60 * 1000).toISOString()
    : referenceTime.toISOString()
}

const buildSubjectBreakdown = async (
  supabase: any,
  interactions: InteractionRow[],
): Promise<EndSessionResult['subjectBreakdown']> => {
  const topicIds = [
    ...new Set(
      interactions
        .map((interaction) => interaction.topic_id)
        .filter((topicId): topicId is string => topicId != null),
    ),
  ]

  if (topicIds.length === 0) {
    return []
  }

  // Single query — PostgREST handles large IN arrays natively
  const { data } = await supabase
    .from('taxonomy_tree')
    .select('node_id, subject_area, discipline_id')
    .in('node_id', topicIds)

  const taxonomyNodes = (data ?? []) as Array<{
    node_id: string
    subject_area: string
    discipline_id: string
  }>

  const taxonomyMap = new Map(
    taxonomyNodes.map((node) => [node.node_id, node]),
  )
  const subjectMap = new Map<
    string,
    { disciplineId: string; disciplineName: string; correct: number; total: number }
  >()

  for (const interaction of interactions) {
    const node = interaction.topic_id ? taxonomyMap.get(interaction.topic_id) : null
    if (!node) continue

    const key = node.subject_area
    const current = subjectMap.get(key)
    if (current) {
      current.total += 1
      if (interaction.is_correct) current.correct += 1
    } else {
      subjectMap.set(key, {
        disciplineId: node.discipline_id,
        disciplineName: node.subject_area,
        correct: interaction.is_correct ? 1 : 0,
        total: 1,
      })
    }
  }

  return [...subjectMap.values()].map((subject) => ({
    disciplineId: subject.disciplineId,
    disciplineName: subject.disciplineName,
    correct: subject.correct,
    total: subject.total,
    percent: subject.total > 0 ? Math.round((subject.correct / subject.total) * 100) : 0,
  }))
}

const buildTrailProgress = async (
  supabase: any,
  session: SessionRow,
  finalStatus: string,
) => {
  const config = session.config ?? null
  const isTrailSession = config?.setup?.isTrailSession ?? false
  const trailDayId = config?.setup?.trailDayId ?? null

  if (!isTrailSession || !trailDayId || !shouldRunCompletionHooks(finalStatus)) {
    return {
      trailDayCompleted: false,
      nextTrailDay: null,
    }
  }

  const { data: currentStep } = await supabase
    .from('trail_steps')
    .select('step_id, step_order, day_id, trail_days!inner(trail_id)')
    .eq('step_id', trailDayId)
    .maybeSingle()

  if (!currentStep) {
    return {
      trailDayCompleted: true,
      nextTrailDay: null,
    }
  }

  const { data: nextStep } = await supabase
    .from('trail_steps')
    .select('step_id, title, target_node_ids')
    .eq('day_id', currentStep.day_id)
    .eq('step_order', currentStep.step_order + 1)
    .maybeSingle()

  if (!nextStep) {
    return {
      trailDayCompleted: true,
      nextTrailDay: null,
    }
  }

  const nodeIds: string[] = nextStep.target_node_ids ?? []
  let topicName = ''

  if (nodeIds.length > 0) {
    const { data: node } = await supabase
      .from('taxonomy_tree')
      .select('name')
      .eq('node_id', nodeIds[0])
      .maybeSingle()

    topicName = node?.name ?? ''
  }

  return {
    trailDayCompleted: true,
    nextTrailDay: {
      id: nextStep.step_id,
      title: nextStep.title,
      topic: topicName,
    },
  }
}

const writeBehavioralSummary = async (
  sessionId: string,
  userId: string,
  interactions: InteractionRow[],
) => {
  const interactionIds = interactions.map((interaction) => interaction.interaction_id)
  if (interactionIds.length === 0) return

  ;(async () => {
    try {
      const { createAdminClient: getAdmin } = await import('@/lib/supabase/admin')
      const { generateSessionSummary } = await import('@/lib/adaptive/generateCoachObservation')
      const admin = getAdmin()

      const { data: indicators } = await admin
        .from('cognitive_state_indicators')
        .select('interaction_id, decision_confidence, hesitancy_index, cognitive_load_proxy, anomalous_behavior_likelihood, identity_consistency_score')
        .in('interaction_id', interactionIds)

      if (!indicators || indicators.length === 0) return

      const summary = generateSessionSummary(
        indicators.map((indicator: Record<string, unknown>) => ({
          questionId: indicator.interaction_id as string,
          indicators: {
            decisionConfidence: indicator.decision_confidence as 'high' | 'moderate' | 'low' | 'guessing',
            hesitancyIndex: indicator.hesitancy_index as number,
            cognitiveLoadProxy: indicator.cognitive_load_proxy as number,
            anomalousBehaviorLikelihood: indicator.anomalous_behavior_likelihood as number,
            identityConsistencyScore: indicator.identity_consistency_score as number | null,
          },
        })),
      )

      await admin.from('session_behavioral_summaries').insert({
        session_id: sessionId,
        user_id: userId,
        item_confidence_levels: summary.itemConfidenceLevels,
        session_consistency_score: summary.sessionConsistencyScore,
        session_engagement_score: summary.sessionEngagementScore,
        integrity_flag_counts: summary.integrityFlags,
      })
    } catch {
      // Never block results on behavioral summarization.
    }
  })()
}

const buildEndSessionResult = async ({
  supabase,
  session,
  userId,
  interactions,
  readinessScoreBefore,
  readinessScoreAfter,
  finalStatus,
}: {
  supabase: any
  session: SessionRow
  userId: string
  interactions: InteractionRow[]
  readinessScoreBefore: number
  readinessScoreAfter: number
  finalStatus: string
}): Promise<EndSessionResult> => {
  const totalQuestions = (session.question_ids ?? []).length
  const totalAnswered = interactions.length
  const totalCorrect = interactions.filter((interaction) => interaction.is_correct).length
  const scorePercent =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  const [subjectBreakdown, trailProgress, recommendations] = await Promise.all([
    buildSubjectBreakdown(supabase, interactions),
    buildTrailProgress(supabase, session, finalStatus),
    shouldRunCompletionHooks(finalStatus)
      ? generateRecommendations(userId, session.session_id, 3).catch(() => [])
      : Promise.resolve([]),
  ])

  if (shouldRunCompletionHooks(finalStatus)) {
    void writeBehavioralSummary(session.session_id, userId, interactions)
  }

  const referenceTime = session.completed_at ? new Date(session.completed_at) : new Date()

  return {
    score: {
      correct: totalCorrect,
      total: totalAnswered,
      percent: scorePercent,
    },
    subjectBreakdown,
    readinessScoreBefore,
    readinessScoreAfter,
    readinessScoreDelta: readinessScoreAfter - readinessScoreBefore,
    growthVsPrevious: null,
    resultsAvailableAt: buildResultsAvailableAt(session, referenceTime),
    trailDayCompleted: trailProgress.trailDayCompleted,
    nextTrailDay: trailProgress.nextTrailDay,
    missedQuestionCount: totalQuestions - totalAnswered,
    recommendations,
  }
}

export const endSession = async (
  input: EndSessionInput,
): Promise<EndSessionResult> => {
  try {
    const parsedInput = endSessionInputSchema.parse(input)
    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()

    if (!user) throw new Error('Unauthorized')

    const session = await getOwnedSessionOrThrow<SessionRow>(
      supabase,
      user.id,
      parsedInput.sessionId,
      'session_id, user_id, status, config, question_ids, started_at, completed_at, session_discovery',
    )

    const { data: interactions, error: interactionsError } = await supabase
      .from('user_interactions')
      .select('interaction_id, question_id, is_correct, topic_id, time_spent_ms')
      .eq('session_id', parsedInput.sessionId)
      .eq('user_id', user.id)

    if (interactionsError) throw interactionsError

    const allInteractions = (interactions ?? []) as InteractionRow[]
    const storedFinalization = getStoredFinalization(session)

    if (isTerminalSessionStatus(session.status)) {
      const { data: stats } = await supabase
        .from('user_global_stats')
        .select('global_readiness_score')
        .eq('user_id', user.id)
        .single()

      const readinessScoreAfter = storedFinalization?.readinessScoreAfter ??
        stats?.global_readiness_score ??
        0
      const readinessScoreBefore = storedFinalization?.readinessScoreBefore ??
        readinessScoreAfter

      return await buildEndSessionResult({
        supabase,
        session,
        userId: user.id,
        interactions: allInteractions,
        readinessScoreBefore,
        readinessScoreAfter,
        finalStatus: session.status,
      })
    }

    const finalStatus =
      parsedInput.endReason === 'user_exit'
        ? 'abandoned'
        : parsedInput.endReason === 'auto_submitted'
          ? 'auto_submitted'
          : 'completed'

    const { data: preStats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .single()

    const readinessScoreBefore = preStats?.global_readiness_score ?? 0
    const nowIso = new Date().toISOString()

    // ─── Parallel Finalization Batch ─────────────────────────────────────────
    // Recompute score, update session status, and fetch background metadata simultaneously.
    const [_, { error: updateError }, trailProgress, subjectBreakdown] = await Promise.all([
      recomputeAndSaveReadinessScore(user.id),
      supabase
        .from('quiz_sessions')
        .update({
          status: finalStatus,
          completed_at: nowIso,
          updated_at: nowIso,
          session_discovery: {
            ...(session.session_discovery ?? {}),
            _finalization: {
              readinessScoreBefore,
              // We'll fetch the 'after' score in the next tick
            },
          },
        })
        .eq('session_id', parsedInput.sessionId)
        .eq('user_id', user.id),
      buildTrailProgress(supabase, session, finalStatus),
      buildSubjectBreakdown(supabase, allInteractions),
    ])

    if (updateError) throw updateError

    // Re-fetch only the final score (now confirmed saved by recomputeAndSaveReadinessScore)
    const { data: updatedStats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .single()

    const readinessScoreAfter =
      updatedStats?.global_readiness_score ?? readinessScoreBefore

    // ─── Post-Session background hooks ───────────────────────────────────────
    if (shouldRunCompletionHooks(finalStatus)) {
      // Fire-and-forget: notifications, recommendations, theta, behavioral summary
      void (async () => {
        try {
          const firstTopicId = allInteractions[0]?.topic_id ?? null
          let sessionTopicName = 'your session'

          if (firstTopicId) {
            const { data: topicNode } = await supabase
              .from('taxonomy_tree')
              .select('name')
              .eq('node_id', firstTopicId)
              .maybeSingle()
            if (topicNode?.name) sessionTopicName = topicNode.name
          }

          void triggerScoreChangeNotification(user.id, readinessScoreBefore, readinessScoreAfter, sessionTopicName)
          void triggerZoneTransitionNotification(user.id, readinessScoreBefore, readinessScoreAfter)
          void runPostSessionHooks(user.id)
          void generateRecommendations(user.id, session.session_id, 3)
          void writeUserTheta(user.id, parsedInput.sessionId)
          void writeBehavioralSummary(session.session_id, user.id, allInteractions)
        } catch (e) {
          console.error('[quiz-v2/end-session] Background hooks failed:', e)
        }
      })()
    }

    revalidateDashboardCacheTags(user.id)
    revalidatePath('/dashboard')

    // ─── Build Final Result ──────────────────────────────────────────────────
    const totalAnswered = allInteractions.length
    const totalCorrect = allInteractions.filter((i) => i.is_correct).length
    const scorePercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

    return {
      score: {
        correct: totalCorrect,
        total: totalAnswered,
        percent: scorePercent,
      },
      subjectBreakdown,
      readinessScoreBefore,
      readinessScoreAfter,
      readinessScoreDelta: readinessScoreAfter - readinessScoreBefore,
      growthVsPrevious: null,
      resultsAvailableAt: buildResultsAvailableAt(session, new Date(nowIso)),
      trailDayCompleted: trailProgress.trailDayCompleted,
      nextTrailDay: trailProgress.nextTrailDay,
      missedQuestionCount: (session.question_ids ?? []).length - totalAnswered,
      recommendations: [], // Will be updated on next page load or via background sync
    }
  } catch (error) {
    console.error('[quiz-v2/end-session] Failed:', error)
    throw error
  }
}
