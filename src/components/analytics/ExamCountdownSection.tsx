import dynamic from 'next/dynamic'
import { getExamCountdownData } from '@/lib/actions/analytics/chart-data'

const ExamCountdown = dynamic(
  () => import('@/components/analytics/ExamCountdown').then(m => m.ExamCountdown),
)

export const ExamCountdownSection = async () => {
  const result = await getExamCountdownData()
  if (result.error) throw new Error(result.error)
  return <ExamCountdown data={result.data} />
}
