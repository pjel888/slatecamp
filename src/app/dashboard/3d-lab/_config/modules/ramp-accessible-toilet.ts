// src/app/dashboard/3d-lab/_config/modules/ramp-accessible-toilet.ts
// Ramp & Accessible Toilet — BP 344 2024 IRR §5.2
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '../../_types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert mm to scene units (1 unit = 1m) */
function mm(v: number | string | boolean): number {
  return (typeof v === 'number' ? v : Number(v)) / 1000
}

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function bool(v: number | string | boolean): boolean {
  return typeof v === 'boolean' ? v : v === 'true'
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  {
    key: 'rampGradient',
    label: 'Ramp Gradient',
    type: 'slider',
    min: 5,
    max: 10,
    step: 0.5,
    default: 5,
    unit: '% rise',
    group: 'Ramp',
    decimals: 1,
  },
  {
    key: 'rampWidth',
    label: 'Ramp Width',
    type: 'slider',
    min: 900,
    max: 2000,
    step: 10,
    default: 1200,
    unit: 'mm',
    group: 'Ramp',
  },
  {
    key: 'rampLength',
    label: 'Ramp Length',
    type: 'slider',
    min: 2000,
    max: 12000,
    step: 100,
    default: 6000,
    unit: 'mm',
    group: 'Ramp',
  },
  {
    key: 'landingLength',
    label: 'Landing Length',
    type: 'slider',
    min: 1200,
    max: 2400,
    step: 100,
    default: 1800,
    unit: 'mm',
    group: 'Ramp',
  },
  {
    key: 'handrailHeight1',
    label: 'Lower Handrail Height',
    type: 'slider',
    min: 600,
    max: 800,
    step: 10,
    default: 700,
    unit: 'mm',
    group: 'Handrails',
  },
  {
    key: 'handrailHeight2',
    label: 'Upper Handrail Height',
    type: 'slider',
    min: 800,
    max: 1000,
    step: 10,
    default: 900,
    unit: 'mm',
    group: 'Handrails',
  },
  {
    key: 'showToilet',
    label: 'Show Accessible Toilet',
    type: 'toggle',
    default: true,
    group: 'Toilet',
  },
]

// ─── Geometry Builder ───────────────────────────────────────────────────────

