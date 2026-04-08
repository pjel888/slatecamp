import dynamic from 'next/dynamic'
import { getSessionHistory } from '@/lib/actions/analytics-data'

const SessionHistory = dynamic(
  () => import('@/components/analytics/SessionHistory').then(m => m.SessionHistory),
)

export const SessionHistorySection = async () => {
  const result = await getSessionHistory()
  if (result.error) throw new Error(result.error)
  return <SessionHistory data={result.data} />
}
