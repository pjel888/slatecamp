import { QuizResultsRoute } from '../../../_components/QuizResultsRoute'

interface ResultsPageProps {
  params: Promise<{ sessionId: string }>
}

const DashboardQuizResultsPage = async ({ params }: ResultsPageProps) => {
  const { sessionId } = await params
  return <QuizResultsRoute sessionId={sessionId} />
}

export default DashboardQuizResultsPage
