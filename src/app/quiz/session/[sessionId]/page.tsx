import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface SessionPageProps {
  params: Promise<{ sessionId: string }>
}

const LegacyQuizSessionPage = async ({ params }: SessionPageProps) => {
  const { sessionId } = await params
  redirect(ROUTES.dashboard.quizSession(sessionId))
}

export default LegacyQuizSessionPage
