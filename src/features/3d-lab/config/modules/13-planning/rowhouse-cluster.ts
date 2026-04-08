// src/features/3d-lab/config/modules/13-planning/rowhouse-cluster.ts
// Rowhouse Cluster Layout — BP 220 (Socialized Housing) / PD 957 (Subdivision Act)
// ─────────────────────────────────────────────────────────────────────────────

import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const parameters: ParameterDef[] = [
  {
    key: 'lotWidth',
    label: 'Lot Width',
    type: 'slider',
    min: 6,
    max: 12,
    step: 0.5,
    default: 8,
    unit: 'm',
    decimals: 1,
    group: 'Lot',
  },
  {
    key: 'lotDepth',
    label: 'Lot Depth',
    type: 'slider',
    min: 12,
    max: 20,
    step: 0.5,
    default: 15,
    unit: 'm',
    decimals: 1,
    group: 'Lot',
  },
  {
    key: 'numUnits',
    label: 'Number of Units',
    type: 'slider',
    min: 3,
    max: 10,
    step: 1,
    default: 5,
    group: 'Cluster',
  },
  {
    key: 'roadWidth',
    label: 'Road Right-of-Way Width',
    type: 'slider',
    min: 6,
    max: 10,
    step: 0.5,
    default: 8,
    unit: 'm',
    decimals: 1,
    group: 'Roads',
  },
  {
    key: 'hasRearAlley',
    label: 'Include Rear Alley',
    type: 'toggle',
    default: false,
    group: 'Roads',
  },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const lW = num(params.lotWidth)
  const lD = num(params.lotDepth)
  const nUnits = num(params.numUnits)
  const rW = num(params.roadWidth)
  const hasAlley = Boolean(params.hasRearAlley)

  const scale = 0.18
  const lWs = lW * scale
  const lDs = lD * scale
  const rWs = rW * scale
  const alleyW = 3 * scale      // 3m rear alley per BP 220 §7
  const stH = 0.65
  const frontSetback = 1.5 * scale
  const sideSetback = 0.75 * scale
  const totalRowW = lWs * nUnits
  const originX = -(totalRowW / 2)

  const inst: GeometryInstruction[] = []

  // Ground plane
  const groundDepth = lDs + rWs + (hasAlley ? alleyW : 0) + 0.5
  inst.push({
    id: 'ground',
    type: 'box',
    position: [0, -0.05, 0],
    args: [totalRowW + rWs, 0.1, groundDepth],
    color: '#78716c',
    opacity: 0.3,
    transparent: true,
  })

  // Front road
  const roadZ = lDs / 2 + rWs / 2
  inst.push({
    id: 'road-front',
    type: 'box',
    position: [0, -0.02, roadZ],
    args: [totalRowW + rWs, 0.04, rWs],
    color: '#52525b',
    label: `Road ROW: ${lW >= 6 ? rW.toFixed(1) : '< 6m!'}m`,
  })
  // Road center line
  inst.push({
    id: 'road-centerline',
    type: 'box',
    position: [0, 0.0, roadZ],
    args: [totalRowW + rWs, 0.01, 0.05],
    color: '#fbbf24',
  })

  // Rear alley
  if (hasAlley) {
    const alleyZ = -(lDs / 2 + alleyW / 2)
    inst.push({
      id: 'alley-rear',
      type: 'box',
      position: [0, -0.02, alleyZ],
      args: [totalRowW + 0.2, 0.04, alleyW],
      color: '#78716c',
      label: '3m Rear Alley',
    })
  }

  // Individual lots and units
  for (let u = 0; u < nUnits; u++) {
    const ux = originX + lWs * u + lWs / 2
    const lotArea = lW * lD
    const violatesLotArea = lotArea < 36   // BP 220 §5: min 36 sqm for socialized
    const isEndUnit = (u === 0 || u === nUnits - 1)

    // Lot boundary (color-coded: green = compliant, red = violation)
    const lotColor = violatesLotArea ? '#fca5a5' : '#bbf7d0'
    inst.push({
      id: `lot-base-${u}`,
      type: 'box',
      position: [ux, -0.01, 0],
      args: [lWs - 0.02, 0.02, lDs],
      color: lotColor,
      opacity: 0.35,
      transparent: true,
      label: u === Math.floor(nUnits / 2) ? `${lotArea.toFixed(0)} sqm/unit` : undefined,
    })

    // Lot boundary walls (party walls between units)
    if (u === 0) {
      inst.push({ id: `wall-left-${u}`, type: 'box', position: [ux - lWs / 2, 0.04, 0], args: [0.04, 0.08, lDs], color: '#a1a1aa' })
    }
    inst.push({ id: `wall-right-${u}`, type: 'box', position: [ux + lWs / 2, 0.04, 0], args: [0.04, 0.08, lDs], color: '#a1a1aa' })

    // Front setback zone
    inst.push({
      id: `setback-front-${u}`,
      type: 'box',
      position: [ux, 0.005, lDs / 2 - frontSetback / 2],
      args: [lWs - 0.04, 0.01, frontSetback],
      color: '#f97316',
      opacity: 0.3,
      transparent: true,
    })

    // Building footprint (2 storeys)
    const buildingW = lWs - sideSetback * (isEndUnit ? 2 : 0) - 0.06
    const buildingZ = -(lDs / 2) + frontSetback + (lDs - frontSetback) * 0.35
    const colors = ['#3b82f6', '#6366f1', '#0891b2', '#7c3aed', '#0d9488', '#d97706', '#dc2626', '#65a30d', '#ec4899', '#0284c7']
    const unitColor = colors[u % colors.length]

    for (let s = 0; s < 2; s++) {
      inst.push({
        id: `unit-${u}-story-${s}`,
        type: 'box',
        position: [ux, s * stH + stH / 2, buildingZ],
        args: [buildingW, stH - 0.02, (lDs - frontSetback) * 0.65],
        color: unitColor,
        opacity: 0.8,
        transparent: true,
      })
      inst.push({
        id: `slab-${u}-${s}`,
        type: 'box',
        position: [ux, s * stH, buildingZ],
        args: [buildingW + 0.02, 0.03, (lDs - frontSetback) * 0.65 + 0.02],
        color: '#71717a',
      })
    }

    // Roof
    inst.push({
      id: `roof-${u}`,
      type: 'cone',
      position: [ux, 2 * stH + 0.18, buildingZ],
      rotation: [0, 0, 0],
      args: [buildingW * 0.7, 0.35, 4],
      color: '#D64545',
    })
  }

  // Total cluster width label bar
  inst.push({
    id: 'cluster-span',
    type: 'box',
    position: [0, -0.01, -(lDs / 2 + 0.1)],
    args: [totalRowW, 0.02, 0.05],
    color: '#1B3FC4',
    label: `Cluster: ${(lW * nUnits).toFixed(0)}m`,
  })

  // Front setback indicator annotation
  inst.push({
    id: 'setback-indicator',
    type: 'box',
    position: [originX - 0.2, 0.01, lDs / 2 - frontSetback / 2],
    args: [0.05, 0.02, frontSetback],
    color: '#f97316',
    label: '1.5m SB',
  })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'lot-area-below-minimum',
    field: 'lotWidth',
    severity: 'error',
    check: (p) => num(p.lotWidth) * num(p.lotDepth) < 36,
    message: 'Lot area < 36 sqm — below BP 220 minimum for socialized rowhouse units',
    codeCitation: 'BP 220 §5 (Socialized Housing: min 36 sqm lot per unit)',
    position: () => [0, 2.5, 0],
  },
  {
    id: 'road-width-below-minimum',
    field: 'roadWidth',
    severity: 'error',
    check: (p) => num(p.roadWidth) < 6,
    message: 'Road ROW < 6m — BP 220 requires minimum 6m right-of-way for access roads',
    codeCitation: 'BP 220 §7 (Road Standards: minor roads min 6m ROW)',
    position: () => [0, 2.5, 2],
  },
  {
    id: 'no-rear-access-interior',
    field: 'hasRearAlley',
    severity: 'warning',
    check: (p) => !p.hasRearAlley && num(p.numUnits) > 5,
    message: 'Interior lots without rear alley — recommend 3m rear service alley for clusters > 5 units per BP 220 §7',
    codeCitation: 'BP 220 §7 (Service roads and alleys for medium-density clusters)',
    position: () => [0, 2.5, -2],
  },
  {
    id: 'lot-width-too-narrow',
    field: 'lotWidth',
    severity: 'warning',
    check: (p) => num(p.lotWidth) < 4,
    message: 'Lot width < 4m — PD 957 prescribes minimum 4m front width for rowhouse lots',
    codeCitation: 'PD 957 §17 (Subdivision Standards: minimum lot dimensions)',
    position: () => [0, 3, 0],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'ann-bp220-lot',
    label: 'BP 220: Min 36 sqm Lot',
    description: 'BP 220 §5 (Socialized Housing): rowhouse minimum lot area is 36 sqm per unit; minimum lot width 4m for BP 220 socialized housing',
    codeCitation: 'BP 220 §5',
    position: () => [-4, 3, 0],
  },
  {
    id: 'ann-bp220-road',
    label: 'BP 220: 6m Min Road ROW',
    description: 'BP 220 §7 (Road Standards): access roads serving rowhouse clusters must have a minimum 6m right-of-way; collector roads require 8m',
    codeCitation: 'BP 220 §7',
    position: () => [4, 3, 2.5],
  },
  {
    id: 'ann-pd957-subdivision',
    label: 'PD 957: Subdivision Design',
    description: 'PD 957 (Subdivision and Condominium Buyers Protective Decree): open space for parks and playgrounds must not be less than 3.5% of gross area for BP 220 projects; no unit shall be sold without a building permit',
    codeCitation: 'PD 957 §17',
    position: () => [0, 3, -3],
  },
  {
    id: 'ann-rear-alley',
    label: 'Rear Alley Requirement',
    description: 'BP 220 §7: medium-density rowhouse clusters of more than 5 units are recommended to provide a 3m rear service alley to ensure rear lot access and utility routing',
    codeCitation: 'BP 220 §7',
    position: (p) => Boolean(p.hasRearAlley) ? [-4, 1.5, -3] : [0, 1.5, -3],
    visibleWhen: (p) => num(p.numUnits) > 4,
  },
]

const presets: Preset[] = [
  { label: 'BP 220 Standard (5 units)', values: { lotWidth: 8, lotDepth: 15, numUnits: 5, roadWidth: 8, hasRearAlley: false } },
  { label: 'BP 220 Dense (8 units + alley)', values: { lotWidth: 6, lotDepth: 14, numUnits: 8, roadWidth: 8, hasRearAlley: true } },
  { label: 'PD 957 Economic (4 units)', values: { lotWidth: 10, lotDepth: 18, numUnits: 4, roadWidth: 10, hasRearAlley: false } },
  { label: 'Violation Demo (too narrow)', values: { lotWidth: 4, lotDepth: 8, numUnits: 6, roadWidth: 5, hasRearAlley: false } },
]

export const rowhouseClusterConfig: ParametricSceneConfig = {
  id: 'rowhouse-cluster',
  title: 'Rowhouse Cluster Layout',
  description: 'Row housing layout showing minimum lot sizes, setbacks, and open space per BP 220 (Socialized Housing) and PD 957 (Subdivision Act).',
  subject: 'bp-220',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [0, 8, 8], fov: 52 },
}
