import { getPacingInsights } from '@/lib/actions/analytics'
import { PacingInsights } from '@/components/analytics/PacingInsights'

export async function PacingInsightsSection() {
  const data = await getPacingInsights()
  return <PacingInsights data={data} />
}
