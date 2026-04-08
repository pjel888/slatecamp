'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { processSuccessiveRelearning } from './successive-relearning'
import type { SRProcessResult } from './successive-relearning'

/**
 * Post-submit hook for Successive Relearning.
 *
 * Call this after submit-answer completes. It checks whether the session
 * is configured for successive relearning (via config.source or a flag)
 * and, if so, advances the SR state machine for the question's topic.
 *
 * This is intentionally decoupled from submit-answer.ts so the core
 * submit path is not modified.
 */
export const srPostSubmit = async (
  userId: string,
  sessionId: string,
  questionId: string,
  isCorrect: boolean,
): Promise<SRProcessResult | null> => {
  const supabase = await createClient()

  // 1. Check session config for SR mode indicator
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('config')
    .eq('session_id', sessionId)
    .single()

  if (!session) return null

  const config = session.config as {
    source?: string
    successiveRelearning?: boolean
  } | null

  // SR mode is triggered by either an explicit flag or a focus_review source
  const isSRSession =
    config?.successiveRelearning === true ||
    config?.source === 'focus_review'

  if (!isSRSession) return null

  // 2. Look up the question's topic_id
  // questions table has admin-only RLS — must use service client
  const serviceClient = await createServiceClient()
  const { data: question } = await serviceClient
    .from('questions')
    .select('topic_id')
    .eq('question_id', questionId)
    .single()

  if (!question?.topic_id) return null

  // 3. Process the SR state machine
  return processSuccessiveRelearning(userId, question.topic_id, isCorrect)
}
