// src/app/dashboard/3d-lab/_config/modules/seismic-parameter-map.ts
// Seismic Parameter Map — NSCP Chapter 2
// ─────────────────────────────────────────────────────────────────────────────
// Interactive visualization of Philippine seismic zones, soil profiles,
// and near-source factors per NSCP 2015.

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '@/features/3d-lab/types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function str(v: number | string | boolean): string {
  return String(v)
}

// ─── NSCP 2015 Seismic Parameters ───────────────────────────────────────────

// Seismic Zone Factors (Z)
const ZONE_FACTORS: Record<string, number> = {
  'Zone 2': 0.20,
  'Zone 4': 0.40,
}

// Soil Profile Types (NSCP Table 208-2)
interface SoilProfile {
  label: string
  description: string
  Fa: Record<string, number>  // Site coefficient for short period
  Fv: Record<string, number>  // Site coefficient for 1-sec period
  color: string
  depth: number  // visual depth in scene
}

const SOIL_PROFILES: Record<string, SoilProfile> = {
  SA: {
    label: 'SA — Hard Rock',
    description: 'Hard rock: Vs > 1500 m/s. Rare in Philippines.',
    Fa: { 'Zone 2': 0.8, 'Zone 4': 0.8 },
    Fv: { 'Zone 2': 0.8, 'Zone 4': 0.8 },
    color: '#78716c',
    depth: 0.3,
  },
  SB: {
    label: 'SB — Rock',
    description: 'Rock: 760 < Vs ≤ 1500 m/s.',
    Fa: { 'Zone 2': 1.0, 'Zone 4': 1.0 },
    Fv: { 'Zone 2': 1.0, 'Zone 4': 1.0 },
    color: '#a1a1aa',
    depth: 0.5,
  },
  SC: {
    label: 'SC — Very Dense Soil/Soft Rock',
    description: 'Very dense soil / soft rock: 360 < Vs ≤ 760 m/s.',
    Fa: { 'Zone 2': 1.0, 'Zone 4': 1.0 },
    Fv: { 'Zone 2': 1.3, 'Zone 4': 1.3 },
    color: '#a3734c',
    depth: 0.8,
  },
  SD: {
    label: 'SD — Stiff Soil',
    description: 'Stiff soil: 180 < Vs ≤ 360 m/s. Most common urban condition.',
    Fa: { 'Zone 2': 1.2, 'Zone 4': 1.0 },
    Fv: { 'Zone 2': 1.6, 'Zone 4': 1.5 },
    color: '#92400e',
    depth: 1.2,
  },
  SE: {
    label: 'SE — Soft Soil',
    description: 'Soft soil: Vs ≤ 180 m/s. Amplifies ground motion significantly.',
    Fa: { 'Zone 2': 1.7, 'Zone 4': 1.1 },
    Fv: { 'Zone 2': 2.4, 'Zone 4': 2.0 },
    color: '#b45309',
    depth: 1.8,
  },
  SF: {
    label: 'SF — Special Study',
    description: 'Soils requiring site-specific evaluation: liquefiable, peat, high plasticity clays >8m.',
    Fa: { 'Zone 2': 1.7, 'Zone 4': 1.1 },
    Fv: { 'Zone 2': 2.4, 'Zone 4': 2.0 },
    color: '#D64545',
    depth: 2.5,
  },
}

// Near-Source Factors (NSCP Table 208-4, 208-5)
const NEAR_SOURCE: Record<string, { Na: number; Nv: number; description: string }> = {
  'A (≤5km)': { Na: 1.5, Nv: 2.0, description: 'Type A fault ≤5km: highest amplification' },
  'A (5-10km)': { Na: 1.2, Nv: 1.6, description: 'Type A fault 5-10km' },
  'A (>10km)': { Na: 1.0, Nv: 1.0, description: 'Type A fault >10km: no amplification' },
  'B (≤5km)': { Na: 1.3, Nv: 1.6, description: 'Type B fault ≤5km' },
  'B (>5km)': { Na: 1.0, Nv: 1.0, description: 'Type B fault >5km: no amplification' },
  'C (any)': { Na: 1.0, Nv: 1.0, description: 'Type C fault: no near-source amplification' },
}

function getSoil(type: string): SoilProfile {
  return SOIL_PROFILES[type] ?? SOIL_PROFILES['SD']
}

