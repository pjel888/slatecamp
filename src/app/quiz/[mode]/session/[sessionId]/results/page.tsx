import { QuizResultsRoute } from '../../../../_components/QuizResultsRoute'

interface ResultsPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

const LegacyModeQuizResultsPage = async ({ params }: ResultsPageProps) => {
  const { mode, sessionId } = await params
  return <QuizResultsRoute sessionId={sessionId} routeMode={mode} />
}

export default LegacyModeQuizResultsPage
