import { QuizSessionRoute } from '../../_components/QuizSessionRoute'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

const DashboardQuizSessionPage = async ({ params }: SessionPageProps) => {
  const { sessionId } = await params
  return <QuizSessionRoute sessionId={sessionId} />
}

export default DashboardQuizSessionPage