function geometry(
  params: Record<string, number | boolean | string>
): GeometryInstruction[] {
  const gradient = num(params.rampGradient) / 100 // decimal slope
  const rW = mm(params.rampWidth)
  const rL = mm(params.rampLength)
  const lL = mm(params.landingLength)
  const hr1 = mm(params.handrailHeight1)
  const hr2 = mm(params.handrailHeight2)
  const showToilet = bool(params.showToilet)

  const riseHeight = gradient * rL
  const slopeAngle = Math.atan2(riseHeight, rL)
  const slopeLength = Math.sqrt(rL * rL + riseHeight * riseHeight)

  // Violation colors
  const gradientBad = num(params.rampGradient) > 6.67
  const widthBad = num(params.rampWidth) < 1200
  const landingBad = num(params.landingLength) < 1800
  const hr1Bad = num(params.handrailHeight1) !== 700
  const hr2Bad = num(params.handrailHeight2) !== 900

  const rampColor = gradientBad || widthBad ? '#dc2626' : '#d1d5db'
  const hr1Color = hr1Bad ? '#dc2626' : '#3b82f6'
  const hr2Color = hr2Bad ? '#dc2626' : '#2563eb'

  const instructions: GeometryInstruction[] = []
  const slabThickness = 0.05
  const edgeHeight = 0.05
  const handrailRadius = 0.02

  // 1. Bottom landing
  instructions.push({
    id: 'bottom-landing',
    type: 'box',
    position: [0, -slabThickness / 2, lL / 2],
    args: [rW, slabThickness, lL],
    color: landingBad ? '#fecaca' : '#e5e7eb',
    label: 'Bottom Landing',
  })

  // 2. Ramp slope
  const rampCenterZ = -(rL / 2)
  const rampCenterY = riseHeight / 2
  instructions.push({
    id: 'ramp-slope',
    type: 'box',
    position: [0, rampCenterY, rampCenterZ],
    rotation: [slopeAngle, 0, 0],
    args: [rW, slabThickness, slopeLength],
    color: rampColor,
    label: 'Ramp Slope',
  })

  // 3. Top landing
  instructions.push({
    id: 'top-landing',
    type: 'box',
    position: [0, riseHeight - slabThickness / 2, -(rL + lL / 2)],
    args: [rW, slabThickness, lL],
    color: landingBad ? '#fecaca' : '#e5e7eb',
    label: 'Top Landing',
  })

  // 4. Raised edges (kerbs) on both sides of ramp
  for (const side of [-1, 1] as const) {
    instructions.push({
      id: `kerb-${side === -1 ? 'left' : 'right'}`,
      type: 'box',
      position: [side * (rW / 2 + 0.025), rampCenterY + edgeHeight / 2, rampCenterZ],
      rotation: [slopeAngle, 0, 0],
      args: [0.05, edgeHeight, slopeLength],
      color: '#a1a1aa',
    })
  }

  // 5. Dual handrails on both sides
  for (const side of [-1, 1] as const) {
    const xPos = side * (rW / 2 + 0.05)
    // Lower handrail
    instructions.push({
      id: `handrail-lower-${side === -1 ? 'left' : 'right'}`,
      type: 'cylinder',
      position: [
        xPos,
        rampCenterY + hr1 * Math.cos(slopeAngle),
        rampCenterZ + hr1 * Math.sin(slopeAngle),
      ],
      rotation: [Math.PI / 2 + slopeAngle, 0, 0],
      args: [handrailRadius, handrailRadius, slopeLength, 8],
      color: hr1Color,
    })
    // Upper handrail
    instructions.push({
      id: `handrail-upper-${side === -1 ? 'left' : 'right'}`,
      type: 'cylinder',
      position: [
        xPos,
        rampCenterY + hr2 * Math.cos(slopeAngle),
        rampCenterZ + hr2 * Math.sin(slopeAngle),
      ],
      rotation: [Math.PI / 2 + slopeAngle, 0, 0],
      args: [handrailRadius, handrailRadius, slopeLength, 8],
      color: hr2Color,
    })
  }

  // 6. Accessible toilet cubicle (1800×1800mm)
  if (showToilet) {
    const toiletSize = 1.8
    const toiletX = rW / 2 + 0.3 + toiletSize / 2
    const wallHeight = 2.4
    const wallThickness = 0.05

    // Floor
    instructions.push({
      id: 'toilet-floor',
      type: 'box',
      position: [toiletX, -slabThickness / 2, 0],
      args: [toiletSize, slabThickness, toiletSize],
      color: '#f5f5f4',
    })

    // Walls (3 walls, open front)
    // Back wall
    instructions.push({
      id: 'toilet-wall-back',
      type: 'box',
      position: [toiletX, wallHeight / 2, -toiletSize / 2 + wallThickness / 2],
      args: [toiletSize, wallHeight, wallThickness],
      color: '#e7e5e4',
      opacity: 0.6,
      transparent: true,
    })
    // Left wall
    instructions.push({
      id: 'toilet-wall-left',
      type: 'box',
      position: [toiletX - toiletSize / 2 + wallThickness / 2, wallHeight / 2, 0],
      args: [wallThickness, wallHeight, toiletSize],
      color: '#e7e5e4',
      opacity: 0.6,
      transparent: true,
    })
    // Right wall
    instructions.push({
      id: 'toilet-wall-right',
      type: 'box',
      position: [toiletX + toiletSize / 2 - wallThickness / 2, wallHeight / 2, 0],
      args: [wallThickness, wallHeight, toiletSize],
      color: '#e7e5e4',
      opacity: 0.6,
      transparent: true,
    })

    // Toilet fixture (simplified box)
    instructions.push({
      id: 'toilet-fixture',
      type: 'box',
      position: [toiletX, 0.2, -toiletSize / 2 + 0.4],
      args: [0.4, 0.4, 0.6],
      color: '#fafaf9',
      label: 'WC',
    })

    // Lavatory / wash basin
    instructions.push({
      id: 'toilet-lavatory',
      type: 'box',
      position: [toiletX + 0.5, 0.4, -toiletSize / 2 + 0.35],
      args: [0.45, 0.05, 0.35],
      color: '#fafaf9',
      label: 'Lavatory',
    })

    // Grab bars (horizontal cylinders)
    // Side grab bar
    instructions.push({
      id: 'grab-bar-side',
      type: 'cylinder',
      position: [toiletX - 0.35, 0.45, -toiletSize / 2 + 0.4],
      rotation: [0, 0, Math.PI / 2],
      args: [0.02, 0.02, 0.6, 8],
      color: '#71717a',
      label: 'Side Grab Bar',
    })
    // Rear grab bar
    instructions.push({
      id: 'grab-bar-rear',
      type: 'cylinder',
      position: [toiletX, 0.45, -toiletSize / 2 + 0.08],
      rotation: [Math.PI / 2, 0, 0],
      args: [0.02, 0.02, 0.5, 8],
      color: '#71717a',
      label: 'Rear Grab Bar',
    })
  }

  return instructions
}

