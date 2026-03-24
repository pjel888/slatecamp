import { redirect, notFound } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { getQuestion } from '@/lib/actions/admin/question-queries'
import { QuestionEditor } from '@/components/admin/QuestionEditor'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Edit Question — SlateCamp Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: PageProps) {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin/dashboard')

  const { id } = await params
  const question = await getQuestion(id)

  if (!question) {
    notFound()
  }

  return <QuestionEditor question={question} />
}
