// src/app/dashboard/3d-lab/_config/modules/10-materials/unified-wall-configurator.ts
// Unified Wall Configurator — Layered wall cross-section with all 7 core types
import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '@/features/3d-lab/types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert mm parameter value to scene units (1 unit = 1 m) */
function mm(v: number | string | boolean): number {
  return (typeof v === 'number' ? v : Number(v)) / 1000
}

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function str(v: number | string | boolean): string {
  return String(v)
}

function bool(v: number | string | boolean): boolean {
  return v === true || v === 'true'
}

// ─── Core type configuration ─────────────────────────────────────────────────

type CoreType = 'chb' | 'drywall' | 'plywood' | 'cement-board' | 'brick' | 'solid-concrete' | 'existing-wall'

interface CoreConfig {
  thickness: number  // in meters
  color: string
  label: string
  hasMortarPattern: boolean
  mortarSpacingH: number   // horizontal mortar line spacing in meters
  mortarSpacingV: number   // vertical mortar line spacing in meters
  mortarColor: string
  supportsPlaster: boolean
}

const CORE_CONFIGS: Record<CoreType, CoreConfig> = {
  'chb': {
    thickness: 0.150,
    color: '#a8a29e',
    label: 'CHB Core',
    hasMortarPattern: true,
    mortarSpacingH: 0.200,
    mortarSpacingV: 0.400,
    mortarColor: '#8d8680',
    supportsPlaster: true,
  },
  'drywall': {
    thickness: 0.100,
    color: '#f5f5f4',
    label: 'Drywall (Studs + Board)',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
  },
  'plywood': {
    thickness: 0.075,
    color: '#c2956b',
    label: 'Plywood Panel',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
  },
  'cement-board': {
    thickness: 0.100,
    color: '#d6d3d1',
    label: 'Cement Board (HardieFlex)',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: false,
  },
  'brick': {
    thickness: 0.200,
    color: '#b45309',
    label: 'Brick Masonry',
    hasMortarPattern: true,
    mortarSpacingH: 0.100,
    mortarSpacingV: 0.200,
    mortarColor: '#92400e',
    supportsPlaster: true,
  },
  'solid-concrete': {
    thickness: 0.150,
    color: '#78716c',
    label: 'Solid Concrete',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: true,
  },
  'existing-wall': {
    thickness: 0.150,
    color: '#e7e5e4',
    label: 'Existing Wall',
    hasMortarPattern: false,
    mortarSpacingH: 0,
    mortarSpacingV: 0,
    mortarColor: '',
    supportsPlaster: true,
  },
}

const PAINT_COLORS: Record<string, string> = {
  'White':      '#ffffff',
  'Cream':      '#fef9ef',
  'Light Gray': '#e5e7eb',
  'Sky Blue':   '#bfdbfe',
  'Sage Green': '#bbf7d0',
  'Warm Beige': '#fde68a',
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  // Dimensions
  {
    key: 'wallLength',
    label: 'Wall Length',
    type: 'slider',
    min: 1000,
    max: 10000,
    step: 100,
    default: 5000,
    unit: 'mm',
    group: 'Dimensions',
  },
  {
    key: 'wallHeight',
    label: 'Wall Height',
    type: 'slider',
    min: 2400,
    max: 4000,
    step: 50,
    default: 3000,
    unit: 'mm',
    group: 'Dimensions',
  },
  // Wall Type
  {
    key: 'coreType',
    label: 'Wall Core Type',
    type: 'dropdown',
    default: 'chb',
    options: [
      { value: 'chb',            label: 'CHB (Concrete Hollow Block)' },
      { value: 'drywall',        label: 'Drywall Partition' },
      { value: 'plywood',        label: 'Plywood Partition' },
      { value: 'cement-board',   label: 'Cement Board (HardieFlex)' },
      { value: 'brick',          label: 'Brick Masonry' },
      { value: 'solid-concrete', label: 'Solid Concrete' },
      { value: 'existing-wall',  label: 'Existing Wall' },
    ],
    group: 'Wall Type',
  },
  // Treatment Sides
  {
    key: 'sides',
    label: 'Finished Sides',
    type: 'dropdown',
    default: '1 Side',
    options: [
      { value: '1 Side',    label: '1 Side' },
      { value: 'Both Sides', label: 'Both Sides' },
    ],
    group: 'Treatment Sides',
  },
  // Finish Layers
  {
    key: 'showPlaster',
    label: 'Show Plaster Layer',
    type: 'toggle',
    default: true,
    group: 'Finish Layers',
  },
  {
    key: 'showSkimCoat',
    label: 'Show Skim Coat',
    type: 'toggle',
    default: false,
    group: 'Finish Layers',
  },
  {
    key: 'showPrimer',
    label: 'Show Primer Layer',
    type: 'toggle',
    default: true,
    group: 'Finish Layers',
  },
  {
    key: 'showPaint',
    label: 'Show Paint Layer',
    type: 'toggle',
    default: true,
    group: 'Finish Layers',
  },
  {
    key: 'paintColor',
    label: 'Paint Color',
    type: 'dropdown',
    default: 'White',
    options: [
      { value: 'White',      label: 'White' },
      { value: 'Cream',      label: 'Cream' },
      { value: 'Light Gray', label: 'Light Gray' },
      { value: 'Sky Blue',   label: 'Sky Blue' },
      { value: 'Sage Green', label: 'Sage Green' },
      { value: 'Warm Beige', label: 'Warm Beige' },
    ],
    group: 'Finish Layers',
  },
]