// ─── Violation Rules ────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'max-gradient',
    field: 'rampGradient',
    check: (p) => num(p.rampGradient) > 6.67,
    message: 'Maximum gradient 1:20 (1:15 special)',
    codeCitation: 'BP 344 2024 IRR §5.2',
    severity: 'error',
    position: (p) => {
      const rL = mm(p.rampLength)
      const rise = (num(p.rampGradient) / 100) * rL
      return [0, rise / 2, -rL / 2]
    },
  },
  {
    id: 'min-width',
    field: 'rampWidth',
    check: (p) => num(p.rampWidth) < 1200,
    message: 'Minimum ramp width 1,200mm',
    codeCitation: 'BP 344 2024 IRR §5.2',
    severity: 'error',
    position: (p) => [0, -0.1, 0],
  },
  {
    id: 'min-landing',
    field: 'landingLength',
    check: (p) => num(p.landingLength) < 1800,
    message: 'Minimum landing length 1,800mm',
    codeCitation: 'BP 344 2024 IRR §5.2',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.landingLength) / 2],
  },
  {
    id: 'handrail-lower',
    field: 'handrailHeight1',
    check: (p) => num(p.handrailHeight1) < 700 || num(p.handrailHeight1) > 700,
    message: 'Lower handrail at 700mm',
    codeCitation: 'BP 344 2024 IRR §5.2',
    severity: 'error',
    position: (p) => {
      const rL = mm(p.rampLength)
      const rise = (num(p.rampGradient) / 100) * rL
      return [mm(p.rampWidth) / 2 + 0.15, rise / 2 + mm(p.handrailHeight1), -rL / 2]
    },
  },
  {
    id: 'handrail-upper',
    field: 'handrailHeight2',
    check: (p) => num(p.handrailHeight2) < 900 || num(p.handrailHeight2) > 900,
    message: 'Upper handrail at 900mm',
    codeCitation: 'BP 344 2024 IRR §5.2',
    severity: 'error',
    position: (p) => {
      const rL = mm(p.rampLength)
      const rise = (num(p.rampGradient) / 100) * rL
      return [mm(p.rampWidth) / 2 + 0.15, rise / 2 + mm(p.handrailHeight2), -rL / 2]
    },
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'gradient-label',
    label: 'Gradient',
    description: 'Ramp slope expressed as percentage rise over run',
    codeCitation: 'BP 344 2024 IRR §5.2',
    position: (p) => {
      const rL = mm(p.rampLength)
      const rise = (num(p.rampGradient) / 100) * rL
      return [-(mm(p.rampWidth) / 2) - 0.15, rise / 2, -rL / 2]
    },
  },
  {
    id: 'width-label',
    label: 'Ramp Width',
    description: 'Clear width between kerbs/handrails',
    codeCitation: 'BP 344 2024 IRR §5.2',
    position: (p) => [0, -0.08, mm(p.landingLength) / 2],
  },
  {
    id: 'landing-label',
    label: 'Landing',
    description: 'Level rest area at top and bottom of ramp run',
    codeCitation: 'BP 344 2024 IRR §5.2',
    position: (p) => [0, 0.08, mm(p.landingLength) / 2],
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: '2024 Standard',
    values: {
      rampGradient: 5,
      rampWidth: 1200,
      rampLength: 6000,
      landingLength: 1800,
      handrailHeight1: 700,
      handrailHeight2: 900,
      showToilet: true,
    },
  },
  {
    label: 'Pre-2024 (Old)',
    values: {
      rampGradient: 8,
      rampWidth: 1000,
      rampLength: 6000,
      landingLength: 1500,
      handrailHeight1: 700,
      handrailHeight2: 850,
      showToilet: true,
    },
  },
  {
    label: 'Maximum Slope',
    values: {
      rampGradient: 10,
      rampWidth: 900,
      rampLength: 3000,
      landingLength: 1200,
      handrailHeight1: 650,
      handrailHeight2: 800,
      showToilet: false,
    },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const rampAccessibleToiletConfig: ParametricSceneConfig = {
  id: 'ramp-accessible-toilet',
  title: 'Ramp & Accessible Toilet',
  description:
    'Interactive accessible ramp with dual handrails and optional toilet cubicle, validated against BP 344 2024 IRR §5.2.',
  subject: 'Accessibility',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: {
    position: [4, 3, 4],
    fov: 45,
  },
}
