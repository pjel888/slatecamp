import { getTestingPageData } from '@/lib/actions/testing'
import { CampDashboard } from './CampDashboard'
import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{
    topicId?: string
    subjectId?: string
  }>
}

export default async function TestingPage({ searchParams }: PageProps) {
  const { topicId, subjectId } = await searchParams

  const data = await getTestingPageData({ topicId, subjectId })
  if (!data) redirect('/login')

  return (
    <div className="w-full h-full">
      <CampDashboard
        initialSession={data.existingSession}
        disciplineId={data.disciplineId}
        disciplineName={data.disciplineName}
        subjects={data.subjects}
        allQuestionIds={data.questionIds}
        modeStats={data.modeStats}
        totalCompletedSessions={data.totalCompletedSessions}
      />
    </div>
  )
}
