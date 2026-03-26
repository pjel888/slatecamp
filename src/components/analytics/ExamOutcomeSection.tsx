import dynamic from 'next/dynamic'
import { createClient, getUser } from '@/lib/supabase/server'

const ExamOutcomeForm = dynamic(
  () => import('@/components/analytics/ExamOutcomeForm').then((m) => m.ExamOutcomeForm),
)

export const ExamOutcomeSection = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) return null

  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('target_exam_date')
    .eq('user_id', user.id)
    .single()

  // Only render if user has a target exam date
  if (!stats?.target_exam_date) return null

  return <ExamOutcomeForm targetExamDate={stats.target_exam_date} />
}
