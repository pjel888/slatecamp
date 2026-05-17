import dynamic from 'next/dynamic'
import { getTimelineHeatmapData } from '@/lib/actions/analytics'

const TimelineHeatmap = dynamic(
  () => import('@/components/analytics/TimelineHeatmap').then(m => m.TimelineHeatmap),
)

interface TimelineHeatmapSectionProps {
  variant?: 'default' | 'compact'
}

export const TimelineHeatmapSection = async ({
  variant = 'default',
}: TimelineHeatmapSectionProps) => {
  const result = await getTimelineHeatmapData()
  if (result.error) throw new Error(result.error)
  return (
    <TimelineHeatmap
      rows={result.data.rows}
      weekLabels={result.data.weekLabels}
      variant={variant}
    />
  )
}
