import { getReadinessTrajectory } from '@/lib/actions/analytics'
import { getReadinessScore } from '@/lib/actions/readiness'
import { ReadinessTrajectory } from '@/components/analytics/ReadinessTrajectory'

export async function ReadinessSection() {
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
