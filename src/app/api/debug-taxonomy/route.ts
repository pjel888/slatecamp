import { createClient } from '@/lib/supabase/server'
import { getTaxonomyTree } from '@/lib/actions/wiki-actions'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get discipline
    const { data: disc } = await supabase
      .from('disciplines')
      .select('discipline_id')
      .limit(1)
      .single()

    if (!disc) {
      return NextResponse.json({ error: 'No discipline found' })
    }

    const nodes = await getTaxonomyTree(disc.discipline_id)

    const levels: Record<number, number> = {}
    let withArticles = 0
    let totalArticles = 0

    for (const n of nodes) {
      levels[n.level] = (levels[n.level] || 0) + 1
      if (n.articles && n.articles.length > 0) {
        withArticles++
        totalArticles += n.articles.length
      }
    }

    // Check parent-child relationships
    const l2nodes = nodes.filter(n => n.level === 2)
    const l2WithChildren = l2nodes.filter(l2 => nodes.some(n => n.parent_id === l2.node_id))

    // Sample nodes
    const sampleL3 = nodes.filter(n => n.level === 3).slice(0, 3).map(n => ({
      name: n.name,
      node_id: n.node_id,
      parent_id: n.parent_id,
      articles: n.articles,
    }))

    return NextResponse.json({
      totalNodes: nodes.length,
      levels,
      nodesWithArticles: withArticles,
      totalArticles,
      l2Total: l2nodes.length,
      l2WithChildren: l2WithChildren.length,
      sampleLevel3Nodes: sampleL3,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
