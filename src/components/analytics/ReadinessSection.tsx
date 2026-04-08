import dynamic from 'next/dynamic'
import { getReadinessSectionData } from '@/lib/actions/analytics'

const ReadinessTrajectory = dynamic(
  () => import('@/components/analytics/ReadinessTrajectory').then(m => m.ReadinessTrajectory),
)

export const ReadinessSection = async () => {
  const result = await getReadinessSectionData()
  if (result.error) throw new Error(result.error)

  return (
    <ReadinessTrajectory
      data={result.data.trajectory}
      currentScore={result.data.currentScore}
      previousScore={result.data.previousScore}
    />
  )
}
