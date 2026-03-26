import { getSessionHistory } from '@/lib/actions/analytics-data'
import { SessionHistory } from './SessionHistory'

export const SessionHistorySection = async () => {
  const data = await getSessionHistory()
  return <SessionHistory data={data} />
}
