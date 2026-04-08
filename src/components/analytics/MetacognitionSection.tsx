import dynamic from 'next/dynamic'
import { getMetacognitionData } from '@/lib/actions/analytics/get-metacognition-data'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const MetacognitionChart = dynamic(
  () => import('@/components/analytics/MetacognitionChart').then(m => m.MetacognitionChart),
)

export const MetacognitionSection = async () => {
  const result = await getMetacognitionData()
  if (result.error) throw new Error(result.error)
  if (!result.data.length) return (
    <ChartEmptyState
      title="No prediction data yet"
      description="Use the prediction slider before drills to track your self-assessment accuracy."
      height="h-[320px]"
    />
  )
  return <MetacognitionChart data={result.data} />
}
