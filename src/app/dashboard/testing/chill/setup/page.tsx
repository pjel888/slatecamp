import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { ChillSetup } from '@/components/testing/setup/ChillSetup'

const ChillSetupPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  return <ChillSetup userId={user.id} />
}

export default ChillSetupPage
