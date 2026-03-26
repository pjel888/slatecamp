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

  // Fetch session — only the columns we need (not select('*'))
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, config, question_ids')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) notFound()

  // Fetch questions for this session — only client-safe columns (no correct_option_id, rationale)
  // Batch in chunks of 80 to avoid Supabase header overflow on fullexam (200 questions)
  const questionIds: string[] = session.question_ids ?? []
  const BATCH_SIZE = 80
  const questionBatches = []
  for (let i = 0; i < questionIds.length; i += BATCH_SIZE) {
    questionBatches.push(questionIds.slice(i, i + BATCH_SIZE))
  }

  const allQuestions: Array<{
    question_id: string
    text: string
    options: unknown
    prompt_image_url: string | null
    difficulty: number
    topic_id: string
  }> = []

  for (const batch of questionBatches) {
    const { data } = await supabase
      .from('questions')
      .select('question_id, text, options, prompt_image_url, difficulty, topic_id')
      .in('question_id', batch)

    if (data) allQuestions.push(...data)
  }

  // Build config from session data or use mode preset
  const config: QuizSessionConfig = (session.config as QuizSessionConfig) ??
    MODE_PRESETS[mode as QuizMode] ??
    MODE_PRESETS.camp

  // Preserve session question order — map by ID then reorder
  const questionMap = new Map(allQuestions.map((q) => [q.question_id, q]))
  const orderedQuestions = questionIds
    .map((id) => questionMap.get(id))
    .filter((q): q is NonNullable<typeof q> => q != null)

  // Strip questions for client (remove correct answers)
  const clientQuestions = orderedQuestions.map((q, i) =>
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
