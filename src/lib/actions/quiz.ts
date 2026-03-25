'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { QuizSessionIdSchema } from '@/lib/validations'
import { computeUserSignals } from '@/lib/signals/compute'
import { recomputeAndSaveReadinessScore } from '@/lib/actions/readiness-score-update'
import { deriveQualityRating, updateSrsSchedule } from '@/lib/srs/update'
import { checkDailyCap, incrementDailyCount } from '@/lib/paywall/daily-cap'
import { computeAccuracyByBlock, updateEnduranceSignals } from '@/lib/endurance/compute'
import type {
  QuizSession,
  Question,
  TestMode,
  SessionStatus,
} from '@/types/app'
import { revalidatePath } from 'next/cache'
import { trackServerEvent } from '@/lib/analytics-server'

export async function getQuizSession(sessionId: string) {
  const parsed = QuizSessionIdSchema.safeParse(sessionId)
  if (!parsed.success) {
    throw new Error(`Invalid session ID: ${parsed.error.message}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return session as QuizSession
}

export async function getSessionQuestions(questionIds: string[]) {
  const supabase = await createClient()
  const { data: questions, error } = await supabase
    .from('questions')
    .select('*')
    .in('question_id', questionIds)

  if (error) throw error

  // Sort questions to match the order in questionIds
  const questionMap = new Map(questions.map((q: any) => [q.question_id, q]))
  return questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean) as Question[]
}

export async function getSessionInteractions(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: interactions, error } = await supabase
    .from('user_interactions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error
  return interactions
}

export async function updateQuizSession(
  sessionId: string,
  updates: {
    current_question_index?: number
    status?: SessionStatus
  },
) {
  const parsed = QuizSessionIdSchema.safeParse(sessionId)
  if (!parsed.success) {
    throw new Error(`Invalid session ID: ${parsed.error.message}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // ── Session completion: compute readiness score BEFORE setting status ──
  // The snapshot trigger fires on status='completed' and reads global_readiness_score
  // + readiness_sub_scores from user_global_stats. Both must be fresh.
  if (updates.status === 'completed') {
    await recomputeAndSaveReadinessScore(user.id)
  }

  const fullPayload = {
    ...updates,
    ...(updates.status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('quiz_sessions')
    .update(fullPayload)
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[QUIZ] updateQuizSession failed:', error)
    throw error
  }

  // Fire-and-forget post-completion work
  if (updates.status === 'completed') {
    void computeUserSignals(user.id)
    void writeAccuracyByBlock(supabase, sessionId, user.id)

    // D2 Event 3: assessment_completed — track when assessment session finishes
    const { data: completedSession } = await supabase
      .from('quiz_sessions')
      .select('config, question_ids')
      .eq('session_id', sessionId)
      .single()

    const isAssessment = completedSession?.config?.diagnostic || completedSession?.config?.isAssessment
    if (isAssessment) {
      const { count: interactionCount } = await supabase
        .from('user_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)

      const { data: globalStats } = await supabase
        .from('user_global_stats')
        .select('global_readiness_score')
        .eq('user_id', user.id)
        .single()

      void trackServerEvent('assessment_completed', {
        session_id: sessionId,
        score: globalStats?.global_readiness_score ?? 0,
        questions_answered: interactionCount ?? 0,
      })
    }
  }

  return { success: true }
}

export async function deleteQuizSession(sessionId: string) {
  const parsed = QuizSessionIdSchema.safeParse(sessionId)
  if (!parsed.success) {
    throw new Error(`Invalid session ID: ${parsed.error.message}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Mark as abandoned instead of deleting — user_interactions FK prevents hard delete
  const { error } = await supabase
    .from('quiz_sessions')
    .update({ status: 'abandoned' as SessionStatus, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/testing')
}

/**
 * Updates or creates a user_node_mastery record based on interaction.
 * Writes all 5 anti-inflation columns alongside the existing mastery data.
 *
 * Global readiness score is now computed at session completion
 * (via recomputeAndSaveReadinessScore) rather than per-answer.
 */
export async function recordMastery(
  user_id: string,
  topic_id: string,
  question_id: string,
  is_correct: boolean,
  time_spent_ms: number,
  test_mode: TestMode,
  question_difficulty: number = 0.5,
  suspected_guess: boolean = false,
) {
  const supabase = await createClient()

  // 1. Get current node mastery (select all columns including new anti-inflation ones)
  const { data: current } = await supabase
    .from('user_node_mastery')
    .select('*')
    .eq('user_id', user_id)
    .eq('topic_id', topic_id)
    .maybeSingle()

  // 2. Fetch taxonomy metadata for this node (difficulty 1-4 and bloom_level)
  const { data: taxonomyNode } = await supabase
    .from('taxonomy_tree')
    .select('difficulty, bloom_level')
    .eq('node_id', topic_id)
    .maybeSingle()

  const taxonomyDifficulty: number | null = taxonomyNode?.difficulty ?? null
  const bloomLevel: string | null = taxonomyNode?.bloom_level ?? null

  // 3. EMA smoothing factor by mode
  let alpha = 0.2
  if (test_mode === 'proof_sim') alpha = 0.6
  else if (test_mode === 'storm') alpha = 0.4
  else if (test_mode === 'chill') alpha = 0.1
  else if (test_mode === 'blindspot') alpha = 0.3

  // 4. Lucky guess: 0.3× weight instead of full contribution
  // Wrong answers always get full weight (wrong answers should fully penalize)
  const baseWeight = suspected_guess ? 0.3 : 1.0
  const answerValue = is_correct ? 1.0 : 0.0

  const prevMastery = current?.current_mastery_weight ?? 0.0
  const new_weight = prevMastery + alpha * baseWeight * (answerValue - prevMastery)

  const total_attempts = (current?.total_attempts ?? 0) + 1
  const total_correct = (current?.total_correct ?? 0) + (is_correct ? 1 : 0)

  const prevAvgTime = current?.avg_time_ms ?? 0
  const new_avg_time = Math.round(
    prevAvgTime + (time_spent_ms - prevAvgTime) / total_attempts,
  )

  // 5. Anti-inflation column updates

  // Vector 1: consecutive correct streak (resets on wrong)
  const prevStreak = current?.consecutive_correct_streak ?? 0
  const newStreak = is_correct ? prevStreak + 1 : 0

  // Vector 2: highest difficulty correct (only increases, never decreases)
  const prevHighestDiff = current?.highest_difficulty_correct ?? 0
  const newHighestDiff = (is_correct && taxonomyDifficulty !== null)
    ? Math.max(prevHighestDiff, taxonomyDifficulty)
    : prevHighestDiff

  // Vector 4: Bloom's cognitive level flags (one-way — once true, stays true)
  const newHasApply = (current?.has_bloom_apply_correct ?? false)
    || (is_correct && (bloomLevel === 'apply' || bloomLevel === 'analyze'))
  const newHasAnalyze = (current?.has_bloom_analyze_correct ?? false)
    || (is_correct && bloomLevel === 'analyze')

  // Vector 5: distinct questions seen (check if this question_id is new for this node)
  const { count: prevSeenCount } = await supabase
    .from('user_interactions')
    .select('interaction_id', { count: 'exact', head: true })
    .eq('user_id', user_id)
    .eq('topic_id', topic_id)
    .eq('question_id', question_id)
  const isNewQuestion = (prevSeenCount ?? 0) <= 1 // <= 1 because the current answer may already be inserted
  const prevDistinct = current?.distinct_questions_seen ?? 0
  const newDistinct = isNewQuestion ? prevDistinct + 1 : prevDistinct

  // 6. Persist node mastery with all columns
  await supabase.from('user_node_mastery').upsert(
    {
      user_id,
      topic_id,
      total_attempts,
      total_correct,
      current_mastery_weight: Math.min(Math.max(new_weight, 0), 1),
      avg_time_ms: new_avg_time,
      last_encountered: new Date().toISOString(),
      consecutive_correct_streak: newStreak,
      highest_difficulty_correct: newHighestDiff,
      has_bloom_apply_correct: newHasApply,
      has_bloom_analyze_correct: newHasAnalyze,
      distinct_questions_seen: newDistinct,
    },
    { onConflict: 'user_id, topic_id' },
  )

  // Note: Global readiness score is now computed at session completion
  // via recomputeAndSaveReadinessScore() called from updateQuizSession().
  // The snapshot trigger fires when the session status changes to 'completed'.
}

export async function saveInteraction(interaction: {
  session_id: string
  question_id: string
  topic_id: string
  selected_option_id: string | null
  is_correct: boolean
  time_spent_ms: number
  is_flagged?: boolean
  answer_changes?: number
  options_eliminated?: number
  confidence?: 'sure' | 'unsure' | null
  rationale_view_ms?: number
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('test_mode')
    .eq('session_id', interaction.session_id)
    .single()

  const { data: question } = await supabase
    .from('questions')
    .select('difficulty')
    .eq('question_id', interaction.question_id)
    .single()

  const difficulty = question?.difficulty || 0.5
  const speedThreshold = 3000 + (difficulty * 5000)
  const suspected_guess = interaction.is_correct && interaction.time_spent_ms < speedThreshold

  const { error } = await supabase.from('user_interactions').upsert(
    {
      session_id: interaction.session_id,
      question_id: interaction.question_id,
      topic_id: interaction.topic_id,
      selected_option_id: interaction.selected_option_id,
      is_correct: interaction.is_correct,
      time_spent_ms: interaction.time_spent_ms,
      is_flagged: interaction.is_flagged ?? false,
      answer_changes: interaction.answer_changes ?? 0,
      options_eliminated: interaction.options_eliminated ?? 0,
      confidence: interaction.confidence ?? null,
      rationale_view_ms: interaction.rationale_view_ms ?? 0,
      user_id: user.id,
      interaction_timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,session_id,question_id',
    },
  )

  if (error) {
    // Telemetry columns (is_flagged, answer_changes, options_eliminated) may not exist yet.
    // Retry with base columns only so the core interaction is never lost.
    const { error: fallbackError } = await supabase.from('user_interactions').upsert(
      {
        session_id: interaction.session_id,
        question_id: interaction.question_id,
        topic_id: interaction.topic_id,
        selected_option_id: interaction.selected_option_id,
        is_correct: interaction.is_correct,
        time_spent_ms: interaction.time_spent_ms,
        user_id: user.id,
        interaction_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,session_id,question_id' },
    )
    if (fallbackError) throw fallbackError
  }

  if (interaction.topic_id && session) {
    // Fire and forget (or await if strict real-time is needed)
    await recordMastery(
      user.id,
      interaction.topic_id,
      interaction.question_id,
      interaction.is_correct,
      interaction.time_spent_ms,
      session.test_mode,
      difficulty,
      suspected_guess,
    )

    // SRS scheduling update (Camp Mode only — Storm/Proof use different cadence)
    if (session.test_mode === 'camp' || session.test_mode === 'blindspot') {
      const { data: currentMastery } = await supabase
        .from('user_node_mastery')
        .select('avg_time_ms')
        .eq('user_id', user.id)
        .eq('topic_id', interaction.topic_id)
        .single()

      const quality = await deriveQualityRating({
        isCorrect: interaction.is_correct,
        timeSpentMs: interaction.time_spent_ms,
        avgTimeMs: currentMastery?.avg_time_ms ?? 10000,
        confidence: interaction.confidence ?? null,
        isSuspectedLuckyGuess: suspected_guess,
      })
      void updateSrsSchedule(user.id, interaction.topic_id, quality)
    }
  }

  // Increment daily question count for free users (fire-and-forget)
  void incrementDailyCount(user.id)

  return { success: true }
}

export async function savePreSessionConfidence(
  sessionId: string,
  ratings: Record<string, number>,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('quiz_sessions')
    .update({ pre_session_confidence_ratings: ratings })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) {
    // Column may not exist — silently fail so quiz isn't blocked
    console.warn('[confidence] Could not save pre-session ratings:', error.message)
    return { success: false }
  }
  return { success: true }
}

export async function saveErrorType(
  sessionId: string,
  questionId: string,
  errorType: string,
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('user_interactions')
    .update({ error_type: errorType })
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .eq('user_id', user.id)

  if (error) {
    console.warn('[error_type] Could not save error type:', error.message)
    return { success: false }
  }
  return { success: true }
}

export async function getQuestionsByTopic(nodeId: string, limit: number = 20) {
  const supabase = await createClient()

  // 1. Get all descendant leaf nodes using a recursive search
  // We fetch the whole tree for the discipline and filter in JS for simplicity, 
  // or use a targeted query if we know the depth.
  const { data: allNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, parent_id, is_leaf')
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)

  if (!allNodes) return []

  const leafIds: string[] = []
  const findLeafs = (id: string) => {
    const node = allNodes.find(n => n.node_id === id)
    if (!node) return
    if (node.is_leaf) {
      leafIds.push(id)
    } else {
      const children = allNodes.filter(n => n.parent_id === id)
      children.forEach(child => findLeafs(child.node_id))
    }
  }

  findLeafs(nodeId)

  if (leafIds.length === 0) return []

  // 2. Fetch random questions from these leaf nodes
  const { data: questions, error } = await supabase
    .from('questions')
    .select('question_id')
    .in('topic_id', leafIds)
    .limit(limit)

  if (error) throw error
  return (questions || []).map(q => q.question_id)
}

/**
 * Feature 6: Successive Relearning Loop
 * Checks if the user has previously answered this question incorrectly.
 * If so, returns 3 additional questions from the same topic for immediate re-study.
 */
export async function checkAndGetRelearningQuestions(
  questionId: string,
  topicId: string,
  currentSessionQuestionIds: string[],
): Promise<{ isRepeatFailure: boolean; restudyQuestionIds: string[] }> {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return { isRepeatFailure: false, restudyQuestionIds: [] }

  // Check if user has previously answered this question incorrectly
  const { count } = await supabase
    .from('user_interactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .eq('is_correct', false)

  if (!count || count === 0) {
    return { isRepeatFailure: false, restudyQuestionIds: [] }
  }

  // Repeat failure detected — fetch 3 questions from the same topic
  // Exclude questions already in this session
  const { data: restudyQuestions } = await supabase
    .from('questions')
    .select('question_id')
    .eq('topic_id', topicId)
    .not('question_id', 'in', `(${currentSessionQuestionIds.map(id => `"${id}"`).join(',')})`)
    .limit(3)

  return {
    isRepeatFailure: true,
    restudyQuestionIds: (restudyQuestions || []).map(
      (q: { question_id: string }) => q.question_id,
    ),
  }
}

/**
 * Feature 5: Contextual Variation Practice
 * Selects one question per application_context value for each target node.
 * This forces pattern recognition across recall, calculation, design, code, and scenario contexts.
 */
export async function selectContextualVariationQuestions(
  nodeIds: string[],
  totalCount: number,
): Promise<string[]> {
  const supabase = await createClient()
  const contexts = ['recall', 'calculation', 'design_application', 'code_interpretation', 'client_scenario']
  const selectedIds: string[] = []

  for (const nodeId of nodeIds) {
    for (const context of contexts) {
      if (selectedIds.length >= totalCount) break

      const { data } = await supabase
        .from('questions')
        .select('question_id')
        .eq('topic_id', nodeId)
        .eq('application_context', context)
        .limit(1)
        .order('difficulty', { ascending: false })

      if (data?.[0]) selectedIds.push(data[0].question_id)
    }
    if (selectedIds.length >= totalCount) break
  }

  // If not enough context variety, fill with remaining questions from those nodes
  if (selectedIds.length < totalCount) {
    const { data: fallback } = await supabase
      .from('questions')
      .select('question_id')
      .in('topic_id', nodeIds)
      .not('question_id', 'in', `(${selectedIds.map(id => `"${id}"`).join(',')})`)
      .limit(totalCount - selectedIds.length)

    if (fallback) {
      selectedIds.push(...fallback.map((q: { question_id: string }) => q.question_id))
    }
  }

  return selectedIds
}

export async function createQuizSession(params: {
  discipline_id: string
  test_mode: TestMode
  question_ids: string[]
  subject_ids?: string[]
  topic_ids?: string[]
  config?: any
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Free tier daily cap enforcement — check BEFORE creating the session
  const capResult = await checkDailyCap(user.id)
  if (!capResult.allowed) {
    return {
      error: 'daily_cap_reached',
      remaining: capResult.remaining,
      cap: capResult.cap,
      resetsAt: capResult.resetsAt,
    } as unknown as QuizSession
  }

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      discipline_id: params.discipline_id,
      test_mode: params.test_mode,
      config: {
        ...params.config,
        topic_ids: params.topic_ids || []
      },
      question_ids: params.question_ids,
      subject_ids: params.subject_ids || [],
      status: 'in_progress',
      current_question_index: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  // Track first_session_at for marketing attribution
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('first_session_at')
    .eq('user_id', user.id)
    .single()

  if (stats && !stats.first_session_at) {
    await supabase
      .from('user_global_stats')
      .update({ first_session_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  // D2 Event 2: assessment_started — track when diagnostic/assessment session begins
  const isAssessment = params.config?.diagnostic || params.config?.isAssessment
  if (isAssessment) {
    void trackServerEvent('assessment_started', {
      session_id: session.session_id,
      question_count: params.question_ids.length,
    })
    // Write assessment_started_at to user_global_stats (gap 2.2)
    void supabase
      .from('user_global_stats')
      .update({ assessment_started_at: new Date().toISOString() })
      .eq('user_id', user.id)
  }

  return session as QuizSession
}

/**
 * PRD Section 5, Step 10: 24-Hour Review Lock
 */
export async function getReviewLockStatus(sessionId: string) {
  const parsed = QuizSessionIdSchema.safeParse(sessionId)
  if (!parsed.success) {
    throw new Error(`Invalid session ID: ${parsed.error.message}`)
  }

  const supabase = await createClient()

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select('test_mode, completed_at, status')
    .eq('session_id', sessionId)
    .single()

  if (error || !session) return { isLocked: false }
  if (session.status !== 'completed' || !session.completed_at)
    return { isLocked: false }

  if (session.test_mode !== 'storm' && session.test_mode !== 'proof_sim') {
    return { isLocked: false }
  }

  const completedAt = new Date(session.completed_at).getTime()
  const now = new Date().getTime()
  const hoursSinceCompletion = (now - completedAt) / (1000 * 60 * 60)

  if (hoursSinceCompletion < 24) {
    return {
      isLocked: true,
      unlocksAt: new Date(completedAt + 24 * 60 * 60 * 1000).toISOString(),
      remainingHours: Math.ceil(24 - hoursSinceCompletion),
    }
  }

  return { isLocked: false }
}

export async function getUserReadinessScore() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return 0

  const { data, error } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return 0
  return data.global_readiness_score
}

export async function getMostDecayedNode(disciplineId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) return null

  // 1. Get all leaf node IDs + names for this discipline
  const { data: leafNodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name')
    .eq('discipline_id', disciplineId)
    .eq('is_leaf', true)
    .eq('is_cross_ref_only', false)
    .is('deprecated_at', null)
    .not('ale_id', 'is', null)

  if (!leafNodes?.length) return null

  const leafIds = leafNodes.map((n: { node_id: string }) => n.node_id)
  const leafMap = new Map(leafNodes.map((n: { node_id: string; name: string }) => [n.node_id, n.name]))

  // 2. Find the weakest encountered node
  const { data: weakest } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, total_attempts')
    .eq('user_id', user.id)
    .in('topic_id', leafIds)
    .gt('total_attempts', 0)
    .order('current_mastery_weight', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!weakest) return null

  return {
    nodeId: weakest.topic_id as string,
    nodeName: (leafMap.get(weakest.topic_id) ?? 'Unknown Topic') as string,
    masteryScore: Math.round((weakest.current_mastery_weight as number) * 100),
  }
}

/**
 * Write accuracy-by-block data to quiz_sessions on completion.
 * Enables Endurance Cycle analysis and Cognitive Stamina chart.
 * Silent on failure.
 */
const writeAccuracyByBlock = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  userId: string,
): Promise<void> => {
  try {
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('question_order, is_correct')
      .eq('session_id', sessionId)
      .eq('user_id', userId)
      .order('question_order', { ascending: true })

    if (interactions && interactions.length > 0) {
      const blocks = computeAccuracyByBlock(
        interactions as { question_order: number; is_correct: boolean }[],
      )
      await supabase
        .from('quiz_sessions')
        .update({ accuracy_by_block: blocks })
        .eq('session_id', sessionId)

      // If this is an endurance session, update endurance signals
      const { data: sessionData } = await supabase
        .from('quiz_sessions')
        .select('is_endurance_session')
        .eq('session_id', sessionId)
        .single()

      if (sessionData?.is_endurance_session) {
        const { data: signals } = await supabase
          .from('user_computed_signals')
          .select('endurance_baseline_items')
          .eq('user_id', userId)
          .maybeSingle()

        const isCalibrationWeek = !signals?.endurance_baseline_items
        void updateEnduranceSignals(userId, blocks, isCalibrationWeek)
      }
    }
  } catch {
    // Silent — block accuracy is non-critical
  }
}
