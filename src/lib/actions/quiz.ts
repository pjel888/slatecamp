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

  // Using upsert with the new unique constraint (user_id, session_id, question_id)
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

  return { success: true }
}

export async function createQuizSession(params: {
  discipline_id: string;
  test_mode: TestMode;
  question_ids: string[];
  subject_ids?: string[];
}) {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      test_mode: params.test_mode,
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
