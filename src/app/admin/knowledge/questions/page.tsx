import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent } from '@/lib/admin/roles'
import { getContentEditorIndexData } from '@/lib/actions/admin/content'
import { getQuestionsGroupedByArticle } from '@/lib/actions/admin/question-queries'
import { ContentEditorIndex } from '@/components/admin/unified-editor/ContentEditorIndex'

export const metadata = {
  title: 'Question Bank | SlateCamp Admin',
}

interface QuestionBankPageProps {
  searchParams: Promise<{ search?: string; filter?: string; page?: string }>
}

const QuestionBankPage = async ({ searchParams }: QuestionBankPageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)
  const { search, filter, page } = await searchParams
  const currentPage = Number.parseInt(page || '1', 10)
  const pageSize = 50

  const [{ articles, searchableQuestions, taxonomyTree, stats }, groupedQuestions] = await Promise.all([
    getContentEditorIndexData(),
    getQuestionsGroupedByArticle(currentPage, pageSize),
  ])

  return (
    <ContentEditorIndex
      articles={articles}
      searchableQuestions={searchableQuestions}
      taxonomyTree={taxonomyTree}
      stats={stats}
      questionGroups={groupedQuestions.data}
      questionTotalCount={groupedQuestions.totalCount}
      questionPage={currentPage}
      questionPageSize={pageSize}
      defaultViewMode="questions"
      defaultSearchQuery={search || ''}
      defaultQuestionFilter={filter || ''}
      indexBasePath={ROUTES.admin.knowledgeQuestions}
    />
  )
}

export default QuestionBankPage
