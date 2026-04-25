import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function LegacyDeveloperSettingsRedirectPage() {
  redirect(ROUTES.developer.root)
}
