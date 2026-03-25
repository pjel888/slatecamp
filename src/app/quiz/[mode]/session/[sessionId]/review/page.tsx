import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { QuizMode, ReviewDataResult, ReviewQuestionData } from '@/types/quiz-config'
import { ReviewMode } from '@/components/quiz-v2/review/ReviewMode'

interface ReviewPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

/** Review mode page — question-by-question review with annotations */
const QuizReviewPage = async ({ params }: ReviewPageProps) => {
  const { mode, sessionId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  // Fetch session — only 'completed' is valid (auto_submitted maps to completed in endSession)
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, question_ids')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!session) notFound()

  // Fetch questions with full data + user interactions
  const questionIds: string[] = (session.question_ids as string[]) ?? []
  const { data: questions } = await supabase
    .from('questions')
    .select('question_id, text, options, correct_option_id, rationale, prompt_image_url')
    .in('question_id', questionIds)

  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('question_id, selected_option_id, is_correct, confidence, is_flagged')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)

  // Build interaction map
  type InteractionRow = {
    question_id: string
    selected_option_id: string | null
    is_correct: boolean
    confidence: string | null
    is_flagged: boolean
  }

  const allInteractions = (interactions ?? []) as InteractionRow[]
  const interactionMap = new Map(
    allInteractions.map((i) => [i.question_id, i]),
  )

  // Compute counts from interactions (not from session columns)
  const answeredCount = allInteractions.length
  const correctCount = allInteractions.filter((i) => i.is_correct).length

  const reviewQuestions: ReviewQuestionData[] = (questions ?? []).map((q, idx) => {
    const interaction = interactionMap.get(q.question_id)
    const options = (q.options as Array<{ id: string; text: string }>) ?? []

    return {
      position: idx + 1,
      questionId: q.question_id,
      stem: q.text,
      imageUrl: q.prompt_image_url ?? null,
      taxonomyBreadcrumb: '',
      options: options.map((opt, oi) => ({
        id: opt.id,
        text: opt.text,
        letter: (['A', 'B', 'C', 'D'] as const)[oi],
        isCorrect: opt.id === q.correct_option_id,
        isUserChoice: opt.id === interaction?.selected_option_id,
      })),
      isCorrect: interaction?.is_correct ?? false,
      isSkipped: !interaction,
      isFlagged: interaction?.is_flagged ?? false,
      confidenceLevel: interaction?.confidence ? Number(interaction.confidence) : null,
      rationale: typeof q.rationale === 'string'
        ? q.rationale
        : (q.rationale as Record<string, string> | null)?.correct ?? '',
      wikiArticleUrl: null,
      wrongAnswerExplanation: null,
    }
  })

  const reviewData: ReviewDataResult = {
    sessionId,
    mode: mode as QuizMode,
    score: {
      correct: correctCount,
      total: answeredCount,
      percent: answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0,
    },
    questions: reviewQuestions,
  }

  return <ReviewMode data={reviewData} />
}

export default QuizReviewPage
