// src/features/3d-lab/config/modules/10-materials/wall-geometry-connections.ts
// Connection details — dowels, track fasteners, deflection gaps

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState } from './wall-types'
import { STRUCTURAL_ELEMENT_COLORS } from './wall-constants'

export const buildConnectionGeometry = (state: ComputedWallState, params: Record<string, number | boolean | string>): GeometryInstruction[] => {
  const showConnections = params.showConnections === true || params.showConnections === 'true'
  if (!showConnections) return []

  const L = state.wallLengthMm / 1000
  const H = state.wallHeightMm / 1000
  const T = state.coreThickness
  const inst: GeometryInstruction[] = []

  if (state.coreType === 'chb') {
    // ── CHB-to-slab dowels (vertical rebar extending from slab into wall) ──
    const dowelSpacing = 0.6 // Every 600mm
    const dowelCount = Math.min(Math.floor(L / dowelSpacing), 10)
    const dowelPositions: [number, number, number][] = []
    for (let i = 0; i < dowelCount; i++) {
      const x = -L / 2 + dowelSpacing * (i + 0.5)
      dowelPositions.push([x, -0.15, 0])
    }

    if (dowelPositions.length > 0) {
      inst.push({
        id: 'conn-chb-slab-dowels',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'cylinder',
        instancedShapeArgs: [0.006, 0.006, 0.4, 6], // 12mm rebar, 400mm long (200mm in slab + 200mm in wall)
        instancedPositions: dowelPositions,
        color: STRUCTURAL_ELEMENT_COLORS.rebar,
      })
    }

    // ── CHB-to-column L-bar dowels (every 3rd course at wall ends) ──
    const courseHeight = 0.200 + 0.010 // block height + mortar
    const lBarInterval = courseHeight * 3
    const lBarPositions: [number, number, number][] = []
    for (let y = lBarInterval; y < H; y += lBarInterval) {
      lBarPositions.push([-L / 2 - 0.1, y, 0]) // Left end
      lBarPositions.push([L / 2 + 0.1, y, 0])   // Right end
    }

    if (lBarPositions.length > 0) {
      inst.push({
        id: 'conn-chb-column-lbars',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'cylinder',
        instancedShapeArgs: [0.005, 0.005, 0.3, 6], // L-bar horizontal leg
        instancedPositions: lBarPositions.slice(0, 12), // Cap at 12
        instancedRotations: lBarPositions.slice(0, 12).map(() => [0, 0, Math.PI / 2] as [number, number, number]),
        color: STRUCTURAL_ELEMENT_COLORS.rebar,
        opacity: 0.9,
        transparent: true,
      })
    }
  }

  if (state.structural.type === 'drywall') {
    // ── Drywall-to-floor: track fastener indicators ──
    const fastenerSpacing = 0.6 // Max 600mm per code
    const fastenerCount = Math.min(Math.floor(L / fastenerSpacing), 10)
    const fastenerPositions: [number, number, number][] = []
    for (let i = 0; i < fastenerCount; i++) {
      const x = -L / 2 + fastenerSpacing * (i + 0.5)
      fastenerPositions.push([x, -0.01, 0])
    }

    if (fastenerPositions.length > 0) {
      inst.push({
        id: 'conn-drywall-floor-fasteners',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'cylinder',
        instancedShapeArgs: [0.003, 0.003, 0.05, 4], // Small fastener indicator
        instancedPositions: fastenerPositions,
        color: '#ef4444', // Red for visibility
      })
    }

    // ── Deflection gap at ceiling ──
    inst.push({
      id: 'conn-drywall-deflection-gap',
      type: 'box',
      position: [0, H + 0.005, 0],
      args: [L, 0.01, T],
      color: '#fbbf24', // Amber — highlights the gap
      opacity: 0.6,
      transparent: true,
      label: 'Deflection gap (10mm)',
    })
  }

  return inst
}
