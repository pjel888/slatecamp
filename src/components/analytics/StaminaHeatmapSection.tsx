import dynamic from 'next/dynamic'
import { getStaminaHeatmapData } from '@/lib/actions/analytics/chart-data'

const StaminaHeatmap = dynamic(
  () => import('@/components/analytics/StaminaHeatmap').then(m => m.StaminaHeatmap),
)

export const StaminaHeatmapSection = async () => {
  const result = await getStaminaHeatmapData()
  if (result.error) throw new Error(result.error)
  return <StaminaHeatmap data={result.data} />
}
