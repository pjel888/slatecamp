import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

export default async function DatabaseViewerPage() {
  redirect(ROUTES.DEVELOPER_DB)
}
