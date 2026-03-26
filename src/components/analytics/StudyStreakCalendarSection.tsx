import { getStudyActivity } from '@/lib/actions/analytics-data'
import { StudyStreakCalendar } from './StudyStreakCalendar'

export const StudyStreakCalendarSection = async () => {
  const data = await getStudyActivity()
  const now = new Date()
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  return <StudyStreakCalendar data={data} monthLabel={monthLabel} />
}
