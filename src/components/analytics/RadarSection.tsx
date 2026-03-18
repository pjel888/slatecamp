import { getSubjectMasteryData } from '@/lib/actions/mastery'
import { SubjectRadarChart } from '@/components/dashboard/SubjectRadarChart'
import type { SubjectMastery } from '@/types/dashboard'

export async function RadarSection() {
  const raw = await getSubjectMasteryData()

  const data: SubjectMastery[] = raw.map(d => ({
    subject: d.subject,
    shortLabel: d.subject.split(' ').slice(0, 2).join(' '),
    mastery: d.score,
    questionsAnswered: d.score > 0 ? 1 : 0,
    topics: [],
  }))

  return <SubjectRadarChart data={data} />
}
