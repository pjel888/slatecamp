import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getAdminAwareProfile } from '@/lib/admin/get-admin-profile'

import { LogoutCard } from './logout-card'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const profile = await getAdminAwareProfile()
  if (!profile) redirect(ROUTES.LOGIN)

  return (
    <div className='space-y-8'>
      {/* Account / Log out */}
      <LogoutCard />
    </div>
  )
}
