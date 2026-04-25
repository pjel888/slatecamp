import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function LegacyDashboardTrailsRedirectPage() {
  redirect(ROUTES.dashboard.camptrails)
}
