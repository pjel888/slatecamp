import dynamic from 'next/dynamic'
import { getStudyVelocityData } from '@/lib/actions/analytics/chart-data'

const StudyVelocity = dynamic(
  () => import('@/components/analytics/StudyVelocity').then(m => m.StudyVelocity),
)

export const StudyVelocitySection = async () => {
  const data = await getStudyVelocityData()
  return <StudyVelocity data={data} />
}
