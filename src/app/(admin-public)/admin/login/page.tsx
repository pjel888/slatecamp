import { redirect } from 'next/navigation'
import { isDemoMode } from '@/lib/demo/config'
import { ROUTES } from '@/lib/routes'
import { AdminLoginClient } from './page-client'

export default function AdminLoginPage() {
  if (isDemoMode()) {
    redirect(ROUTES.dashboard.root)
  }

  return <AdminLoginClient />
}
