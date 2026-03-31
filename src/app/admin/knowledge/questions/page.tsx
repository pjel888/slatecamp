import { redirect } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { getContentEditorIndexData } from '@/lib/actions/admin/content'
import { ContentEditorIndex } from '@/components/admin/unified-editor/ContentEditorIndex'

export const metadata = {
  title: 'Question Bank | SlateCamp Admin',
}

const QuestionBankPage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin')

  const { articles, searchableQuestions, taxonomyTree, stats } = await getContentEditorIndexData()

  return (
    <ContentEditorIndex
      articles={articles}
      searchableQuestions={searchableQuestions}
      taxonomyTree={taxonomyTree}
      stats={stats}
      defaultViewMode="questions"
    />
  )
}

export default QuestionBankPage
