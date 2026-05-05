import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { QuizHubContent } from './_components/QuizHubContent'

const DashboardQuizPage = () => (
  <PracticeLayout
    hero={{
      subtitle: 'Quiz',
      description:
        'Build mastery through guided study, timed practice, and exam simulations.',
    }}
  >
    <QuizHubContent />
  </PracticeLayout>
)

export default DashboardQuizPage
