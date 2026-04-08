import dynamic from 'next/dynamic'
import { getModeFunnelData } from '@/lib/actions/analytics/get-mode-funnel'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'

const ModeFunnel = dynamic(
  () => import('@/components/analytics/ModeFunnel').then(m => m.ModeFunnel),
)

export const ModeFunnelSection = async () => {
  const result = await getModeFunnelData()
  if (result.error) throw new Error(result.error)
  if (!result.data.length) return (
    <ChartEmptyState
      title="No session data yet"
      description="Complete drills across different modes to see your progression."
      height="h-[320px]"
    />
  )
  return <ModeFunnel data={result.data} />
}
