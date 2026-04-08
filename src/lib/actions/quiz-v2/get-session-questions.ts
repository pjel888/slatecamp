'use server'

import { createClient, createServiceClient, getUser } from '@/lib/supabase/server'
import { getOwnedSessionOrThrow } from '@/lib/actions/quiz-v2/session-helpers'
import { sessionQuestionSliceInputSchema, type SessionQuestionSliceInput } from '@/lib/actions/quiz-v2/schemas'
import { fetchQuestionsForClient } from '@/lib/quiz/to-client-question'
import type { QuestionForClient } from '@/types/quiz-config'

interface SessionQuestionIdsRow {
  question_ids: string[] | null
}

export const getSessionQuestions = async (
  input: SessionQuestionSliceInput,
): Promise<QuestionForClient[]> => {
  try {
    const parsedInput = sessionQuestionSliceInputSchema.parse(input)
    const supabase = await createClient()
    const {
      data: { user },
    } = await getUser()

    if (!user) throw new Error('Unauthorized')

    const session = await getOwnedSessionOrThrow<SessionQuestionIdsRow>(
      supabase,
      user.id,
      parsedInput.sessionId,
      'question_ids',
    )

    const questionIds = session.question_ids ?? []
    const slice = questionIds.slice(
      parsedInput.offset,
      parsedInput.offset + parsedInput.limit,
    )

    // Use service client for questions — RLS on `questions` table restricts to admins only
    const serviceClient = await createServiceClient()
    return await fetchQuestionsForClient({
      supabase: serviceClient,
      questionIds: slice,
      offset: parsedInput.offset,
    })
  } catch (error) {
    console.error('[quiz-v2/get-session-questions] Failed:', error)
    throw error
  }
}
