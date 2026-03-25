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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Fetch session
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  // Fetch questions for this session
  const questionIds: string[] = session.question_ids ?? []
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .in('question_id', questionIds)

  // Build config from session data or use mode preset
  const config: QuizSessionConfig = (session.config as QuizSessionConfig) ??
    MODE_PRESETS[mode as QuizMode] ??
    MODE_PRESETS.camp

  // Strip questions for client (remove correct answers)
  const clientQuestions = (questions ?? []).map((q, i) =>
    stripQuestionForClient(q, i + 1),
  )

  // Dynamic import for client shell
  const { QuizShell } = await import('@/components/quiz-v2/QuizShell')

  return (
    <QuizShell
      sessionId={sessionId}
      config={config}
      questions={clientQuestions}
    />
  )
}

export default QuizSessionPage
