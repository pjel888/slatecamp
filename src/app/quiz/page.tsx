import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

const LegacyQuizPage = () => {
  redirect(ROUTES.dashboard.quiz)
}

export default LegacyQuizPage