function getNearSource(type: string): { Na: number; Nv: number } {
  return NEAR_SOURCE[type] ?? { Na: 1.0, Nv: 1.0 }
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  {
    key: 'seismicZone',
    label: 'Seismic Zone',
    type: 'dropdown',
    default: 'Zone 4',
    options: [
      { value: 'Zone 2', label: 'Zone 2 (Z=0.20)' },
      { value: 'Zone 4', label: 'Zone 4 (Z=0.40)' },
    ],
    group: 'Location',
  },
  {
    key: 'soilProfile',
    label: 'Soil Profile',
    type: 'dropdown',
    default: 'SD',
    options: Object.entries(SOIL_PROFILES).map(([value, sp]) => ({
      value,
      label: sp.label,
    })),
    group: 'Site Conditions',
  },
  {
    key: 'nearSourceType',
    label: 'Near-Source Factor',
    type: 'dropdown',
    default: 'C (any)',
    options: Object.keys(NEAR_SOURCE).map(k => ({ value: k, label: k })),
    group: 'Site Conditions',
  },
  {
    key: 'buildingHeight',
    label: 'Building Height',
    type: 'slider',
    min: 3,
    max: 60,
    step: 1,
    default: 15,
    unit: 'm',
    group: 'Structure',
  },
  {
    key: 'structuralSystem',
    label: 'Structural System',
    type: 'dropdown',
    default: 'SMRF',
    options: [
      { value: 'SMRF', label: 'Special Moment Resisting Frame (R=8.5)' },
      { value: 'OMRF', label: 'Ordinary Moment Resisting Frame (R=3.5)' },
      { value: 'DUAL', label: 'Dual System (R=8.5)' },
      { value: 'SHEARWALL', label: 'Shear Wall (R=4.5)' },
      { value: 'BEARING', label: 'Bearing Wall (R=2.8)' },
    ],
    group: 'Structure',
  },
]

// R-factors for structural systems
const R_FACTORS: Record<string, number> = {
  SMRF: 8.5,
  OMRF: 3.5,
  DUAL: 8.5,
  SHEARWALL: 4.5,
  BEARING: 2.8,
}

// ─── Geometry Builder ───────────────────────────────────────────────────────

function geometry(
  params: Record<string, number | boolean | string>
): GeometryInstruction[] {
  const zone = str(params.seismicZone)
  const soilType = str(params.soilProfile)
  const nsType = str(params.nearSourceType)
  const bldgH = num(params.buildingHeight)
  const sysType = str(params.structuralSystem)

  const Z = ZONE_FACTORS[zone] ?? 0.40
  const soil = getSoil(soilType)
  const ns = getNearSource(nsType)
  const R = R_FACTORS[sysType] ?? 8.5
  const Fa = soil.Fa[zone] ?? 1.0
  const Fv = soil.Fv[zone] ?? 1.0

  // Approximate base shear coefficient: V/W ≈ (Z * Na * Fa) / R (simplified)
  const baseShearCoeff = (Z * ns.Na * Fa) / R

  // Scale for scene
  const s = 0.05

  const instructions: GeometryInstruction[] = []

  // 1. Soil column (layered cross-section)
  const soilDepth = soil.depth
  instructions.push({
    id: 'soil-column',
    type: 'box',
    position: [0, -soilDepth * s / 2, 0],
    args: [2.5 * s * 20, soilDepth * s * 20, 1.5 * s * 20],
    color: soil.color,
    opacity: 0.7,
    transparent: true,
  })

  // Soil surface line
  instructions.push({
    id: 'ground-surface',
    type: 'box',
    position: [0, 0, 0],
    args: [3 * s * 20, 0.01, 2 * s * 20],
    color: '#2D9F6F',
  })

  // 2. Building (simplified frame)
  const bh = bldgH * s
  const bw = 0.8
  const bd = 0.5

  // Building body
  instructions.push({
    id: 'building',
    type: 'box',
    position: [0, bh / 2 + 0.01, 0],
    args: [bw, bh, bd],
    color: zone === 'Zone 4' ? '#D64545' : '#f97316',
    opacity: 0.5,
    transparent: true,
  })

  // Floor lines
  const floorH = 3.0 * s
  const numFloors = Math.floor(bldgH / 3)
  for (let i = 1; i < numFloors; i++) {
    instructions.push({
      id: `floor-${i}`,
      type: 'box',
      position: [0, i * floorH + 0.01, 0],
      args: [bw, 0.003, bd],
      color: '#1535A8',
      opacity: 0.5,
      transparent: true,
    })
  }

  // 3. Base shear arrow (proportional to coefficient)
  const arrowScale = baseShearCoeff * 10 // visual scaling
  instructions.push({
    id: 'base-shear-arrow',
    type: 'cone',
    position: [bw / 2 + 0.15 + arrowScale / 2, bh / 3, 0],
    rotation: [0, 0, -Math.PI / 2],
    args: [0.06, arrowScale, 8],
    color: '#D64545',
  })

  // Lateral force distribution arrows (inverted triangle)
  for (let i = 1; i <= Math.min(numFloors, 8); i++) {
    const forceMag = (i / numFloors) * arrowScale * 0.7
    if (forceMag > 0.02) {
      instructions.push({
        id: `lateral-force-${i}`,
        type: 'cone',
        position: [bw / 2 + 0.1 + forceMag / 2, i * floorH + 0.01, 0],
        rotation: [0, 0, -Math.PI / 2],
        args: [0.03, forceMag, 6],
        color: '#ef4444',
        opacity: 0.7,
        transparent: true,
      })
    }
  }

  // 4. Zone indicator (colored platform)
  instructions.push({
    id: 'zone-indicator',
    type: 'box',
    position: [0, -0.015, 0],
    args: [3 * s * 20, 0.02, 2 * s * 20],
    color: zone === 'Zone 4' ? '#fecaca' : '#fef3c7',
  })

  // 5. Seismic wave lines (surface)
  for (let i = 0; i < 5; i++) {
    const waveZ = -0.5 + i * 0.25
    instructions.push({
      id: `wave-${i}`,
      type: 'box',
      position: [0, 0.005, waveZ],
      args: [2.5, 0.003, 0.005],
      color: '#f97316',
      opacity: 0.4 - i * 0.06,
      transparent: true,
    })
  }

  return instructions
}

