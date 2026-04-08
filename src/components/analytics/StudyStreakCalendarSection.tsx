import dynamic from 'next/dynamic'
import { getStudyActivity } from '@/lib/actions/analytics-data'

const StudyStreakCalendar = dynamic(
  () => import('@/components/analytics/StudyStreakCalendar').then(m => m.StudyStreakCalendar),
)

export const StudyStreakCalendarSection = async () => {
  const result = await getStudyActivity()
  if (result.error) throw new Error(result.error)
  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return <StudyStreakCalendar data={result.data} monthLabel={monthLabel} />
}
