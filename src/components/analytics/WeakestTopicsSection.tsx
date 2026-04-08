import dynamic from 'next/dynamic'
import { getWeakestTopics } from '@/lib/actions/analytics-data'

const WeakestTopics = dynamic(
  () => import('@/components/analytics/WeakestTopics').then(m => m.WeakestTopics),
)

export const WeakestTopicsSection = async () => {
  const result = await getWeakestTopics()
  if (result.error) throw new Error(result.error)
  return <WeakestTopics data={result.data} />
}
