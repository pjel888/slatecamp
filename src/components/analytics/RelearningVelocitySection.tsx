import dynamic from 'next/dynamic'
import { getRelearningData } from '@/lib/actions/analytics/get-relearning-data'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const RelearningVelocity = dynamic(
  () => import('@/components/analytics/RelearningVelocity').then(m => m.RelearningVelocity),
)

export const RelearningVelocitySection = async () => {
  const result = await getRelearningData()
  if (result.error) throw new Error(result.error)
  if (!result.data.length) return (
    <ChartEmptyState
      title="No relearning data yet"
      description="Relearning velocity appears after revisiting previously studied topics."
      height="h-[320px]"
    />
  )
  return <RelearningVelocity data={result.data} />
}
