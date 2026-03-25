import type { Metadata } from 'next'
import { getQuestions } from '@/lib/actions/admin/question-queries'

export const metadata: Metadata = { title: 'Questions — SlateCamp Admin' }
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Plus, UploadSimple, ChartBar } from '@phosphor-icons/react/dist/ssr'
import Link from 'next/link'
import { QuestionsTableClient } from './_components/QuestionsTableClient'

const AdminQuestionsPage = async () => {
  const questions = await getQuestions()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Questions"
        subtitle={`${questions.length} question${questions.length !== 1 ? 's' : ''} in bank`}
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

      <QuestionsTableClient questions={questions} />
    </div>
  )
}

export default AdminQuestionsPage
