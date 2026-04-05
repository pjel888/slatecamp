import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { QuizMode, QuizSessionConfig } from '@/types/quiz-config'
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
    supabase.auth.getUser(),
    supabase
      .from('quiz_sessions')
      .select('session_id, user_id, config, question_ids')
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
  const INITIAL_BATCH_SIZE = 10
  const initialBatchIds = questionIds.slice(0, INITIAL_BATCH_SIZE)

  const { data: initialQuestions } = await supabase
    .from('questions')
    .select('question_id, text, options, prompt_image_url, difficulty, topic_id, question_type, metadata')
    .in('question_id', initialBatchIds)

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

  // Dynamic import for client shell
  const { QuizShell } = await import('@/components/quiz-v2/QuizShell')

  return (
    <QuizShell
      sessionId={sessionId}
      config={config}
      questions={initialClientQuestions}
      allQuestionIds={questionIds}
    />
  )
}

export default QuizSessionPage
