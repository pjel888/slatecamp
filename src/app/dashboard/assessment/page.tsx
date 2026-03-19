import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { hasCompletedAssessment, getAssessmentQuestions } from '@/lib/actions/assessment'
import { AssessmentQuiz } from '@/components/assessment/AssessmentQuiz'

const AssessmentPage = async () => {
  const {
    data: { user },
  } = await getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const completed = await hasCompletedAssessment()
  if (completed) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('current_discipline_id')
    .eq('user_id', user.id)
    .single()

  const disciplineId = stats?.current_discipline_id
  if (!disciplineId) {
    redirect('/dashboard')
  }

  const questionIds = await getAssessmentQuestions(disciplineId)
  if (questionIds.length === 0) {
    redirect('/dashboard')
  }

  return <AssessmentQuiz questionIds={questionIds} disciplineId={disciplineId} />
}

export default AssessmentPage
