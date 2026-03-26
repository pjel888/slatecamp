import dynamic from 'next/dynamic'
import { getStaminaHeatmapData } from '@/lib/actions/analytics/chart-data'

const StaminaHeatmap = dynamic(
  () => import('@/components/analytics/StaminaHeatmap').then(m => m.StaminaHeatmap),
)

export const StaminaHeatmapSection = async () => {
  const data = await getStaminaHeatmapData()
  return <StaminaHeatmap data={data} />
}
