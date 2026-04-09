import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function TestDataPage() {
  redirect(ROUTES.DEVELOPER_TEST_DATA)
}
