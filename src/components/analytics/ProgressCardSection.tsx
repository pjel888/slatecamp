import dynamic from 'next/dynamic'
import { getMonthlyReport } from '@/lib/actions/progress-report/actions'

const ProgressCard = dynamic(
  () => import('@/components/analytics/ProgressCard').then((m) => m.ProgressCard),
)

export const ProgressCardSection = async () => {
  const report = await getMonthlyReport()
  if (!report) return null
  return <ProgressCard report={report} />
}
