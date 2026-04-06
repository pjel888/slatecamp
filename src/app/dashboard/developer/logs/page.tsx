import { redirect } from 'next/navigation'

import { ROUTES } from '@/lib/constants/routes'

export default async function LogsPage() {
  redirect(ROUTES.DEVELOPER_LOGS)
}
