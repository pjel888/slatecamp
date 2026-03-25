import Link from 'next/link'
import { getComponentsByDomain } from '@/lib/developer/componentRegistry'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { Badge } from '@/components/ui/badge'
import type { ComponentMeta } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Interactive Widgets — Domain Index (grouped by law code)           */
/* ------------------------------------------------------------------ */

const STATUS_VARIANT = {
  stable: 'success',
  beta: 'warning',
  deprecated: 'danger',
} as const

const LAW_GROUPS = [
  { key: 'BP-344', label: 'BP-344: Accessibility Standards' },
  { key: 'DSGN-013', label: 'DSGN-013: Furniture & Clearances' },
  { key: 'PD-1096', label: 'PD-1096: Building Code' },
] as const

const WidgetCard = ({ c }: { c: ComponentMeta }) => (
  <Link
    href={`/developer/design-system/widgets/${c.slug}`}
    className="group bg-card border border-border rounded-md p-5 transition-shadow duration-150 hover:shadow-sm"
  >
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
        {c.title}
      </span>
      <Badge variant={STATUS_VARIANT[c.status]} size="xs" pill>
        {c.status}
      </Badge>
    </div>
    <p className="text-[12px] text-muted-foreground leading-relaxed">
      {c.description}
    </p>
  </Link>
)

const WidgetsPage = () => {
  const widgets = getComponentsByDomain('widgets')
  const bp344 = widgets.filter((w) => w.lawGroup === 'BP-344')
  const dsgn013 = widgets.filter((w) => w.lawGroup === 'DSGN-013')
  const pd1096 = widgets.filter((w) => w.lawGroup === 'PD-1096')

  const groups = [
    { ...LAW_GROUPS[0], components: bp344 },
    { ...LAW_GROUPS[1], components: dsgn013 },
    { ...LAW_GROUPS[2], components: pd1096 },
  ]

  return (
    <div className="max-w-4xl">
      <Breadcrumbs />

      {/* Header */}
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
        Design System
      </p>
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight mb-1">
        Interactive Widgets
      </h1>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mb-8">
        Interactive per-law visualizers and calculators for architecture exam
        content.
      </p>

      {/* Law group sections */}
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.key}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-foreground">
                {group.label}
              </h2>
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-muted font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground">
                {group.components.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {group.components.map((c) => (
                <WidgetCard key={c.slug} c={c} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default WidgetsPage
