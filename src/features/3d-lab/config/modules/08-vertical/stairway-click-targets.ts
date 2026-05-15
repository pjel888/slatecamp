// ──────────────────────────────────────────────────────────────────────────────
// stairway-click-targets.ts — Click-to-Inspect Registry
// Maps GeometryInstruction ID patterns to element metadata for popover display.
// ──────────────────────────────────────────────────────────────────────────────

export interface ClickTarget {
  idPattern: string      // Glob-like: 'tread-*', 'riser-*', 'handrail-*'
  elementName: string    // Human-readable: 'Tread', 'Riser'
  dimensionKey: string   // Maps to ComputedStairState field
  unit: string           // 'mm', 'deg'
  description: string    // Brief explanation
}

export const STAIRWAY_CLICK_TARGETS: ClickTarget[] = [
  {
    idPattern: 'tread-*',
    elementName: 'Tread',
    dimensionKey: 'treadDepth',
    unit: 'mm',
    description: 'Horizontal depth of a single tread (exclusive of nosing)',
  },
  {
    idPattern: 'riser-*',
    elementName: 'Riser',
    dimensionKey: 'riserHeight',
    unit: 'mm',
    description: 'Vertical distance between consecutive treads',
  },
  {
    idPattern: 'handrail-*',
    elementName: 'Handrail',
    dimensionKey: 'handrailHeight',
    unit: 'mm',
    description: 'Height of primary handrail above stair nosing',
  },
  {
    idPattern: 'headroom-plane',
    elementName: 'Headroom Clearance',
    dimensionKey: 'headroom',
    unit: 'mm',
    description: 'Vertical clearance above the nosing line',
  },
  {
    idPattern: 'base-platform',
    elementName: 'Bottom Landing',
    dimensionKey: 'stairWidth',
    unit: 'mm',
    description: 'Landing platform at the base of the stair flight',
  },
  {
    idPattern: 'top-landing',
    elementName: 'Top Landing',
    dimensionKey: 'stairWidth',
    unit: 'mm',
    description: 'Landing platform at the top of the stair flight',
  },
  {
    idPattern: 'landing-intermediate',
    elementName: 'Intermediate Landing',
    dimensionKey: 'stairWidth',
    unit: 'mm',
    description: 'Turning landing between stair flights',
  },
  {
    idPattern: 'bp344-rail-*',
    elementName: 'BP 344 Accessible Rail',
    dimensionKey: 'handrailHeight',
    unit: 'mm',
    description: 'Required accessible handrail per BP 344 (dual-height: 700 mm and 900 mm)',
  },
  {
    idPattern: 'bp344-ext-*',
    elementName: 'BP 344 Extension',
    dimensionKey: 'handrailHeight',
    unit: 'mm',
    description: 'Handrail extension 300 mm beyond first and last step (BP 344)',
  },
  {
    idPattern: 'compare-ibc-*',
    elementName: 'IBC Comparison',
    dimensionKey: 'stairWidth',
    unit: 'mm',
    description: 'Ghost geometry showing IBC 2024 required dimensions (⚠️ UNVERIFIED)',
  },
  {
    idPattern: 'nosing-detail-*',
    elementName: 'Nosing Detail',
    dimensionKey: 'nosingProjection',
    unit: 'mm',
    description: 'Detailed nosing profile showing projection, radius, undercut, and contrast strip.',
  },
  {
    idPattern: 'handrail-cross-section',
    elementName: 'Handrail Cross-Section',
    dimensionKey: 'handrailDiameter',
    unit: 'mm',
    description: 'Handrail grip profile detail showing diameter, profile, and wall clearance.',
  },
  {
    idPattern: 'children-rail-711-*',
    elementName: 'Children’s Rail Reference',
    dimensionKey: 'handrailHeight',
    unit: 'mm',
    description: '711 mm educational reference rail for child-oriented stair safety comparisons.',
  },
]

export const STAIRWAY_NON_INTERACTIVE_ID_PATTERNS = [
  'evac-dot-*',
] as const

/** Match a geometry instruction ID to a click target */
export const matchClickTarget = (id: string): ClickTarget | null =>
  STAIRWAY_CLICK_TARGETS.find((t) => {
    if (t.idPattern.endsWith('*')) {
      return id.startsWith(t.idPattern.slice(0, -1))
    }
    return id === t.idPattern
  }) ?? null

export const isExplicitlyNonInteractiveStairwayId = (id: string): boolean =>
  STAIRWAY_NON_INTERACTIVE_ID_PATTERNS.some((pattern) => (
    pattern.endsWith('*')
      ? id.startsWith(pattern.slice(0, -1))
      : id === pattern
  ))
