'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { stripQuestionForClient } from '@/lib/quiz/question-selection'
import type { QuestionForClient } from '@/types/quiz-config'

interface SessionQuestionRow {
  question_id: string
  text: string
  options: unknown
  prompt_image_url: string | null
  difficulty: number | null
  topic_id: string | null
  question_type: string | null
}

/**
 * Fetches specific questions for a quiz session.
 * Used for background hydration of large question sets.
 */
export const getSessionQuestions = async (
  sessionId: string,
  questionIds: string[],
  offset: number = 0,
): Promise<QuestionForClient[]> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  if (questionIds.length === 0) return []

  // Verify session ownership
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) throw new Error('Session not found')

  // Fetch batch
  const { data: questions, error } = await supabase
    .from('questions')
    .select('question_id, text, options, prompt_image_url, difficulty, topic_id, question_type')
    .in('question_id', questionIds)

  if (error || !questions) return []

  // Reorder to match input IDs and strip for client
  const typedQuestions = questions as SessionQuestionRow[]
  const questionMap = new Map(typedQuestions.map((question) => [question.question_id, question]))
  const ordered = questionIds
    .map((id) => questionMap.get(id))
    .filter((question): question is SessionQuestionRow => question != null)

  return ordered.map((question, i) => stripQuestionForClient(question, offset + i + 1))
}
