import { getQuestions } from '@/lib/actions/admin/question-queries'
import { QuestionList } from '@/components/admin/QuestionList'

export default async function AdminQuestionsPage() {
  const questions = await getQuestions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Question Bank</h1>
        <p className="text-muted-foreground">Manage your exam questions</p>
      </div>

      <QuestionList initialQuestions={questions} />
    </div>
  )
}
