import { notFound } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import type { QuizAnswerState, QuizMode, QuizSessionConfig } from '@/types/quiz-config'
import { MODE_PRESETS } from '@/lib/quiz/mode-presets'
import { stripQuestionForClient } from '@/lib/quiz/question-selection'

interface SessionPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

/** Active quiz session page — fetches session data server-side, renders client shell */
const QuizSessionPage = async ({ params }: SessionPageProps) => {
  const { mode, sessionId } = await params
  const supabase = await createClient()

  // Parallelize auth and session check
  const [{ data: { user } }, sessionResponse] = await Promise.all([
    getUser(),
    supabase
      .from('quiz_sessions')
      .select('session_id, user_id, config, question_ids, current_question_index')
      .eq('session_id', sessionId)
      .single()
  ])

  if (!user) notFound()
  const session = sessionResponse.data

  // Verify session belongs to user
  if (!session || session.user_id !== user.id) notFound()

  // PRUNED HYDRATION STRATEGY:
  // Fetch only the first batch (lookahead) server-side to minimize payload.
  // The client will fetch the remainder in the background.
  const questionIds: string[] = session.question_ids ?? []
  const resumeIndex = Math.min(
    Math.max(session.current_question_index ?? 0, 0),
    Math.max(questionIds.length - 1, 0),
  )
  const INITIAL_LOOKAHEAD = 10
  const initialLoadCount = Math.min(
    questionIds.length,
    Math.max(INITIAL_LOOKAHEAD, resumeIndex + INITIAL_LOOKAHEAD),
  )
  const initialBatchIds = questionIds.slice(0, initialLoadCount)

  const [{ data: initialQuestions }, { data: interactions }] = await Promise.all([
    supabase
      .from('questions')
      .select('question_id, text, options, prompt_image_url, difficulty, topic_id, question_type')
      .in('question_id', initialBatchIds),
    supabase
      .from('user_interactions')
      .select('question_id, selected_option_id, is_correct, time_spent_ms, confidence_score, interaction_timestamp, is_flagged')
      .eq('session_id', sessionId)
      .eq('user_id', user.id),
  ])

  // Build config from session data or use mode preset
  const config: QuizSessionConfig = (session.config as QuizSessionConfig) ??
    MODE_PRESETS[mode as QuizMode] ??
    MODE_PRESETS.camp

  // Preserve session question order for the initial batch
  const questionMap = new Map((initialQuestions ?? []).map((q) => [q.question_id, q]))
  const orderedInitial = initialBatchIds
    .map((id) => questionMap.get(id))
    .filter((q): q is NonNullable<typeof q> => q != null)

  // Strip questions for client
  const initialClientQuestions = orderedInitial.map((q, i) =>
    stripQuestionForClient(q as any, i + 1),
  )

  const restoredAnswers = Object.fromEntries(
    (interactions ?? []).map((interaction) => [
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

  // Dynamic import for client shell
  const { QuizShell } = await import('@/components/quiz-v2/QuizShell')

  return (
    <QuizShell
      sessionId={sessionId}
      config={config}
      questions={initialClientQuestions}
      allQuestionIds={questionIds}
      totalQuestionCount={questionIds.length}
      initialCurrentIndex={resumeIndex}
      restoredAnswers={restoredAnswers}
    />
  )
}

export default QuizSessionPage
