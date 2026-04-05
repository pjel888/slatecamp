import dynamic from 'next/dynamic'
import { getReadinessTrajectory } from '@/lib/actions/analytics'
import { createClient, getUser } from '@/lib/supabase/server'

const ReadinessTrajectory = dynamic(
  () => import('@/components/analytics/ReadinessTrajectory').then(m => m.ReadinessTrajectory),
)

export const ReadinessSection = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  
  const [trajectory, { data: stats }, { data: snapshots }] = await Promise.all([
    getReadinessTrajectory(),
    supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user?.id)
      .maybeSingle(),
    supabase
      .from('readiness_score_snapshots')
      .select('score')
      .eq('user_id', user?.id)
      .order('computed_at', { ascending: false })
      .limit(2),
  ])

  const currentScore = Math.round(stats?.global_readiness_score ?? 0)
  const previousScore = (snapshots && snapshots.length >= 2) ? Math.round(snapshots[1].score) : null

  return (
    <ReadinessTrajectory
      data={trajectory}
      currentScore={currentScore}
      previousScore={previousScore}
    />
  )
}
