import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

export default async function DeveloperConsolePage() {
  redirect(ROUTES.DEVELOPER_CONSOLE)
}
