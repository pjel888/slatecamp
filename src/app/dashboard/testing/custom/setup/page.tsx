import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { CustomSetup } from '@/components/testing/setup/CustomSetup'

const CustomSetupPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect(ROUTES.LOGIN)

  return <CustomSetup userId={user.id} />
}

export default CustomSetupPage
