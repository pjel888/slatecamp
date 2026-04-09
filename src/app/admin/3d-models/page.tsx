import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canReviewContent } from '@/lib/admin/roles'
import { ModelRegistryPage } from './_components/ModelRegistryPage'

export const metadata = { title: '3D Models Registry — Admin' }

export default async function ThreeDModelsAdminPage() {
  const isAdmin = await canReviewContent()
  if (!isAdmin) redirect(ROUTES.admin.login)

  return <ModelRegistryPage />
}
