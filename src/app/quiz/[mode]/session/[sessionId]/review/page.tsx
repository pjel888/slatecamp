import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface ReviewPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

const LegacyModeQuizReviewPage = async ({ params }: ReviewPageProps) => {
  const { sessionId } = await params
  redirect(ROUTES.quiz.results(sessionId))
}

export default LegacyModeQuizReviewPage
