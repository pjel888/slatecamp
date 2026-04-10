import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent } from '@/lib/admin/roles'
import { getContentEditorIndexData } from '@/lib/actions/admin/content'
import { ContentEditorIndex } from '@/components/admin/unified-editor/ContentEditorIndex'

export const metadata = {
  title: 'Question Bank | SlateCamp Admin',
}

const QuestionBankPage = async () => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  const { articles, searchableQuestions, taxonomyTree, stats } = await getContentEditorIndexData()

  return (
    <Suspense fallback={<div>Loading question bank...</div>}>
      <ContentEditorIndex
        articles={articles}
        searchableQuestions={searchableQuestions}
        taxonomyTree={taxonomyTree}
        stats={stats}
        defaultViewMode="questions"
      />
    </Suspense>
  )
}

export default QuestionBankPage
