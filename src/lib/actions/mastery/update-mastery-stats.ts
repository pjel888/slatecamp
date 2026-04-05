'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Updates core mastery statistics for a user-topic pair.
 * Ported from legacy recordMastery logic.
 */
export const updateMasteryStats = async (params: {
  userId: string
  topicId: string
  questionId: string
  isCorrect: boolean
  timeSpentMs: number
  testMode: string
  difficulty?: number
  isSuspectedLuckyGuess?: boolean
}): Promise<void> => {
  const {
    userId,
    topicId,
    questionId,
    isCorrect,
    timeSpentMs,
    testMode,
    difficulty = 0.5,
    isSuspectedLuckyGuess = false,
  } = params

  try {
    const supabase = await createClient()

    // 1. Get current node mastery
    const { data: current } = await supabase
      .from('user_node_mastery')
      .select('current_mastery_weight, total_attempts, total_correct, avg_time_ms, consecutive_correct_streak, highest_difficulty_correct, has_bloom_apply_correct, has_bloom_analyze_correct, distinct_questions_seen')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .maybeSingle()

    // 2. Fetch taxonomy metadata
    const { data: taxonomyNode } = await supabase
      .from('taxonomy_tree')
      .select('difficulty, bloom_level')
      .eq('node_id', topicId)
      .maybeSingle()

    const taxonomyDifficulty = taxonomyNode?.difficulty ?? null
    const bloomLevel = taxonomyNode?.bloom_level ?? null

    // 3. EMA smoothing factor by mode
    let alpha = 0.2
    if (testMode === 'fullexam' || testMode === 'proof_sim') alpha = 0.6
    else if (testMode === 'storm') alpha = 0.4
    else if (testMode === 'chill') alpha = 0.1
    else if (testMode === 'focused' || testMode === 'blindspot') alpha = 0.3

    // 4. Contribution weighting
    const baseWeight = isSuspectedLuckyGuess ? 0.5 : 1.0
    const answerValue = isCorrect ? 1.0 : 0.0

    const prevMastery = current?.current_mastery_weight ?? 0.0
    const newWeight = prevMastery + alpha * baseWeight * (answerValue - prevMastery)

    const totalAttempts = (current?.total_attempts ?? 0) + 1
    const totalCorrect = (current?.total_correct ?? 0) + (isCorrect ? 1 : 0)

    const prevAvgTime = current?.avg_time_ms ?? 0
    const newAvgTime = Math.round(
      prevAvgTime + (timeSpentMs - prevAvgTime) / totalAttempts,
    )

    // 5. Anti-inflation updates
    const prevStreak = current?.consecutive_correct_streak ?? 0
    const newStreak = isCorrect ? prevStreak + 1 : 0

    const prevHighestDiff = current?.highest_difficulty_correct ?? 0
    const newHighestDiff = (isCorrect && taxonomyDifficulty !== null)
      ? Math.max(prevHighestDiff, taxonomyDifficulty)
      : prevHighestDiff

    const newHasApply = (current?.has_bloom_apply_correct ?? false)
      || (isCorrect && (bloomLevel === 'apply' || bloomLevel === 'analyze'))
    const newHasAnalyze = (current?.has_bloom_analyze_correct ?? false)
      || (isCorrect && bloomLevel === 'analyze')

    const { count: prevSeenCount } = await supabase
      .from('user_interactions')
      .select('interaction_id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('question_id', questionId)
    
    // If count is <= 1, it means this is either the first time or we just inserted the current one
    const isNewQuestion = (prevSeenCount ?? 0) <= 1
    const prevDistinct = current?.distinct_questions_seen ?? 0
    const newDistinct = isNewQuestion ? prevDistinct + 1 : prevDistinct

    // 6. Upsert
    await supabase.from('user_node_mastery').upsert(
      {
        user_id: userId,
        topic_id: topicId,
        total_attempts: totalAttempts,
        total_correct: totalCorrect,
        current_mastery_weight: Math.min(Math.max(newWeight, 0), 1),
        avg_time_ms: newAvgTime,
        last_encountered: new Date().toISOString(),
        consecutive_correct_streak: newStreak,
        highest_difficulty_correct: newHighestDiff,
        has_bloom_apply_correct: newHasApply,
        has_bloom_analyze_correct: newHasAnalyze,
        distinct_questions_seen: newDistinct,
      },
      { onConflict: 'user_id, topic_id' },
    )
  } catch (err) {
    console.error('[MASTERY-STATS] updateMasteryStats failed:', err)
  }
}
