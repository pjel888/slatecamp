import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { ComponentPageLayout } from '@/components/developer/ComponentPageLayout'
import {
  getComponentBySlug,
  getComponentsByDomain,
} from '@/lib/developer/componentRegistry'
import type { PropsTableEntry } from '@/types/developer'
import {
  DoorConfiguratorPreview,
  CorridorVisualizerPreview,
  WorkstationCalculatorPreview,
  CubicleCheckerPreview,
  GrabBarExplainerPreview,
  RecallDrillPreview,
  ComparisonTablePreview,
  ReachEnvelopeDiagramPreview,
  BedroomPlanViewPreview,
  BedSizeComparatorPreview,
  BodyDimensionExplorerPreview,
  DHRatioExplorerPreview,
  ProportionComparatorPreview,
  DimensionDrillPreview,
  SpatialQualityDrillPreview,
  BodyDimensionDrillPreview,
  PHBuildingSetbacksPreview,
} from '../_widget-previews'

/* ------------------------------------------------------------------ */
/*  Widgets Domain — Component Documentation Pages                     */
/* ------------------------------------------------------------------ */

interface ComponentData {
  propsTable: PropsTableEntry[]
  codeSnippet: string
  preview: React.ReactNode
}

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
  preview: <DoorConfiguratorPreview />,
}

/* ── CorridorVisualizer ──────────────────────────────────────────── */

const corridorVisualizerData: ComponentData = {
  propsTable: [
    { name: 'mode', type: "'single' | 'double'", defaultValue: "'single'", required: false, description: 'Corridor passing mode — single wheelchair or two wheelchairs.' },
    { name: 'corridorWidth', type: 'number', defaultValue: '1500', required: false, description: 'Initial corridor width in millimeters.' },
  ],
  codeSnippet: `import { CorridorVisualizer } from '@/components/wiki/widgets/bp344/CorridorVisualizer'

<CorridorVisualizer />`,
  preview: <CorridorVisualizerPreview />,
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
  preview: <WorkstationCalculatorPreview />,
}

/* ── CubicleChecker ─────────────────────────────────────────────── */

const cubicleCheckerData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained component. Width, depth, door width, turning space, and door swing are controlled via internal state.' },
  ],
  codeSnippet: `import { CubicleChecker } from '@/components/wiki/widgets/bp344/CubicleChecker'

<CubicleChecker />`,
  preview: <CubicleCheckerPreview />,
}

/* ── GrabBarExplainer ──────────────────────────────────────────── */

const grabBarExplainerData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained component. Grab bar offset above seat is controlled via an internal slider (250–350 mm range).' },
  ],
  codeSnippet: `import { GrabBarExplainer } from '@/components/wiki/widgets/bp344/GrabBarExplainer'

<GrabBarExplainer />`,
  preview: <GrabBarExplainerPreview />,
}

/* ── RecallDrill ───────────────────────────────────────────────── */

const recallDrillData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained flashcard drill. Contains 40 shuffled BP 344 2024 IRR recall questions with reveal/next navigation.' },
  ],
  codeSnippet: `import { RecallDrill } from '@/components/wiki/widgets/bp344/RecallDrill'

<RecallDrill />`,
  preview: <RecallDrillPreview />,
}

/* ── ComparisonTable (BP344 2024 vs 2013) ──────────────────────── */

const comparisonTableData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained comparison table. Contains 20 rows of 2013 vs 2024 IRR values. Click a row to expand its detail panel.' },
  ],
  codeSnippet: `import { ComparisonTable } from '@/components/wiki/widgets/bp344/ComparisonTable'

<ComparisonTable />`,
  preview: <ComparisonTablePreview />,
}

/* ── ReachEnvelopeDiagram ──────────────────────────────────────── */

const reachEnvelopeDiagramData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained reach envelope explorer. Tabs switch between standing, seated, and wheelchair postures showing forward, overhead, low, and side reach zones.' },
  ],
  codeSnippet: `import { ReachEnvelopeDiagram } from '@/components/wiki/widgets/dsgn013/ReachEnvelopeDiagram'

<ReachEnvelopeDiagram />`,
  preview: <ReachEnvelopeDiagramPreview />,
}

/* ── BedroomPlanView ───────────────────────────────────────────── */

const bedroomPlanViewData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Static SVG plan view of a 3.5 m x 4.0 m bedroom with a queen bed, nightstands, wardrobe, and clearance zone overlays.' },
  ],
  codeSnippet: `import { BedroomPlanView } from '@/components/wiki/widgets/dsgn013/BedroomPlanView'

<BedroomPlanView />`,
  preview: <BedroomPlanViewPreview />,
}

/* ── BedSizeComparator ─────────────────────────────────────────── */

