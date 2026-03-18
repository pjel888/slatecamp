import { getSubjectMasteryData } from '@/lib/actions/mastery'
import { SubjectRadarChart } from '@/components/dashboard/SubjectRadarChart'

export async function RadarSection() {
  const data = await getSubjectMasteryData()
  return <SubjectRadarChart data={data} />
}
