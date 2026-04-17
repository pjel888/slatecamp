import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export default function DeveloperPage() {
  redirect(ROUTES.developer.root)
}
