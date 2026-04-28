import type { Metadata } from 'next'
import { assertPermission } from '@/lib/admin/roles'
import { QuestionImporter } from '@/components/admin/QuestionImporter'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ROUTES } from '@/lib/routes'

export const metadata: Metadata = { title: 'Import Questions - SlateCamp Admin' }

export default async function ImportQuestionsPage() {
  await assertPermission('admin.content.import')

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
