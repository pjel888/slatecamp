import dynamic from 'next/dynamic'
import { getAccuracyBySubject } from '@/lib/actions/analytics-data'

const AccuracyBySubject = dynamic(
  () => import('@/components/analytics/AccuracyBySubject').then(m => m.AccuracyBySubject),
)

export const AccuracyBySubjectSection = async () => {
  const result = await getAccuracyBySubject()
  if (result.error) throw new Error(result.error)
  return <AccuracyBySubject data={result.data} />
}
