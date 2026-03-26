import { Suspense } from 'react'
import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { ReviewHub } from '@/components/testing/hub/ReviewHub'
import { Skeleton } from '@/components/ui/skeleton'

/** Async content — fetches data then renders */
const TestingContent = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const [
    { data: subscription },
    { data: sessions },
    { data: stats },
    { data: blindspotQueues },
    { data: profile },
    { data: weakNodes },
  ] = await Promise.all([
    supabase
      .from('user_subscriptions')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('quiz_sessions')
      .select('session_id, test_mode, config, status, question_ids, started_at, completed_at, current_question_index, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(200),
    supabase
      .from('user_global_stats')
      .select('global_readiness_score, last_study_date')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('blindspot_queues')
      .select('queue_id, node_ids, question_count, status, pre_queue_mastery')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .limit(1),
    supabase
      .from('profiles')
      .select('target_exam_date')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('user_node_mastery')
      .select('topic_id, current_mastery_weight, taxonomy_tree!inner(name, subject_area)')
      .eq('user_id', user.id)
      .lt('current_mastery_weight', 0.4)
      .order('current_mastery_weight', { ascending: true })
      .limit(5),
  ])

  const userTier = subscription?.tier ?? 'free'

  const inProgressSession = (sessions ?? []).find(
    (s: { status: string }) => s.status === 'in_progress'
  )

  const completedSessions = (sessions ?? []).filter(
    (s: { status: string }) => s.status === 'completed'
  )

  return (
    <ReviewHub
      userTier={userTier}
      readinessScore={stats?.global_readiness_score ?? 0}
      lastStudyDate={stats?.last_study_date ?? null}
      completedSessions={completedSessions ?? []}
      inProgressSession={inProgressSession ?? null}
      allSessions={sessions ?? []}
      blindspotQueues={blindspotQueues ?? []}
      targetExamDate={profile?.target_exam_date ?? null}
      weakNodes={weakNodes ?? []}
    />
  )
}

/** Page shell renders instantly; content streams via Suspense */
const TestingPage = () => (
  <Suspense fallback={<Skeleton className="h-screen w-full" />}>
    <TestingContent />
  </Suspense>
)

export default TestingPage
