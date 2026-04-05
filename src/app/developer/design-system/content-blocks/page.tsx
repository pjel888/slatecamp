import Link from 'next/link'
import { getComponentsByDomain } from '@/lib/developer/componentRegistry'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { Badge } from '@/components/ui/badge'

/* ------------------------------------------------------------------ */
/*  Content Blocks — Domain Index                                      */
/* ------------------------------------------------------------------ */

const STATUS_VARIANT = {
  stable: 'success',
  beta: 'warning',
  deprecated: 'danger',
} as const

const ContentBlocksPage = () => {
  const components = getComponentsByDomain('content-blocks')

  return (
    <div className="max-w-4xl">
      <Breadcrumbs />

      {/* Header */}
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
        Design System
      </p>
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground mb-1">
        Content Blocks
      </h1>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mb-8">
        Pedagogical MDX blocks embedded in wiki articles — quizzes, formulas,
        callouts, and more.
      </p>

      {/* Component grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {components.map((c) => (
          <Link
            key={c.slug}
            href={`/developer/design-system/content-blocks/${c.slug}`}
            className="group bg-card border border-border rounded-md p-5 transition-shadow duration-150 hover:shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                {c.title}
              </span>
              <Badge variant={STATUS_VARIANT[c.status]} size="xs" shape="pill">
                {c.status}
              </Badge>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {c.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ContentBlocksPage
