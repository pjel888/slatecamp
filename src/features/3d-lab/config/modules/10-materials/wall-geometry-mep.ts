// src/features/3d-lab/config/modules/10-materials/wall-geometry-mep.ts
// MEP integration layer — conduit, outlet boxes, plumbing in wall cavity

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState } from './wall-types'

export const buildMEPGeometry = (state: ComputedWallState, params: Record<string, number | boolean | string>): GeometryInstruction[] => {
  const showMEP = params.showMEP === true || params.showMEP === 'true'
  if (!showMEP) return []

  // MEP only makes sense for framed types with internal cavity
  if (!state.registryEntry.supportsMEP) return []

  const L = state.wallLengthMm / 1000
  const H = state.wallHeightMm / 1000
  const studDepth = state.structural.type === 'drywall' ? state.structural.studDepthMm / 1000 : 0.092
  const inst: GeometryInstruction[] = []

  // ── Electrical conduit (horizontal run through stud knockouts) ──
  inst.push({
    id: 'mep-conduit',
    type: 'instanced',
    position: [0, 0, 0],
    args: [],
    instancedShape: 'cylinder',
    instancedShapeArgs: [0.01, 0.01, studDepth * 0.8, 8], // 20mm diameter EMT conduit
    instancedPositions: [
      [0, 1.2, 0],    // Switch height run
      [0, 0.3, 0],    // Convenience outlet run
    ],
    instancedRotations: [
      [Math.PI / 2, 0, 0],
      [Math.PI / 2, 0, 0],
    ],
    color: '#6b7280', // Gray EMT conduit
    opacity: 0.9,
    transparent: true,
  })

  // ── Outlet box at convenience height (300mm from floor) ──
  inst.push({
    id: 'mep-outlet-convenience',
    type: 'box',
    position: [L * 0.25, 0.3, 0],
    args: [0.1, 0.075, studDepth * 0.5], // Standard outlet box
    color: '#3b82f6', // Blue — electrical
    opacity: 0.85,
    transparent: true,
    label: 'Outlet (300mm)',
  })

  // ── Switch box at standard height (1200mm from floor) ──
  inst.push({
    id: 'mep-switch-box',
    type: 'box',
    position: [-L * 0.3, 1.2, 0],
    args: [0.1, 0.075, studDepth * 0.5],
    color: '#3b82f6',
    opacity: 0.85,
    transparent: true,
    label: 'Switch (1200mm)',
  })

  // ── Plumbing supply lines (only for 150mm+ stud depth — bathroom walls) ──
  if (studDepth >= 0.140) {
    inst.push({
      id: 'mep-plumbing-hot',
      type: 'instanced',
      position: [0, 0, 0],
      args: [],
      instancedShape: 'cylinder',
      instancedShapeArgs: [0.008, 0.008, H * 0.7, 8], // ½" supply line
      instancedPositions: [
        [L * 0.15, H * 0.5, -studDepth * 0.2],
      ],
      color: '#ef4444', // Red — hot water
    })

    inst.push({
      id: 'mep-plumbing-cold',
      type: 'instanced',
      position: [0, 0, 0],
      args: [],
      instancedShape: 'cylinder',
      instancedShapeArgs: [0.008, 0.008, H * 0.7, 8],
      instancedPositions: [
        [L * 0.15, H * 0.5, studDepth * 0.2],
      ],
      color: '#3b82f6', // Blue — cold water
    })
  }

  return inst
}
