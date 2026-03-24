import { createClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { SimulationBriefing } from '@/components/testing/setup/SimulationBriefing'

const SimulationBriefingPage = async () => {
  const supabase = await createClient()
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // Check gate: Readiness >= 65%
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .maybeSingle()

  const readinessScore = stats?.global_readiness_score ?? 0
  if (readinessScore < 65) {
    redirect(ROUTES.TESTING)
  }

  return <SimulationBriefing userId={user.id} />
}

export default SimulationBriefingPage