// ─── Violation Rules ────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'sf-requires-study',
    field: 'soilProfile',
    check: (p) => str(p.soilProfile) === 'SF',
    message: 'Soil Profile SF requires site-specific geotechnical study',
    codeCitation: 'NSCP 2015 §208.4.3',
    severity: 'warning',
    position: () => [0, -0.3, 0.8],
  },
  {
    id: 'near-source-high',
    field: 'nearSourceType',
    check: (p) => {
      const ns = getNearSource(str(p.nearSourceType))
      return ns.Na > 1.0 || ns.Nv > 1.0
    },
    message: 'Near-source amplification active — verify fault distance',
    codeCitation: 'NSCP 2015 Table 208-4',
    severity: 'warning',
    position: () => [1.2, 0.3, 0],
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'ann-zone-factor',
    label: 'Seismic Zone Factor (Z)',
    description: 'Zone 2: Z=0.20 | Zone 4: Z=0.40. Philippines has only Zone 2 and Zone 4.',
    codeCitation: 'NSCP 2015 Table 208-3',
    position: (p) => [0, -0.1, num(p.buildingHeight) * 0.05 * 0.5 + 0.3],
  },
  {
    id: 'ann-soil-amplification',
    label: 'Soil Amplification (Fa/Fv)',
    description: 'Soft soils amplify ground motion. Fa: short-period amplification, Fv: long-period amplification.',
    codeCitation: 'NSCP 2015 Table 208-7/208-8',
    position: () => [-1.2, -0.3, 0],
  },
  {
    id: 'ann-base-shear',
    label: 'Base Shear',
    description: 'Design base shear V = (Cv·I)/(R·T) × W. Distributed as inverted triangle to floor levels.',
    codeCitation: 'NSCP 2015 §208.5.2',
    position: (p) => [1.0, num(p.buildingHeight) * 0.05 / 2, 0],
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'Metro Manila (Zone 4, SD)',
    values: { seismicZone: 'Zone 4', soilProfile: 'SD', nearSourceType: 'B (≤5km)', buildingHeight: 15, structuralSystem: 'SMRF' },
  },
  {
    label: 'Cebu (Zone 4, SC)',
    values: { seismicZone: 'Zone 4', soilProfile: 'SC', nearSourceType: 'C (any)', buildingHeight: 20, structuralSystem: 'DUAL' },
  },
  {
    label: 'Palawan (Zone 2, SD)',
    values: { seismicZone: 'Zone 2', soilProfile: 'SD', nearSourceType: 'C (any)', buildingHeight: 10, structuralSystem: 'SHEARWALL' },
  },
  {
    label: 'Soft Soil Warning',
    values: { seismicZone: 'Zone 4', soilProfile: 'SE', nearSourceType: 'A (≤5km)', buildingHeight: 30, structuralSystem: 'OMRF' },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const seismicParameterMapConfig: ParametricSceneConfig = {
  id: 'seismic-parameter-map',
  title: 'Seismic Parameter Visualization',
  description:
    'Interactive visualization of Philippine seismic design parameters per NSCP 2015: zone factors, soil profile amplification, near-source effects, and base shear distribution.',
  subject: 'nscp',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: {
    position: [3, 2, 3],
    fov: 45,
  },
}