// ─── Geometry ────────────────────────────────────────────────────────────────

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const coreKey = str(params.coreType) as CoreType
  const core = CORE_CONFIGS[coreKey] ?? CORE_CONFIGS['chb']

  const L = mm(params.wallLength)
  const H = mm(params.wallHeight)
  const T = core.thickness

  const bothSides  = str(params.sides) === 'Both Sides'
  const showPlaster = bool(params.showPlaster) && core.supportsPlaster
  const showSkim    = bool(params.showSkimCoat)
  const showPrimer  = bool(params.showPrimer)
  const showPaint   = bool(params.showPaint)
  const paintHex    = PAINT_COLORS[str(params.paintColor)] ?? '#ffffff'

  // Layer thicknesses (meters)
  const plasterT = 0.0127  // 12.7mm
  const skimT    = 0.003   // 3mm
  const primerT  = 0.001   // 1mm
  const paintT   = 0.001   // 1mm

  const inst: GeometryInstruction[] = []

  // ── Ground plane ──────────────────────────────────────────────────────────
  inst.push({
    id: 'ground',
    type: 'box',
    position: [0, -0.05, 0],
    args: [L + 1.0, 0.1, T + 2.0],
    color: '#e4e4e7',
    opacity: 0.6,
    transparent: true,
  })

  // ── Core wall body ────────────────────────────────────────────────────────
  inst.push({
    id: 'wall-core',
    type: 'box',
    position: [0, H / 2, 0],
    args: [L, H, T],
    color: core.color,
    label: core.label,
  })

  // ── Masonry block / mortar pattern ───────────────────────────────────────
  if (core.hasMortarPattern && core.mortarSpacingH > 0) {
    // Horizontal bed joints — cap at 20 lines to keep performance reasonable
    const hCount = Math.min(Math.floor(H / core.mortarSpacingH), 20)
    for (let i = 1; i < hCount; i++) {
      const yPos = core.mortarSpacingH * i
      // Front face joint
      inst.push({
        id: `mortar-h-f-${i}`,
        type: 'box',
        position: [0, yPos, T / 2 + 0.0015],
        args: [L, 0.006, 0.003],
        color: core.mortarColor,
        opacity: 0.7,
        transparent: true,
      })
    }

    // Vertical head joints — alternating offset pattern (running bond)
    const vSpacing = core.mortarSpacingV
    const vCount   = Math.min(Math.floor(L / vSpacing) * 2, 40)
    for (let i = 0; i <= vCount; i++) {
      // Even rows: joints at 0, vSpacing, 2*vSpacing, ...
      // Odd rows: joints at vSpacing/2, 1.5*vSpacing, ...
      const xEven = -L / 2 + vSpacing * i
      const xOdd  = -L / 2 + vSpacing / 2 + vSpacing * i
      if (xEven > -L / 2 && xEven < L / 2) {
        inst.push({
          id: `mortar-v-even-${i}`,
          type: 'box',
          position: [xEven, H / 2, T / 2 + 0.0015],
          args: [0.006, H, 0.003],
          color: core.mortarColor,
          opacity: 0.5,
          transparent: true,
        })
      }
      if (xOdd > -L / 2 && xOdd < L / 2) {
        inst.push({
          id: `mortar-v-odd-${i}`,
          type: 'box',
          position: [xOdd, H / 2, T / 2 + 0.0015],
          args: [0.006, H, 0.003],
          color: core.mortarColor,
          opacity: 0.5,
          transparent: true,
        })
      }
    }
  }

  // ── Layer buildup helper ──────────────────────────────────────────────────
  // Tracks accumulated offset from the core face outward on each side
  let frontOffset = T / 2
  let backOffset  = T / 2

  function addLayer(
    side: 'front' | 'back' | 'both',
    idSuffix: string,
    thickness: number,
    color: string,
    opacity: number,
    label?: string,
  ): void {
    const half = thickness / 2

    if (side === 'front' || side === 'both') {
      frontOffset += half
      inst.push({
        id: `layer-front-${idSuffix}`,
        type: 'box',
        position: [0, H / 2, frontOffset],
        args: [L + 0.002, H + 0.002, thickness],
        color,
        opacity,
        transparent: true,
        label: side === 'front' || side === 'both' ? label : undefined,
      })
      frontOffset += half
    }

    if (side === 'back' || side === 'both') {
      backOffset += half
      inst.push({
        id: `layer-back-${idSuffix}`,
        type: 'box',
        position: [0, H / 2, -backOffset],
        args: [L + 0.002, H + 0.002, thickness],
        color,
        opacity,
        transparent: true,
      })
      backOffset += half
    }
  }

  const layerSide = bothSides ? 'both' : 'front'

  // ── Plaster ───────────────────────────────────────────────────────────────
  if (showPlaster) {
    addLayer(layerSide, 'plaster', plasterT, '#d4d0ca', 0.85, 'Plaster')
  }

  // ── Skim coat ─────────────────────────────────────────────────────────────
  if (showSkim) {
    addLayer(layerSide, 'skim', skimT, '#f5f5f0', 0.9, 'Skim Coat')
  }

  // ── Primer ────────────────────────────────────────────────────────────────
  if (showPrimer) {
    addLayer(layerSide, 'primer', primerT, '#e8e8e8', 0.8, 'Primer')
  }

  // ── Paint ─────────────────────────────────────────────────────────────────
  if (showPaint) {
    addLayer(layerSide, 'paint', paintT, paintHex, 0.9, `Paint — ${str(params.paintColor)}`)
  }

  // ── Total thickness indicator (thin vertical edge cap) ────────────────────
  // Show a contrasting edge on the right end to read total assembly thickness
  const totalT = frontOffset + (bothSides ? backOffset : T / 2)
  inst.push({
    id: 'thickness-edge',
    type: 'box',
    position: [L / 2 + 0.015, H / 2, (frontOffset - T / 2) / 2],
    args: [0.01, H * 0.6, totalT],
    color: '#1B3FC4',
    opacity: 0.25,
    transparent: true,
    label: `Total: ${Math.round(totalT * 1000)}mm`,
  })

  return inst
}

