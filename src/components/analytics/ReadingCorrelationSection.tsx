import dynamic from 'next/dynamic'
import { getReadingCorrelationData } from '@/lib/actions/analytics/get-reading-correlation-data'

const ReadingCorrelation = dynamic(
  () => import('@/components/analytics/ReadingCorrelation').then((m) => m.ReadingCorrelation),
)

export const ReadingCorrelationSection = async () => {
  const result = await getReadingCorrelationData()
  if (result.error) throw new Error(result.error)
  return <ReadingCorrelation data={result.data} />
}
