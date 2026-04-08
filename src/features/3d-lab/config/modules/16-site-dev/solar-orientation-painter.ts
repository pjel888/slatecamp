// src/features/3d-lab/config/modules/16-site-dev/solar-orientation-painter.ts
// Solar Orientation Painter — PD 1096 Rule VIII §803 / BP 220
// Visualizes sun path and shadow casting on a building at different times of day.
// Helps architects orient buildings for natural lighting compliance.

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

// Sun altitude angles for Metro Manila (~14.5°N latitude)
// Approximate altitude at solar noon by month
const MONTH_ALTITUDE: Record<string, number> = {
  'jan': 52, 'feb': 59, 'mar': 68, 'apr': 76, 'may': 80,
  'jun': 79, 'jul': 78, 'aug': 75, 'sep': 70, 'oct': 62, 'nov': 54, 'dec': 50,
}

const parameters: ParameterDef[] = [
  { key: 'buildingWidth', label: 'Building Width', type: 'slider', min: 5, max: 30, step: 1, default: 12, unit: 'm', group: 'Building' },
  { key: 'buildingDepth', label: 'Building Depth', type: 'slider', min: 5, max: 30, step: 1, default: 8, unit: 'm', group: 'Building' },
  { key: 'buildingHeight', label: 'Building Height', type: 'slider', min: 3, max: 30, step: 0.5, default: 9, unit: 'm', decimals: 1, group: 'Building' },
  { key: 'month', label: 'Month', type: 'dropdown', default: 'jun',
    options: [
      { value: 'jan', label: 'January' }, { value: 'feb', label: 'February' },
      { value: 'mar', label: 'March' }, { value: 'apr', label: 'April' },
      { value: 'may', label: 'May' }, { value: 'jun', label: 'June' },
      { value: 'jul', label: 'July' }, { value: 'aug', label: 'August' },
      { value: 'sep', label: 'September' }, { value: 'oct', label: 'October' },
      { value: 'nov', label: 'November' }, { value: 'dec', label: 'December' },
    ],
    group: 'Sun Path' },
  { key: 'hour', label: 'Time of Day', type: 'slider', min: 6, max: 18, step: 0.5, default: 12, unit: 'h', decimals: 1, group: 'Sun Path' },
  { key: 'orientation', label: 'Building Orientation', type: 'slider', min: 0, max: 360, step: 15, default: 0, unit: '°', group: 'Orientation' },
  { key: 'lotWidth', label: 'Lot Width', type: 'slider', min: 10, max: 50, step: 1, default: 20, unit: 'm', group: 'Lot' },
  { key: 'lotDepth', label: 'Lot Depth', type: 'slider', min: 10, max: 50, step: 1, default: 25, unit: 'm', group: 'Lot' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const bW = num(params.buildingWidth)
  const bD = num(params.buildingDepth)
  const bH = num(params.buildingHeight)
  const month = String(params.month)
  const hour = num(params.hour)
  const orient = num(params.orientation)
  const lW = num(params.lotWidth)
  const lD = num(params.lotDepth)

  const scale = 0.15
  const bWs = bW * scale
  const bDs = bD * scale
  const bHs = bH * scale
  const lWs = lW * scale
  const lDs = lD * scale

  // Sun position calculation
  const solarNoonAlt = MONTH_ALTITUDE[month] ?? 70
  // Adjust altitude for time of day (simplified: peak at noon, 0 at sunrise/sunset)
  const hourAngle = (hour - 12) * 15 // degrees from solar noon
  const altDeg = Math.max(0, solarNoonAlt * Math.cos(hourAngle * Math.PI / 180))
  const altRad = altDeg * Math.PI / 180
  // Azimuth: east in morning, south at noon, west in afternoon (Northern hemisphere)
  const azDeg = 180 + hourAngle + orient
  const azRad = azDeg * Math.PI / 180

  // Shadow length (projected on ground)
  const shadowLen = altDeg > 1 ? (bH / Math.tan(altRad)) * scale : bHs * 8
  const shadowDirX = Math.sin(azRad)
  const shadowDirZ = Math.cos(azRad)

  const inst: GeometryInstruction[] = []

  // Ground / lot
  inst.push({ id: 'lot', type: 'box', position: [0, 0.005, 0], args: [lWs, 0.01, lDs], color: '#d4d0c8', opacity: 0.3, transparent: true })

  // Building
  inst.push({ id: 'building', type: 'box', position: [0, bHs / 2, 0], args: [bWs, bHs, bDs], color: '#64748b', opacity: 0.85, transparent: true })
  inst.push({ id: 'building-roof', type: 'box', position: [0, bHs, 0], args: [bWs, 0.02, bDs], color: '#475569' })

  // Shadow projection on ground
  if (altDeg > 1) {
    const shX = shadowDirX * shadowLen / 2
    const shZ = shadowDirZ * shadowLen / 2
    inst.push({
      id: 'shadow',
      type: 'box',
      position: [shX, 0.008, shZ],
      args: [bWs * 1.1, 0.005, shadowLen],
      color: '#1e293b',
      opacity: 0.25,
      transparent: true,
      label: `Shadow: ${(shadowLen / scale).toFixed(1)}m`,
    })
  }

  // Sun direction indicator (arrow from building toward sun)
  const sunDist = 2.5
  const sunX = -shadowDirX * sunDist
  const sunZ = -shadowDirZ * sunDist
  const sunY = Math.sin(altRad) * sunDist
  inst.push({
    id: 'sun-indicator',
    type: 'sphere',
    position: [sunX, sunY, sunZ],
    args: [0.15],
    color: '#f59e0b',
    label: `Alt: ${altDeg.toFixed(0)}°`,
  })

  // Sun ray line (simplified as thin box)
  inst.push({
    id: 'sun-ray',
    type: 'box',
    position: [sunX / 2, sunY / 2 + bHs / 2, sunZ / 2],
    args: [0.01, Math.sqrt(sunX * sunX + sunY * sunY + sunZ * sunZ), 0.01],
    color: '#fbbf24',
    opacity: 0.4,
    transparent: true,
  })

  // Compass rose markers
  const compassDist = lWs / 2 + 0.3
  inst.push({ id: 'north', type: 'box', position: [0, 0.02, -compassDist], args: [0.15, 0.02, 0.15], color: '#dc2626', label: 'N' })
  inst.push({ id: 'south', type: 'box', position: [0, 0.02, compassDist], args: [0.1, 0.02, 0.1], color: '#64748b' })
  inst.push({ id: 'east', type: 'box', position: [compassDist, 0.02, 0], args: [0.1, 0.02, 0.1], color: '#64748b', label: 'E' })
  inst.push({ id: 'west', type: 'box', position: [-compassDist, 0.02, 0], args: [0.1, 0.02, 0.1], color: '#64748b', label: 'W' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'inadequate-light',
    field: 'orientation',
    check: (p) => {
      // Windows facing within 30° of due west get harsh afternoon sun
      const orient = num(p.orientation)
      return orient >= 240 && orient <= 300
    },
    message: 'Primary facade faces west — excessive afternoon solar heat gain. Consider reorienting 15-30° or adding sun-shading devices.',
    codeCitation: 'PD 1096 Rule VIII §803 — Natural Light',
    severity: 'warning',
    position: () => [0, 1.5, 0],
  },
  {
    id: 'shadow-on-neighbor',
    field: 'buildingHeight',
    check: (p) => {
      const bH = num(p.buildingHeight)
      const lD = num(p.lotDepth)
      const bD = num(p.buildingDepth)
      // If shadow at winter solstice (Dec, alt ~50°) extends beyond lot
      return (bH / Math.tan(50 * Math.PI / 180)) > (lD - bD) / 2
    },
    message: 'Building shadow may extend beyond lot boundary at winter solstice. Check easement requirements.',
    codeCitation: 'PD 1096 Rule VII — Setbacks',
    severity: 'info',
    position: () => [0, 0.5, 2],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'shadow-note',
    label: 'Shadow analysis for Metro Manila (~14.5°N)',
    description: 'Sun altitude angles calibrated for 14.5°N latitude (Metro Manila). Seasonal variation affects shadow length.',
    position: () => [0, 0, -1.5],
    codeCitation: 'Lat 14.5°N',
  },
]

const presets: Preset[] = [
  { label: 'Morning (East Sun)', values: { hour: 8, month: 'mar', orientation: 0, buildingWidth: 12, buildingDepth: 8, buildingHeight: 9 } },
  { label: 'Noon (Peak)', values: { hour: 12, month: 'jun', orientation: 0, buildingWidth: 12, buildingDepth: 8, buildingHeight: 9 } },
  { label: 'Afternoon (West Sun)', values: { hour: 16, month: 'mar', orientation: 0, buildingWidth: 12, buildingDepth: 8, buildingHeight: 9 } },
  { label: 'Winter Solstice', values: { hour: 12, month: 'dec', orientation: 0, buildingWidth: 12, buildingDepth: 8, buildingHeight: 15 } },
]

export const solarOrientationPainterConfig: ParametricSceneConfig = {
  id: 'solar-orientation-painter',
  title: 'Solar Orientation Painter',
  description: 'Sun path and shadow analysis for building orientation per PD 1096 §803 natural lighting requirements. Adjust time, month, and building orientation to optimize daylight.',
  subject: 'pd-1096',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: { position: [5, 4, 5], fov: 45 },
  showHumanScale: false,
  scale: 1,
}
