import dynamic from 'next/dynamic'
import { getReadinessTrajectory } from '@/lib/actions/analytics'
import { getReadinessScore } from '@/lib/actions/readiness'

const ReadinessTrajectory = dynamic(
  () => import('@/components/analytics/ReadinessTrajectory').then(m => m.ReadinessTrajectory),
)

export const ReadinessSection = async () => {
  const [trajectory, readiness] = await Promise.all([
    getReadinessTrajectory(),
    getReadinessScore(),
  ])
  return (
    <ReadinessTrajectory
      data={trajectory}
      currentScore={readiness.score}
      previousScore={readiness.previousScore}
    />
  )
}
