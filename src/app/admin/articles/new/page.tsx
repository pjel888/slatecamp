import { AdminMDXEditor } from '@/components/admin/AdminMDXEditorLoader'
import { canManageContent } from '@/lib/admin/roles'
import { redirect } from 'next/navigation'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'New Article | Admin' }

const NewArticlePage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  return <AdminMDXEditor />
}

export default NewArticlePage