const bedSizeComparatorData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained bed size comparator. Tap twin, double, queen, or king to see dimensions and clearance requirements.' },
  ],
  codeSnippet: `import { BedSizeComparator } from '@/components/wiki/widgets/dsgn013/BedSizeComparator'

<BedSizeComparator />`,
  preview: <BedSizeComparatorPreview />,
}

/* ── BodyDimensionExplorer ─────────────────────────────────────── */

const bodyDimensionExplorerData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained anthropometric explorer. Toggle male/female, then tap any of 10 body dimensions to see 5th, 50th, and 95th percentile values with design implications.' },
  ],
  codeSnippet: `import { BodyDimensionExplorer } from '@/components/wiki/widgets/dsgn013/BodyDimensionExplorer'

<BodyDimensionExplorer />`,
  preview: <BodyDimensionExplorerPreview />,
}

/* ── DHRatioExplorer ───────────────────────────────────────────── */

const dhRatioExplorerData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained D/H ratio explorer. Tap five ratio presets (< 1 through > 4) to visualize enclosure and see spatial perception descriptions with real-world examples.' },
  ],
  codeSnippet: `import { DHRatioExplorer } from '@/components/wiki/widgets/dsgn013/DHRatioExplorer'

<DHRatioExplorer />`,
  preview: <DHRatioExplorerPreview />,
}

/* ── ProportionComparator ──────────────────────────────────────── */

const proportionComparatorData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained room proportion comparator. Tap 1:1, 1:1.4, 1:1.618 (golden), or 1:2 to see spatial quality descriptions and common uses.' },
  ],
  codeSnippet: `import { ProportionComparator } from '@/components/wiki/widgets/dsgn013/ProportionComparator'

<ProportionComparator />`,
  preview: <ProportionComparatorPreview />,
}

/* ── DimensionDrill ────────────────────────────────────────────── */

const dimensionDrillData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained retrieval practice drill. 14 flashcards covering bed sizes, furniture dimensions, and PD 1096 minimum areas with tap-to-reveal and prev/next navigation.' },
  ],
  codeSnippet: `import { DimensionDrill } from '@/components/wiki/widgets/dsgn013/DimensionDrill'

<DimensionDrill />`,
  preview: <DimensionDrillPreview />,
}

/* ── SpatialQualityDrill ───────────────────────────────────────── */

const spatialQualityDrillData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained retrieval practice drill. 16 flashcards on D/H ratios, ceiling heights, proxemics zones, and spatial perception with tap-to-reveal and prev/next navigation.' },
  ],
  codeSnippet: `import { SpatialQualityDrill } from '@/components/wiki/widgets/dsgn013/SpatialQualityDrill'

<SpatialQualityDrill />`,
  preview: <SpatialQualityDrillPreview />,
}

/* ── BodyDimensionDrill ────────────────────────────────────────── */

const bodyDimensionDrillData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained retrieval practice drill. 18 flashcards on anthropometric percentiles, reach ranges, and ergonomic standards with tap-to-reveal and prev/next navigation.' },
  ],
  codeSnippet: `import { BodyDimensionDrill } from '@/components/wiki/widgets/dsgn013/BodyDimensionDrill'

<BodyDimensionDrill />`,
  preview: <BodyDimensionDrillPreview />,
}

/* ── PHBuildingSetbacks ────────────────────────────────────────── */

const phBuildingSetbacksData: ComponentData = {
  propsTable: [
    { name: '(no props)', type: '—', defaultValue: '—', required: false, description: 'Self-contained PD 1096 setback illustration. Select RROW width (below 6 m, 6-10 m, 10-15 m, 15 m+) to see front, side, and rear setback zones with a buildable area SVG diagram.' },
  ],
  codeSnippet: `import PHBuildingSetbacks from '@/components/interactive-illustrations/2D/SetbackIllustration'

<PHBuildingSetbacks />`,
  preview: <PHBuildingSetbacksPreview />,
}

/* ── Component data lookup ───────────────────────────────────────── */

const COMPONENT_DATA: Record<string, ComponentData> = {
  'door-configurator': doorConfiguratorData,
  'corridor-visualizer': corridorVisualizerData,
  'workstation-calculator': workstationCalculatorData,
  'cubicle-checker': cubicleCheckerData,
  'grab-bar-explainer': grabBarExplainerData,
  'recall-drill': recallDrillData,
  'bp344-comparison': comparisonTableData,
  'reach-envelope-diagram': reachEnvelopeDiagramData,
  'bedroom-plan-view': bedroomPlanViewData,
  'bed-size-comparator': bedSizeComparatorData,
  'body-dimension-explorer': bodyDimensionExplorerData,
  'dh-ratio-explorer': dhRatioExplorerData,
  'proportion-comparator': proportionComparatorData,
  'dimension-drill': dimensionDrillData,
  'spatial-quality-drill': spatialQualityDrillData,
  'body-dimension-drill': bodyDimensionDrillData,
  'ph-building-setbacks': phBuildingSetbacksData,
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