// ─── Violations ───────────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'height-below-min',
    field: 'wallHeight',
    check: (p) => num(p.wallHeight) < 2400,
    message: 'Wall height below minimum ceiling clearance of 2.4m for habitable rooms',
    codeCitation: 'PD 1096 Rule VII §708',
    severity: 'warning',
    position: (p) => [0, mm(p.wallHeight) + 0.3, 0.5],
  },
  {
    id: 'chb-thickness-min',
    field: 'coreType',
    check: (p) => str(p.coreType) === 'chb',
    message: 'CHB non-bearing walls: min 100mm (4"); bearing walls: min 150mm (6")',
    codeCitation: 'NSCP 2015 §702.1',
    severity: 'info',
    position: () => [0, 1.5, 0.5],
  },
  {
    id: 'brick-load-bearing',
    field: 'coreType',
    check: (p) => str(p.coreType) === 'brick' && num(p.wallHeight) > 3600,
    message: 'Brick walls exceeding 3.6m height require structural engineering review',
    codeCitation: 'NSCP 2015 §705.2',
    severity: 'warning',
    position: (p) => [0, mm(p.wallHeight) + 0.3, 0.6],
  },
]

// ─── Annotations ─────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'ann-wall-height',
    label: 'Wall Height',
    description:
      'Measured from finished floor to underside of ceiling/slab. Minimum 2.4m for habitable rooms per NBCP (PD 1096). Service rooms require minimum 2.1m.',
    codeCitation: 'PD 1096 Rule VII §708',
    position: (p) => [-(mm(p.wallLength) / 2) - 0.5, mm(p.wallHeight) / 2, 0],
  },
  {
    id: 'ann-wall-thickness',
    label: 'Core Thickness',
    description:
      'Core thickness excludes plaster, skim coat, primer, and paint. CHB non-bearing minimum 100mm; bearing minimum 150mm. Drywall partition: 100mm with 64mm metal studs.',
    codeCitation: 'NSCP 2015 §702.1',
    position: (p) => [0, mm(p.wallHeight) + 0.4, 0],
  },
  {
    id: 'ann-layer-callout',
    label: 'Finish Layer Stack',
    description:
      'Standard Philippine finish sequence: Core → Plaster (12.7mm) → Skim Coat (3mm) → Primer (1mm) → Paint (1mm). Each layer is applied after the previous has fully cured.',
    position: (p) => [mm(p.wallLength) / 2 + 0.5, mm(p.wallHeight) / 2, 0],
    visibleWhen: (p) =>
      bool(p.showPlaster) || bool(p.showSkimCoat) || bool(p.showPrimer) || bool(p.showPaint),
  },
  {
    id: 'ann-total-buildout',
    label: 'Total Build-Out',
    description:
      'Total wall build-out affects room net dimensions. Account for plaster and finish layers when calculating net floor area per NBCP minimum room size requirements.',
    position: (p) => [0, -0.3, 0],
  },
]

