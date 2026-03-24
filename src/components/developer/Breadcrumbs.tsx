'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DOMAIN_LABELS } from '@/lib/developer/componentRegistry'

/* ------------------------------------------------------------------ */
/*  Segment → human-readable label mapping                             */
/* ------------------------------------------------------------------ */

const SEGMENT_LABELS: Record<string, string> = {
  developer: 'Developer Portal',
  'design-system': 'Design System',
  wiki: 'Wiki',
  questions: 'Questions',
  'testing-path': 'Testing Path',
  shared: 'Shared',
  status: 'Status',
  database: 'Database',
  infrastructure: 'Infrastructure',
}

/** Convert a kebab-case slug to PascalCase (e.g. "wiki-card" → "WikiCard") */
const toPascalCase = (slug: string) =>
  slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

const labelFor = (segment: string): string =>
  SEGMENT_LABELS[segment] ?? toPascalCase(segment)

/* ------------------------------------------------------------------ */
/*  Breadcrumbs                                                        */
/* ------------------------------------------------------------------ */

export const Breadcrumbs = () => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  const crumbs = segments.map((seg, i) => ({
    label: labelFor(seg),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap mb-3">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-[9px] text-border select-none">/</span>
          )}
          {crumb.isLast ? (
            <span className="text-[11px] font-medium text-foreground">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
