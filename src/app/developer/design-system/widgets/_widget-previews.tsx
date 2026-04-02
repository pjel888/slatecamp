'use client'

import dynamic from 'next/dynamic'

/* ------------------------------------------------------------------ */
/*  Widget preview wrappers — client-side dynamic imports              */
/*  Separated from the page (Server Component) because ssr:false       */
/*  requires 'use client'.                                             */
/* ------------------------------------------------------------------ */

const DoorConfiguratorInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/DoorConfigurator').then((m) => m.DoorConfigurator),
  { ssr: false },
)

const CorridorVisualizerInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/CorridorVisualizer').then((m) => m.CorridorVisualizer),
  { ssr: false },
)

const WorkstationCalculatorInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/WorkstationCalculator').then((m) => m.WorkstationCalculator),
  { ssr: false },
)

export const DoorConfiguratorPreview = () => (
  <div className="max-w-md">
    <DoorConfiguratorInner />
  </div>
)

export const CorridorVisualizerPreview = () => (
  <div className="max-w-lg">
    <CorridorVisualizerInner />
  </div>
)

export const WorkstationCalculatorPreview = () => (
  <div className="max-w-md">
    <WorkstationCalculatorInner />
  </div>
)

/* ── BP 344 widgets ──────────────────────────────────────────────── */

const CubicleCheckerInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/CubicleChecker').then((m) => m.CubicleChecker),
  { ssr: false },
)

export const CubicleCheckerPreview = () => (
  <div className="max-w-md">
    <CubicleCheckerInner />
  </div>
)

const GrabBarExplainerInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/GrabBarExplainer').then((m) => m.GrabBarExplainer),
  { ssr: false },
)

export const GrabBarExplainerPreview = () => (
  <div className="max-w-md">
    <GrabBarExplainerInner />
  </div>
)

const RecallDrillInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/RecallDrill').then((m) => m.RecallDrill),
  { ssr: false },
)

export const RecallDrillPreview = () => (
  <div className="max-w-md">
    <RecallDrillInner />
  </div>
)

const ComparisonTableInner = dynamic(
  () => import('@/components/wiki/widgets/bp344/ComparisonTable').then((m) => m.AccessibilityChangesTable),
  { ssr: false },
)

export const ComparisonTablePreview = () => (
  <div className="max-w-lg">
    <ComparisonTableInner />
  </div>
)

/* ── DSGN 013 widgets ────────────────────────────────────────────── */

const ReachEnvelopeDiagramInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/ReachEnvelopeDiagram').then((m) => m.ReachEnvelopeDiagram),
  { ssr: false },
)

export const ReachEnvelopeDiagramPreview = () => (
  <div className="max-w-md">
    <ReachEnvelopeDiagramInner />
  </div>
)

const BedroomPlanViewInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/BedroomPlanView').then((m) => m.BedroomPlanView),
  { ssr: false },
)

export const BedroomPlanViewPreview = () => (
  <div className="max-w-md">
    <BedroomPlanViewInner />
  </div>
)

const BedSizeComparatorInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/BedSizeComparator').then((m) => m.BedSizeComparator),
  { ssr: false },
)

export const BedSizeComparatorPreview = () => (
  <div className="max-w-lg">
    <BedSizeComparatorInner />
  </div>
)

const BodyDimensionExplorerInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/BodyDimensionExplorer').then((m) => m.BodyDimensionExplorer),
  { ssr: false },
)

export const BodyDimensionExplorerPreview = () => (
  <div className="max-w-lg">
    <BodyDimensionExplorerInner />
  </div>
)

const DHRatioExplorerInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/DHRatioExplorer').then((m) => m.DHRatioExplorer),
  { ssr: false },
)

export const DHRatioExplorerPreview = () => (
  <div className="max-w-lg">
    <DHRatioExplorerInner />
  </div>
)

const ProportionComparatorInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/ProportionComparator').then((m) => m.ProportionComparator),
  { ssr: false },
)

export const ProportionComparatorPreview = () => (
  <div className="max-w-lg">
    <ProportionComparatorInner />
  </div>
)

const DimensionDrillInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/DimensionDrill').then((m) => m.DimensionDrill),
  { ssr: false },
)

export const DimensionDrillPreview = () => (
  <div className="max-w-md">
    <DimensionDrillInner />
  </div>
)

const SpatialQualityDrillInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/SpatialQualityDrill').then((m) => m.SpatialQualityDrill),
  { ssr: false },
)

export const SpatialQualityDrillPreview = () => (
  <div className="max-w-md">
    <SpatialQualityDrillInner />
  </div>
)

const BodyDimensionDrillInner = dynamic(
  () => import('@/components/wiki/widgets/dsgn013/BodyDimensionDrill').then((m) => m.BodyDimensionDrill),
  { ssr: false },
)

export const BodyDimensionDrillPreview = () => (
  <div className="max-w-md">
    <BodyDimensionDrillInner />
  </div>
)

/* ── Interactive illustrations ───────────────────────────────────── */

const PHBuildingSetbacksInner = dynamic(
  () => import('@/components/interactive-illustrations/2D/SetbackIllustration'),
  { ssr: false },
)

export const PHBuildingSetbacksPreview = () => (
  <div className="max-w-lg">
    <PHBuildingSetbacksInner />
  </div>
)
