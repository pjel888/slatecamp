'use server'

import { createClient } from '@/lib/supabase/server'
import { wrapResult, wrapError } from '@/lib/actions/analytics/shared-helpers'
import type { AnalyticsResult } from '@/lib/actions/analytics/shared-helpers'

export type QuestionHealthRow = {
  questionId: string
  totalAttempts: number
  accuracy: number
  avgTimeMs: number
  flags: string[]
}

export const getQuestionHealthData = async (): Promise<AnalyticsResult<QuestionHealthRow[]>> => {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('user_interactions')
      .select('question_id, is_correct, time_taken_ms')

    if (error) throw new Error(error.message)

    const rows = (data ?? []) as Array<{
      question_id: string | null
      is_correct: boolean | null
      time_taken_ms: number | null
    }>

    if (rows.length === 0) return wrapResult([])

    // Aggregate by question
    const byQuestion = new Map<
      string,
      { correct: number; total: number; totalTimeMs: number }
    >()

    for (const row of rows) {
      if (!row.question_id) continue
      const agg = byQuestion.get(row.question_id) ?? { correct: 0, total: 0, totalTimeMs: 0 }
      agg.total += 1
      if (row.is_correct) agg.correct += 1
      agg.totalTimeMs += row.time_taken_ms ?? 0
      byQuestion.set(row.question_id, agg)
    }

    const flagged: QuestionHealthRow[] = []

    for (const [questionId, agg] of byQuestion) {
      if (agg.total < 3) continue // not enough data
      const accuracy = Math.round((agg.correct / agg.total) * 1000) / 10
      const avgTimeMs = Math.round(agg.totalTimeMs / agg.total)
      const flags: string[] = []

      if (accuracy < 20) flags.push('Too Hard')
      if (accuracy > 95) flags.push('Too Easy')
      if (avgTimeMs > 180_000) flags.push('Confusing')

      if (flags.length > 0) {
        flagged.push({ questionId, totalAttempts: agg.total, accuracy, avgTimeMs, flags })
      }
    }

    // Sort by most attempts desc, return top 20
    flagged.sort((a, b) => b.totalAttempts - a.totalAttempts)

    return wrapResult(flagged.slice(0, 20))
  } catch (err) {
    return wrapError(
      err instanceof Error ? err.message : 'Failed to load question health data',
      [],
    )
  }
}
