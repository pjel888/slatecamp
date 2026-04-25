import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function LegacyAdminWikiRedirectPage() {
  redirect(ROUTES.admin.knowledge)
}
