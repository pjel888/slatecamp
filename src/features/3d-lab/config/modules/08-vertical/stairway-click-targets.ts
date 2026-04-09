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
    idPattern: 'width-gap-*',
    elementName: 'Width Deficit',
    dimensionKey: 'stairWidth',
    unit: 'mm',
    description: 'Gap showing how much wider the stair must be to meet the strictest applicable minimum',
  },
  {
    idPattern: 'compare-ibc-*',
    elementName: 'IBC Comparison',
    dimensionKey: 'stairWidth',
    unit: 'mm',
    description: 'Ghost geometry showing IBC 2024 required dimensions (⚠️ UNVERIFIED)',
  },
]

/** Match a geometry instruction ID to a click target */
export const matchClickTarget = (id: string): ClickTarget | null =>
  STAIRWAY_CLICK_TARGETS.find((t) => {
    if (t.idPattern.endsWith('*')) {
      return id.startsWith(t.idPattern.slice(0, -1))
    }
    return id === t.idPattern
  }) ?? null
