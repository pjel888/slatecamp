import { getWeakestTopics } from '@/lib/actions/analytics-data'
import { WeakestTopics } from './WeakestTopics'

export const WeakestTopicsSection = async () => {
  const data = await getWeakestTopics()
  return <WeakestTopics data={data} />
}
