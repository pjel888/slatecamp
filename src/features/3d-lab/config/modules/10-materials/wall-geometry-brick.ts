// src/features/3d-lab/config/modules/10-materials/wall-geometry-brick.ts
// Brick sub-builder — representative section with instanced individual bricks

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState } from './wall-types'

export const buildBrickGeometry = (state: ComputedWallState): GeometryInstruction[] => {
  const L = state.wallLengthMm / 1000
  const H = state.wallHeightMm / 1000
  const T = state.coreThickness  // 0.200 for brick
  const registry = state.registryEntry
  const inst: GeometryInstruction[] = []

  // Brick dimensions (meters)
  const brickL = 0.200   // 200mm length
  const brickH = 0.065   // 65mm height
  const mortarT = 0.010  // 10mm mortar

  // Representative section: ~600mm on the right side
  const repWidth = Math.min(0.6, L * 0.3)
  const simplifiedWidth = L - repWidth
  const repStartX = simplifiedWidth / 2  // right edge of simplified section in local coords

  // ── Simplified body (left ~70-80%) ──────────────────────────────────────────
  inst.push({
    id: 'core-brick-simplified',
    type: 'box',
    position: [-repWidth / 2, H / 2, 0],
    args: [simplifiedWidth, H, T],
    color: registry.color,
    label: registry.label,
  })

  // ── Mortar face lines on simplified body ────────────────────────────────────
  // Horizontal bed joints
  const courseH = brickH + mortarT  // 75mm per course
  const hCount = Math.min(Math.floor(H / courseH), 20)
  for (let i = 1; i < hCount; i++) {
    const yPos = courseH * i
    if (yPos < H) {
      inst.push({
        id: `mortar-brick-h-${i}`,
        type: 'box',
        position: [-repWidth / 2, yPos, T / 2 + 0.0015],
        args: [simplifiedWidth, 0.006, 0.003],
        color: registry.mortarColor,
        opacity: 0.7,
        transparent: true,
      })
    }
  }

  // Vertical head joints — running bond
  const vSpacing = brickL + mortarT  // 210mm
  const vCount = Math.min(Math.floor(simplifiedWidth / vSpacing) * 2, 40)
  for (let i = 0; i <= vCount; i++) {
    const baseX = -L / 2
    const xEven = baseX + vSpacing * i
    const xOdd = baseX + vSpacing / 2 + vSpacing * i
    const leftBound = -L / 2
    const rightBound = -L / 2 + simplifiedWidth
    if (xEven > leftBound && xEven < rightBound) {
      inst.push({
        id: `mortar-brick-v-even-${i}`,
        type: 'box',
        position: [xEven, H / 2, T / 2 + 0.0015],
        args: [0.006, H, 0.003],
        color: registry.mortarColor,
        opacity: 0.5,
        transparent: true,
      })
    }
    if (xOdd > leftBound && xOdd < rightBound) {
      inst.push({
        id: `mortar-brick-v-odd-${i}`,
        type: 'box',
        position: [xOdd, H / 2, T / 2 + 0.0015],
        args: [0.006, H, 0.003],
        color: registry.mortarColor,
        opacity: 0.5,
        transparent: true,
      })
    }
  }

  // ── Representative section bricks (instanced) ────────────────────────────────
  const bricksPerRow = Math.floor(repWidth / (brickL + mortarT))
  const coursesHigh = Math.min(Math.floor(H / courseH), 40)
  const positions: [number, number, number][] = []

  for (let row = 0; row < coursesHigh && positions.length < 100; row++) {
    const y = courseH * row + brickH / 2
    const isOddRow = row % 2 === 1
    const offset = isOddRow ? (brickL + mortarT) / 2 : 0

    for (let col = 0; col < bricksPerRow && positions.length < 100; col++) {
      const x = repStartX + offset + (brickL + mortarT) * col + brickL / 2 - L / 2
      if (x - brickL / 2 >= -L / 2 && x + brickL / 2 <= L / 2) {
        positions.push([x, y, 0])
      }
    }
  }

  if (positions.length > 0) {
    inst.push({
      id: 'core-brick-blocks',
      type: 'instanced',
      position: [0, 0, 0],
      args: [],
      instancedShape: 'box',
      instancedShapeArgs: [brickL - mortarT * 0.5, brickH - mortarT * 0.5, T - 0.002],
      instancedPositions: positions,
      color: registry.color,
    })
  }

  // ── Section boundary ─────────────────────────────────────────────────────────
  inst.push({
    id: 'core-brick-boundary',
    type: 'box',
    position: [repStartX - L / 2, H / 2, 0],
    args: [0.005, H, T + 0.01],
    color: '#ffffff',
    opacity: 0.8,
    transparent: true,
  })

  return inst
}
