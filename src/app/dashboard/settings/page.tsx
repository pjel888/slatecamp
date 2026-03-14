import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getAdminAwareProfile } from '@/lib/admin/get-admin-profile'

import { LogoutCard } from './logout-card'
import { DisciplineCard } from './discipline-card'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const profile = await getAdminAwareProfile()
  if (!profile) redirect(ROUTES.LOGIN)

  return (
    <div className='max-w-2xl mx-auto space-y-8'>
      {/* License / Discipline */}
      <DisciplineCard />

      {/* Account / Log out */}
      <LogoutCard />
    </div>
  )
}
