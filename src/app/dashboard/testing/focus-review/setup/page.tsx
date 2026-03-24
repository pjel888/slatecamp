import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { FocusReviewSetup } from '@/components/testing/setup/FocusReviewSetup'

const FocusReviewSetupPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch weakest red nodes for targeting
  const { data: weakNodes } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, total_attempts, taxonomy_tree!inner(name, ale_id, subject_area)')
    .eq('user_id', user.id)
    .lt('current_mastery_weight', 0.4)
    .gt('total_attempts', 0)
    .order('current_mastery_weight', { ascending: true })
    .limit(5)

  return (
    <FocusReviewSetup
      weakNodes={weakNodes ?? []}
      userId={user.id}
    />
  )
}

export default FocusReviewSetupPage
