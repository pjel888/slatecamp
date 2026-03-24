import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SectionHeader } from '@/components/shared/section-header'

export const metadata: Metadata = { title: 'Coverage Map — SlateCamp Admin' }
import { StatCard } from '@/components/shared/stat-card'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { Grid3X3, AlertTriangle } from 'lucide-react'

/* ------------------------------------------------------------------
 *  Types
 * ------------------------------------------------------------------ */

interface TaxonomyNode {
  node_id: string
  name: string
  ale_id: string | null
  parent_id: string | null
  level: number
  exam_frequency: string | null
}

interface CoverageCellData {
  node_id: string
  name: string
  ale_id: string | null
  questionCount: number
  hasArticle: boolean
  examFrequency: string | null
}

type CoverageLevel = 'full' | 'partial' | 'empty' | 'critical'

/* ------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------ */

const classifyCoverage = (cell: CoverageCellData): CoverageLevel => {
  const hasQuestions = cell.questionCount > 0
  const isHighFrequency = cell.examFrequency === 'high'

  if (cell.questionCount >= 10 && cell.hasArticle) return 'full'
  if (hasQuestions || cell.hasArticle) return 'partial'
  if (!hasQuestions && !cell.hasArticle && isHighFrequency) return 'critical'
  return 'empty'
}

const coverageStyles: Record<CoverageLevel, string> = {
  full: 'bg-[#EDFAF4] border-[#C6DBAD]',
  partial: 'bg-[#FFF8EB] border-[#FDE68A]',
  empty: 'bg-muted border-border',
  critical: 'bg-muted border-2 border-red-500',
}

/* ------------------------------------------------------------------
 *  Data fetching
 * ------------------------------------------------------------------ */

const fetchCoverageData = async () => {
  const supabase = await createClient()

  // 1. Get taxonomy nodes at level 1 and 2
  const { data: nodes, error: nodesError } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, ale_id, parent_id, level, exam_frequency')
    .in('level', [1, 2])
    .is('deprecated_at', null)
    .eq('is_cross_ref_only', false)
    .order('name', { ascending: true })

  if (nodesError || !nodes) {
    console.error('Error fetching taxonomy nodes:', nodesError)
    return { level1: [], childrenMap: new Map<string, CoverageCellData[]>(), stats: { total: 0, full: 0, partial: 0, empty: 0, critical: 0 } }
  }

  // 2. Get question counts per topic_id
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('topic_id')

  if (qError) console.error('Error fetching questions:', qError)

  const questionCounts = new Map<string, number>()
  questions?.forEach((q) => {
    const current = questionCounts.get(q.topic_id) ?? 0
    questionCounts.set(q.topic_id, current + 1)
  })

  // 3. Get article presence via junction table
  const { data: articleLinks, error: aError } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id')

  if (aError) console.error('Error fetching article taxonomy:', aError)

  const articleNodeSet = new Set<string>()
  articleLinks?.forEach((link) => articleNodeSet.add(link.node_id))

  // 4. Separate level-1 and level-2 nodes
  const level1Nodes = (nodes as TaxonomyNode[]).filter((n) => n.level === 1)
  const level2Nodes = (nodes as TaxonomyNode[]).filter((n) => n.level === 2)

  // 5. Build children map: parent_id -> CoverageCellData[]
  const childrenMap = new Map<string, CoverageCellData[]>()

  level2Nodes.forEach((n) => {
    if (!n.parent_id) return
    const cell: CoverageCellData = {
      node_id: n.node_id,
      name: n.name,
      ale_id: n.ale_id,
      questionCount: questionCounts.get(n.node_id) ?? 0,
      hasArticle: articleNodeSet.has(n.node_id),
      examFrequency: n.exam_frequency,
    }
    const existing = childrenMap.get(n.parent_id) ?? []
    existing.push(cell)
    childrenMap.set(n.parent_id, existing)
  })

  // 6. Compute stats
  const allCells = level2Nodes.map((n) => ({
    node_id: n.node_id,
    name: n.name,
    ale_id: n.ale_id,
    questionCount: questionCounts.get(n.node_id) ?? 0,
    hasArticle: articleNodeSet.has(n.node_id),
    examFrequency: n.exam_frequency,
  }))

  const stats = {
    total: allCells.length,
    full: allCells.filter((c) => classifyCoverage(c) === 'full').length,
    partial: allCells.filter((c) => classifyCoverage(c) === 'partial').length,
    empty: allCells.filter((c) => classifyCoverage(c) === 'empty').length,
    critical: allCells.filter((c) => classifyCoverage(c) === 'critical').length,
  }

  return { level1: level1Nodes, childrenMap, stats }
}

