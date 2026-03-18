import { TimelineHeatmap } from './TimelineHeatmap'
import { getTimelineHeatmapData } from '@/lib/actions/analytics'

export async function TimelineHeatmapSection() {
  const data = await getTimelineHeatmapData()
  return <TimelineHeatmap rows={data.rows} weekLabels={data.weekLabels} />
}
