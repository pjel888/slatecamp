// src/features/3d-lab/config/modules/13-planning/road-hierarchy-standards.ts
// Road Hierarchy Standards — PD 957 / DPWH Road Design Standards
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }
function bool(v: number | string | boolean): boolean { return v === true || v === 'true' || v === 1 }

// Minimum carriageway widths per PD 957 §6.2 and DPWH RROW standards
const ROAD_SPECS: Record<string, { minCarriage: number; label: string; lanes: number; color: string }> = {
  'national-highway':         { minCarriage: 14.0, label: 'National Highway', lanes: 4, color: '#374151' },
  'city-road':                { minCarriage: 10.0, label: 'City Road', lanes: 3, color: '#4b5563' },
  'barangay-road':            { minCarriage: 6.0,  label: 'Barangay Road', lanes: 2, color: '#6b7280' },
  'subdivision-collector':    { minCarriage: 8.0,  label: 'Subdivision Collector', lanes: 2, color: '#9ca3af' },
  'subdivision-local':        { minCarriage: 6.0,  label: 'Subdivision Local', lanes: 2, color: '#d1d5db' },
  'alley':                    { minCarriage: 3.0,  label: 'Alley', lanes: 1, color: '#e5e7eb' },
}

const parameters: ParameterDef[] = [
  { key: 'roadType', label: 'Road Type', type: 'dropdown', default: 'subdivision-collector',
    options: Object.entries(ROAD_SPECS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Road Classification' },
  { key: 'carriageWidth', label: 'Carriageway Width', type: 'slider', min: 3.0, max: 15.0, step: 0.5, default: 8.0, unit: 'm', decimals: 1, group: 'Dimensions' },
  { key: 'hasSidewalk', label: 'Has Sidewalk', type: 'toggle', default: true, group: 'Elements' },
  { key: 'sidewalkWidth', label: 'Sidewalk Width', type: 'slider', min: 0.6, max: 3.0, step: 0.1, default: 1.5, unit: 'm', decimals: 1, group: 'Elements' },
  { key: 'hasMedian', label: 'Has Median', type: 'toggle', default: false, group: 'Elements' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const roadType = str(params.roadType)
  const carriageW = num(params.carriageWidth)
  const hasSidewalk = bool(params.hasSidewalk)
  const sidewalkW = num(params.sidewalkWidth)
  const hasMedian = bool(params.hasMedian)

  const spec = ROAD_SPECS[roadType] ?? ROAD_SPECS['subdivision-collector']
  const carriageViolated = carriageW < spec.minCarriage
  const sidewalkViolated = hasSidewalk && sidewalkW < 1.2

  // Section length (into the scene)
  const sectionLen = 8.0
  const sectionH = 0.15

  // Total cross-section width
  const swTotal = hasSidewalk ? sidewalkW * 2 : 0
  const totalW = carriageW + swTotal

  const inst: GeometryInstruction[] = []

  // Sub-base
  inst.push({ id: 'subbase', type: 'box', position: [0, -0.25, 0], args: [totalW + 1.0, 0.4, sectionLen], color: '#92400e' })
  // Base course
  inst.push({ id: 'base', type: 'box', position: [0, -0.05, 0], args: [totalW + 0.6, 0.2, sectionLen], color: '#78716c' })

  // Carriageway
  inst.push({ id: 'carriageway', type: 'box', position: [0, 0.08, 0], args: [carriageW, sectionH, sectionLen], color: carriageViolated ? '#fca5a5' : spec.color, label: `CW: ${carriageW.toFixed(1)}m` })

  // Lane markings (dashed centre line)
  const laneW = carriageW / spec.lanes
  for (let i = 1; i < spec.lanes; i++) {
    const lx = -carriageW / 2 + i * laneW
    for (let j = 0; j < 4; j++) {
      inst.push({ id: `lane-mark-${i}-${j}`, type: 'box', position: [lx, 0.165, -sectionLen / 2 + j * 2.2 + 1], args: [0.12, 0.01, 0.8], color: '#f8fafc' })
    }
  }
  // Centre line (solid white if 2 lanes, yellow if 4+)
  inst.push({ id: 'centre-line', type: 'box', position: [0, 0.165, 0], args: [0.12, 0.01, sectionLen], color: spec.lanes >= 4 ? '#fde68a' : '#f8fafc' })

  // Curbs
  const curbH = 0.15
  inst.push({ id: 'curb-left', type: 'box', position: [-(carriageW / 2 + 0.1), curbH / 2, 0], args: [0.2, curbH, sectionLen], color: '#d1d5db' })
  inst.push({ id: 'curb-right', type: 'box', position: [(carriageW / 2 + 0.1), curbH / 2, 0], args: [0.2, curbH, sectionLen], color: '#d1d5db' })

  // Sidewalks
  if (hasSidewalk) {
    const swX = carriageW / 2 + 0.2 + sidewalkW / 2
    inst.push({ id: 'sidewalk-left', type: 'box', position: [-swX, 0.06, 0], args: [sidewalkW, 0.12, sectionLen], color: sidewalkViolated ? '#fca5a5' : '#e2e8f0', label: `SW: ${sidewalkW.toFixed(1)}m` })
    inst.push({ id: 'sidewalk-right', type: 'box', position: [swX, 0.06, 0], args: [sidewalkW, 0.12, sectionLen], color: sidewalkViolated ? '#fca5a5' : '#e2e8f0' })

    // Utility strip between curb and sidewalk
    inst.push({ id: 'utility-left', type: 'box', position: [-(carriageW / 2 + 0.2 + sidewalkW + 0.2), 0.04, 0], args: [0.4, 0.08, sectionLen], color: '#6b7280', opacity: 0.5, transparent: true })
    inst.push({ id: 'utility-right', type: 'box', position: [(carriageW / 2 + 0.2 + sidewalkW + 0.2), 0.04, 0], args: [0.4, 0.08, sectionLen], color: '#6b7280', opacity: 0.5, transparent: true })
  }

  // Median
  if (hasMedian) {
    const medianW = Math.max(carriageW * 0.08, 0.6)
    inst.push({ id: 'median', type: 'box', position: [0, 0.2, 0], args: [medianW, 0.25, sectionLen], color: '#2D9F6F', opacity: 0.8, transparent: true, label: `Median ${medianW.toFixed(1)}m` })
  }

  // Min carriageway width indicator
  inst.push({ id: 'min-cw-line', type: 'box', position: [0, 0.25, sectionLen / 2 + 0.3], args: [spec.minCarriage, 0.04, 0.08], color: carriageViolated ? '#D64545' : '#2D9F6F', label: `Min ${spec.minCarriage}m` })

  // Dimension arrows (left/right edge indicators)
  inst.push({ id: 'dim-total', type: 'box', position: [0, 0.5, sectionLen / 2 + 0.8], args: [totalW, 0.04, 0.05], color: '#1B3FC4', label: `Total RROW: ${totalW.toFixed(1)}m` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'carriageway-below-min', field: 'carriageWidth',
    check: (p) => {
      const spec = ROAD_SPECS[str(p.roadType)] ?? ROAD_SPECS['subdivision-collector']
      return num(p.carriageWidth) < spec.minCarriage
    },
    message: 'Carriageway width is below the minimum for the selected road classification',
    codeCitation: 'PD 957 §6.2 Table 1 — Minimum Road Right-of-Way / DPWH Road Design Standards 2022', severity: 'error',
    position: () => [0, 1.5, 3],
  },
  {
    id: 'sidewalk-below-min', field: 'sidewalkWidth',
    check: (p) => bool(p.hasSidewalk) && num(p.sidewalkWidth) < 1.2,
    message: 'Sidewalk width is below the 1.20m minimum for pedestrian accessibility',
    codeCitation: 'BP 344 §3.3 / PD 957 §6.2 — Minimum sidewalk width for subdivision roads', severity: 'warning',
    position: () => [4, 1, 0],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'ann-road-hierarchy', label: 'Road Hierarchy',
    description: 'PD 957 §6 establishes minimum road right-of-way widths by classification. National highways, city roads, and barangay roads follow DPWH standards while subdivision roads are governed by PD 957 and BP 220 directly.',
    codeCitation: 'PD 957 §6.2 / DPWH Road Design Standards',
    position: () => [-6, 1.5, 0],
  },
  {
    id: 'ann-sidewalk', label: 'Sidewalk Requirement',
    description: 'Subdivision roads must provide sidewalks on both sides per PD 957 §6.2. Minimum 1.20m clear walking width is required to comply with BP 344 accessibility standards for pedestrians.',
    codeCitation: 'PD 957 §6.2 / BP 344 §3.3',
    position: () => [6, 1.5, 0],
  },
]

const presets: Preset[] = [
  { label: 'Subdivision Collector Compliant', values: { roadType: 'subdivision-collector', carriageWidth: 8.0, hasSidewalk: true, sidewalkWidth: 1.5, hasMedian: false } },
  { label: 'National Highway', values: { roadType: 'national-highway', carriageWidth: 14.0, hasSidewalk: true, sidewalkWidth: 2.0, hasMedian: true } },
  { label: 'Alley Minimum', values: { roadType: 'alley', carriageWidth: 3.0, hasSidewalk: false, sidewalkWidth: 1.2, hasMedian: false } },
  { label: 'Subdivision Local Violation', values: { roadType: 'subdivision-local', carriageWidth: 4.0, hasSidewalk: true, sidewalkWidth: 0.9, hasMedian: false } },
]

export const roadHierarchyStandardsConfig: ParametricSceneConfig = {
  id: 'road-hierarchy-standards',
  title: 'Road Hierarchy Standards',
  description: 'Road cross-section showing carriageway, sidewalks, curbs, utility strips, and optional median by classification per PD 957 §6.2 and DPWH road design minimum right-of-way standards.',
  subject: 'pd-957',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [0, 8, 10], fov: 55 },
}
