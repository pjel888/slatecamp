import dynamic from 'next/dynamic'
import { getSubjectMasteryData } from '@/lib/actions/mastery'
import type { SubjectMastery } from '@/types/dashboard'

const SubjectRadarChart = dynamic(
  () => import('@/components/dashboard/SubjectRadarChart').then(m => m.SubjectRadarChart),
)

export const RadarSection = async () => {
  const raw = await getSubjectMasteryData()

  const data: SubjectMastery[] = raw.map(d => ({
    subject: d.subject,
    shortLabel: d.subject.split(' ').slice(0, 2).join(' '),
    mastery: d.score,
    questionsAnswered: d.score,
    topics: [],
  }))

  return <SubjectRadarChart data={data} />
}
