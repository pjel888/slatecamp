'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type {
  QuizSession,
  Question,
  TestMode,
  SessionStatus,
} from '@/types/app'
import { revalidatePath } from 'next/cache'

export async function getQuizSession(sessionId: string) {
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

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
    // completed_at column may not exist yet (pre-migration). Retry without it.
    if (updates.status === 'completed') {
      const { error: fallbackError } = await supabase
        .from('quiz_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
      if (fallbackError) throw fallbackError
      return { success: true }
    }
    throw error
  }
  return { success: true }
}

export async function deleteQuizSession(sessionId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('quiz_sessions')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/testing')
}

/**
 * Updates or creates a user_node_mastery record based on interaction.
 * Also triggers global readiness recalculation and daily snapshots.
 * Decision: Phase 2 Decisions Step 2.
 */
async function recordMastery(
  user_id: string,
  topic_id: string,
  is_correct: boolean,
  time_spent_ms: number,
  test_mode: TestMode,
  question_difficulty: number = 0.5,
  suspected_guess: boolean = false,
) {
  const supabase = await createClient()

  // 1. Get current node mastery
  const { data: current } = await supabase
    .from('user_node_mastery')
    .select('*')
    .eq('user_id', user_id)
    .eq('topic_id', topic_id)
    .single()

  let alpha = 0.2 // Base EMA smoothing factor
  if (test_mode === 'proof_sim') alpha = 0.6
  else if (test_mode === 'storm') alpha = 0.4
  else if (test_mode === 'chill') alpha = 0.1
  else if (test_mode === 'blindspot') alpha = 0.3

  // Score logic: suspected guesses receive zero mastery bump (nullified)
  let score = is_correct ? 1.0 : 0.0
  if (suspected_guess) {
    score = 0.0
  }

  let new_weight = score
  let total_attempts = 1
  let total_correct = is_correct ? 1 : 0
  let new_avg_time = time_spent_ms

  if (current) {
    // If it was a suspected guess, we don't improve the mastery weight
    // but we still update attempts and avg_time for data accuracy
    new_weight = score * alpha + current.current_mastery_weight * (1 - alpha)
    total_attempts = current.total_attempts + 1
    total_correct = current.total_correct + (is_correct ? 1 : 0)
    new_avg_time = time_spent_ms * alpha + current.avg_time_ms * (1 - alpha)
  }

  // 2. Persist node mastery
  await supabase.from('user_node_mastery').upsert({
    user_id,
    topic_id,
    total_attempts,
    total_correct,
    current_mastery_weight: new_weight,
    avg_time_ms: Math.round(new_avg_time),
    last_encountered: new Date().toISOString(),
  })

  // 3. Recalculate Global Readiness (average of all nodes)
  const { data: allNodesData } = await supabase
    .from('user_node_mastery')
    .select('current_mastery_weight')
    .eq('user_id', user_id)

  const allNodes = (allNodesData || []) as Array<{
    current_mastery_weight: number
  }>

  if (allNodes.length > 0) {
    const sum = allNodes.reduce(
      (acc, node) => acc + node.current_mastery_weight,
      0,
    )
    const globalScore = (sum / allNodes.length) * 100

    await supabase
      .from('user_global_stats')
      .update({
        global_readiness_score: globalScore,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id)

    // 4. Daily Snapshotting (Phase 2 Decisions Step 2)
    const today = new Date().toISOString().split('T')[0]
    const { data: existingSnapshot } = await supabase
      .from('readiness_score_snapshots')
      .select('snapshot_id')
      .eq('user_id', user_id)
      .gte('computed_at', `${today}T00:00:00Z`)
      .lt('computed_at', `${today}T23:59:59Z`)
      .maybeSingle()

    if (!existingSnapshot) {
      await supabase.from('readiness_score_snapshots').insert({
        user_id,
        score: globalScore,
        computed_at: new Date().toISOString(),
      })

      // 5. Snapshot Pruning (Retain only 90 most recent)
      const { data: overflow } = await supabase
        .from('readiness_score_snapshots')
        .select('snapshot_id')
        .eq('user_id', user_id)
        .order('computed_at', { ascending: false })
        .range(90, 999) // skip the 90 we want to keep — only return the excess

      if (overflow && overflow.length > 0) {
        const idsToDelete = overflow.map((s: any) => s.snapshot_id)
        await supabase
          .from('readiness_score_snapshots')
          .delete()
          .in('snapshot_id', idsToDelete)
      }
    }
  }
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
      interaction.is_correct,
      interaction.time_spent_ms,
      session.test_mode,
      difficulty,
      suspected_guess,
    )
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
  return session as QuizSession
}

/**
 * PRD Section 5, Step 10: 24-Hour Review Lock
 */
export async function getReviewLockStatus(sessionId: string) {
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
