import dynamic from 'next/dynamic'
import { getEngagementDepthData } from '@/lib/queries/ceo/analytics/get-engagement-depth'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const EngagementDepth = dynamic(
  () =>
    import('@/components/ceo/analytics/EngagementDepth').then((m) => m.EngagementDepth),
)

export const EngagementDepthSection = async () => {
  const result = await getEngagementDepthData()
  if (result.error) throw new Error(result.error)

  const { buckets, totalUsers } = result.data

  if (totalUsers === 0 || buckets.every((b) => b.userCount === 0)) {
    return (
      <ChartEmptyState
        title="No engagement data yet"
        description="Engagement depth scores appear as users interact with platform features."
        height="h-[320px]"
      />
    )
  }

  return <EngagementDepth data={result.data} />
}
