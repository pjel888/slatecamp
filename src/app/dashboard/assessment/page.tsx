import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { hasCompletedAssessment, getAssessmentQuestions } from '@/lib/actions/assessment'
import { AssessmentQuiz } from '@/components/assessment/AssessmentQuiz'
import { ROUTES } from '@/lib/routes'

const AssessmentPage = async () => {
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect(ROUTES.auth.login)
  }

  const completed = await hasCompletedAssessment()
  if (completed) {
    redirect(ROUTES.dashboard.root)
  }

  const supabase = await createClient()
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .single()

  const disciplineId = stats?.current_discipline_id
  if (!disciplineId) {
    redirect(ROUTES.dashboard.root)
  }

  const questionIds = await getAssessmentQuestions(disciplineId)
  if (questionIds.length === 0) {
    redirect(ROUTES.dashboard.root)
  }

  return <AssessmentQuiz questionIds={questionIds} disciplineId={disciplineId} />
}

export default AssessmentPage
