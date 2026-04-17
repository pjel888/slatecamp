import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default async function DeveloperConsolePage() {
  redirect(ROUTES.developer.console)
}
