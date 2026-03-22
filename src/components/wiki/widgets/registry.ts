import type { ComponentType } from 'react'

// ---------------------------------------------------------------------------
// Widget Registry — the single source of truth for MDX-embeddable widgets.
//
// How it works:
//   1. Each entry maps an MDX tag name to a lazy loader (dynamic import).
//   2. At render time, WikiArticle scans the MDX content to detect which
//      widget tags are present, then loads ONLY those modules.
//   3. With 500+ widgets this keeps per-article server work minimal —
//      an article using 3 widgets loads 3 modules, not 500.
//
// Adding a new widget:
//   1. Create the component file in the appropriate group folder.
//   2. Add ONE line below mapping the MDX tag name to the import.
//   That's it — WikiArticle.tsx never needs editing.
// ---------------------------------------------------------------------------

type WidgetLoader = () => Promise<ComponentType<any>>

/**
 * Master registry. Keys = exact MDX tag names authors use in content.
 * Values = lazy loaders that resolve to the React component.
 */
export const widgetRegistry: Record<string, WidgetLoader> = {
  // -- BP 344: Accessibility Standards ------------------------------------
  ComparisonTable: () =>
    import('./bp344/ComparisonTable').then((m) => m.ComparisonTable),
  DoorConfigurator: () =>
    import('./bp344/DoorConfigurator').then((m) => m.DoorConfigurator),
  CorridorVisualizer: () =>
    import('./bp344/CorridorVisualizer').then((m) => m.CorridorVisualizer),
  CubicleChecker: () =>
    import('./bp344/CubicleChecker').then((m) => m.CubicleChecker),
  GrabBarExplainer: () =>
    import('./bp344/GrabBarExplainer').then((m) => m.GrabBarExplainer),
  RecallDrill: () =>
    import('./bp344/RecallDrill').then((m) => m.RecallDrill),

  // -- DSGN-013: Furniture & Equipment Clearances --------------------------
  BedroomPlanView: () =>
    import('./dsgn013/BedroomPlanView').then((m) => m.BedroomPlanView),
  BedSizeComparator: () =>
    import('./dsgn013/BedSizeComparator').then((m) => m.BedSizeComparator),
  WorkstationCalculator: () =>
    import('./dsgn013/WorkstationCalculator').then(
      (m) => m.WorkstationCalculator,
    ),
  DimensionDrill: () =>
    import('./dsgn013/DimensionDrill').then((m) => m.DimensionDrill),

  // -- DSGN-013-01: Human Body Dimensions & Reach Ranges -------------------
  BodyDimensionExplorer: () =>
    import('./dsgn013/BodyDimensionExplorer').then(
      (m) => m.BodyDimensionExplorer,
    ),
  ReachEnvelopeDiagram: () =>
    import('./dsgn013/ReachEnvelopeDiagram').then(
      (m) => m.ReachEnvelopeDiagram,
    ),
  BodyDimensionDrill: () =>
    import('./dsgn013/BodyDimensionDrill').then((m) => m.BodyDimensionDrill),

  // -- DSGN-013-03: Spatial Quality — Scale, Proportion, Enclosure --------
  DHRatioExplorer: () =>
    import('./dsgn013/DHRatioExplorer').then((m) => m.DHRatioExplorer),
  ProportionComparator: () =>
    import('./dsgn013/ProportionComparator').then(
      (m) => m.ProportionComparator,
    ),
  SpatialQualityDrill: () =>
    import('./dsgn013/SpatialQualityDrill').then(
      (m) => m.SpatialQualityDrill,
    ),

  // -- Interactive Illustrations ------------------------------------------
  PHBuildingSetbacks: () =>
    import('../../interactive-illustrations/2D/SetbackIllustration').then(
      (m) => m.default,
    ),
}

// ---------------------------------------------------------------------------
// Detection + resolution
// ---------------------------------------------------------------------------

/**
 * Scan MDX content and return the names of registered widgets it references.
 * Looks for `<WidgetName` patterns — fast string check, no parsing needed.
 */
export const detectWidgets = (content: string): string[] =>
  Object.keys(widgetRegistry).filter((name) => content.includes(`<${name}`))

/**
 * Load only the widgets an article actually uses.
 * Returns a component map ready to spread into the MDX components object.
 */
export const resolveWidgets = async (
  content: string,
): Promise<Record<string, ComponentType<any>>> => {
  const needed = detectWidgets(content)
  if (needed.length === 0) return {}

  const entries = await Promise.all(
    needed.map(async (name) => {
      const component = await widgetRegistry[name]()
      return [name, component] as const
    }),
  )

  return Object.fromEntries(entries)
}
