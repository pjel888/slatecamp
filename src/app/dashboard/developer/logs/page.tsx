import { redirect } from 'next/navigation'

import { ROUTES } from '@/lib/routes'

export default async function LogsPage() {
  redirect(ROUTES.DEVELOPER_LOGS)
}
