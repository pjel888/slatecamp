'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Pre-populate exam_outcomes rows for all active users before an ALE batch.
 * Called manually (or via cron) 1 day before PRC results release.
 * Users then just confirm pass/fail — all analytics data is already there.
 */
export const prepopulateExamOutcomes = async (
  examBatch: string,
  disciplineId: string,
  examDate: Date
): Promise<{ created: number; errors: string[] }> => {
  const supabase = await createClient()
  const errors: string[] = []
  let created = 0

  // Find all users active in 90 days before exam
  const ninetyDaysBefore = new Date(examDate.getTime() - 90 * 24 * 60 * 60 * 1000)

  const { data: activeUsers } = await supabase
    .from('quiz_sessions')
    .select('user_id')
    .gte('started_at', ninetyDaysBefore.toISOString())
    .eq('status', 'completed')

  const uniqueUserIds = [...new Set((activeUsers || []).map((u: any) => u.user_id as string))]

  for (const userId of uniqueUserIds) {
    try {
      // Peak readiness score
      const { data: peakSnapshot } = await supabase
        .from('readiness_score_snapshots')
        .select('score')
        .eq('user_id', userId)
        .order('score', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Score 7 days before exam
      const sevenBefore = new Date(examDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      const { data: weekBeforeSnapshot } = await supabase
        .from('readiness_score_snapshots')
        .select('score')
        .eq('user_id', userId)
        .lte('computed_at', sevenBefore.toISOString())
        .order('computed_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      // Usage stats
      const { count: totalSessions } = await supabase
        .from('quiz_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')

      const { count: totalQuestions } = await supabase
        .from('user_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Average accuracy
      const { data: interactions } = await supabase
        .from('user_interactions')
        .select('is_correct')
        .eq('user_id', userId)

      const totalAnswered = interactions?.length || 0
      const totalCorrect = interactions?.filter((i: any) => i.is_correct).length || 0
      const avgAccuracy = totalAnswered > 0 ? totalCorrect / totalAnswered : null

      // Days active (distinct dates with sessions)
      const { data: sessions } = await supabase
        .from('quiz_sessions')
        .select('started_at')
        .eq('user_id', userId)
        .eq('status', 'completed')

      const activeDates = new Set(
        (sessions || []).map((s: any) =>
          new Date(s.started_at).toISOString().split('T')[0]
        )
      )

      // Attribution
      const { data: stats } = await supabase
        .from('user_global_stats')
        .select('signup_source, customer_archetype')
        .eq('user_id', userId)
        .single()

      // Insert pre-populated outcome
      const { error } = await supabase.from('exam_outcomes').upsert(
        {
          user_id: userId,
          discipline_id: disciplineId,
          exam_batch: examBatch,
          result: 'did_not_take' as const,
          peak_readiness_score: peakSnapshot?.score || null,
          readiness_score_at_7d_before: weekBeforeSnapshot?.score || null,
          avg_session_accuracy: avgAccuracy,
          total_sessions_completed: totalSessions || 0,
          total_questions_answered: totalQuestions || 0,
          days_active: activeDates.size,
          signup_source: stats?.signup_source || null,
          customer_archetype: stats?.customer_archetype || null,
        },
        { onConflict: 'user_id,exam_batch' }
      )

      if (error) throw error
      created++
    } catch (e) {
      errors.push(`User ${userId}: ${e}`)
    }
  }

  return { created, errors }
}
