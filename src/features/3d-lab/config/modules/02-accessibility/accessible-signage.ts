// src/app/dashboard/3d-lab/_config/modules/accessible-signage.ts
// Accessible Signage — BP 344 2024 IRR
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'mountHeight', label: 'Sign Mount Height', type: 'slider', min: 1200, max: 2400, step: 50, default: 1500, unit: 'mm', group: 'Mounting' },
  { key: 'signWidth', label: 'Sign Width', type: 'slider', min: 150, max: 600, step: 25, default: 300, unit: 'mm', group: 'Sign' },
  { key: 'signHeight', label: 'Sign Height', type: 'slider', min: 150, max: 600, step: 25, default: 200, unit: 'mm', group: 'Sign' },
  { key: 'signType', label: 'Sign Type', type: 'dropdown', default: 'directional', options: [{ value: 'directional', label: 'Directional' }, { value: 'informational', label: 'Informational' }, { value: 'regulatory', label: 'Regulatory' }], group: 'Sign' },
  { key: 'showBraille', label: 'Show Braille Panel', type: 'toggle', default: true, group: 'Features' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const mH = mm(params.mountHeight)
  const sW = mm(params.signWidth)
  const sH = mm(params.signHeight)
  const sType = str(params.signType)
  const showBraille = Boolean(params.showBraille)
  const signColors: Record<string, string> = { directional: '#3b82f6', informational: '#2D9F6F', regulatory: '#D64545' }
  const sColor = signColors[sType] ?? '#3b82f6'
  const optimalH = mH >= 1.5 && mH <= 1.7
  const inst: GeometryInstruction[] = []

  // Wall
  inst.push({ id: 'wall', type: 'box', position: [0, 1.5, -0.1], args: [2.5, 3.0, 0.2], color: '#d4d4d8' })
  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [2.5, 0.1, 2], color: '#a1a1aa' })

  // Sign panel
  inst.push({ id: 'sign-bg', type: 'box', position: [0, mH, -0.005], args: [sW, sH, 0.015], color: sColor, opacity: 0.9, transparent: true })
  inst.push({ id: 'sign-frame', type: 'box', position: [0, mH, -0.008], args: [sW + 0.01, sH + 0.01, 0.01], color: '#52525b' })

  // ISA symbol (wheelchair)
  inst.push({ id: 'isa-circle', type: 'sphere', position: [-sW * 0.3, mH + sH * 0.2, 0.02], args: [sH * 0.12, 8, 8], color: '#ffffff' })
  inst.push({ id: 'isa-body', type: 'box', position: [-sW * 0.3, mH - sH * 0.05, 0.02], args: [sH * 0.15, sH * 0.3, 0.01], color: '#ffffff' })

  // Raised lettering
  const letterW = sW * 0.5
  inst.push({ id: 'raised-text', type: 'box', position: [sW * 0.1, mH, 0.02], args: [letterW, sH * 0.25, 0.005], color: '#ffffff', opacity: 0.8, transparent: true, label: sType.toUpperCase() })

  // Braille panel (below sign)
  if (showBraille) {
    const bY = mH - sH / 2 - 0.04
    inst.push({ id: 'braille-bg', type: 'box', position: [0, bY, -0.005], args: [sW * 0.8, 0.06, 0.01], color: '#f5f5f5' })
    const dotCols = 10
    const dotRows = 2
    for (let r = 0; r < dotRows; r++) {
      for (let c = 0; c < dotCols; c++) {
        inst.push({ id: `braille-dot-${r}-${c}`, type: 'sphere', position: [-(sW * 0.35) + c * (sW * 0.07), bY + (r - 0.5) * 0.025, 0.01], args: [0.004, 4, 4], color: '#52525b' })
      }
    }
  }

  // Optimal height range indicator
  inst.push({ id: 'opt-min', type: 'box', position: [1.1, 1.5, 0], args: [0.15, 0.01, 0.1], color: '#2D9F6F', label: '1500mm' })
  inst.push({ id: 'opt-max', type: 'box', position: [1.1, 1.7, 0], args: [0.15, 0.01, 0.1], color: '#f97316', label: '1700mm' })
  inst.push({ id: 'opt-band', type: 'box', position: [1.1, 1.6, 0], args: [0.02, 0.2, 0.05], color: '#3b82f6', opacity: 0.4, transparent: true })

  // Mount height indicator
  inst.push({ id: 'mount-line', type: 'box', position: [-1.1, mH / 2, 0], args: [0.02, mH, 0.02], color: optimalH ? '#2D9F6F' : '#f97316', label: `${(mH * 1000).toFixed(0)}mm` })

  // Person for scale
  inst.push({ id: 'person', type: 'cylinder', position: [0.8, 0.85, 0.5], args: [0.2, 0.2, 1.7, 8], color: '#6366f1', opacity: 0.4, transparent: true })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-height', label: 'Optimal Height 1500–1700mm', description: 'Signs should be mounted so center is between 1500–1700mm above finished floor for seated and standing users', codeCitation: 'BP 344 2024 IRR §8.1', position: () => [1.5, 1.6, 0] },
  { id: 'ann-braille', label: 'Braille + Raised Lettering', description: 'Informational and directional signs must include Grade 2 Braille and raised lettering for visually impaired users', codeCitation: 'BP 344 2024 IRR §8.2', position: (p) => [0, mm(p.mountHeight) - mm(p.signHeight) / 2 - 0.15, 0.5] },
  { id: 'ann-contrast', label: 'High Contrast Required', description: 'Signs must have minimum 70% contrast ratio between text and background; ISA symbol in white on blue', codeCitation: 'BP 344 2024 IRR §8.1', position: () => [-1.5, 2.5, 0] },
]

const presets: Preset[] = [
  { label: 'Directional Sign', values: { mountHeight: 1500, signWidth: 300, signHeight: 200, signType: 'directional', showBraille: true } },
  { label: 'Room Sign', values: { mountHeight: 1700, signWidth: 250, signHeight: 175, signType: 'informational', showBraille: true } },
  { label: 'Regulatory Sign', values: { mountHeight: 1500, signWidth: 300, signHeight: 300, signType: 'regulatory', showBraille: false } },
  { label: 'Large Wayfinding', values: { mountHeight: 2000, signWidth: 500, signHeight: 300, signType: 'directional', showBraille: true } },
]

export const accessibleSignageConfig: ParametricSceneConfig = {
  id: 'accessible-signage',
  title: 'Accessible Signage',
  description: 'Signage panel with Braille, raised lettering, pictograms, and mounting height requirements per BP 344 2024 IRR §8.',
  subject: 'bp-344',
  parameters, geometry, annotations, presets,
  camera: { position: [2.5, 2, 3], fov: 50 },
}

