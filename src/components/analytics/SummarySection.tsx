import { getAnalyticsSummaryMetrics } from '@/lib/actions/analytics'
import { AnalyticsSummaryBar } from '@/components/analytics/AnalyticsSummaryBar'

export async function SummarySection() {
  const metrics = await getAnalyticsSummaryMetrics()
  return <AnalyticsSummaryBar data={metrics} />
}
