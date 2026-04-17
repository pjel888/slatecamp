import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

/** /quiz → redirect to testing hub (mode selector lives there) */
const QuizIndexPage = () => {
  redirect(ROUTES.dashboard.drills)
}

export default QuizIndexPage
