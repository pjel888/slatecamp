// src/app/dashboard/3d-lab/_config/modules/earthwork-volume.ts
// Earthwork Volume — Cut and Fill Calculation
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const parameters: ParameterDef[] = [
  { key: 'siteWidth', label: 'Site Width', type: 'slider', min: 10, max: 50, step: 1, default: 20, unit: 'm', group: 'Site' },
  { key: 'siteDepth', label: 'Site Depth', type: 'slider', min: 10, max: 50, step: 1, default: 30, unit: 'm', group: 'Site' },
  { key: 'cutDepth', label: 'Cut Depth', type: 'slider', min: 0, max: 5, step: 0.1, default: 1.5, unit: 'm', decimals: 1, group: 'Earthwork' },
  { key: 'fillDepth', label: 'Fill Depth', type: 'slider', min: 0, max: 3, step: 0.1, default: 0.5, unit: 'm', decimals: 1, group: 'Earthwork' },
  { key: 'slopeAngle', label: 'Slope Angle', type: 'slider', min: 0, max: 45, step: 5, default: 30, unit: 'deg', group: 'Earthwork' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const sW = num(params.siteWidth)
  const sD = num(params.siteDepth)
  const cut = num(params.cutDepth)
  const fill = num(params.fillDepth)
  const slope = num(params.slopeAngle)
  const scale = 0.2
  const sWs = sW * scale
  const sDs = sD * scale
  const cutS = cut * scale
  const fillS = fill * scale
  const inst: GeometryInstruction[] = []

  // Natural ground (back half)
  inst.push({ id: 'natural-ground', type: 'box', position: [0, -cutS / 2, -sDs / 4], args: [sWs, cutS + 0.1, sDs / 2], color: '#92400e', opacity: 0.7, transparent: true, label: 'Natural Ground' })
  // Fill area (front half)
  inst.push({ id: 'fill-zone', type: 'box', position: [0, fillS / 2, sDs / 4], args: [sWs, fillS, sDs / 2], color: '#b45309', opacity: 0.7, transparent: true, label: `Fill: ${(sW * sD * 0.5 * fill).toFixed(0)} m³` })
  // Cut zone visualization
  inst.push({ id: 'cut-zone', type: 'box', position: [0, -(cutS / 2), -sDs / 4], args: [sWs, cutS, sDs / 2], color: '#D64545', opacity: 0.35, transparent: true, label: `Cut: ${(sW * sD * 0.5 * cut).toFixed(0)} m³` })
  // Finished grade plane
  inst.push({ id: 'finished-grade', type: 'box', position: [0, 0.005, 0], args: [sWs, 0.01, sDs], color: '#2D9F6F', opacity: 0.5, transparent: true, label: 'Finished Grade' })
  // Slope batter on cut edge
  const slopeRad = (slope * Math.PI) / 180
  const batterH = cutS
  const batterW = batterH / Math.tan(slopeRad + 0.01)
  inst.push({ id: 'batter-slope', type: 'box', position: [-sWs / 2 - batterW / 2, -cutS / 2, -sDs / 4], rotation: [0, 0, slopeRad], args: [batterW * 1.2, 0.08, sDs / 2], color: '#78350f' })
  // Excavation dump pile
  const dumpVol = sW * sD * 0.5 * cut * 0.3
  const dumpH = Math.cbrt(dumpVol) * scale
  inst.push({ id: 'dump-pile', type: 'cone', position: [sWs / 2 + 1, dumpH / 2, 0], args: [dumpH * 0.8, dumpH, 8], color: '#78350f', label: 'Spoil' })
  // Equipment (excavator simplified)
  inst.push({ id: 'excavator-body', type: 'box', position: [-sWs / 2 + 0.5, 0.3, -sDs / 4], args: [0.8, 0.5, 0.5], color: '#D4951A' })
  inst.push({ id: 'excavator-arm', type: 'box', position: [-sWs / 2 + 0.2, 0.7, -sDs / 4], rotation: [0, 0, 0.5], args: [0.1, 0.5, 0.1], color: '#D4951A' })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-cut', label: 'Cut Volume', description: 'Volume of material removed = Area × Average cut depth; multiplied by swell factor for disposal', position: (p) => [num(p.siteWidth) * 0.2 / 2 + 1, 0.5, -(num(p.siteDepth) * 0.2 / 4)] },
  { id: 'ann-fill', label: 'Fill Volume', description: 'Volume of compacted fill = Area × Fill depth; divided by compaction factor for borrow calculation', position: (p) => [num(p.siteWidth) * 0.2 / 2 + 1, num(p.fillDepth) * 0.2 / 2, num(p.siteDepth) * 0.2 / 4] },
  { id: 'ann-batter', label: 'Slope Batter', description: 'Cut slopes must be stable; typical soil at 1:1 (45°), rock at 1:4', position: (p) => [-(num(p.siteWidth) * 0.2 / 2) - 1.5, 0, 0] },
]

const presets: Preset[] = [
  { label: 'Typical Lot Grading', values: { siteWidth: 20, siteDepth: 30, cutDepth: 1.5, fillDepth: 0.5, slopeAngle: 30 } },
  { label: 'Deep Cut', values: { siteWidth: 30, siteDepth: 40, cutDepth: 4.0, fillDepth: 0.0, slopeAngle: 45 } },
  { label: 'Large Fill', values: { siteWidth: 25, siteDepth: 35, cutDepth: 0.5, fillDepth: 2.5, slopeAngle: 20 } },
  { label: 'Balanced Cut-Fill', values: { siteWidth: 20, siteDepth: 30, cutDepth: 2.0, fillDepth: 2.0, slopeAngle: 35 } },
]

export const earthworkVolumeConfig: ParametricSceneConfig = {
  id: 'earthwork-volume',
  title: 'Earthwork Volume',
  description: 'Cut-and-fill terrain model with volume calculation, batter slopes, and spoil pile visualization for estimating earthwork quantities.',
  subject: 'estimating',
  parameters, geometry, annotations, presets,
  camera: { position: [6, 5, 6], fov: 50 },
}

