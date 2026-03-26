import { getTimeSpentDistribution } from '@/lib/actions/analytics-data'
import { TimeSpentDistribution } from './TimeSpentDistribution'

export const TimeSpentDistributionSection = async () => {
  const data = await getTimeSpentDistribution()
  return <TimeSpentDistribution data={data} />
}
