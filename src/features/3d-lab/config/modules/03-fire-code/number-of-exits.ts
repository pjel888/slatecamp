// src/features/3d-lab/config/modules/03-fire-code/number-of-exits.ts
// Number of Exits Required — RA 9514 (Fire Code of the Philippines) / PD 1096 Rule X
// ─────────────────────────────────────────────────────────────────────────────

import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'
import { RA_9514 } from '@/features/3d-lab/config/constants'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

// Occupant load factors (sqm per person) per RA 9514 IRR Rule 10 §1004
const OCCUPANT_LOAD_FACTORS: Record<string, { factor: number; label: string; color: string }> = {
  Assembly:    { factor: RA_9514.OCCUPANT_LOAD_FACTOR.assembly,    label: 'Assembly',    color: '#7c3aed' }, // 0.65
  Business:    { factor: RA_9514.OCCUPANT_LOAD_FACTOR.business,    label: 'Business',    color: '#3b82f6' }, // 9.3
  Educational: { factor: RA_9514.OCCUPANT_LOAD_FACTOR.educational, label: 'Educational', color: '#2D9F6F' }, // 1.85
  Residential: { factor: RA_9514.OCCUPANT_LOAD_FACTOR.residential, label: 'Residential', color: '#f97316' }, // 18.6
  Mercantile:  { factor: RA_9514.OCCUPANT_LOAD_FACTOR.mercantile,  label: 'Mercantile',  color: '#0891b2' }, // 2.8
  Industrial:  { factor: RA_9514.OCCUPANT_LOAD_FACTOR.industrial,  label: 'Industrial',  color: '#78716c' }, // 9.3
}

