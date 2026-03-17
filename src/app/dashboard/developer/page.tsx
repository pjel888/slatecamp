import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

export default function DeveloperPage() {
  redirect(ROUTES.DEVELOPER_CONSOLE)
}
