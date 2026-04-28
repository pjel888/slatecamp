import type { Metadata } from 'next'
import Link from 'next/link'
import { requirePermissionOrRedirect } from '@/lib/admin/roles'
import { fetchCoverageData, classifyCoverage, type CoverageCellData, type CoverageLevel } from '@/lib/actions/admin/coverage'
import { SectionHeader } from '@/components/shared/section-header'

export const metadata: Metadata = { title: 'Coverage Map — SlateCamp Admin' }
import { StatCard } from '@/components/shared/stat-card'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/shared/empty-state'
import { GridFour, Warning } from '@phosphor-icons/react/dist/ssr'

/* ------------------------------------------------------------------
 *  Helpers
 * ------------------------------------------------------------------ */

const coverageStyles: Record<CoverageLevel, string> = {
  full: 'bg-success-50 border-emerald',
  partial: 'bg-warning-50 border-warning',
  empty: 'bg-muted border-border',
  critical: 'bg-muted border-2 border-destructive',
}

/* ------------------------------------------------------------------
 *  Page
 * ------------------------------------------------------------------ */

const AdminTaxonomyCoveragePage = async () => {
  await requirePermissionOrRedirect('admin.analytics.view')
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
          icon={<GridFour size={20} />}
          title="No taxonomy data found"
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
        <LegendItem className="bg-success-50 border-emerald" label="Full (≥10q + article)" />
        <LegendItem className="bg-warning-50 border-warning" label="Partial (1–9q or draft)" />
        <LegendItem className="bg-muted border-border" label="Empty" />
        <LegendItem className="bg-muted border-2 border-destructive" label="Critical Gap (high-freq, no content)" />
      </div>

      {/* Coverage grid per level-1 node */}
      <div className="space-y-4">
        {level1.map((subject) => {
          const children = childrenMap.get(subject.node_id) ?? []

          return (
            <Card key={subject.node_id} size="sm">
              <div className="flex items-baseline gap-2 mb-2">
                {subject.lea_id && (
                  <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                    {subject.lea_id}
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
    <Link
      href={`/admin/knowledge?topic=${cell.node_id}&view=articles`}
      className={`
        relative flex flex-col items-center justify-center
        rounded-sm border p-1 min-h-[40px]
        transition-all duration-150 ease-out
        hover:scale-105 hover:shadow-sm hover:z-10
        ${coverageStyles[level]}
      `}
      aria-label={`${cell.lea_id ?? cell.name}: ${cell.questionCount} question${cell.questionCount !== 1 ? 's' : ''}, ${level} coverage — click to view content`}
      title={`${cell.name}${cell.lea_id ? ` (${cell.lea_id})` : ''} — ${cell.questionCount}q${cell.hasArticle ? ', has article' : ''}${cell.examFrequency ? `, freq: ${cell.examFrequency}` : ''}`}
    >
      {isCritical && (
        <Warning size={10} className="text-destructive absolute top-0.5 right-0.5" />
      )}
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-bold tabular-nums leading-none">
        {cell.questionCount > 0 ? `${cell.questionCount}q` : '0'}
      </span>
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground leading-tight truncate max-w-full px-0.5 mt-0.5">
        {cell.lea_id ?? cell.name.slice(0, 6)}
      </span>
    </Link>
  )
}

export default AdminTaxonomyCoveragePage
