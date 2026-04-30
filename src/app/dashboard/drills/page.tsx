import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

const LegacyQuizPage = () => {
  redirect(ROUTES.quiz.root)
}

export default LegacyQuizPage
