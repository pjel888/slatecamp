import { AdminMDXEditor } from '@/components/admin/AdminMDXEditorLoader'
import { getArticle } from '@/lib/actions/admin/wiki-queries'
import { canManageContent } from '@/lib/admin/roles'
import { redirect, notFound } from 'next/navigation'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Edit Article | Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

const EditArticlePage = async ({ params }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const { id } = await params
  const article = await getArticle(id)

  if (!article) notFound()

  return <AdminMDXEditor article={article} />
}

export default EditArticlePage
