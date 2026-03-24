import { Suspense } from 'react'
import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { ReviewHub } from '@/components/testing/hub/ReviewHub'
import { Skeleton } from '@/components/ui/skeleton'

const TestingPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch user tier for pro badge logic
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  const userTier = subscription?.tier ?? 'free'

  // Fetch session history for mode stats
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('session_id, test_mode, config, status, question_ids, started_at, completed_at, current_question_index, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(200)

  // Fetch readiness score
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score, last_study_date')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch blindspot queues (pending)
  const { data: blindspotQueues } = await supabase
    .from('blindspot_queues')
    .select('queue_id, node_ids, question_count, status, pre_queue_mastery')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .limit(1)

  // Fetch user profile for exam date
  const { data: profile } = await supabase
    .from('profiles')
    .select('target_exam_date')
    .eq('id', user.id)
    .maybeSingle()

  // Find in-progress session
  const inProgressSession = (sessions ?? []).find(
    (s: { status: string }) => s.status === 'in_progress'
  )

  // Compute completed sessions grouped by source
  const completedSessions = (sessions ?? []).filter(
    (s: { status: string }) => s.status === 'completed'
  )

  // Fetch weak subject data for suggestion
  const { data: weakNodes } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, taxonomy_tree!inner(name, subject_area)')
    .eq('user_id', user.id)
    .lt('current_mastery_weight', 0.4)
    .order('current_mastery_weight', { ascending: true })
    .limit(5)

  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <ReviewHub
        userTier={userTier}
        readinessScore={stats?.global_readiness_score ?? 0}
        lastStudyDate={stats?.last_study_date ?? null}
        completedSessions={completedSessions ?? []}
        inProgressSession={inProgressSession ?? null}
        blindspotQueues={blindspotQueues ?? []}
        targetExamDate={profile?.target_exam_date ?? null}
        weakNodes={weakNodes ?? []}
      />
    </Suspense>
  )
}

export default TestingPage
