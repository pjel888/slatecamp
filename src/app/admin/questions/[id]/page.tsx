import { getQuestion } from '@/lib/actions/admin/question-queries'
import { notFound } from 'next/navigation'
import { QuestionEditor } from '@/components/admin/QuestionEditor'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { id } = await params
  const question = await getQuestion(id)

  if (!question) {
    notFound()
  }

  return <QuestionEditor question={question} />
}
