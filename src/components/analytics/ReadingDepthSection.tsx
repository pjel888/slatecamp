import dynamic from 'next/dynamic'
import { getReadingDepthData } from '@/lib/actions/analytics/get-reading-depth-data'

const ReadingDepthHeatmap = dynamic(
  () => import('@/components/analytics/ReadingDepthHeatmap').then((m) => m.ReadingDepthHeatmap),
)

export const ReadingDepthSection = async () => {
  const result = await getReadingDepthData()
  if (result.error) throw new Error(result.error)
  return <ReadingDepthHeatmap data={result.data} />
}
