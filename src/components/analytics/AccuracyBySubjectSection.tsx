import { getAccuracyBySubject } from '@/lib/actions/analytics-data'
import { AccuracyBySubject } from './AccuracyBySubject'

export const AccuracyBySubjectSection = async () => {
  const data = await getAccuracyBySubject()
  return <AccuracyBySubject data={data} />
}
