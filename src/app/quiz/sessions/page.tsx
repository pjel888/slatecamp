import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

const LegacyQuizSessionsPage = () => {
  redirect(ROUTES.dashboard.quizSessions)
}

export default LegacyQuizSessionsPage
