import dynamic from 'next/dynamic'
import { getMonthlyReport } from '@/lib/actions/progress-report/actions'

const ProgressCard = dynamic(
  () => import('@/components/analytics/ProgressCard').then((m) => m.ProgressCard),
)

interface ProgressCardSectionProps {
  variant?: 'default' | 'compact'
}

export const ProgressCardSection = async ({
  variant = 'default',
}: ProgressCardSectionProps) => {
  const result = await getMonthlyReport()
  if (result.error) throw new Error(result.error)
  if (!result.data) return null
  return <ProgressCard report={result.data} variant={variant} />
}
