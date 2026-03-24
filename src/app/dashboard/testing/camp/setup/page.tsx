import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { CampSetup } from '@/components/testing/setup/CampSetup'

const CampSetupPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  const { count } = await supabase
    .from('quiz_sessions')
    .select('session_id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  return (
    <CampSetup
      completedSessionCount={count ?? 0}
      userId={user.id}
    />
  )
}

export default CampSetupPage
