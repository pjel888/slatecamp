import { redirect } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { getContentEditorIndexData } from '@/lib/actions/admin/content'
import { ContentEditorIndex } from '@/components/admin/unified-editor/ContentEditorIndex'

export const metadata = {
  title: 'Content Editor | SlateCamp Admin',
}

const ContentEditorIndexPage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const { articles, taxonomyTree, stats } = await getContentEditorIndexData()

  return (
    <ContentEditorIndex
      articles={articles}
      taxonomyTree={taxonomyTree}
      stats={stats}
    />
  )
}

export default ContentEditorIndexPage