const parameters: ParameterDef[] = [
  {
    key: 'floorArea',
    label: 'Floor Area',
    type: 'slider',
    min: 50,
    max: 2000,
    step: 10,
    default: 200,
    unit: 'sqm',
    group: 'Space',
  },
  {
    key: 'occupancyType',
    label: 'Occupancy Type',
    type: 'dropdown',
    default: 'Business',
    options: Object.entries(OCCUPANT_LOAD_FACTORS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Occupancy',
  },
  {
    key: 'occupantLoadFactor',
    label: 'Occupant Load Factor Override',
    type: 'slider',
    min: 0.5,
    max: 20,
    step: 0.05,
    default: 9.3,
    unit: 'sqm/person',
    decimals: 2,
    group: 'Occupancy',
  },
  {
    key: 'numExitsProvided',
    label: 'Number of Exits Provided',
    type: 'slider',
    min: 1,
    max: 6,
    step: 1,
    default: 2,
    group: 'Egress',
  },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const floorArea = num(params.floorArea)
  const occType = str(params.occupancyType)
  const loadFactor = num(params.occupantLoadFactor)
  const exitsProvided = num(params.numExitsProvided)

  const occData = OCCUPANT_LOAD_FACTORS[occType] ?? OCCUPANT_LOAD_FACTORS['Business']
  const occupantLoad = Math.ceil(floorArea / loadFactor)
  const exitsRequired = occupantLoad > 500 ? 4 : occupantLoad > 100 ? 3 : occupantLoad > 10 ? 2 : 1
  const isCompliant = exitsProvided >= exitsRequired

  const scale = 0.006
  const fW = Math.sqrt(floorArea * 1.5) * scale * 8
  const fD = Math.sqrt(floorArea / 1.5) * scale * 8
  const wallH = 0.6

  const inst: GeometryInstruction[] = []

  // Floor slab
  inst.push({
    id: 'floor-slab',
    type: 'box',
    position: [0, -0.02, 0],
    args: [fW, 0.04, fD],
    color: '#d4d4d8',
    opacity: 0.5,
    transparent: true,
    label: `${floorArea.toFixed(0)} sqm`,
  })

  // Walls (4 sides, open at exit positions)
  inst.push({ id: 'wall-back', type: 'box', position: [0, wallH / 2, -fD / 2], args: [fW, wallH, 0.06], color: isCompliant ? '#a1a1aa' : '#fca5a5' })
  inst.push({ id: 'wall-left', type: 'box', position: [-fW / 2, wallH / 2, 0], args: [0.06, wallH, fD], color: isCompliant ? '#a1a1aa' : '#fca5a5' })
  inst.push({ id: 'wall-right', type: 'box', position: [fW / 2, wallH / 2, 0], args: [0.06, wallH, fD], color: isCompliant ? '#a1a1aa' : '#fca5a5' })

  // Front wall (split to show exit openings)
  const doorW = 0.12
  const frontWallSegments = Math.max(1, exitsProvided + 1)
  const segW = (fW - exitsProvided * doorW) / frontWallSegments
  for (let s = 0; s <= exitsProvided; s++) {
    const wallX = -fW / 2 + s * (segW + doorW) + segW / 2
    inst.push({
      id: `wall-front-${s}`,
      type: 'box',
      position: [wallX, wallH / 2, fD / 2],
      args: [segW, wallH, 0.06],
      color: isCompliant ? '#a1a1aa' : '#fca5a5',
    })
  }

  // Exit doors
  const exitColors = ['#2D9F6F', '#1B3FC4', '#D4951A', '#0891b2', '#7c3aed', '#D64545']
  for (let e = 0; e < exitsProvided; e++) {
    const exitX = -fW / 2 + (e + 1) * (segW + doorW) - doorW / 2
    const isAdequate = e < exitsRequired
    inst.push({
      id: `exit-door-${e}`,
      type: 'box',
      position: [exitX, wallH * 0.4, fD / 2 + 0.02],
      args: [doorW, wallH * 0.8, 0.04],
      color: isAdequate ? exitColors[e % exitColors.length] : '#71717a',
      opacity: 0.9,
      transparent: true,
      label: `EXIT ${e + 1}`,
    })
    // Exit sign above door
    inst.push({
      id: `exit-sign-${e}`,
      type: 'box',
      position: [exitX, wallH + 0.05, fD / 2 + 0.04],
      args: [doorW * 1.2, 0.06, 0.02],
      color: isAdequate ? '#2D9F6F' : '#D64545',
    })
  }

  // Interior occupant load visualization — dots representing people
  const maxDotsVisible = Math.min(occupantLoad, 40)
  const cols = Math.ceil(Math.sqrt(maxDotsVisible))
  const rows = Math.ceil(maxDotsVisible / cols)
  const dotSpacingX = fW / (cols + 1)
  const dotSpacingZ = fD / (rows + 1)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      if (idx >= maxDotsVisible) break
      inst.push({
        id: `person-${idx}`,
        type: 'cylinder',
        position: [-fW / 2 + (c + 1) * dotSpacingX, 0.06, -fD / 2 + (r + 1) * dotSpacingZ],
        args: [0.03, 0.03, 0.12, 6],
        color: occData.color,
        opacity: 0.7,
        transparent: true,
      })
    }
  }

  // Required exits indicator bar (right side)
  const barX = fW / 2 + 0.3
  inst.push({
    id: 'required-bar',
    type: 'box',
    position: [barX, exitsRequired * 0.15, 0],
    args: [0.15, exitsRequired * 0.3, 0.15],
    color: '#1B3FC4',
    label: `Req: ${exitsRequired}`,
  })
  inst.push({
    id: 'provided-bar',
    type: 'box',
    position: [barX + 0.25, exitsProvided * 0.15, 0],
    args: [0.15, exitsProvided * 0.3, 0.15],
    color: isCompliant ? '#2D9F6F' : '#D64545',
    label: `Have: ${exitsProvided}`,
  })

  // Occupant load counter display
  inst.push({
    id: 'occ-load-display',
    type: 'box',
    position: [-fW / 2 - 0.3, 0.3, 0],
    args: [0.15, 0.6, 0.15],
    color: occData.color,
    opacity: 0.8,
    transparent: true,
    label: `OL: ${occupantLoad}`,
  })

  // Compliance status panel
  inst.push({
    id: 'compliance-panel',
    type: 'box',
    position: [0, wallH + 0.15, 0],
    args: [fW * 0.4, 0.08, fD * 0.1],
    color: isCompliant ? '#2D9F6F' : '#D64545',
    opacity: 0.6,
    transparent: true,
    label: isCompliant ? 'COMPLIANT' : 'VIOLATION',
  })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'insufficient-exits-occupant-load',
    field: 'numExitsProvided',
    severity: 'error',
    check: (p) => {
      const occupantLoad = Math.ceil(num(p.floorArea) / num(p.occupantLoadFactor))
      const exitsRequired = occupantLoad > 500 ? 4 : occupantLoad > 100 ? 3 : occupantLoad > 10 ? 2 : 1
      return num(p.numExitsProvided) < exitsRequired
    },
    message: 'Number of exits provided is less than required for the computed occupant load',
    codeCitation: 'RA 9514 IRR Rule 10 §1005 (Minimum Number of Exits)',
    position: () => [0, 2, 0],
  },
  {
    id: 'single-exit-occupant-load-over-10',
    field: 'numExitsProvided',
    severity: 'error',
    check: (p) => {
      const occupantLoad = Math.ceil(num(p.floorArea) / num(p.occupantLoadFactor))
      return num(p.numExitsProvided) < 2 && occupantLoad > 10
    },
    message: 'At least 2 exits are required when occupant load exceeds 10 persons',
    codeCitation: 'RA 9514 IRR Rule 10 §1005.1 (Two exit minimum above 10 occupants)',
    position: () => [0, 2.5, 1],
  },
  {
    id: 'large-floor-area-single-exit',
    field: 'floorArea',
    severity: 'error',
    check: (p) => num(p.floorArea) > 500 && num(p.numExitsProvided) < 2,
    message: 'Floor area > 500 sqm requires a minimum of 2 exits regardless of occupant load',
    codeCitation: 'PD 1096 Rule X §1004 (Exit requirements for large floor plates)',
    position: () => [0, 2.5, -1],
  },
  {
    id: 'assembly-high-load-warning',
    field: 'occupancyType',
    severity: 'warning',
    check: (p) => {
      const occupantLoad = Math.ceil(num(p.floorArea) / num(p.occupantLoadFactor))
      return str(p.occupancyType) === 'Assembly' && occupantLoad > 300 && num(p.numExitsProvided) < 3
    },
    message: 'Assembly occupancy with OL > 300 should provide ≥ 3 exits for life safety redundancy',
    codeCitation: 'RA 9514 IRR Rule 10 §1005.2 (Assembly occupancy egress capacity)',
    position: () => [1, 2, 0],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'ann-occupant-load',
    label: 'Occupant Load Calculation',
    description: 'RA 9514 IRR Rule 10 §1004: occupant load = floor area ÷ load factor per occupancy type. Assembly 0.65 sqm/person, Business 9.3, Educational 1.85, Residential 18.6, Mercantile 2.8, Industrial 9.3',
    codeCitation: 'RA 9514 IRR Rule 10 §1004',
    position: () => [-4, 2.5, 0],
  },
  {
    id: 'ann-exit-count-table',
    label: 'Required Exit Count Table',
    description: 'RA 9514 IRR Rule 10 §1005: OL ≤ 10 → 1 exit; OL 11–100 → 2 exits; OL 101–500 → 3 exits; OL > 500 → 4 exits minimum',
    codeCitation: 'RA 9514 IRR Rule 10 §1005',
    position: () => [4, 2.5, 0],
  },
  {
    id: 'ann-pd1096-large-floor',
    label: 'PD 1096: Large Floor Plates',
    description: 'PD 1096 Rule X §1004: any floor area exceeding 500 sqm requires a minimum of two exits regardless of computed occupant load',
    codeCitation: 'PD 1096 Rule X §1004',
    position: () => [0, 2.5, -3],
    visibleWhen: (p) => num(p.floorArea) > 400,
  },
  {
    id: 'ann-exit-width',
    label: 'Exit Door Minimum Width',
    description: 'RA 9514 IRR Rule 10 §1008: exit doors must be a minimum of 0.9m clear width; doors must swing in the direction of egress travel for OL > 50',
    codeCitation: 'RA 9514 IRR Rule 10 §1008',
    position: () => [0, 1.2, 3],
  },
]

const presets: Preset[] = [
  { label: 'Small Office (Business)', values: { floorArea: 200, occupancyType: 'Business', occupantLoadFactor: 9.3, numExitsProvided: 2 } },
  { label: 'Assembly Hall (300 sqm)', values: { floorArea: 300, occupancyType: 'Assembly', occupantLoadFactor: 0.65, numExitsProvided: 2 } },
  { label: 'School Classroom Block', values: { floorArea: 500, occupancyType: 'Educational', occupantLoadFactor: 1.85, numExitsProvided: 3 } },
  { label: 'Violation Demo (under-exited)', values: { floorArea: 800, occupancyType: 'Mercantile', occupantLoadFactor: 2.8, numExitsProvided: 1 } },
]

export const numberOfExitsConfig: ParametricSceneConfig = {
  id: 'number-of-exits',
  title: 'Number of Exits Required',
  description: 'Determine required number of exits based on occupancy type, floor area, and occupant load per RA 9514 (Fire Code) IRR Rule 10 and PD 1096 Rule X.',
  subject: 'ra-9514',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [0, 5, 6], fov: 52 },
}
