import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent } from '@/lib/admin/roles'
import { QuestionImporter } from '@/components/admin/QuestionImporter'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export const metadata: Metadata = { title: 'Import Questions - SlateCamp Admin' }

export default async function ImportQuestionsPage() {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Breadcrumb
        items={[
          { label: 'Knowledge Base', href: ROUTES.admin.knowledge },
          { label: 'Import Questions' },
        ]}
      />
      <div>
        <h1 className="text-xl font-semibold">Import Questions</h1>
        <p className="text-muted-foreground">Bulk import questions from CSV or JSON files</p>
      </div>
      <QuestionImporter />
    </div>
  )
}
