import { notFound, redirect } from 'next/navigation'

import { canManageContent } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import { getAdminDesignScenario } from '@/lib/actions/admin/design-scenarios'
import { DesignScenarioEditor } from '@/components/admin/DesignScenarioEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Scenario Question Editor | SlateCamp Admin',
}

const AdminScenarioEditorPage = async ({ params }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  const { id } = await params
  const scenario = await getAdminDesignScenario(id)

  if (!scenario) {
    notFound()
  }

  return <DesignScenarioEditor scenario={scenario} />
}

export default AdminScenarioEditorPage
