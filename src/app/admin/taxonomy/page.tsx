import { createClient } from '@/lib/supabase/server'
import { TaxonomyEditor } from '@/components/admin/TaxonomyEditor'

async function getTaxonomyNodes() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('taxonomy_tree')
    .select('id:node_id, name, level, subject_area, is_leaf, parent_id, discipline_id')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching taxonomy nodes:', error)
    return []
  }

  return data || []
}

export default async function AdminTaxonomyPage() {
  const nodes = await getTaxonomyNodes()

  // Get discipline ID from first node or use a default
  const disciplineId = nodes[0]?.discipline_id || ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Taxonomy Editor</h1>
        <p className="text-muted-foreground">Manage the discipline → subject → topic hierarchy</p>
      </div>

      <TaxonomyEditor initialNodes={nodes} disciplineId={disciplineId} />
    </div>
  )
}
