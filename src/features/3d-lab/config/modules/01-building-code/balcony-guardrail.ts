// src/features/3d-lab/config/modules/balcony-guardrail.ts
// Balcony Guardrail — PD 1096 Rule VIII §810
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'guardrailHeight', label: 'Guardrail Height', type: 'slider', min: 800, max: 1400, step: 10, default: 1100, unit: 'mm', group: 'Guardrail' },
  { key: 'balustrSpacing', label: 'Baluster Spacing', type: 'slider', min: 50, max: 250, step: 10, default: 150, unit: 'mm', group: 'Guardrail' },
  { key: 'balconyWidth', label: 'Balcony Width', type: 'slider', min: 1000, max: 5000, step: 100, default: 2500, unit: 'mm', group: 'Balcony' },
  { key: 'balconyDepth', label: 'Balcony Depth', type: 'slider', min: 800, max: 3000, step: 100, default: 1500, unit: 'mm', group: 'Balcony' },
  { key: 'floorLevel', label: 'Floor Level', type: 'slider', min: 1, max: 10, step: 1, default: 3, group: 'Building' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const grH = mm(params.guardrailHeight)
  const bSpace = mm(params.balustrSpacing)
  const bW = mm(params.balconyWidth)
  const bD = mm(params.balconyDepth)
  const level = num(params.floorLevel)
  const minH = level >= 2 ? 1.1 : 0.9
  const heightViolated = grH < minH
  const spacingViolated = bSpace > 0.15
  const grColor = heightViolated ? '#D64545' : '#a1a1aa'
  const slabH = (level - 1) * 3.0
  const inst: GeometryInstruction[] = []

  // Building facade
  inst.push({ id: 'facade', type: 'box', position: [0, slabH / 2 + 1.5, -0.15], args: [bW + 1, slabH + 3, 0.3], color: '#d4d4d8' })
  // Balcony slab
  inst.push({ id: 'slab', type: 'box', position: [0, slabH - 0.1, bD / 2], args: [bW, 0.2, bD], color: '#a1a1aa' })
  // Support bracket
  inst.push({ id: 'bracket', type: 'box', position: [0, slabH - 0.25, 0], args: [bW * 0.6, 0.1, 0.3], color: '#71717a' })

  // Guardrail top rail
  inst.push({ id: 'top-rail', type: 'box', position: [0, slabH + grH, bD], args: [bW, 0.05, 0.05], color: grColor })
  // Bottom rail
  inst.push({ id: 'bot-rail', type: 'box', position: [0, slabH + 0.05, bD], args: [bW, 0.04, 0.04], color: grColor })

  // Balusters
  const numBal = Math.max(Math.floor(bW / bSpace), 2)
  const actualSpacing = bW / numBal
  for (let b = 0; b <= numBal; b++) {
    const bx = -(bW / 2) + b * actualSpacing
    inst.push({
      id: `baluster-${b}`, type: 'box',
      position: [bx, slabH + grH / 2, bD],
      args: [0.025, grH, 0.025],
      color: spacingViolated ? '#f97316' : grColor,
    })
  }
  // End posts
  inst.push({ id: 'post-left', type: 'box', position: [-bW / 2, slabH + grH / 2, bD], args: [0.05, grH, 0.05], color: grColor })
  inst.push({ id: 'post-right', type: 'box', position: [bW / 2, slabH + grH / 2, bD], args: [0.05, grH, 0.05], color: grColor })

  // Min height indicator
  inst.push({ id: 'min-height-line', type: 'box', position: [bW / 2 + 0.2, slabH + minH, bD], args: [0.3, 0.02, bD * 0.5], color: heightViolated ? '#D64545' : '#2D9F6F', label: `Min ${minH}m` })
  // Height measurement
  inst.push({ id: 'height-bar', type: 'box', position: [-(bW / 2) - 0.3, slabH + grH / 2, bD], args: [0.02, grH, 0.02], color: '#3b82f6', label: `${(grH * 1000).toFixed(0)}mm` })

  // Person silhouette
  inst.push({ id: 'person', type: 'cylinder', position: [bW / 4, slabH + 0.85, bD / 2], args: [0.2, 0.2, 1.7, 8], color: '#6366f1', opacity: 0.5, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'guardrail-height', field: 'guardrailHeight',
    check: (p) => {
      const minH = num(p.floorLevel) >= 2 ? 1100 : 900
      return num(p.guardrailHeight) < minH
    },
    message: 'Balcony guardrail height below 1100mm minimum for 2nd floor and above',
    codeCitation: 'PD 1096 IRR Rule VIII §810', severity: 'error',
    position: () => [2, 5, 1.5],
  },
  {
    id: 'baluster-spacing', field: 'balustrSpacing',
    check: (p) => num(p.balustrSpacing) > 150,
    message: 'Baluster spacing exceeds 150mm — child safety risk',
    codeCitation: 'PD 1096 IRR Rule VIII §810', severity: 'error',
    position: () => [0, 5, 2],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-height', label: 'Min 1100mm (2F+)', description: 'Guardrails on balconies at 2nd floor and above must be at least 1100mm high', codeCitation: 'PD 1096 IRR Rule VIII §810', position: (p) => [mm(p.balconyWidth) / 2 + 0.8, num(p.floorLevel) * 3, mm(p.balconyDepth)] },
  { id: 'ann-baluster', label: 'Max 150mm Spacing', description: 'Baluster spacing must not allow passage of a 150mm sphere — child safety requirement', codeCitation: 'PD 1096 IRR Rule VIII §810', position: (p) => [0, num(p.floorLevel) * 3 + mm(p.guardrailHeight), mm(p.balconyDepth) + 0.5] },
]

const presets: Preset[] = [
  { label: 'Standard 3F Balcony', values: { guardrailHeight: 1100, balustrSpacing: 120, balconyWidth: 2500, balconyDepth: 1500, floorLevel: 3 } },
  { label: 'Ground Floor Patio', values: { guardrailHeight: 900, balustrSpacing: 150, balconyWidth: 4000, balconyDepth: 2000, floorLevel: 1 } },
  { label: 'Generous Rail', values: { guardrailHeight: 1200, balustrSpacing: 100, balconyWidth: 3000, balconyDepth: 2000, floorLevel: 5 } },
  { label: 'Violation Demo', values: { guardrailHeight: 800, balustrSpacing: 200, balconyWidth: 2500, balconyDepth: 1500, floorLevel: 4 } },
]

export const balconyGuardrailConfig: ParametricSceneConfig = {
  id: 'balcony-guardrail',
  title: 'Balcony Guardrail',
  description: 'Balcony section with adjustable guardrail height (min 1100mm at 2F+), baluster spacing max 150mm per PD 1096 Rule VIII §810.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 8, 6], fov: 50 },
}