/* ------------------------------------------------------------------
 *  Page
 * ------------------------------------------------------------------ */

const AdminTaxonomyCoveragePage = async () => {
  const { level1, childrenMap, stats } = await fetchCoverageData()

  if (level1.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Structure"
          title="Taxonomy Coverage Map"
          subtitle="Visual overview of content coverage."
        />
        <EmptyState
          icon={<Grid3X3 className="h-5 w-5" />}
          message="No taxonomy data found"
          description="Add taxonomy nodes to see coverage analysis here."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Structure"
        title="Taxonomy Coverage Map"
        subtitle="Visual overview of content coverage. Red outlines = high-frequency exam topics with no content."
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard eyebrow="Total Topics" value={stats.total} />
        <StatCard eyebrow="Full Coverage" value={stats.full} color="text-emerald-600" />
        <StatCard eyebrow="Partial" value={stats.partial} color="text-amber-600" />
        <StatCard eyebrow="Empty" value={stats.empty} />
        <StatCard
          eyebrow="Critical Gaps"
          value={stats.critical}
          color={stats.critical > 0 ? 'text-red-600' : undefined}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest">
          Legend
        </span>
        <LegendItem className="bg-[#EDFAF4] border-[#C6DBAD]" label="Full" />
        <LegendItem className="bg-[#FFF8EB] border-[#FDE68A]" label="Partial" />
        <LegendItem className="bg-muted border-border" label="Empty" />
        <LegendItem className="bg-muted border-2 border-red-500" label="Critical Gap" />
      </div>

      {/* Coverage grid per level-1 node */}
      <div className="space-y-4">
        {level1.map((subject) => {
          const children = childrenMap.get(subject.node_id) ?? []

          return (
            <Card key={subject.node_id} size="sm">
              <div className="flex items-baseline gap-2 mb-2">
                {subject.ale_id && (
                  <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {subject.ale_id}
                  </span>
                )}
                <span className="text-sm font-medium text-foreground">
                  {subject.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {children.length} topics
                </span>
              </div>

              {children.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">
                  No level-2 topics
                </p>
              ) : (
                <div
                  className="grid gap-1.5"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                  }}
                >
                  {children.map((cell) => (
                    <CoverageCell key={cell.node_id} cell={cell} />
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------
 *  Sub-components
 * ------------------------------------------------------------------ */

const LegendItem = ({ className, label }: { className: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`inline-block h-3 w-3 rounded-sm border ${className}`} />
    <span>{label}</span>
  </span>
)

const CoverageCell = ({ cell }: { cell: CoverageCellData }) => {
  const level = classifyCoverage(cell)
  const isCritical = level === 'critical'

  return (
    <div
      className={`
        relative flex flex-col items-center justify-center
        rounded-sm border p-1 min-h-[40px]
        transition-all duration-150 ease-out
        hover:scale-105 hover:shadow-sm hover:z-10
        ${coverageStyles[level]}
      `}
      title={`${cell.name}${cell.ale_id ? ` (${cell.ale_id})` : ''} — ${cell.questionCount}q${cell.hasArticle ? ', has article' : ''}${cell.examFrequency ? `, freq: ${cell.examFrequency}` : ''}`}
    >
      {isCritical && (
        <AlertTriangle className="h-2.5 w-2.5 text-red-500 absolute top-0.5 right-0.5" />
      )}
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-bold tabular-nums leading-none">
        {cell.questionCount > 0 ? `${cell.questionCount}q` : '0'}
      </span>
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground leading-tight truncate max-w-full px-0.5 mt-0.5">
        {cell.ale_id ?? cell.name.slice(0, 6)}
      </span>
    </div>
  )
}

export default AdminTaxonomyCoveragePage
