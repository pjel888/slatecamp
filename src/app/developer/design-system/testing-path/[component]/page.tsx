import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { ComponentPageLayout } from '@/components/developer/ComponentPageLayout'
import { getComponentBySlug } from '@/lib/developer/componentRegistry'
import type { PropsTableEntry } from '@/types/developer'
import {
  ReadinessRingPreview,
  MasteryBarPreview,
  HeatmapGridPreview,
  TrailProgressCardPreview,
  SubjectPillPreview,
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
  /* ── ReadinessRing ───────────────────────────────────────────────── */
  'readiness-ring': {
    propsTable: [
      { name: 'score', type: 'number (0-100)', defaultValue: null, required: true, description: 'Readiness score percentage to display in the ring.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", required: false, description: 'Controls the overall diameter of the ring.' },
      { name: 'showLabel', type: 'boolean', defaultValue: 'true', required: false, description: 'Whether to show the percentage label in the center.' },
      { name: 'strokeWidth', type: 'number', defaultValue: '8', required: false, description: 'Width of the ring stroke in pixels.' },
    ],
    codeSnippet: `import { ScoreDisplay } from '@/components/shared/score-display'

<ScoreDisplay score={72} size="md" showLabel />`,
    preview: <ReadinessRingPreview />,
  },

  /* ── MasteryBar ──────────────────────────────────────────────────── */
  'mastery-bar': {
    propsTable: [
      { name: 'value', type: 'number (0-100)', defaultValue: null, required: true, description: 'Current mastery value shown as bar fill width.' },
      { name: 'label', type: 'string', defaultValue: null, required: false, description: 'Optional text label displayed above the bar.' },
      { name: 'color', type: "'primary' | 'emerald' | 'amber' | 'red'", defaultValue: "'primary'", required: false, description: 'Color variant for the filled portion of the bar.' },
      { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", required: false, description: 'Bar height — sm is compact for dense layouts.' },
      { name: 'showValue', type: 'boolean', defaultValue: 'true', required: false, description: 'Whether to display the numeric percentage alongside the bar.' },
    ],
    codeSnippet: `import { ProgressBar } from '@/components/ui/progress-bar'

<ProgressBar value={68} label="Structural Engineering" showValue />`,
    preview: <MasteryBarPreview />,
  },

  /* ── HeatmapGrid ─────────────────────────────────────────────────── */
  'heatmap-grid': {
    propsTable: [
      { name: 'data', type: 'Array<{ id: string; label: string; value: number }>', defaultValue: null, required: true, description: 'Array of topic objects with mastery values mapped to cell colors.' },
      { name: 'rows', type: 'number', defaultValue: '4', required: false, description: 'Number of rows in the grid layout.' },
      { name: 'colorScale', type: "'green' | 'blue'", defaultValue: "'green'", required: false, description: 'Color palette for the heatmap intensity scale.' },
    ],
    codeSnippet: `<HeatmapGrid
  data={topics.map(t => ({ id: t.id, label: t.name, value: t.mastery }))}
  rows={4}
/>`,
    preview: <HeatmapGridPreview />,
  },

  /* ── TrailProgressCard ───────────────────────────────────────────── */
  'trail-progress-card': {
    propsTable: [
      { name: 'title', type: 'string', defaultValue: null, required: true, description: 'Exam or trail name displayed as the card heading.' },
      { name: 'progress', type: 'number (0-100)', defaultValue: null, required: true, description: 'Overall completion percentage shown in the progress bar.' },
      { name: 'totalTopics', type: 'number', defaultValue: null, required: true, description: 'Total number of topics in the trail.' },
      { name: 'completedTopics', type: 'number', defaultValue: null, required: true, description: 'Number of topics the learner has completed.' },
      { name: 'href', type: 'string', defaultValue: null, required: true, description: 'Navigation target when the card is clicked.' },
    ],
    codeSnippet: `<TrailProgressCard
  title="Architecture Licensure Exam"
  progress={64}
  totalTopics={48}
  completedTopics={31}
  href="/trail/ale"
/>`,
    preview: <TrailProgressCardPreview />,
  },

  /* ── SubjectPill ─────────────────────────────────────────────────── */
  'subject-pill': {
    propsTable: [
      { name: 'label', type: 'string', defaultValue: null, required: true, description: 'Text label displayed inside the pill.' },
      { name: 'variant', type: "'default' | 'primary' | 'subtle'", defaultValue: "'default'", required: false, description: 'Visual style variant controlling background and text color.' },
      { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", required: false, description: 'Controls padding and font size of the pill.' },
      { name: 'count', type: 'number', defaultValue: null, required: false, description: 'Optional numeric count shown in parentheses after the label.' },
    ],
    codeSnippet: `<SubjectPill label="Structural" variant="primary" count={12} />`,
    preview: <SubjectPillPreview />,
  },
}

/* ------------------------------------------------------------------ */
/*  Known slugs for static generation                                  */
/* ------------------------------------------------------------------ */

const KNOWN_SLUGS = [
  'readiness-ring',
  'mastery-bar',
  'heatmap-grid',
  'trail-progress-card',
  'subject-pill',
]

export const generateStaticParams = () =>
  KNOWN_SLUGS.map((slug) => ({ component: slug }))

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const TestingPathComponentPage = async ({
  params,
}: {
  params: Promise<{ component: string }>
}) => {
  const { component } = await params
  const meta = getComponentBySlug('testing-path', component)
  const data = COMPONENT_DATA[component]

  if (!meta || !data) notFound()

  return (
    <div>
      <Breadcrumbs />
      <ComponentPageLayout
        title={meta.title}
        description={meta.description}
        domain="Review & Testing Path"
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

export default TestingPathComponentPage
