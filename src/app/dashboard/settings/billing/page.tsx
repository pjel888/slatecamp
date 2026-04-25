import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function LegacyBillingSettingsRedirectPage() {
  redirect(ROUTES.dashboard.settings)
}
