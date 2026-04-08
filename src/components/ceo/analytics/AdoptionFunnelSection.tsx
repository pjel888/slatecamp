import dynamic from 'next/dynamic'
import { getAdoptionFunnelData } from '@/lib/queries/ceo/analytics/get-adoption-funnel'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const AdoptionFunnel = dynamic(
  () => import('@/components/ceo/analytics/AdoptionFunnel').then((m) => m.AdoptionFunnel),
)

export const AdoptionFunnelSection = async () => {
  const result = await getAdoptionFunnelData()
  if (result.error) throw new Error(result.error)

  const { stages, totalRegistered } = result.data

  if (stages.length === 0 || totalRegistered === 0) {
    return (
      <ChartEmptyState
        title="No funnel data yet"
        description="Adoption funnel data appears as users progress through the platform."
        height="h-[320px]"
      />
    )
  }

  return <AdoptionFunnel stages={stages} totalRegistered={totalRegistered} />
}
