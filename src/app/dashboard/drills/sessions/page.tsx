import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

const LegacyQuizSessionsPage = () => {
  redirect(ROUTES.quiz.sessions)
}

export default LegacyQuizSessionsPage
