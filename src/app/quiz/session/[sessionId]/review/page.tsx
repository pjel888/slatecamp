import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface ReviewPageProps {
  params: Promise<{ sessionId: string }>
}

const CanonicalQuizReviewPage = async ({ params }: ReviewPageProps) => {
  const { sessionId } = await params
  redirect(ROUTES.quiz.results(sessionId))
}

export default CanonicalQuizReviewPage
