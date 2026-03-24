import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { ComponentPageLayout } from '@/components/developer/ComponentPageLayout'
import { getComponentBySlug } from '@/lib/developer/componentRegistry'
import type { PropsTableEntry } from '@/types/developer'
import {
  ButtonPreview,
  BadgePreview,
  CardPreview,
  TooltipPreview,
  SkeletonPreview,
  EmptyStatePreview,
} from '../_previews'

/* ------------------------------------------------------------------ */
/*  Per-component data lookup                                          */
/* ------------------------------------------------------------------ */

interface ComponentData {
  propsTable: PropsTableEntry[]
  codeSnippet: string
  preview: React.ReactNode
}

const COMPONENT_DATA: Record<string, ComponentData> = {
  /* ── Button ──────────────────────────────────────────────────────── */
  button: {
    propsTable: [
      { name: 'variant', type: "'default' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'link'", defaultValue: "'default'", required: false, description: 'Visual style variant controlling color, background, and border treatment.' },
      { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", defaultValue: "'md'", required: false, description: 'Controls padding, font size, and overall button dimensions.' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false', required: false, description: 'Disables the button, reducing opacity and preventing interaction.' },
      { name: 'children', type: 'ReactNode', defaultValue: null, required: true, description: 'Button label or content.' },
      { name: 'asChild', type: 'boolean', defaultValue: 'false', required: false, description: 'Merges props onto the child element instead of rendering a <button>.' },
    ],
    codeSnippet: `import { Button } from '@/components/ui/button'

<Button variant="default" size="md">
  Start Session
</Button>`,
    preview: <ButtonPreview />,
  },

  /* ── Badge ───────────────────────────────────────────────────────── */
  badge: {
    propsTable: [
      { name: 'variant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", defaultValue: "'default'", required: false, description: 'Color variant indicating status or category.' },
      { name: 'size', type: "'xs' | 'sm' | 'md'", defaultValue: "'sm'", required: false, description: 'Controls padding and font size of the badge.' },
      { name: 'pill', type: 'boolean', defaultValue: 'false', required: false, description: 'Rounds corners fully to create a pill shape.' },
      { name: 'children', type: 'ReactNode', defaultValue: null, required: true, description: 'Badge label or content.' },
    ],
    codeSnippet: `import { Badge } from '@/components/ui/badge'

<Badge variant="success" size="sm" pill>Stable</Badge>`,
    preview: <BadgePreview />,
  },

  /* ── Card ─────────────────────────────────────────────────────────── */
  card: {
    propsTable: [
      { name: 'variant', type: "'default' | 'interactive'", defaultValue: "'default'", required: false, description: 'Default is static. Interactive adds hover shadow and border highlight.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", required: false, description: 'Controls internal padding of the card.' },
      { name: 'className', type: 'string', defaultValue: null, required: false, description: 'Additional CSS classes merged onto the card container.' },
      { name: 'children', type: 'ReactNode', defaultValue: null, required: true, description: 'Card content including CardHeader, CardContent, and CardFooter slots.' },
    ],
    codeSnippet: `import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<Card variant="interactive">
  <CardHeader>
    <CardTitle>Session Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content here</p>
  </CardContent>
</Card>`,
    preview: <CardPreview />,
  },

  /* ── Tooltip ─────────────────────────────────────────────────────── */
  tooltip: {
    propsTable: [
      { name: 'content', type: 'string', defaultValue: null, required: true, description: 'Text content displayed inside the tooltip.' },
      { name: 'side', type: "'top' | 'right' | 'bottom' | 'left'", defaultValue: "'top'", required: false, description: 'Preferred side for tooltip placement relative to the trigger.' },
      { name: 'children', type: 'ReactNode', defaultValue: null, required: true, description: 'Trigger element that activates the tooltip on hover.' },
    ],
    codeSnippet: `import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>`,
    preview: <TooltipPreview />,
  },

  /* ── Skeleton ────────────────────────────────────────────────────── */
  skeleton: {
    propsTable: [
      { name: 'className', type: 'string', defaultValue: null, required: false, description: 'Custom dimensions and styling for the skeleton element.' },
      { name: 'variant', type: "'line' | 'circle' | 'card'", defaultValue: "'line'", required: false, description: 'Shape preset — line for text, circle for avatars, card for containers.' },
    ],
    codeSnippet: `import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-48" />
<Skeleton className="h-4 w-32" />`,
    preview: <SkeletonPreview />,
  },

  /* ── EmptyState ──────────────────────────────────────────────────── */
  'empty-state': {
    propsTable: [
      { name: 'icon', type: 'ReactNode', defaultValue: null, required: false, description: 'Optional icon or illustration displayed above the title.' },
      { name: 'title', type: 'string', defaultValue: null, required: true, description: 'Primary heading for the empty state.' },
      { name: 'description', type: 'string', defaultValue: null, required: false, description: 'Supporting text explaining why the state is empty and what to do next.' },
      { name: 'action', type: 'ReactNode', defaultValue: null, required: false, description: 'Optional call-to-action element, typically a Button.' },
    ],
    codeSnippet: `import { EmptyState } from '@/components/shared/empty-state'

<EmptyState
  title="No sessions yet"
  description="Start a practice session to track your progress."
  action={<Button>Start Session</Button>}
/>`,
    preview: <EmptyStatePreview />,
  },
}

/* ------------------------------------------------------------------ */
/*  Known slugs for static generation                                  */
/* ------------------------------------------------------------------ */

const KNOWN_SLUGS = [
  'button',
  'badge',
  'card',
  'tooltip',
  'skeleton',
  'empty-state',
]

export const generateStaticParams = () =>
  KNOWN_SLUGS.map((slug) => ({ component: slug }))

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const SharedComponentPage = async ({
  params,
}: {
  params: Promise<{ component: string }>
}) => {
  const { component } = await params
  const meta = getComponentBySlug('shared', component)
  const data = COMPONENT_DATA[component]

  if (!meta || !data) notFound()

  return (
    <div>
      <Breadcrumbs />
      <ComponentPageLayout
        title={meta.title}
        description={meta.description}
        domain="System / Shared"
        status={meta.status}
        importPath={meta.importPath}
        filePath={meta.filePath}
        preview={data.preview}
        propsTable={data.propsTable}
        codeSnippet={data.codeSnippet}
        lastUpdated="2026-03-25"
      />
    </div>
  )
}

export default SharedComponentPage
