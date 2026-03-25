import { createClient, getUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { SimulationResults } from '@/components/testing/debrief/SimulationResults'

interface SimulationResultsPageProps {
  params: Promise<{ sessionId: string }>
}

const SimulationResultsPage = async ({ params }: SimulationResultsPageProps) => {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [{ data: session }, { data: stats }] = await Promise.all([
    // Fetch simulation session
    supabase
      .from('quiz_sessions')
      .select('session_id, user_id, discipline_id, test_mode, status, config, question_ids, subject_ids, source_article_id, current_question_index, started_at, completed_at, created_at, updated_at')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .maybeSingle(),
    // Fetch readiness score for pressure gap
    supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (!session || session.config?.source !== 'proof_simulation') notFound()

  // Check cold delivery window
  const isCompleted = session.status === 'completed'
  const completedAt = session.completed_at ? new Date(session.completed_at) : null
  const now = new Date()
  const hoursSinceCompletion = completedAt
    ? (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60)
    : 0
  const resultsAvailable = isCompleted && hoursSinceCompletion >= 24

  // If results available, fetch interactions
  let interactions = null
  if (resultsAvailable) {
    const { data } = await supabase
      .from('user_interactions')
      .select('*, questions!inner(question_id, text, options, correct_option_id, rationale, code_citation, topic_id)')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('question_order', { ascending: true })
    interactions = data
  }

  return (
    <SimulationResults
      session={session}
      resultsAvailable={resultsAvailable}
      hoursRemaining={resultsAvailable ? 0 : Math.max(0, Math.ceil(24 - hoursSinceCompletion))}
      completedAt={session.completed_at}
      interactions={interactions}
      readinessScore={stats?.global_readiness_score ?? 0}
    />
  )
}

export default SimulationResultsPage
