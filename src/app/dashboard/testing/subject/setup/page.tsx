import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { SubjectSetup } from '@/components/testing/setup/SubjectSetup'

const SubjectSetupPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch per-subject mastery aggregation
  const { data: masteryData } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, taxonomy_tree!inner(subject_area)')
    .eq('user_id', user.id)

  return (
    <SubjectSetup
      masteryData={masteryData ?? []}
      userId={user.id}
    />
  )
}

export default SubjectSetupPage
