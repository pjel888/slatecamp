import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

/** /quiz → redirect to testing hub (mode selector lives there) */
const QuizIndexPage = () => {
  redirect(ROUTES.TESTING)
}

export default QuizIndexPage
