'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'

interface SubmitExamOutcomePayload {
  exam_batch: string
  result: 'passed' | 'failed' | 'did_not_take'
  self_reported_score?: number | null
}

export const submitExamOutcome = async (
  payload: SubmitExamOutcomePayload
): Promise<{ success: boolean; error?: string }> => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Pull user stats to snapshot at time of survey
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, signup_source, customer_archetype')
    .eq('user_id', user.id)
    .single()

  // Pull 7-day-before score from readiness_score_snapshots
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: snapshot7d } = await supabase
    .from('readiness_score_snapshots')
    .select('score')
    .eq('user_id', user.id)
    .lte('computed_at', sevenDaysAgo.toISOString())
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Aggregate session stats
  const { count: sessionCount } = await supabase
    .from('quiz_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  const { count: interactionCount } = await supabase
    .from('user_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Get ALE discipline
  const { data: discipline } = await supabase
    .from('disciplines')
    .select('discipline_id')
    .eq('acronym', 'ALE')
    .maybeSingle()

  const { error } = await supabase
    .from('exam_outcomes')
    .upsert({
      user_id: user.id,
      discipline_id: discipline?.discipline_id ?? null,
      exam_batch: payload.exam_batch,
      result: payload.result,
      self_reported_score: payload.self_reported_score ?? null,
      peak_readiness_score: stats?.global_readiness_score ?? null,
      readiness_score_at_7d_before: snapshot7d?.score ?? null,
      total_sessions_completed: sessionCount ?? 0,
      total_questions_answered: interactionCount ?? 0,
      signup_source: stats?.signup_source ?? null,
      customer_archetype: stats?.customer_archetype ?? null,
    }, {
      onConflict: 'user_id,exam_batch',
    })

  if (error) {
    console.error('Exam outcome write failed:', error)
    return { success: false, error: 'Failed to save outcome' }
  }

  // Write ale_result to profiles for Results Day flows
  if (payload.result !== 'did_not_take') {
    const aleResult = payload.result === 'passed' ? 'passed' : 'failed'
    await supabase
      .from('profiles')
      .update({
        ale_result: aleResult,
        // For passers: transition to professional mode
        ...(payload.result === 'passed' ? { account_mode: 'professional_mode' } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    // For non-passers: set reviewer_type for next cycle
    if (payload.result === 'failed') {
      await supabase
        .from('profiles')
        .update({ reviewer_type: 'returning_reviewer' })
        .eq('id', user.id)
      await supabase
        .from('user_global_stats')
        .update({
          is_retaker: true,
          previous_exam_result: 'failed',
          exam_attempt_number: (stats as Record<string, unknown>)?.exam_attempt_number
            ? Number((stats as Record<string, unknown>).exam_attempt_number) + 1
            : 2,
        })
        .eq('user_id', user.id)
    }
  }

  void trackServerEvent('exam_outcome_submitted', {
    exam_batch: payload.exam_batch,
    result: payload.result,
    had_peak_score: !!stats?.global_readiness_score,
  })

  return { success: true }
}
