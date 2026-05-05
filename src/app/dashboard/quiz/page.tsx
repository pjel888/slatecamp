import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { QuizHubContent } from './_components/QuizHubContent'

const DashboardQuizPage = () => (
  <PracticeLayout
    hero={{
      subtitle: 'Quiz',
      description:
        'Guided study, timed practice, and full exam simulation.',
    }}
  >
    <QuizHubContent />
  </PracticeLayout>
)

export default DashboardQuizPage
