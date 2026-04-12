import { notFound, redirect } from 'next/navigation'

import { canManageContent } from '@/lib/admin/roles'
import { ROUTES } from '@/lib/routes'
import { getAdminDesignProblem } from '@/lib/actions/admin/design-problems'
import { DesignProblemEditor } from '@/components/admin/DesignProblemEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: 'Design Problem Question Editor | SlateCamp Admin',
}

const AdminDesignProblemEditorPage = async ({ params }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  const { id } = await params
  const problem = await getAdminDesignProblem(id)

  if (!problem) {
    notFound()
  }

  return <DesignProblemEditor problem={problem} />
}

export default AdminDesignProblemEditorPage
