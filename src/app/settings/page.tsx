import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function LegacySettingsRedirectPage() {
  redirect(ROUTES.dashboard.settings)
}
