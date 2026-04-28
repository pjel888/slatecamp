import type { Metadata } from 'next'
import { assertPermission } from '@/lib/admin/roles'
import { getTaxonomyNodes } from '@/lib/actions/admin/taxonomy'
import { TaxonomyEditor } from '@/components/admin/TaxonomyEditor'

export const metadata: Metadata = { title: 'Taxonomy - SlateCamp Admin' }

export default async function AdminTaxonomyPage() {
  await assertPermission('admin.taxonomy.manage')
  const nodes = await getTaxonomyNodes()

  // Get discipline ID from first node or use a default
  const disciplineId = nodes[0]?.discipline_id || ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Taxonomy Editor</h1>
        <p className="text-muted-foreground">Manage the discipline -&gt; subject -&gt; topic hierarchy</p>
      </div>

      <TaxonomyEditor initialNodes={nodes} disciplineId={disciplineId} />
    </div>
  )
}
