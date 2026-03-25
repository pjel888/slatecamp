'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { recomputeAndSaveReadinessScore } from '@/lib/actions/readiness-score-update'
import type { EndSessionInput, EndSessionResult } from '@/types/quiz-config'

export const endSession = async (
  input: EndSessionInput,
): Promise<EndSessionResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { sessionId, endReason } = input

  // 1. Fetch session to validate ownership and gather metadata
  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select(
      'session_id, user_id, status, config, question_ids, started_at',
    )
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (sessionError || !session) throw new Error('Session not found')

  const now = new Date()
  const startedAt = session.started_at ? new Date(session.started_at) : now
  const _timeElapsedSeconds = Math.round((now.getTime() - startedAt.getTime()) / 1000)

  // 2. Count answered and correct from user_interactions
  const { data: interactions, error: interactionsError } = await supabase
    .from('user_interactions')
    .select('question_id, is_correct, topic_id, time_spent_ms')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (interactionsError) throw interactionsError

  const allInteractions = interactions ?? []
  const totalAnswered = allInteractions.length
  const totalCorrect = allInteractions.filter(
    (i: { is_correct: boolean }) => i.is_correct,
  ).length
  const totalQuestions = (session.question_ids as string[] ?? []).length
  const scorePercent =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  // 3. Determine final status
  const finalStatus =
    endReason === 'completed' || endReason === 'timer_expired' || endReason === 'auto_submitted'
      ? 'completed'
      : 'abandoned'

  // 4. Get readiness score BEFORE recomputing (from user_global_stats)
  const { data: preStats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  const readinessScoreBefore = preStats?.global_readiness_score ?? 0

  await recomputeAndSaveReadinessScore(user.id)

  // 5. Read UPDATED readiness score
  const { data: updatedStats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  const readinessScoreAfter = updatedStats?.global_readiness_score ?? readinessScoreBefore
  const readinessScoreDelta = readinessScoreAfter - readinessScoreBefore

  // 6. Determine results_available_at
  const config = session.config as { mode?: string; results?: { delayHours?: number } } | null
  const delayHours = config?.results?.delayHours ?? 0
  const resultsAvailableAt =
    delayHours > 0
      ? new Date(now.getTime() + delayHours * 60 * 60 * 1000).toISOString()
      : now.toISOString()

  // 7. Update quiz_sessions
  const { error: updateError } = await supabase
    .from('quiz_sessions')
    .update({
      status: finalStatus,
      completed_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (updateError) throw updateError

  // 8. Subject breakdown from interactions joined with taxonomy
  const topicIds = [
    ...new Set(
      allInteractions
        .map((i: { topic_id: string | null }) => i.topic_id)
        .filter((id): id is string => !!id),
    ),
  ]

  const subjectBreakdown: EndSessionResult['subjectBreakdown'] = []

  if (topicIds.length > 0) {
    const { data: taxonomyNodes } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name, subject_area, discipline_id')
      .in('node_id', topicIds)

    // Group by subject_area
    const subjectMap = new Map<
      string,
      { disciplineId: string; name: string; correct: number; total: number }
    >()

    for (const interaction of allInteractions) {
      const node = (taxonomyNodes ?? []).find(
        (n: { node_id: string }) => n.node_id === interaction.topic_id,
      ) as { node_id: string; name: string; subject_area: string; discipline_id: string } | undefined

      if (!node) continue

      const key = node.subject_area
      const existing = subjectMap.get(key)
      if (existing) {
        existing.total += 1
        if (interaction.is_correct) existing.correct += 1
      } else {
        subjectMap.set(key, {
          disciplineId: node.discipline_id,
          name: node.subject_area,
          correct: interaction.is_correct ? 1 : 0,
          total: 1,
        })
      }
    }

    for (const [disciplineId, data] of subjectMap.entries()) {
      subjectBreakdown.push({
        disciplineId: data.disciplineId,
        disciplineName: data.name,
        correct: data.correct,
        total: data.total,
        percent: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      })
    }
  }

  // 9. Check trail day completion
  const isTrailSession = (config as { setup?: { isTrailSession?: boolean } } | null)?.setup?.isTrailSession ?? false
  const trailDayId = (config as { setup?: { trailDayId?: string | null } } | null)?.setup?.trailDayId ?? null
  let trailDayCompleted = false
  let nextTrailDay: { id: string; title: string; topic: string } | null = null

  if (isTrailSession && trailDayId && finalStatus === 'completed') {
    trailDayCompleted = true

    // Look up next trail step via trail_steps -> trail_days -> trail_id chain
    const { data: currentStep } = await supabase
      .from('trail_steps')
      .select('step_id, step_order, day_id, trail_days!inner(trail_id)')
      .eq('step_id', trailDayId)
      .maybeSingle()

    if (currentStep) {
      const trailId = (currentStep as { trail_days?: { trail_id?: string } }).trail_days?.trail_id

      if (trailId) {
        // Find next step in same trail (via trail_days)
        const { data: nextStep } = await supabase
          .from('trail_steps')
          .select('step_id, title, target_node_ids')
          .eq('day_id', currentStep.day_id)
          .eq('step_order', (currentStep as { step_order: number }).step_order + 1)
          .maybeSingle()

        if (nextStep) {
          // Resolve first target node name for display
          const nodeIds: string[] = (nextStep as { target_node_ids?: string[] }).target_node_ids ?? []
          let topicName = ''
          if (nodeIds.length > 0) {
            const { data: node } = await supabase
              .from('taxonomy_tree')
              .select('name')
              .eq('node_id', nodeIds[0])
              .maybeSingle()
            topicName = node?.name ?? ''
          }

          nextTrailDay = {
            id: nextStep.step_id,
            title: nextStep.title,
            topic: topicName,
          }
        }
      }
    }
  }

  const missedQuestionCount = totalQuestions - totalAnswered

  return {
    score: {
      correct: totalCorrect,
      total: totalAnswered,
      percent: scorePercent,
    },
    subjectBreakdown,
    readinessScoreBefore,
    readinessScoreAfter,
    readinessScoreDelta,
    growthVsPrevious: null, // computed separately via snapshots if needed
    resultsAvailableAt,
    trailDayCompleted,
    nextTrailDay,
    missedQuestionCount,
  }
}
