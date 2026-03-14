import React from 'react'
import { NotesShell } from '@/components/notes/NotesShell'
import { getTaxonomyTree, type TaxonomyNode } from '@/lib/actions/taxonomy'
import { getUserGlobalStats } from '@/lib/actions/user-stats'
import { redirect } from 'next/navigation'
import type { WikiCategory } from '@/types/app'

function mapTaxonomyToWikiCategory(nodes: TaxonomyNode[]): WikiCategory[] {
  return nodes.map(node => ({
    id: node.node_id,
    parent_id: node.parent_id,
    name: node.name,
    slug: node.slug || '',
    description: null,
    order_index: 0,
    created_at: '',
    updated_at: '',
    children: node.children ? mapTaxonomyToWikiCategory(node.children) : []
  }))
}

export default async function NotesPage() {
  const stats = await getUserGlobalStats()
  
  if (!stats?.current_discipline_id) {
    redirect('/onboarding')
  }

  const tree = await getTaxonomyTree(stats.current_discipline_id)
  const wikiTree = mapTaxonomyToWikiCategory(tree)

  return (
    <div className="h-full w-full overflow-hidden">
      <NotesShell tree={wikiTree} />
    </div>
  )
}
