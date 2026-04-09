// src/features/3d-lab/config/modules/10-materials/wall-geometry-drywall.ts
// Drywall framing sub-builder — studs, tracks, board, insulation, bridging

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState, DrywallStructural } from './wall-types'
import { STRUCTURAL_ELEMENT_COLORS } from './wall-constants'

export const buildDrywallGeometry = (state: ComputedWallState): GeometryInstruction[] => {
  const L = state.wallLengthMm / 1000
  const H = state.wallHeightMm / 1000
  const structural = state.structural as DrywallStructural
  const studSpacing = structural.studSpacingMm / 1000
  const studDepth = structural.studDepthMm / 1000
  const gypsumT = structural.gypsumThicknessMm / 1000
  const bothSides = state.bothSides

  // Track dimensions
  const trackFlange = 0.032

  // Stud dimensions
  const studThickness = 0.001

  const instructions: GeometryInstruction[] = []

  // 1. Bottom U-track
  instructions.push({
    id: 'struct-drywall-bottom-track',
    type: 'box',
    position: [0, trackFlange / 2, 0],
    args: [L, 0.032, studDepth],
    color: STRUCTURAL_ELEMENT_COLORS.metalTrack,
  })

  // 2. Top U-track
  instructions.push({
    id: 'struct-drywall-top-track',
    type: 'box',
    position: [0, H - 0.032 / 2, 0],
    args: [L, 0.032, studDepth],
    color: STRUCTURAL_ELEMENT_COLORS.metalTrack,
  })

  // 3. C-studs (instanced)
  const studCount = Math.min(Math.floor(L / studSpacing) + 1, 16)
  const studPositions: [number, number, number][] = []
  for (let i = 0; i < studCount; i++) {
    const xPos = -L / 2 + i * studSpacing
    studPositions.push([xPos, H / 2, 0])
  }

  instructions.push({
    id: 'struct-drywall-studs',
    type: 'instanced',
    position: [0, 0, 0],
    args: [],
    instancedShape: 'box',
    instancedShapeArgs: [studThickness, H - 0.064, studDepth],
    instancedPositions: studPositions,
    color: STRUCTURAL_ELEMENT_COLORS.metalStud,
  })

  // 4. Gypsum board front
  instructions.push({
    id: 'struct-drywall-board-front',
    type: 'box',
    position: [0, H / 2, studDepth / 2 + gypsumT / 2],
    args: [L, H, gypsumT],
    color: '#f5f5f4',
    opacity: 0.7,
    transparent: true,
  })

  // 5. Gypsum board back (only if bothSides)
  if (bothSides) {
    instructions.push({
      id: 'struct-drywall-board-back',
      type: 'box',
      position: [0, H / 2, -(studDepth / 2 + gypsumT / 2)],
      args: [L, H, gypsumT],
      color: '#f5f5f4',
      opacity: 0.7,
      transparent: true,
    })
  }

  // 6. Insulation batts (instanced, only if showInsulation)
  if (structural.showInsulation) {
    const insulationCount = Math.min(studCount - 1, 16)
    const insulationPositions: [number, number, number][] = []
    for (let i = 0; i < insulationCount; i++) {
      const xPos = -L / 2 + i * studSpacing + studSpacing / 2
      insulationPositions.push([xPos, H / 2, 0])
    }

    const insulationColor = structural.insulationType === 'mineral-wool'
      ? STRUCTURAL_ELEMENT_COLORS.insulationMineralWool
      : STRUCTURAL_ELEMENT_COLORS.insulationFiberglass

    if (insulationPositions.length > 0) {
      instructions.push({
        id: 'struct-drywall-insulation',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'box',
        instancedShapeArgs: [studSpacing - 0.005, H - 0.1, studDepth - 0.005],
        instancedPositions: insulationPositions,
        color: insulationColor,
        opacity: 0.6,
        transparent: true,
      })
    }
  }

  // 7. Horizontal bridging (instanced, only if showBridging)
  if (structural.showBridging) {
    const bridgingCount = Math.min(Math.floor(H / 1.2) - 1, 5)
    const bridgingPositions: [number, number, number][] = []
    for (let i = 1; i <= bridgingCount; i++) {
      bridgingPositions.push([0, i * 1.2, 0])
    }

    if (bridgingPositions.length > 0) {
      instructions.push({
        id: 'struct-drywall-bridging',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'box',
        instancedShapeArgs: [L, 0.003, 0.025],
        instancedPositions: bridgingPositions,
        color: STRUCTURAL_ELEMENT_COLORS.metalStud,
      })
    }
  }

  return instructions
}
