// src/features/3d-lab/config/modules/10-materials/wall-geometry-generic.ts
// Generic sub-builder — simple box rendering for plywood, cement-board, solid-concrete, existing-wall
// Also handles brick as a simple box until Phase 2 adds a dedicated brick builder

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState } from './wall-types'

export const buildGenericGeometry = (state: ComputedWallState): GeometryInstruction[] => {
  const L = state.wallLengthMm / 1000
  const H = state.wallHeightMm / 1000
  const T = state.coreThickness
  const registry = state.registryEntry
  const inst: GeometryInstruction[] = []

  // ── Core wall body ──
  inst.push({
    id: 'wall-core',
    type: 'box',
    position: [0, H / 2, 0],
    args: [L, H, T],
    color: registry.color,
    label: registry.label,
  })

  // ── Mortar pattern for brick ──
  if (registry.hasMortarPattern && registry.mortarSpacingH > 0) {
    // Horizontal bed joints — cap at 20
    const hCount = Math.min(Math.floor(H / registry.mortarSpacingH), 20)
    for (let i = 1; i < hCount; i++) {
      const yPos = registry.mortarSpacingH * i
      inst.push({
        id: `mortar-h-f-${i}`,
        type: 'box',
        position: [0, yPos, T / 2 + 0.0015],
        args: [L, 0.006, 0.003],
        color: registry.mortarColor,
        opacity: 0.7,
        transparent: true,
      })
    }

    // Vertical head joints — running bond
    const vSpacing = registry.mortarSpacingV
    const vCount = Math.min(Math.floor(L / vSpacing) * 2, 40)
    for (let i = 0; i <= vCount; i++) {
      const xEven = -L / 2 + vSpacing * i
      const xOdd = -L / 2 + vSpacing / 2 + vSpacing * i
      if (xEven > -L / 2 && xEven < L / 2) {
        inst.push({
          id: `mortar-v-even-${i}`,
          type: 'box',
          position: [xEven, H / 2, T / 2 + 0.0015],
          args: [0.006, H, 0.003],
          color: registry.mortarColor,
          opacity: 0.5,
          transparent: true,
        })
      }
      if (xOdd > -L / 2 && xOdd < L / 2) {
        inst.push({
          id: `mortar-v-odd-${i}`,
          type: 'box',
          position: [xOdd, H / 2, T / 2 + 0.0015],
          args: [0.006, H, 0.003],
          color: registry.mortarColor,
          opacity: 0.5,
          transparent: true,
        })
      }
    }
  }

  return inst
}
