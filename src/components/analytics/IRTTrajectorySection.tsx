import dynamic from 'next/dynamic'
import { getIRTTrajectoryData } from '@/lib/actions/analytics/get-irt-data'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const IRTTrajectoryChart = dynamic(
  () => import('@/components/analytics/IRTTrajectoryChart').then(m => m.IRTTrajectoryChart),
)

export const IRTTrajectorySection = async () => {
  const result = await getIRTTrajectoryData()
  if (result.error) throw new Error(result.error)
  if (!result.data.length) return (
    <ChartEmptyState
      title="No ability data yet"
      description="Complete more drills to see your ability trajectory."
      height="h-[320px]"
    />
  )
  return <IRTTrajectoryChart data={result.data} />
}
