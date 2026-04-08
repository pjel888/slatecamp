import dynamic from 'next/dynamic'
import { getMonthlyReport } from '@/lib/actions/progress-report/actions'

const ProgressCard = dynamic(
  () => import('@/components/analytics/ProgressCard').then((m) => m.ProgressCard),
)

export const ProgressCardSection = async () => {
  const result = await getMonthlyReport()
  if (result.error) throw new Error(result.error)
  if (!result.data) return null
  return <ProgressCard report={result.data} />
}
