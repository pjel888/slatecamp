import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { ComponentPageLayout } from '@/components/developer/ComponentPageLayout'
import {
  getComponentBySlug,
  getComponentsByDomain,
} from '@/lib/developer/componentRegistry'
import type { PropsTableEntry } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Widgets Domain — Component Documentation Pages                     */
/* ------------------------------------------------------------------ */

interface ComponentData {
  propsTable: PropsTableEntry[]
  codeSnippet: string
  preview: React.ReactNode
}

/* ── Dynamic imports (client components, SSR disabled) ───────────── */

const DoorConfiguratorPreview = dynamic(
  () => import('@/components/wiki/widgets/bp344/DoorConfigurator').then((m) => m.DoorConfigurator),
  { ssr: false }
)

const CorridorVisualizerPreview = dynamic(
  () => import('@/components/wiki/widgets/bp344/CorridorVisualizer').then((m) => m.CorridorVisualizer),
  { ssr: false }
)

const WorkstationCalculatorPreview = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/WorkstationCalculator').then((m) => m.WorkstationCalculator),
  { ssr: false }
)

/* ── DoorConfigurator ────────────────────────────────────────────── */

const doorConfiguratorData: ComponentData = {
  propsTable: [
    { name: 'width', type: 'number', defaultValue: '900', required: false, description: 'Initial door clear width in millimeters.' },
    { name: 'space', type: 'number', defaultValue: '1800', required: false, description: 'Approach maneuvering space in millimeters.' },
    { name: 'threshold', type: 'number', defaultValue: '0', required: false, description: 'Threshold height in millimeters.' },
    { name: 'hardwareHeight', type: 'number', defaultValue: '900', required: false, description: 'Hardware mounting height in millimeters.' },
    { name: 'closerForce', type: 'number', defaultValue: '2.0', required: false, description: 'Door closer force in kilograms.' },
  ],
  codeSnippet: `import { DoorConfigurator } from '@/components/wiki/widgets/bp344/DoorConfigurator'

<DoorConfigurator />`,
  preview: (
    <div className="max-w-md">
      <DoorConfiguratorPreview />
    </div>
  ),
}

/* ── CorridorVisualizer ──────────────────────────────────────────── */

const corridorVisualizerData: ComponentData = {
  propsTable: [
    { name: 'mode', type: "'single' | 'double'", defaultValue: "'single'", required: false, description: 'Corridor passing mode — single wheelchair or two wheelchairs.' },
    { name: 'corridorWidth', type: 'number', defaultValue: '1500', required: false, description: 'Initial corridor width in millimeters.' },
  ],
  codeSnippet: `import { CorridorVisualizer } from '@/components/wiki/widgets/bp344/CorridorVisualizer'

<CorridorVisualizer />`,
  preview: (
    <div className="max-w-lg">
      <CorridorVisualizerPreview />
    </div>
  ),
}

/* ── WorkstationCalculator ───────────────────────────────────────── */

const workstationCalculatorData: ComponentData = {
  propsTable: [
    { name: 'employees', type: 'number', defaultValue: '50', required: false, description: 'Initial employee count.' },
    { name: 'density', type: 'number', defaultValue: '9.3', required: false, description: 'Area per employee in square meters.' },
    { name: 'multiplier', type: 'number', defaultValue: '1.3', required: false, description: 'NFA to GFA conversion multiplier.' },
    { name: 'floors', type: 'number', defaultValue: '1', required: false, description: 'Number of floors for distribution.' },
  ],
  codeSnippet: `import { WorkstationCalculator } from '@/components/wiki/widgets/dsgn013/WorkstationCalculator'

<WorkstationCalculator />`,
  preview: (
    <div className="max-w-md">
      <WorkstationCalculatorPreview />
    </div>
  ),
}

/* ── Placeholder data for remaining widgets ──────────────────────── */

const makePlaceholder = (title: string, importPath: string): ComponentData => ({
  propsTable: [
    { name: 'className', type: 'string', defaultValue: null, required: false, description: 'Additional CSS class names.' },
  ],
  codeSnippet: `import { ${title} } from '${importPath}'

<${title} />`,
  preview: (
    <div className="w-full max-w-md bg-muted/30 border border-dashed border-border rounded-md px-6 py-10 flex items-center justify-center">
      <span className="text-[13px] text-muted-foreground">
        Preview: {title}
      </span>
    </div>
  ),
})

/* ── Component data lookup ───────────────────────────────────────── */

const COMPONENT_DATA: Record<string, ComponentData> = {
  'door-configurator': doorConfiguratorData,
  'corridor-visualizer': corridorVisualizerData,
  'workstation-calculator': workstationCalculatorData,
  'cubicle-checker': makePlaceholder('CubicleChecker', '@/components/wiki/widgets/bp344/CubicleChecker'),
  'grab-bar-explainer': makePlaceholder('GrabBarExplainer', '@/components/wiki/widgets/bp344/GrabBarExplainer'),
  'recall-drill': makePlaceholder('RecallDrill', '@/components/wiki/widgets/bp344/RecallDrill'),
  'bp344-comparison': makePlaceholder('BP344Comparison', '@/components/wiki/widgets/bp344/ComparisonTable'),
  'reach-envelope-diagram': makePlaceholder('ReachEnvelopeDiagram', '@/components/wiki/widgets/dsgn013/ReachEnvelopeDiagram'),
  'bedroom-plan-view': makePlaceholder('BedroomPlanView', '@/components/wiki/widgets/dsgn013/BedroomPlanView'),
  'bed-size-comparator': makePlaceholder('BedSizeComparator', '@/components/wiki/widgets/dsgn013/BedSizeComparator'),
  'body-dimension-explorer': makePlaceholder('BodyDimensionExplorer', '@/components/wiki/widgets/dsgn013/BodyDimensionExplorer'),
  'dh-ratio-explorer': makePlaceholder('DHRatioExplorer', '@/components/wiki/widgets/dsgn013/DHRatioExplorer'),
  'proportion-comparator': makePlaceholder('ProportionComparator', '@/components/wiki/widgets/dsgn013/ProportionComparator'),
  'dimension-drill': makePlaceholder('DimensionDrill', '@/components/wiki/widgets/dsgn013/DimensionDrill'),
  'spatial-quality-drill': makePlaceholder('SpatialQualityDrill', '@/components/wiki/widgets/dsgn013/SpatialQualityDrill'),
  'body-dimension-drill': makePlaceholder('BodyDimensionDrill', '@/components/wiki/widgets/dsgn013/BodyDimensionDrill'),
  'ph-building-setbacks': makePlaceholder('PHBuildingSetbacks', '@/components/interactive-illustrations/2D/SetbackIllustration'),
}

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export const generateStaticParams = () =>
  getComponentsByDomain('widgets').map((c) => ({ component: c.slug }))

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const WidgetsComponentPage = async ({
  params,
}: {
  params: Promise<{ component: string }>
}) => {
  const { component } = await params
  const meta = getComponentBySlug('widgets', component)

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
        domain="Interactive Widgets"
        status={meta.status}
        importPath={meta.importPath}
        filePath={meta.filePath}
        preview={data.preview}
        propsTable={data.propsTable}
        codeSnippet={data.codeSnippet}
        lastUpdated="2026-03-25"
      />
    </>
  )
}

export default WidgetsComponentPage
