// src/app/dashboard/3d-lab/_config/modules/handrail-requirements.ts
// Handrail Requirements — PD 1096 Rule VIII §809
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'handrailHeight', label: 'Handrail Height (above nosing)', type: 'slider', min: 700, max: 1100, step: 10, default: 865, unit: 'mm', group: 'Handrail' },
  { key: 'wallClearance', label: 'Wall Clearance', type: 'slider', min: 25, max: 80, step: 5, default: 38, unit: 'mm', group: 'Handrail' },
  { key: 'riserHeight', label: 'Riser Height', type: 'slider', min: 100, max: 250, step: 5, default: 175, unit: 'mm', group: 'Stair' },
  { key: 'treadDepth', label: 'Tread Depth', type: 'slider', min: 200, max: 350, step: 5, default: 280, unit: 'mm', group: 'Stair' },
  { key: 'numSteps', label: 'Number of Steps', type: 'slider', min: 4, max: 16, step: 1, default: 10, group: 'Stair' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const hrH = mm(params.handrailHeight)
  const wallClr = mm(params.wallClearance)
  const rH = mm(params.riserHeight)
  const tD = mm(params.treadDepth)
  const nSteps = num(params.numSteps)
  const stairW = 1.2
  const hrViolated = hrH < 0.80 || hrH > 0.90
  const clrViolated = wallClr < 0.038
  const hrColor = hrViolated ? '#dc2626' : '#16a34a'
  const inst: GeometryInstruction[] = []

  // Steps
  for (let s = 0; s < nSteps; s++) {
    inst.push({ id: `tread-${s}`, type: 'box', position: [s * tD + tD / 2, s * rH + rH / 2, 0], args: [tD, rH, stairW], color: '#a1a1aa' })
    inst.push({ id: `nosing-${s}`, type: 'box', position: [s * tD + tD / 2, s * rH + rH, 0], args: [tD + 0.02, 0.02, stairW + 0.04], color: '#71717a' })
  }
  // Landing
  inst.push({ id: 'landing', type: 'box', position: [nSteps * tD + 0.6, nSteps * rH - 0.05, 0], args: [1.2, 0.1, stairW + 0.3], color: '#a1a1aa' })

  // Wall
  inst.push({ id: 'wall', type: 'box', position: [-0.075, (nSteps * rH) / 2, -stairW / 2 - 0.075], args: [nSteps * tD + 1.5, nSteps * rH + 0.5, 0.15], color: '#d4d4d8' })

  // Handrail (wall side)
  const hrAngle = Math.atan2(rH, tD)
  const hrLen = Math.sqrt((nSteps * tD) ** 2 + (nSteps * rH) ** 2)
  inst.push({ id: 'handrail-wall', type: 'cylinder', position: [nSteps * tD / 2, nSteps * rH / 2 + hrH * Math.cos(hrAngle), -stairW / 2 - wallClr - 0.019], rotation: [0, 0, -hrAngle], args: [0.019, 0.019, hrLen, 8], color: hrColor })
  // Handrail bracket posts
  for (let b = 0; b < 3; b++) {
    const bx = (nSteps * tD / 3) * b + tD
    const by = (bx / (nSteps * tD)) * nSteps * rH
    inst.push({ id: `bracket-${b}`, type: 'cylinder', position: [bx, by + hrH / 2, -stairW / 2 - wallClr - 0.019], args: [0.012, 0.012, hrH * 0.95, 6], color: '#71717a' })
  }

  // Free side handrail
  inst.push({ id: 'handrail-free', type: 'cylinder', position: [nSteps * tD / 2, nSteps * rH / 2 + hrH * Math.cos(hrAngle), stairW / 2 + 0.05], rotation: [0, 0, -hrAngle], args: [0.019, 0.019, hrLen, 8], color: hrColor })

  // Height annotation line
  inst.push({ id: 'hr-height-line', type: 'box', position: [tD * 2, nSteps * rH / 4 + hrH / 2, -stairW / 2 - wallClr - 0.1], args: [0.01, hrH, 0.01], color: '#3b82f6' })

  // Wall clearance indicator
  inst.push({ id: 'clearance-indicator', type: 'box', position: [tD * 2, nSteps * rH / 4 + hrH, -stairW / 2 - wallClr / 2 - 0.075], args: [0.01, 0.01, wallClr], color: clrViolated ? '#dc2626' : '#3b82f6', label: `${(wallClr * 1000).toFixed(0)}mm` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'handrail-height', field: 'handrailHeight',
    check: (p) => num(p.handrailHeight) < 800 || num(p.handrailHeight) > 900,
    message: 'Handrail height must be 800–900mm above stair nosing',
    codeCitation: 'PD 1096 IRR Rule VIII §809', severity: 'error',
    position: (p) => [0, mm(p.handrailHeight) + 0.5, 0],
  },
  {
    id: 'wall-clearance', field: 'wallClearance',
    check: (p) => num(p.wallClearance) < 38,
    message: 'Handrail must have minimum 38mm clearance from wall',
    codeCitation: 'PD 1096 IRR Rule VIII §809', severity: 'error',
    position: () => [1, 2, -1],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-height', label: '800–900mm Height', description: 'Handrail height measured vertically from stair nosing to top of handrail', codeCitation: 'PD 1096 IRR Rule VIII §809', position: (p) => [mm(p.treadDepth) * 2 + 0.5, mm(p.handrailHeight), 0] },
  { id: 'ann-clearance', label: '38mm Min Wall Clearance', description: 'Clear space between handrail and wall face must not be less than 38mm to allow gripping', codeCitation: 'PD 1096 IRR Rule VIII §809', position: (p) => [mm(p.treadDepth) * 2, mm(p.riserHeight) * num(p.numSteps) / 2, -(1.2 / 2) - 0.5] },
]

const presets: Preset[] = [
  { label: 'Compliant Stair', values: { handrailHeight: 865, wallClearance: 38, riserHeight: 175, treadDepth: 280, numSteps: 10 } },
  { label: 'Min Height', values: { handrailHeight: 800, wallClearance: 40, riserHeight: 175, treadDepth: 280, numSteps: 8 } },
  { label: 'Max Height', values: { handrailHeight: 900, wallClearance: 50, riserHeight: 175, treadDepth: 300, numSteps: 12 } },
  { label: 'Violation Demo', values: { handrailHeight: 700, wallClearance: 25, riserHeight: 175, treadDepth: 280, numSteps: 10 } },
]

export const handrailRequirementsConfig: ParametricSceneConfig = {
  id: 'handrail-requirements',
  title: 'Handrail Requirements',
  description: 'Stairway section with handrail heights 800–900mm above nosing, 38mm wall clearance, dual rails per PD 1096 Rule VIII §809.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 4, 5], fov: 50 },
}
