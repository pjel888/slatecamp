import { assertPermission } from '@/lib/admin/roles'
import { ModelRegistryPage } from './_components/ModelRegistryPage'

export const metadata = { title: '3D Models Registry — Admin' }

export default async function ThreeDModelsAdminPage() {
  await assertPermission('admin.access')

  return <ModelRegistryPage />
}
