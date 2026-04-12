import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent } from '@/lib/admin/roles'
import { getContentEditorIndexData } from '@/lib/actions/admin/content'
import { ContentEditorIndex } from '@/components/admin/unified-editor/ContentEditorIndex'

export const metadata = {
  title: 'Question Bank | SlateCamp Admin',
}

interface QuestionBankPageProps {
  searchParams: Promise<{ search?: string; filter?: string }>
}

const QuestionBankPage = async ({ searchParams }: QuestionBankPageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)
  const { search, filter } = await searchParams

  const { articles, searchableQuestions, taxonomyTree, stats } = await getContentEditorIndexData()

  return (
    <ContentEditorIndex
      articles={articles}
      searchableQuestions={searchableQuestions}
      taxonomyTree={taxonomyTree}
      stats={stats}
      defaultViewMode="questions"
      defaultSearchQuery={search || ''}
      defaultQuestionFilter={filter || ''}
    />
  )
}

export default QuestionBankPage
