import dynamic from 'next/dynamic'
import { getPassRateData } from '@/lib/queries/ceo/analytics/get-pass-rate'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const PassRate = dynamic(
  () => import('@/components/ceo/analytics/PassRate').then((m) => m.PassRate),
)

export const PassRateSection = async () => {
  const result = await getPassRateData()
  if (result.error) throw new Error(result.error)

  const buckets = result.data

  if (buckets.length === 0) {
    return (
      <ChartEmptyState
        title="No pass rate data yet"
        description="Pass rate predictions appear as users build readiness scores."
        height="h-[320px]"
      />
    )
  }

  return <PassRate buckets={buckets} />
}
