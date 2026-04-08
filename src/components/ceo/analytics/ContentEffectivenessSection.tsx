import dynamic from 'next/dynamic'
import { getContentEffectivenessData } from '@/lib/queries/ceo/analytics/get-content-effectiveness'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const ContentEffectiveness = dynamic(
  () =>
    import('@/components/ceo/analytics/ContentEffectiveness').then(
      (m) => m.ContentEffectiveness,
    ),
)

export const ContentEffectivenessSection = async () => {
  const result = await getContentEffectivenessData()
  if (result.error) throw new Error(result.error)

  if (result.data.length === 0) {
    return (
      <ChartEmptyState
        title="No effectiveness data yet"
        description="Content effectiveness metrics appear as users answer questions."
        height="h-[320px]"
      />
    )
  }

  return <ContentEffectiveness data={result.data} />
}
