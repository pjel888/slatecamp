import dynamic from 'next/dynamic'
import { getPacingInsights } from '@/lib/actions/analytics'

const PacingInsights = dynamic(
  () => import('@/components/analytics/PacingInsights').then(m => m.PacingInsights),
)

export const PacingInsightsSection = async () => {
  const result = await getPacingInsights()
  if (result.error) throw new Error(result.error)
  return <PacingInsights data={result.data} />
}
