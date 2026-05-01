import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface ReviewPageProps {
  params: Promise<{ sessionId: string }>
}

const LegacyModeQuizReviewPage = async ({ params }: ReviewPageProps) => {
  const { sessionId } = await params
  redirect(ROUTES.dashboard.quizReview(sessionId))
}

export default LegacyModeQuizReviewPage
