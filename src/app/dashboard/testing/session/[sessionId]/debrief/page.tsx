import { createClient, getUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { DebriefLayout } from '@/components/testing/debrief/DebriefLayout'

interface DebriefPageProps {
  params: Promise<{ sessionId: string }>
}

const DebriefPage = async ({ params }: DebriefPageProps) => {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch completed session
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .maybeSingle()

  if (!session) notFound()

  // Check if this is a proof simulation with cold delivery
  const isSimulation = session.config?.source === 'proof_simulation'
  if (isSimulation) {
    const completedAt = new Date(session.completed_at)
    const now = new Date()
    const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCompletion < 24) {
      // Cold delivery: results not yet available
      redirect(`/dashboard/testing/simulation/${sessionId}/results`)
    }
  }

  // Fetch all interactions for this session
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('*, questions!inner(question_id, text, options, correct_option_id, rationale, code_citation, model_id, topic_id)')
    .eq('session_id', sessionId)
    .eq('user_id', user.id)
    .order('question_order', { ascending: true })

  // Fetch readiness score snapshots (before and after)
  const { data: snapshots } = await supabase
    .from('readiness_score_snapshots')
    .select('score, computed_at, session_id')
    .eq('user_id', user.id)
    .order('computed_at', { ascending: false })
    .limit(10)

  // Find score before and after this session
  const thisSnapshot = (snapshots ?? []).find(
    (s: { session_id: string | null }) => s.session_id === sessionId
  )
  const previousSnapshots = (snapshots ?? []).filter(
    (s: { computed_at: string }) =>
      new Date(s.computed_at) < new Date(session.completed_at)
  )
  const previousScore = previousSnapshots[0]?.score ?? 0
  const currentScore = thisSnapshot?.score ?? previousScore

  // Fetch node mastery deltas
  const topicIds = [
    ...new Set(
      (interactions ?? []).map((i: { questions: { topic_id: string } }) => i.questions.topic_id)
    ),
  ]

  const { data: masteryData } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, taxonomy_tree!inner(name, ale_id)')
    .eq('user_id', user.id)
    .in('topic_id', topicIds)

  return (
    <DebriefLayout
      session={session}
      interactions={interactions ?? []}
      readinessBefore={previousScore}
      readinessAfter={currentScore}
      masteryData={masteryData ?? []}
      masterySnapshotAtStart={session.mastery_snapshot_at_start}
    />
  )
}

export default DebriefPage