// ─── Presets ─────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'Standard CHB Room',
    values: {
      coreType:     'chb',
      wallLength:   5000,
      wallHeight:   3000,
      sides:        '1 Side',
      showPlaster:  true,
      showSkimCoat: false,
      showPrimer:   true,
      showPaint:    true,
      paintColor:   'White',
    },
  },
  {
    label: 'Drywall Office Partition',
    values: {
      coreType:     'drywall',
      wallLength:   3000,
      wallHeight:   2700,
      sides:        'Both Sides',
      showPlaster:  false,
      showSkimCoat: false,
      showPrimer:   true,
      showPaint:    true,
      paintColor:   'Light Gray',
    },
  },
  {
    label: 'Plywood Temp Partition',
    values: {
      coreType:     'plywood',
      wallLength:   2400,
      wallHeight:   2700,
      sides:        '1 Side',
      showPlaster:  false,
      showSkimCoat: false,
      showPrimer:   true,
      showPaint:    true,
      paintColor:   'Cream',
    },
  },
  {
    label: 'HardieFlex Exterior',
    values: {
      coreType:     'cement-board',
      wallLength:   4000,
      wallHeight:   3000,
      sides:        'Both Sides',
      showPlaster:  false,
      showSkimCoat: false,
      showPrimer:   true,
      showPaint:    true,
      paintColor:   'Warm Beige',
    },
  },
  {
    label: 'Brick Feature Wall',
    values: {
      coreType:     'brick',
      wallLength:   3000,
      wallHeight:   3000,
      sides:        '1 Side',
      showPlaster:  true,
      showSkimCoat: true,
      showPrimer:   true,
      showPaint:    true,
      paintColor:   'Sage Green',
    },
  },
  {
    label: 'Concrete Basement',
    values: {
      coreType:     'solid-concrete',
      wallLength:   5000,
      wallHeight:   3000,
      sides:        'Both Sides',
      showPlaster:  true,
      showSkimCoat: false,
      showPrimer:   true,
      showPaint:    true,
      paintColor:   'White',
    },
  },
  {
    label: 'Quick Repaint',
    values: {
      coreType:     'existing-wall',
      wallLength:   4000,
      wallHeight:   3000,
      sides:        '1 Side',
      showPlaster:  false,
      showSkimCoat: false,
      showPrimer:   true,
      showPaint:    true,
      paintColor:   'Sky Blue',
    },
  },
]

// ─── Export ───────────────────────────────────────────────────────────────────

export const unifiedWallConfiguratorConfig: ParametricSceneConfig = {
  id: 'unified-wall-configurator',
  title: 'Unified Wall Configurator',
  description:
    'Architectural wall cross-section showing layered material build-up for all 7 Philippine construction wall types. Visualize core, plaster, skim coat, primer, and paint layers in correct sequence with code-compliance feedback.',
  subject: 'materials',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: { position: [7, 2.5, 5.5], fov: 48 },
  showHumanScale: false,
  contextScenario:
    'You are preparing a wall material takeoff for a mixed-use building with different wall types per area. Determine the correct finishing sequence and estimate materials for each wall type under Philippine construction standards.',
  aleQuestionCount: 5,
  aleQuestionType: 'dimensional recall',
  supportedPhases: ['guided', 'sandbox'],
  hasChallengeMode: true,
}

