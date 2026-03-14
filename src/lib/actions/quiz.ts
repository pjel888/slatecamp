'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import type { QuizSession, Question, TestMode, SessionStatus } from '@/types/app'
import { revalidatePath } from 'next/cache'

export async function getQuizSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
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
  const questionMap = new Map(questions.map(q => [q.question_id, q]))
  return questionIds.map(id => questionMap.get(id)).filter(Boolean) as Question[]
}

export async function getSessionInteractions(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
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
    current_question_index?: number;
    status?: SessionStatus;
    completed_at?: string | null;
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  if (error) throw error
  return { success: true }
}

export async function deleteQuizSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
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
 * Uses EMA (Exponential Moving Average) for mastery weight.
 * PRD Section 8 & 9 Implementation: Lucky Guess Detector™ and Mode-Aware Weighting.
 */
async function recordMastery(
  user_id: string, 
  topic_id: string, 
  is_correct: boolean, 
  time_spent_ms: number,
  test_mode: TestMode,
  question_difficulty: number = 0.5
) {
  const supabase = await createClient()
  
  // 1. Get current mastery
  const { data: current } = await supabase
    .from('user_node_mastery')
    .select('*')
    .eq('user_id', user_id)
    .eq('topic_id', topic_id)
    .single()

  let alpha = 0.2 // Base EMA smoothing factor
  
  // PRD Section 7B, Step 5: Proof Simulation impact is 3x heavier
  if (test_mode === 'proof_sim') alpha = 0.6 
  // PRD Section 11: Storm mode is 2x, Chill is 0.5x
  else if (test_mode === 'storm') alpha = 0.4
  else if (test_mode === 'chill') alpha = 0.1
  else if (test_mode === 'blindspot') alpha = 0.3

  // PRD Section 8: Lucky Guess Detector™
  // Thresholds based on difficulty (0.0 to 1.0)
  // Low threshold: if they answer faster than 3s + (diff * 5s)
  const speedThreshold = 3000 + (question_difficulty * 5000)
  let score = is_correct ? 1.0 : 0.0
  
  if (is_correct && time_spent_ms < speedThreshold) {
    // Lucky Guess: Don't award full credit, reduce impact by half
    score = 0.5 
    // Internally we would flag for re-test ≥ 48h later
  }
  
  let new_weight = score
  let total_attempts = 1
  let total_correct = is_correct ? 1 : 0
  let new_avg_time = time_spent_ms

  if (current) {
    new_weight = (score * alpha) + (current.current_mastery_weight * (1 - alpha))
    total_attempts = current.total_attempts + 1
    total_correct = current.total_correct + (is_correct ? 1 : 0)
    new_avg_time = (time_spent_ms * alpha) + (current.avg_time_ms * (1 - alpha))
  }

  const { error } = await supabase
    .from('user_node_mastery')
    .upsert({
      user_id,
      topic_id,
      total_attempts,
      total_correct,
      current_mastery_weight: new_weight,
      avg_time_ms: Math.round(new_avg_time),
      last_encountered: new Date().toISOString()
    })

  if (error) console.error('Error recording mastery:', error)
}

export async function saveInteraction(interaction: {
  session_id: string;
  question_id: string;
  topic_id: string;
  selected_option_id: string | null;
  is_correct: boolean;
  time_spent_ms: number;
}) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch session mode for recordMastery
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('test_mode')
    .eq('session_id', interaction.session_id)
    .single()

  // Fetch question difficulty
  const { data: question } = await supabase
    .from('questions')
    .select('difficulty')
    .eq('question_id', interaction.question_id)
    .single()

  // 1. Save interaction
  const { error } = await supabase
    .from('user_interactions')
    .upsert({
      ...interaction,
      user_id: user.id,
      interaction_timestamp: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,session_id,question_id'
    })

  if (error) {
    console.error('Save interaction error:', error)
    throw error
  }

  // 2. Record mastery (async)
  if (interaction.topic_id && session) {
    recordMastery(
      user.id, 
      interaction.topic_id, 
      interaction.is_correct, 
      interaction.time_spent_ms, 
      session.test_mode,
      question?.difficulty || 0.5
    )
  }

  return { success: true }
}

export async function createQuizSession(params: {
  discipline_id: string;
  test_mode: TestMode;
  question_ids: string[];
  subject_ids?: string[];
  config?: any;
}) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      discipline_id: params.discipline_id,
      test_mode: params.test_mode,
      config: params.config || {},
      question_ids: params.question_ids,
      subject_ids: params.subject_ids || [],
      status: 'in_progress',
      current_question_index: 0,
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  return session as QuizSession
}

/**
 * PRD Section 5, Step 10: 24-Hour Review Lock (Proof Simulation™ protocol)
 */
export async function getReviewLockStatus(sessionId: string) {
  const supabase = await createClient()
  
  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .select('test_mode, completed_at, status')
    .eq('session_id', sessionId)
    .single()

  if (error || !session) return { isLocked: false }
  if (session.status !== 'completed' || !session.completed_at) return { isLocked: false }

  // Only lock for Storm (Full) and Proof Simulation
  if (session.test_mode !== 'storm' && session.test_mode !== 'proof_sim') {
    return { isLocked: false }
  }

  const completedAt = new Date(session.completed_at).getTime()
  const now = new Date().getTime()
  const hoursSinceCompletion = (now - completedAt) / (1000 * 60 * 60)

  if (hoursSinceCompletion < 24) {
    return { 
      isLocked: true, 
      unlocksAt: new Date(completedAt + (24 * 60 * 60 * 1000)).toISOString(),
      remainingHours: Math.ceil(24 - hoursSinceCompletion)
    }
  }

  return { isLocked: false }
}

export async function getUserReadinessScore() {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return 0

  const { data, error } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return 0
  return data.global_readiness_score
}
