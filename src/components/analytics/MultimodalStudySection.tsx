import dynamic from 'next/dynamic'
import { getMultimodalStudyData } from '@/lib/actions/analytics/get-multimodal-study-data'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const MultimodalStudy = dynamic(
  () => import('@/components/analytics/MultimodalStudy').then((m) => m.MultimodalStudy),
)

export const MultimodalStudySection = async () => {
  const result = await getMultimodalStudyData()
  if (result.error) throw new Error(result.error)

  const hasActivity = result.data.some((w) => w.drillScore > 0 || w.readingScore > 0)
  if (!hasActivity) {
    return (
      <ChartEmptyState
        title="No multimodal activity yet"
        description="Multimodal study score appears after both drilling and reading wiki articles."
        height="h-[320px]"
      />
    )
  }

  return <MultimodalStudy data={result.data} />
}
