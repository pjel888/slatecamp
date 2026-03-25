import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { ComponentPageLayout } from '@/components/developer/ComponentPageLayout'
import {
  getComponentBySlug,
  getComponentsByDomain,
} from '@/lib/developer/componentRegistry'
import type { PropsTableEntry } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Wiki Domain — Component Documentation Pages                        */
/* ------------------------------------------------------------------ */

interface ComponentData {
  propsTable: PropsTableEntry[]
  codeSnippet: string
  preview: React.ReactNode
}

/* ── WikiCard ────────────────────────────────────────────────────── */

const wikiCardData: ComponentData = {
  propsTable: [
    { name: 'title', type: 'string', defaultValue: null, required: true, description: 'Article title displayed on the card.' },
    { name: 'description', type: 'string', defaultValue: null, required: false, description: 'Short summary excerpt below the title.' },
    { name: 'domain', type: 'string', defaultValue: null, required: true, description: 'Regulatory domain label (e.g. "PD 1096").' },
    { name: 'tags', type: 'string[]', defaultValue: '[]', required: false, description: 'Taxonomy tags displayed as pills.' },
    { name: 'status', type: "'published' | 'draft' | 'archived'", defaultValue: "'published'", required: false, description: 'Publication status badge.' },
    { name: 'lastUpdated', type: 'string', defaultValue: null, required: false, description: 'ISO date string of last modification.' },
    { name: 'href', type: 'string', defaultValue: null, required: true, description: 'Navigation target when the card is clicked.' },
  ],
  codeSnippet: `import { WikiCard } from '@/components/wiki/WikiCard'

<WikiCard
  title="Section 401: Minimum Corridor Width"
  domain="PD 1096"
  status="published"
  tags={['egress', 'corridors']}
  href="/wiki/pd-1096/section-401"
/>`,
  preview: (
    <div className="w-full max-w-sm bg-card border border-border rounded-md p-4 space-y-3 hover:shadow-sm transition-shadow duration-150">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-primary text-[11px] font-medium">
          PD 1096 — National Building Code
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm bg-[#EDFAF4] text-emerald-700 text-[11px] font-medium">
          Published
        </span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground leading-snug mb-1">
          Section 401: Minimum Corridor Width Requirements
        </h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Defines the minimum clear width for corridors serving various
          occupancy types under the National Building Code.
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-[11px] text-muted-foreground">
          egress
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-[11px] text-muted-foreground">
          corridors
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-[11px] text-muted-foreground">
          commercial
        </span>
      </div>
    </div>
  ),
}

/* ── ArticleRenderer ─────────────────────────────────────────────── */

const articleRendererData: ComponentData = {
  propsTable: [
    { name: 'content', type: 'string', defaultValue: null, required: true, description: 'Raw MDX / markdown content string to render.' },
    { name: 'className', type: 'string', defaultValue: null, required: false, description: 'Additional CSS class names for the wrapper.' },
  ],
  codeSnippet: `import { ArticleRenderer } from '@/components/wiki/ArticleRenderer'

<ArticleRenderer content={articleContent} />`,
  preview: (
    <div className="w-full max-w-md space-y-4 text-foreground">
      <h2 className="font-[family-name:var(--font-display)] font-bold text-[15px] tracking-tight">
        Section 401: Corridor Width Standards
      </h2>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        The minimum corridor width for buildings classified under Group C
        (commercial) occupancies shall be determined by the occupant load of the
        floor area served. Corridors shall provide unobstructed egress width as
        specified in Table 401.1.
      </p>
      <h3 className="font-[family-name:var(--font-display)] font-bold text-[13px] tracking-tight">
        401.2 Width Calculations
      </h3>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        For occupant loads exceeding 50 persons, the corridor width shall be
        increased at a rate of 7.6 mm per additional occupant beyond the base
        threshold.
      </p>
      <div className="rounded-sm border border-zinc-800 bg-zinc-950 p-3 overflow-x-auto">
        <pre className="font-[family-name:var(--font-dm-mono)] text-[11px] text-zinc-300 leading-relaxed">
          {`corridor_width = base_width + (occupant_load - 50) * 7.6mm\nmin_width = max(corridor_width, 1200mm)`}
        </pre>
      </div>
    </div>
  ),
}

/* ── TableOfContents ─────────────────────────────────────────────── */

const tableOfContentsData: ComponentData = {
  propsTable: [
    { name: 'headings', type: 'Array<{ id: string; text: string; level: number }>', defaultValue: null, required: true, description: 'List of heading anchors extracted from the article.' },
    { name: 'activeId', type: 'string', defaultValue: null, required: false, description: 'Currently visible heading id for scroll-spy highlighting.' },
  ],
  codeSnippet: `import { TableOfContents } from '@/components/wiki/TableOfContents'

<TableOfContents
  headings={[
    { id: 'overview', text: 'Overview', level: 2 },
    { id: 'width-requirements', text: 'Width Requirements', level: 2 },
    { id: 'occupant-load', text: 'Occupant Load Calculations', level: 3 },
    { id: 'exceptions', text: 'Exceptions', level: 3 },
    { id: 'references', text: 'References', level: 2 },
  ]}
  activeId="width-requirements"
/>`,
  preview: (
    <div className="w-full max-w-xs">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
        On this page
      </p>
      <nav className="space-y-1 border-l border-border pl-3">
        <a href="#overview" className="block text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-150">
          Overview
        </a>
        <a href="#width-requirements" className="block text-[12px] text-primary font-medium border-l-2 border-primary -ml-[13px] pl-[11px]">
          Width Requirements
        </a>
        <a href="#occupant-load" className="block text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-150 pl-3">
          Occupant Load Calculations
        </a>
        <a href="#exceptions" className="block text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-150 pl-3">
          Exceptions
        </a>
        <a href="#references" className="block text-[12px] text-muted-foreground hover:text-foreground transition-colors duration-150">
          References
        </a>
      </nav>
    </div>
  ),
}

/* ── BreadcrumbNav ───────────────────────────────────────────────── */

const breadcrumbNavData: ComponentData = {
  propsTable: [
    { name: 'items', type: 'Array<{ label: string; href: string }>', defaultValue: null, required: true, description: 'Ordered list of breadcrumb segments.' },
    { name: 'separator', type: 'string', defaultValue: "'/'", required: false, description: 'Character used between segments.' },
  ],
  codeSnippet: `import { BreadcrumbNav } from '@/components/wiki/BreadcrumbNav'

<BreadcrumbNav
  items={[
    { label: 'Wiki', href: '/wiki' },
    { label: 'PD 1096', href: '/wiki/pd-1096' },
    { label: 'Section 401', href: '/wiki/pd-1096/section-401' },
  ]}
/>`,
  preview: (
    <nav className="flex items-center gap-1.5">
      <a href="#" className="text-[12px] text-primary hover:underline">
        Wiki
      </a>
      <span className="text-[11px] text-muted-foreground select-none">/</span>
      <a href="#" className="text-[12px] text-primary hover:underline">
        PD 1096
      </a>
      <span className="text-[11px] text-muted-foreground select-none">/</span>
      <span className="text-[12px] text-foreground font-medium">
        Section 401
      </span>
    </nav>
  ),
}

/* ── TagBadge ────────────────────────────────────────────────────── */

const tagBadgeData: ComponentData = {
  propsTable: [
    { name: 'label', type: 'string', defaultValue: null, required: true, description: 'Text displayed inside the badge.' },
    { name: 'variant', type: "'default' | 'primary' | 'muted'", defaultValue: "'default'", required: false, description: 'Visual style variant.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", required: false, description: 'Badge sizing.' },
  ],
  codeSnippet: `import { TagBadge } from '@/components/wiki/TagBadge'

<TagBadge label="Structural" variant="primary" />
<TagBadge label="Egress" variant="default" />
<TagBadge label="Archived" variant="muted" />`,
  preview: (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-[#EEF2FC] text-primary text-[12px] font-medium">
        Structural
      </span>
      <span className="inline-flex items-center px-2.5 py-1 rounded-sm border border-border bg-card text-foreground text-[12px] font-medium">
        Egress
      </span>
      <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-muted text-muted-foreground text-[12px] font-medium">
        Archived
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[#EEF2FC] text-primary text-[11px] font-medium">
        Utilities
      </span>
      <span className="inline-flex items-center px-2 py-0.5 rounded-sm border border-border bg-card text-foreground text-[11px] font-medium">
        Fire Safety
      </span>
    </div>
  ),
}

/* ── Component data lookup ───────────────────────────────────────── */

const COMPONENT_DATA: Record<string, ComponentData> = {
  'wiki-card': wikiCardData,
  'article-renderer': articleRendererData,
  'table-of-contents': tableOfContentsData,
  'breadcrumb-nav': breadcrumbNavData,
  'tag-badge': tagBadgeData,
}

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export const generateStaticParams = () =>
  getComponentsByDomain('wiki').map((c) => ({ component: c.slug }))

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const WikiComponentPage = async ({
  params,
}: {
  params: Promise<{ component: string }>
}) => {
  const { component } = await params
  const meta = getComponentBySlug('wiki', component)

  if (!meta) {
    notFound()
  }

  const data = COMPONENT_DATA[component]

  if (!data) {
    notFound()
  }

  return (
    <>
      <Breadcrumbs />
      <ComponentPageLayout
        title={meta.title}
        description={meta.description}
        domain="Wiki Article"
        status={meta.status}
        importPath={meta.importPath}
        filePath={meta.filePath}
        preview={data.preview}
        propsTable={data.propsTable}
        codeSnippet={data.codeSnippet}
        lastUpdated="2026-03-20"
      />
    </>
  )
}

export default WikiComponentPage
