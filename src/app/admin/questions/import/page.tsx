import { redirect } from 'next/navigation'
import { canManageContent } from '@/lib/admin/roles'
import { QuestionImporter } from '@/components/admin/QuestionImporter'

import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'Import Questions — SlateCamp Admin' }

export default async function ImportQuestionsPage() {
  const authorized = await canManageContent()
  if (!authorized) redirect('/admin/dashboard')

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Import Questions</h1>
        <p className="text-muted-foreground">Bulk import questions from CSV or JSON files</p>
      </div>
      <QuestionImporter />
    </div>
  )
}
