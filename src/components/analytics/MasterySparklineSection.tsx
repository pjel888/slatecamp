import dynamic from 'next/dynamic'
import { getMasteryHistoryData } from '@/lib/actions/analytics/get-mastery-history'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const MasterySparklineGrid = dynamic(
  () => import('@/components/analytics/MasterySparklineGrid').then(m => m.MasterySparklineGrid),
)

export const MasterySparklineSection = async () => {
  const result = await getMasteryHistoryData()
  if (result.error) throw new Error(result.error)
  if (!result.data.length) return (
    <ChartEmptyState
      title="No mastery trends yet"
      description="Mastery trends appear after multiple drill sessions."
      height="h-[320px]"
    />
  )
  return <MasterySparklineGrid data={result.data} />
}
