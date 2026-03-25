import { createClient, getUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { SessionShell } from '@/components/testing/session/SessionShell'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

const SessionPage = async ({ params }: SessionPageProps) => {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch session first — questions depend on session.question_ids
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('session_id, user_id, discipline_id, test_mode, status, config, question_ids, subject_ids, source_article_id, current_question_index, started_at, completed_at, created_at, updated_at')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!session) notFound()

  // If already completed, redirect to debrief
  if (session.status === 'completed') {
    redirect(ROUTES.TESTING_DEBRIEF(sessionId))
  }

  // Fetch questions and interactions in parallel — interactions only need sessionId/user.id
  const [{ data: questions }, { data: interactions }] = await Promise.all([
    supabase
      .from('questions')
      .select('question_id, topic_id, text, options, correct_option_id, rationale, difficulty, difficulty_rating, discrimination_rating, prompt_image_url, explanation, code_citation, model_id')
      .in('question_id', session.question_ids ?? []),
    supabase
      .from('user_interactions')
      .select('question_id, selected_option_id, is_correct, time_spent_ms, is_flagged, confidence, error_type, options_eliminated, answer_changes')
      .eq('session_id', sessionId)
      .eq('user_id', user.id),
  ])

  // Reorder questions to match session order
  const orderedQuestions = (session.question_ids ?? [])
    .map((id: string) => (questions ?? []).find((q: { question_id: string }) => q.question_id === id))
    .filter(Boolean)

  return (
    <SessionShell
      session={session}
      questions={orderedQuestions}
      existingInteractions={interactions ?? []}
      userId={user.id}
    />
  )
}

export default SessionPage
