import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

interface ReviewPageProps {
  params: Promise<{ sessionId: string }>
}

const DashboardQuizReviewPage = async ({ params }: ReviewPageProps) => {
  const { sessionId } = await params
  redirect(ROUTES.dashboard.quizResults(sessionId))
}

export default DashboardQuizReviewPage
