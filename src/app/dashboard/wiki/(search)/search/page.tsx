import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

/** Wiki search is disabled; redirect to wiki hub. */
export default async function WikiSearchPage() {
  redirect(ROUTES.WIKI)
}
