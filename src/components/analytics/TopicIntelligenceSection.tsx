import dynamic from 'next/dynamic'
import { getTopicIntelligenceData } from '@/lib/actions/analytics/get-topic-intelligence-data'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const TopicIntelligenceCards = dynamic(
  () =>
    import('@/components/analytics/TopicIntelligenceCards').then(
      (m) => m.TopicIntelligenceCards,
    ),
)

export const TopicIntelligenceSection = async () => {
  const result = await getTopicIntelligenceData()
  if (result.error) throw new Error(result.error)

  if (!result.data.length) {
    return (
      <ChartEmptyState
        title="No topic intelligence yet"
        description="Topic intelligence appears after answering questions across multiple topics."
        height="h-[400px]"
      />
    )
  }

  return <TopicIntelligenceCards data={result.data} />
}
