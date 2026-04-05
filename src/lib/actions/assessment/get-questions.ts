'use server'

import { createClient } from '@/lib/supabase/server'
import { stripQuestionForClient } from '@/lib/quiz/question-selection'
import type { QuestionForClient } from '@/types/quiz-config'

/**
 * Fetches specific questions for the assessment diagnostic.
 * Strips answer keys for client safety.
 */
export const getAssessmentClientQuestions = async (
  questionIds: string[]
): Promise<QuestionForClient[]> => {
  const supabase = await createClient()
  
  if (questionIds.length === 0) return []

  const { data: questions, error } = await supabase
    .from('questions')
    .select('question_id, text, options, prompt_image_url, difficulty, topic_id, question_type, metadata')
    .in('question_id', questionIds)

  if (error || !questions) return []

  // Reorder to match input IDs and strip for client
  const questionMap = new Map(questions.map((q: any) => [q.question_id, q]))
  const ordered = questionIds
    .map((id) => questionMap.get(id))
    .filter(Boolean)

  return (ordered as any[]).map((q, i) => stripQuestionForClient(q, i + 1))
}
