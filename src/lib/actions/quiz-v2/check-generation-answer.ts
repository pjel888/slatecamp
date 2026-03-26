'use server'

import { createClient, getUser } from '@/lib/supabase/server'
import { matchGenerationAnswer } from '@/lib/quiz/answer-matching'
import { resolveRationaleText } from '@/lib/utils/question'
import type { QuestionMatchData } from '@/lib/quiz/answer-matching'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CheckGenerationResult {
  isCorrect: boolean
  closeness: number
  correctAnswer: string
  rationale: string | null
}

// ─── Action ──────────────────────────────────────────────────────────────────

/**
 * Server action to check a generation (non-MCQ) answer.
 * Fetches the question from DB, runs matchGenerationAnswer, and returns
 * correctness info. Does NOT write to user_interactions — that is handled
 * by the main submitAnswer flow.
 */
export const checkGenerationAnswer = async (
  questionId: string,
  userAnswer: string,
): Promise<CheckGenerationResult> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch question with generation-specific columns
  const { data: question, error } = await supabase
    .from('questions')
    .select(
      'question_id, question_type, correct_value, value_tolerance, accepted_answers, correct_option_id, rationale',
    )
    .eq('question_id', questionId)
    .single()

  if (error || !question) throw new Error('Question not found')

  // Cast to the match data shape (DB columns may come as any due to
  // supabase types not being regenerated yet)
  const raw = question as Record<string, unknown>
  const questionType = (raw.question_type as string) ?? 'mcq'

  // If somehow called for an MCQ, return a non-match
  if (questionType === 'mcq') {
    return {
      isCorrect: false,
      closeness: 0,
      correctAnswer: '',
      rationale: null,
    }
  }

  const matchData: QuestionMatchData = {
    question_type: questionType,
    correct_value: raw.correct_value as number | null,
    value_tolerance: raw.value_tolerance as number | null,
    accepted_answers: raw.accepted_answers as string[] | null,
    correct_option_id: raw.correct_option_id as string | null,
  }

  const result = matchGenerationAnswer(questionType, userAnswer, matchData)

  // Build the "correct answer" string for display
  let correctAnswer = ''
  if (questionType === 'numeric' || questionType === 'formula') {
    correctAnswer = matchData.correct_value?.toString() ?? ''
  } else if (questionType === 'short_text') {
    correctAnswer = matchData.accepted_answers?.[0] ?? ''
  }

  const rationale = resolveRationaleText(
    raw.rationale as string | Record<string, string | undefined> | null,
  ) || null

  return {
    isCorrect: result.isCorrect,
    closeness: result.closeness,
    correctAnswer,
    rationale,
  }
}
