import { redirect } from 'next/navigation'

interface ReviewPageProps {
  params: Promise<{ mode: string; sessionId: string }>
}

/** Review page now redirects to the merged results page */
const QuizReviewPage = async ({ params }: ReviewPageProps) => {
  const { mode, sessionId } = await params
  redirect(`/quiz/${mode}/session/${sessionId}/results`)
}

export default QuizReviewPage
