import { QuizSessionRoute } from '../../../_components/QuizSessionRoute'

interface SessionPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

const LegacyModeQuizSessionPage = async ({ params }: SessionPageProps) => {
  const { mode, sessionId } = await params
  return <QuizSessionRoute sessionId={sessionId} routeMode={mode} />
}

export default LegacyModeQuizSessionPage
