import type { Metadata } from 'next'
import { getQuestions, getQuestionsGroupedByArticle, getQuestionsTaxonomyTree } from '@/lib/actions/admin/question-queries'

export const metadata: Metadata = { title: 'Questions — SlateCamp Admin' }
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Plus, UploadSimple, ChartBar } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { QuestionsTableClient } from './_components/QuestionsTableClient'

const PAGE_SIZE = 50

const AdminQuestionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) => {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)

  const [{ data: questions, totalCount }, { data: articleGroups }, taxonomyTree] =
    await Promise.all([
      getQuestions(page, PAGE_SIZE),
      getQuestionsGroupedByArticle(page, PAGE_SIZE),
      getQuestionsTaxonomyTree(),
    ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questions"
        subtitle={`${totalCount.toLocaleString()} question${totalCount !== 1 ? 's' : ''} in bank`}
        actions={
          <>
            <Link href="/admin/questions/analytics">
              <Button variant="ghost" size="sm" leftIcon={<ChartBar />}>
                Analytics
              </Button>
            </Link>
            <Link href="/admin/questions/import">
              <Button variant="secondary" size="sm" leftIcon={<UploadSimple />}>
                Import
              </Button>
            </Link>
            <Link href="/admin/questions/new">
              <Button variant="primary" size="sm" leftIcon={<Plus />}>
                New Question
              </Button>
            </Link>
          </>
        }
      />

      <QuestionsTableClient
        questions={questions}
        articleGroups={articleGroups}
        totalCount={totalCount}
        page={page}
        pageSize={PAGE_SIZE}
        taxonomyTree={taxonomyTree}
      />
    </div>
  )
}

export default AdminQuestionsPage
