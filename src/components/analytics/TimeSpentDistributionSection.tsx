import dynamic from 'next/dynamic'
import { getTimeSpentDistribution } from '@/lib/actions/analytics-data'

const TimeSpentDistribution = dynamic(
  () => import('@/components/analytics/TimeSpentDistribution').then(m => m.TimeSpentDistribution),
)

export const TimeSpentDistributionSection = async () => {
  const result = await getTimeSpentDistribution()
  if (result.error) throw new Error(result.error)
  return <TimeSpentDistribution data={result.data} />
}
