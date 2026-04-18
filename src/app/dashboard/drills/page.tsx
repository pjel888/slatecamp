import { Suspense } from 'react'
import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { ReviewHub } from '@/components/testing/hub/ReviewHub'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getActiveSRCycles,
  getDueSRCycles,
  getUserSRProgress,
} from '@/lib/actions/quiz-v2/successive-relearning'
import { getViewerEntitlements } from '@/lib/entitlements/get-viewer-entitlements'

interface CoreSubject {
  node_id: string
  name: string
  subject_area: string
}

/** Async content — fetches data then renders */
const DrillsContent = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.auth.login)
  const entitlements = await getViewerEntitlements()

  // Fetch discipline ID first for subject query
  const { data: disciplineStats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const [
    { data: sessions },
    { data: stats },
    { data: focusReviewQueues },
    { data: profile },
    { data: weakNodes },
    { data: coreSubjectsRaw },
    srActiveCycles,
    srDueCycles,
    srProgress,
  ] = await Promise.all([
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
      .from('focus_review_queues')
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
    disciplineStats?.current_discipline_id
      ? supabase
          .from('taxonomy_tree')
          .select('node_id, name, subject_area')
          .eq('discipline_id', disciplineStats.current_discipline_id)
          .eq('level', 1)
          .is('deprecated_at', null)
          .order('sort_order', { ascending: true, nullsFirst: false })
          .order('name', { ascending: true })
      : Promise.resolve({ data: [] as CoreSubject[] }),
    getActiveSRCycles(user.id).catch(() => []),
    getDueSRCycles(user.id).catch(() => []),
    getUserSRProgress(user.id).catch(() => ({ active: 0, spacing: 0, durable: 0, reset: 0, total: 0 })),
  ])

  const coreSubjects: CoreSubject[] = (coreSubjectsRaw ?? []).map((s: any) => ({
    node_id: s.node_id,
    name: s.name,
    subject_area: s.subject_area,
  }))

  const inProgressSession = (sessions ?? []).find(
    (s: { status: string }) => s.status === 'in_progress'
  )

  const completedSessions = (sessions ?? []).filter(
    (s: { status: string }) => s.status === 'completed'
  )

  return (
    <ReviewHub
      viewerEntitlements={entitlements}
      readinessScore={stats?.global_readiness_score ?? 0}
      lastStudyDate={stats?.last_study_date ?? null}
      completedSessions={completedSessions ?? []}
      inProgressSession={inProgressSession ?? null}
      focusReviewQueues={focusReviewQueues ?? []}
      targetExamDate={profile?.target_exam_date ?? null}
      weakNodes={weakNodes ?? []}
      coreSubjects={coreSubjects}
      srActiveCycles={srActiveCycles}
      srDueCycles={srDueCycles}
      srProgress={srProgress}
    />
  )
}

/** Page shell renders instantly; content streams via Suspense */
const DrillsPage = () => (
  <Suspense fallback={<Skeleton className="h-screen w-full" />}>
    <DrillsContent />
  </Suspense>
)

export default DrillsPage
