import { notFound } from 'next/navigation'
import { MODE_PRESETS } from '@/lib/quiz/mode-presets'
import { fetchQuestionsForClient } from '@/lib/quiz/to-client-question'
import { createClient, createServiceClient, getUser } from '@/lib/supabase/server'
import type { QuizAnswerState, QuizMode, QuizSessionConfig } from '@/types/quiz-config'

interface SessionPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

const QuizSessionPage = async ({ params }: SessionPageProps) => {
  const { mode, sessionId } = await params
  const supabase = await createClient()

  const [{ data: { user } }, sessionResponse] = await Promise.all([
    getUser(),
    supabase
      .from('quiz_sessions')
      .select('session_id, user_id, config, question_ids, current_question_index')
      .eq('session_id', sessionId)
      .single(),
  ])

  if (!user) notFound()

  const session = sessionResponse.data
  if (!session || session.user_id !== user.id) notFound()

  const questionIds: string[] = session.question_ids ?? []
  const resumeIndex = Math.min(
    Math.max(session.current_question_index ?? 0, 0),
    Math.max(questionIds.length - 1, 0),
  )
  const initialLoadCount = Math.min(
    questionIds.length,
    Math.max(10, resumeIndex + 10),
  )

  // Use service client for questions — RLS on `questions` table restricts to admins only
  const serviceClient = await createServiceClient()
  const [initialQuestions, interactionsResponse] = await Promise.all([
    fetchQuestionsForClient({
      supabase: serviceClient,
      questionIds: questionIds.slice(0, initialLoadCount),
      offset: 0,
    }),
    supabase
      .from('user_interactions')
      .select('question_id, selected_option_id, is_correct, time_spent_ms, confidence_score, interaction_timestamp, is_flagged')
      .eq('session_id', sessionId)
      .eq('user_id', user.id),
  ])

  const config: QuizSessionConfig =
    (session.config as QuizSessionConfig) ??
    MODE_PRESETS[mode as QuizMode] ??
    MODE_PRESETS.camp

  const restoredAnswers = Object.fromEntries(
    (interactionsResponse.data ?? []).map((interaction) => [
      interaction.question_id,
      {
        selectedOptionId: interaction.selected_option_id,
        confidenceLevel: interaction.confidence_score ?? null,
        isCorrect: interaction.is_correct,
        isSkipped: false,
        isFlagged: interaction.is_flagged ?? false,
        timeStartedMs: 0,
        timeSpentMs: interaction.time_spent_ms ?? 0,
        submittedAt: interaction.interaction_timestamp,
        questionStatus: 'reviewed',
      } satisfies Partial<QuizAnswerState>,
    ]),
  )

  // Dynamic Shell Routing (Phase 3 Consolidation)
  const shellProps = {
    sessionId,
    config,
    questions: initialQuestions,
    allQuestionIds: questionIds,
    totalQuestionCount: questionIds.length,
    initialCurrentIndex: resumeIndex,
    restoredAnswers,
  }

  if (mode === 'full_exam') {
    const { SimulationShell } = await import('@/components/quiz-v2/SimulationShell')
    return <SimulationShell {...shellProps} />
  }

  if (mode === 'endurance') {
    const { EnduranceShell } = await import('@/components/quiz-v2/EnduranceShell')
    return <EnduranceShell {...shellProps} />
  }

  const { StandardQuizShell } = await import('@/components/quiz-v2/StandardQuizShell')
  return <StandardQuizShell {...shellProps} />
}

export default QuizSessionPage
