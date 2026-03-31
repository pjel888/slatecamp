// src/app/dashboard/3d-lab/_config/modules/wind-load-analysis.ts
// Wind Load Analysis — NSCP Chapter 2
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'windSpeed', label: 'Basic Wind Speed', type: 'slider', min: 150, max: 300, step: 10, default: 200, unit: 'kph', group: 'Wind' },
  { key: 'buildingHeight', label: 'Building Height', type: 'slider', min: 5, max: 60, step: 1, default: 20, unit: 'm', group: 'Building' },
  { key: 'buildingWidth', label: 'Building Width', type: 'slider', min: 8, max: 40, step: 1, default: 15, unit: 'm', group: 'Building' },
  { key: 'exposureCategory', label: 'Exposure Category', type: 'dropdown', default: 'B', options: [{ value: 'A', label: 'A — Center City' }, { value: 'B', label: 'B — Suburban' }, { value: 'C', label: 'C — Open Terrain' }], group: 'Exposure' },
  { key: 'showPressure', label: 'Show Pressure Distribution', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const ws = num(params.windSpeed)
  const bH = num(params.buildingHeight)
  const bW = num(params.buildingWidth)
  const expo = str(params.exposureCategory)
  const showPressure = Boolean(params.showPressure)
  const scale = 0.18
  const bHs = bH * scale
  const bWs = bW * scale
  const bDs = bW * 0.7 * scale
  const speedNorm = (ws - 150) / 150
  const windColor = speedNorm > 0.7 ? '#D64545' : speedNorm > 0.4 ? '#f97316' : '#3b82f6'
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.1, 0], args: [bWs + 6, 0.2, bDs + 4], color: '#52525b' })

  // Building
  inst.push({ id: 'building', type: 'box', position: [0, bHs / 2, 0], args: [bWs, bHs, bDs], color: '#a1a1aa', opacity: 0.8, transparent: true })
  inst.push({ id: 'roof', type: 'box', position: [0, bHs + 0.05, 0], args: [bWs, 0.1, bDs], color: '#71717a' })

  // Windward pressure zones
  if (showPressure) {
    const zones = 5
    for (let z = 0; z < zones; z++) {
      const zH = bHs / zones
      const zy = z * zH + zH / 2
      const hRatio = zy / bHs
      // Pressure increases with height
      const pressure = speedNorm * (0.6 + hRatio * 0.8) * bHs * 0.3
      inst.push({ id: `windward-${z}`, type: 'box', position: [-(bWs / 2) - pressure / 2, zy, 0], args: [pressure, zH * 0.9, bDs * 0.8], color: windColor, opacity: 0.4, transparent: true })
      // Arrow heads
      inst.push({ id: `arrow-${z}`, type: 'cone', position: [-(bWs / 2) - 0.05, zy, 0], rotation: [0, Math.PI / 2, 0], args: [0.08, 0.15, 6], color: windColor })
    }

    // Leeward suction
    const leewardP = speedNorm * 0.4 * bHs * 0.15
    inst.push({ id: 'leeward', type: 'box', position: [bWs / 2 + leewardP / 2, bHs / 2, 0], args: [leewardP, bHs, bDs * 0.8], color: '#6366f1', opacity: 0.3, transparent: true, label: 'Suction' })
    // Roof uplift
    inst.push({ id: 'roof-uplift', type: 'box', position: [0, bHs + 0.15, 0], args: [bWs, speedNorm * 0.3, bDs], color: '#f97316', opacity: 0.3, transparent: true, label: 'Uplift' })
  }

  // Wind arrows approaching
  const arrowCount = 4
  for (let a = 0; a < arrowCount; a++) {
    const ay = (a + 0.5) * bHs / arrowCount
    const startX = -(bWs / 2) - 1.5
    inst.push({ id: `wind-arrow-${a}`, type: 'cylinder', position: [startX - 0.4, ay, 0], rotation: [0, 0, Math.PI / 2], args: [0.04, 0.04, 0.8, 8], color: windColor })
    inst.push({ id: `wind-head-${a}`, type: 'cone', position: [startX, ay, 0], rotation: [0, Math.PI / 2, 0], args: [0.08, 0.2, 6], color: windColor })
  }

  // Exposure category terrain
  const terrainH = expo === 'A' ? 0.4 : expo === 'B' ? 0.2 : 0.05
  for (let t = 0; t < 5; t++) {
    const tx = -(bWs + 3) + t * 0.8
    inst.push({ id: `terrain-${t}`, type: 'box', position: [tx, terrainH / 2, 0], args: [0.5, terrainH, 1.0], color: '#4d7c0f', opacity: 0.6, transparent: true })
  }

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-speed', label: 'Basic Wind Speed', description: 'Design wind speed ranges from 200–280 kph in the Philippines depending on typhoon zone', codeCitation: 'NSCP 2015 §207.5.4', position: () => [-5, 3, 0] },
  { id: 'ann-expo', label: 'Exposure Categories', description: 'Exposure A (city) provides most shelter; C (open terrain) has highest gust factors', codeCitation: 'NSCP 2015 §207.5.6', position: () => [-5, 1, 0] },
]

const presets: Preset[] = [
  { label: 'Standard Manila (200 kph)', values: { windSpeed: 200, buildingHeight: 20, buildingWidth: 15, exposureCategory: 'B', showPressure: true } },
  { label: 'Typhoon Zone (280 kph)', values: { windSpeed: 280, buildingHeight: 15, buildingWidth: 12, exposureCategory: 'C', showPressure: true } },
  { label: 'High-Rise (220 kph)', values: { windSpeed: 220, buildingHeight: 50, buildingWidth: 20, exposureCategory: 'A', showPressure: true } },
  { label: 'Open Terrain (250 kph)', values: { windSpeed: 250, buildingHeight: 10, buildingWidth: 15, exposureCategory: 'C', showPressure: true } },
]

export const windLoadAnalysisConfig: ParametricSceneConfig = {
  id: 'wind-load-analysis',
  title: 'Wind Load Analysis',
  description: 'Building with wind pressure distribution on faces showing exposure categories A/B/C and 200–280 kph design speeds per NSCP 2015.',
  subject: 'nscp',
  parameters, geometry, annotations, presets,
  camera: { position: [6, 5, 7], fov: 50 },
}
