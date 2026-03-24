import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { EnduranceSetup } from '@/components/testing/setup/EnduranceSetup'

const EnduranceSetupPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Fetch previous endurance sessions for fatigue threshold
  const { data: previousSessions } = await supabase
    .from('quiz_sessions')
    .select('session_id, config, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .filter('config->>source', 'eq', 'extended_practice')
    .order('completed_at', { ascending: false })
    .limit(5)

  return (
    <EnduranceSetup
      previousSessions={previousSessions ?? []}
      userId={user.id}
    />
  )
}

export default EnduranceSetupPage
