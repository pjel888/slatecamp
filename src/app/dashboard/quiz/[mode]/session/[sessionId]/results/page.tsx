import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>
}

const DashboardModeQuizResultsPage = async ({ params }: ResultsPageProps) => {
  const { sessionId } = await params
  redirect(ROUTES.dashboard.quizResults(sessionId))
}

export default DashboardModeQuizResultsPage
