import dynamic from 'next/dynamic'
import { getCAGEQualityData } from '@/lib/queries/ceo/analytics/get-cage-quality'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const CAGEQuality = dynamic(
  () => import('@/components/ceo/analytics/CAGEQuality').then((m) => m.CAGEQuality),
)

export const CAGEQualitySection = async () => {
  const result = await getCAGEQualityData()
  if (result.error) throw new Error(result.error)

  const metrics = result.data

  if (metrics.length === 0) {
    return (
      <ChartEmptyState
        title="No CAGE quality data yet"
        description="CAGE quality metrics appear after verification sessions."
        height="h-[280px]"
      />
    )
  }

  return <CAGEQuality metrics={metrics} />
}
