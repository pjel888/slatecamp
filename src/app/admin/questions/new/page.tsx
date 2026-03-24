import { redirect } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { QuestionEditor } from '@/components/admin/QuestionEditor'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'New Question — SlateCamp Admin' }

export default async function NewQuestionPage() {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin/dashboard')

  return <QuestionEditor />
}
