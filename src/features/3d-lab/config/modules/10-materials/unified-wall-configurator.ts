// src/features/3d-lab/config/modules/10-materials/unified-wall-configurator.ts
// Unified Wall Configurator v2 — Multi-file architecture
import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  AnnotationDef,
} from '@/features/3d-lab/types/templates'
import { computeWallState } from './wall-computation'
import { buildWallGeometry } from './wall-geometry'
import { wallViolations } from './wall-violations'
import { wallPresets } from './wall-presets'

// ─── Helpers (kept for violations/annotations that use raw params) ──────────

const mm = (v: number | string | boolean): number =>
  (typeof v === 'number' ? v : Number(v)) / 1000

const _num = (v: number | string | boolean): number =>
  typeof v === 'number' ? v : Number(v)

const str = (v: number | string | boolean): string =>
  String(v)

const bool = (v: number | string | boolean): boolean =>
  v === true || v === 'true'

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

  // ── Structure — Masonry (CHB only) ──
  {
    key: 'rebarSpacing',
    label: 'Rebar Spacing',
    type: 'slider',
    min: 600,
    max: 1200,
    step: 200,
    default: 800,
    unit: 'mm',
    group: 'Structure — Masonry',
    visibleWhen: (p) => str(p.coreType) === 'chb',
  },
  {
    key: 'rebarDiameter',
    label: 'Rebar Diameter',
    type: 'dropdown',
    default: '12',
    options: [
      { value: '10', label: '10mm' },
      { value: '12', label: '12mm' },
      { value: '16', label: '16mm' },
    ],
    group: 'Structure — Masonry',
    visibleWhen: (p) => str(p.coreType) === 'chb',
  },
  {
    key: 'bondBeamInterval',
    label: 'Bond Beam Interval',
    type: 'dropdown',
    default: 'Every 3rd course',
    options: [
      { value: 'Every 3rd course', label: 'Every 3rd course (600mm)' },
      { value: 'Every 4th course', label: 'Every 4th course (800mm)' },
    ],
    group: 'Structure — Masonry',
    visibleWhen: (p) => str(p.coreType) === 'chb',
  },
  {
    key: 'chbSize',
    label: 'CHB Size',
    type: 'dropdown',
    default: '150',
    options: [
      { value: '150', label: '150mm (6" bearing)' },
      { value: '100', label: '100mm (4" non-bearing)' },
    ],
    group: 'Structure — Masonry',
    visibleWhen: (p) => str(p.coreType) === 'chb',
  },
  {
    key: 'showReinforcement',
    label: 'Show Reinforcement',
    type: 'toggle',
    default: true,
    group: 'Structure — Masonry',
    visibleWhen: (p) => str(p.coreType) === 'chb',
  },

  // ── Structure — Framing (Drywall, Plywood, Cement Board) ──
  {
    key: 'studSpacing',
    label: 'Stud Spacing',
    type: 'dropdown',
    default: '600',
    options: [
      { value: '400', label: '400mm (16" o.c.)' },
      { value: '600', label: '600mm (24" o.c.)' },
    ],
    group: 'Structure — Framing',
    visibleWhen: (p) => ['drywall', 'plywood', 'cement-board'].includes(str(p.coreType)),
  },
  {
    key: 'studDepth',
    label: 'Stud Depth',
    type: 'dropdown',
    default: '92',
    options: [
      { value: '64', label: '64mm (2½")' },
      { value: '92', label: '92mm (3⅝")' },
      { value: '150', label: '150mm (6")' },
    ],
    group: 'Structure — Framing',
    visibleWhen: (p) => ['drywall', 'plywood', 'cement-board'].includes(str(p.coreType)),
  },
  {
    key: 'gypsumThickness',
    label: 'Gypsum Thickness',
    type: 'dropdown',
    default: '12.5',
    options: [
      { value: '12.5', label: '12.5mm (½")' },
      { value: '15.9', label: '15.9mm (⅝" Type X)' },
    ],
    group: 'Structure — Framing',
    visibleWhen: (p) => str(p.coreType) === 'drywall',
  },
  {
    key: 'gypsumLayers',
    label: 'Gypsum Layers',
    type: 'dropdown',
    default: 'Single layer',
    options: [
      { value: 'Single layer', label: 'Single layer' },
      { value: 'Double layer', label: 'Double layer' },
    ],
    group: 'Structure — Framing',
    visibleWhen: (p) => str(p.coreType) === 'drywall',
  },
  {
    key: 'showInsulation',
    label: 'Show Insulation',
    type: 'toggle',
    default: false,
    group: 'Structure — Framing',
    visibleWhen: (p) => ['drywall', 'plywood', 'cement-board'].includes(str(p.coreType)),
  },
  {
    key: 'showBridging',
    label: 'Show Bridging',
    type: 'toggle',
    default: false,
    group: 'Structure — Framing',
    visibleWhen: (p) => ['drywall', 'plywood', 'cement-board'].includes(str(p.coreType)),
  },

  // View
  {
    key: 'viewMode',
    label: 'View Mode',
    type: 'dropdown',
    default: 'overview',
    options: [
      { value: 'overview', label: 'Overview' },
      { value: 'section-cut', label: 'Section Cut' },
      { value: 'exploded', label: 'Exploded' },
      { value: 'build-sequence', label: 'Build Sequence' },
      { value: 'compare', label: 'Compare' },
    ],
    group: 'View',
    visibleWhen: () => false, // Hidden — driven by ViewModeButtonStrip
  },
  {
    key: 'compareWith',
    label: 'Compare With',
    type: 'dropdown',
    default: 'drywall',
    options: [
      { value: 'chb', label: 'CHB' },
      { value: 'drywall', label: 'Drywall' },
      { value: 'plywood', label: 'Plywood' },
      { value: 'cement-board', label: 'Cement Board' },
      { value: 'brick', label: 'Brick' },
      { value: 'solid-concrete', label: 'Solid Concrete' },
      { value: 'existing-wall', label: 'Existing Wall' },
    ],
    group: 'View',
    visibleWhen: (p) => String(p.viewMode) === 'compare',
  },
  {
    key: 'explodeAmount',
    label: 'Explode Amount',
    type: 'slider',
    min: 0,
    max: 100,
    step: 5,
    default: 0,
    unit: '%',
    group: 'View',
    visibleWhen: (p) => String(p.viewMode) === 'exploded',
  },
  {
    key: 'buildStep',
    label: 'Build Step',
    type: 'slider',
    min: 1,
    max: 8,
    step: 1,
    default: 8,
    group: 'View',
    visibleWhen: (p) => String(p.viewMode) === 'build-sequence',
  },

  // Finish Layers
  {
    key: 'showPlaster',
    label: 'Show Plaster Layer',
    type: 'toggle',
    default: true,
    group: 'Finish Layers',
    visibleWhen: (p) => !['drywall', 'plywood', 'cement-board'].includes(str(p.coreType)),
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

  // ── Advanced Features ──
  {
    key: 'showMEP',
    label: 'Show MEP (Electrical/Plumbing)',
    type: 'toggle',
    default: false,
    group: 'Advanced Features',
    visibleWhen: (p) => ['drywall', 'plywood', 'cement-board'].includes(str(p.coreType)),
  },
  {
    key: 'wallLocation',
    label: 'Wall Location',
    type: 'dropdown',
    default: 'interior',
    options: [
      { value: 'interior', label: 'Interior' },
      { value: 'exterior', label: 'Exterior' },
      { value: 'bathroom', label: 'Bathroom/Wet Area' },
      { value: 'below-grade', label: 'Below Grade' },
    ],
    group: 'Advanced Features',
  },
  {
    key: 'showWaterproofing',
    label: 'Show Waterproofing',
    type: 'toggle',
    default: false,
    group: 'Advanced Features',
    visibleWhen: (p) => String(p.wallLocation) !== 'interior',
  },
  {
    key: 'showConnections',
    label: 'Show Connection Details',
    type: 'toggle',
    default: false,
    group: 'Advanced Features',
  },
]

// ─── Geometry ────────────────────────────────────────────────────────────────

const geometry = (params: Record<string, number | boolean | string>): GeometryInstruction[] => {
  const state = computeWallState(params)
  return buildWallGeometry(state, params)
}

// ─── Violations ──────────────────────────────────────────────────────────────

const violations = wallViolations

// ─── Annotations (existing 4) ───────────────────────────────────────────────

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
    position: (_p) => [0, -0.3, 0],
  },
]

// ─── Presets ─────────────────────────────────────────────────────────────────

const presets = wallPresets

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
  leaQuestionCount: 5,
  leaQuestionType: 'dimensional recall',
  supportedPhases: ['guided', 'sandbox'],
  hasChallengeMode: true,
}
