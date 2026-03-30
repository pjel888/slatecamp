import { AdminMDXEditor } from '@/components/admin/AdminMDXEditorLoader'
import { canManageContent } from '@/lib/admin/roles'
import { redirect } from 'next/navigation'
import { getTaxonomyNodes } from '@/lib/actions/admin/taxonomy'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'New Article | Admin' }

const NewArticlePage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const nodes = await getTaxonomyNodes()

  return <AdminMDXEditor taxonomyNodes={nodes} />
}

export default NewArticlePage
