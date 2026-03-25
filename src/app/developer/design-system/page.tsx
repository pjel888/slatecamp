import Link from 'next/link'
import {
  getComponentsByDomain,
  DOMAIN_LABELS,
} from '@/lib/developer/componentRegistry'

/* ------------------------------------------------------------------ */
/*  Design System Overview                                             */
/* ------------------------------------------------------------------ */

const DOMAIN_DESCRIPTIONS: Record<string, string> = {
  wiki: 'Article rendering, navigation, and taxonomy components for the knowledge base.',
  'content-blocks':
    'Pedagogical MDX blocks embedded in wiki articles — quizzes, formulas, callouts, and more.',
  widgets:
    'Interactive per-law visualizers and calculators for architecture exam content.',
  questions:
    'Quiz presentation, answer selection, rationale display, and session management.',
  'testing-path':
    'Readiness scoring, mastery visualization, and study-path progress tracking.',
  shared:
    'Foundational UI primitives used across every domain — buttons, cards, badges, and more.',
}

const DOMAIN_ORDER = ['wiki', 'content-blocks', 'widgets', 'questions', 'testing-path', 'shared'] as const

/** Domains that have their own index page.tsx listing all components. */
const DOMAINS_WITH_INDEX = new Set<string>(['content-blocks', 'widgets'])

const DesignSystemPage = () => {
  const domains = DOMAIN_ORDER.map((key) => {
    const components = getComponentsByDomain(key)
    const firstSlug = components[0]?.slug
    const hasIndex = DOMAINS_WITH_INDEX.has(key)
    return {
      key,
      label: DOMAIN_LABELS[key] ?? key,
      description: DOMAIN_DESCRIPTIONS[key] ?? '',
      count: components.length,
      href: hasIndex
        ? `/developer/design-system/${key}`
        : firstSlug
          ? `/developer/design-system/${key}/${firstSlug}`
          : `/developer/design-system/${key}`,
    }
  })

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
        Component Library
      </p>
      <h1 className="font-[family-name:var(--font-display)] font-extrabold text-2xl text-foreground tracking-tight mb-1">
        Design System
      </h1>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mb-8">
        Domain-organized component catalog for the SlateCamp platform.
      </p>

      {/* Domain grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {domains.map((d) => (
          <Link
            key={d.key}
            href={d.href}
            className="group bg-card border border-border rounded-md p-5 transition-shadow duration-150 hover:shadow-sm"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                {d.label}
              </span>
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-muted font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground">
                {d.count}
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              {d.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DesignSystemPage
