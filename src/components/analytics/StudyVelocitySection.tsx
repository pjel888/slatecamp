import dynamic from 'next/dynamic'
import { getStudyVelocityData } from '@/lib/actions/analytics/chart-data'

const StudyVelocity = dynamic(
  () => import('@/components/analytics/StudyVelocity').then(m => m.StudyVelocity),
)

export const StudyVelocitySection = async () => {
  const result = await getStudyVelocityData()
  if (result.error) throw new Error(result.error)
  return <StudyVelocity data={result.data} />
}
