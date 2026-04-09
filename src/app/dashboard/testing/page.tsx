import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

const TestingPage = () => {
  redirect(ROUTES.dashboard.drills)
}

export default TestingPage
