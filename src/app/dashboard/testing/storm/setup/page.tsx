import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { StormSetup } from '@/components/testing/setup/StormSetup'

const StormSetupPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  return <StormSetup userId={user.id} />
}

export default StormSetupPage
