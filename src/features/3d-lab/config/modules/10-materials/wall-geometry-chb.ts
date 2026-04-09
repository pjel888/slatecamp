// src/features/3d-lab/config/modules/10-materials/wall-geometry-chb.ts
// CHB reinforcement sub-builder — representative section + simplified body
// Strategy: ~80% simplified solid, ~20% (rightmost 1200mm) detailed with instanced blocks

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedWallState, CHBStructural } from './wall-types'
import { STRUCTURAL_ELEMENT_COLORS } from './wall-constants'

export const buildCHBGeometry = (state: ComputedWallState): GeometryInstruction[] => {
  const L = state.wallLengthMm / 1000
  const H = state.wallHeightMm / 1000
  const T = state.coreThickness
  const structural = state.structural as CHBStructural
  const registry = state.registryEntry

  // Representative section dimensions
  const repWidth = Math.min(1.2, L * 0.2)
  const repStartX = L / 2 - repWidth // left edge of representative section in local coords
  const simplifiedWidth = L - repWidth

  // CHB block dimensions (meters)
  const blockW = 0.400
  const blockH = 0.200
  const blockD = T
  const mortarT = 0.010

  const inst: GeometryInstruction[] = []

  // ── 1. Simplified body ──────────────────────────────────────────────────────
  inst.push({
    id: 'core-chb-simplified',
    type: 'box',
    position: [-repWidth / 2, H / 2, 0],
    args: [simplifiedWidth, H, T],
    color: registry.color,
  })

  // ── 2. Mortar face lines on simplified body ─────────────────────────────────
  if (registry.hasMortarPattern && registry.mortarSpacingH > 0) {
    const simplifiedLeft = -L / 2
    const simplifiedRight = repStartX - L / 2 + simplifiedWidth // right edge relative to center
    const simplifiedCenter = (simplifiedLeft + simplifiedRight) / 2

    // Horizontal bed joints — cap at 20
    const hCount = Math.min(Math.floor(H / registry.mortarSpacingH), 20)
    for (let i = 1; i < hCount; i++) {
      const yPos = registry.mortarSpacingH * i
      inst.push({
        id: `mortar-h-f-${i}`,
        type: 'box',
        position: [simplifiedCenter, yPos, T / 2 + 0.0015],
        args: [simplifiedWidth, 0.006, 0.003],
        color: registry.mortarColor,
        opacity: 0.7,
        transparent: true,
      })
    }

    // Vertical head joints in running bond — cap at 40
    const vSpacing = registry.mortarSpacingV
    const vCount = Math.min(Math.floor(simplifiedWidth / vSpacing) * 2, 40)
    for (let i = 0; i <= vCount; i++) {
      const xEven = simplifiedLeft + vSpacing * i
      const xOdd = simplifiedLeft + vSpacing / 2 + vSpacing * i
      if (xEven > simplifiedLeft && xEven < simplifiedLeft + simplifiedWidth) {
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
      if (xOdd > simplifiedLeft && xOdd < simplifiedLeft + simplifiedWidth) {
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

  // ── 3. Representative section — instanced CHB blocks ────────────────────────
  const blocksPerRow = Math.floor(repWidth / blockW)
  const coursesHigh = Math.min(Math.floor(H / blockH), 15)
  const blockPositions: [number, number, number][] = []

  for (let course = 0; course < coursesHigh; course++) {
    const isOdd = course % 2 === 1
    const offset = isOdd ? blockW / 2 : 0
    for (let col = 0; col < blocksPerRow; col++) {
      const x = repStartX - L / 2 + offset + col * blockW + blockW / 2
      const y = course * blockH + blockH / 2
      // Only include blocks within the representative section bounds
      if (x - blockW / 2 >= repStartX - L / 2 - 0.001 && x + blockW / 2 <= L / 2 + 0.001) {
        blockPositions.push([x, y, 0])
      }
      if (blockPositions.length >= 45) break
    }
    if (blockPositions.length >= 45) break
  }

  if (blockPositions.length > 0) {
    inst.push({
      id: 'core-chb-blocks',
      type: 'instanced',
      position: [0, 0, 0],
      args: [],
      instancedShape: 'box',
      instancedShapeArgs: [blockW - mortarT, blockH - mortarT, blockD - 0.002],
      instancedPositions: blockPositions,
      color: '#b5ada7',
    })
  }

  // ── 4. Section boundary edge ────────────────────────────────────────────────
  inst.push({
    id: 'core-chb-boundary',
    type: 'box',
    position: [repStartX - L / 2, H / 2, 0],
    args: [0.005, H, T + 0.01],
    color: '#ffffff',
    opacity: 0.8,
    transparent: true,
  })

  // ── Structural reinforcement (only if showReinforcement) ────────────────────
  if (structural.showReinforcement) {
    const rebarSpacing = structural.rebarSpacingMm / 1000
    const rebarR = structural.rebarDiameterMm / 2000

    // ── 5. Vertical rebar — instanced cylinders ─────────────────────────────
    const vRebarPositions: [number, number, number][] = []
    const repLeft = repStartX - L / 2
    const repRight = L / 2
    let x = repLeft + rebarSpacing / 2
    while (x < repRight && vRebarPositions.length < 12) {
      vRebarPositions.push([x, H / 2, 0])
      x += rebarSpacing
    }

    if (vRebarPositions.length > 0) {
      inst.push({
        id: 'struct-chb-rebar-v',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'cylinder',
        instancedShapeArgs: [rebarR, rebarR, H - 0.1, 8],
        instancedPositions: vRebarPositions,
        color: STRUCTURAL_ELEMENT_COLORS.rebar,
      })
    }

    // ── 6. Horizontal rebar in bond beams — instanced cylinders ─────────────
    const bondBeamInterval = structural.bondBeamIntervalCourses * blockH
    const hRebarPositions: [number, number, number][] = []
    const hRebarRotations: [number, number, number][] = []
    let yBond = bondBeamInterval
    while (yBond < H && hRebarPositions.length < 5) {
      hRebarPositions.push([repLeft + repWidth / 2, yBond, 0])
      hRebarRotations.push([0, 0, Math.PI / 2])
      yBond += bondBeamInterval
    }

    if (hRebarPositions.length > 0) {
      inst.push({
        id: 'struct-chb-rebar-h',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'cylinder',
        instancedShapeArgs: [rebarR, rebarR, repWidth, 8],
        instancedPositions: hRebarPositions,
        instancedRotations: hRebarRotations,
        color: STRUCTURAL_ELEMENT_COLORS.rebar,
      })
    }

    // ── 7. Grout fill — instanced boxes at vertical rebar positions ─────────
    if (vRebarPositions.length > 0) {
      inst.push({
        id: 'struct-chb-grout',
        type: 'instanced',
        position: [0, 0, 0],
        args: [],
        instancedShape: 'box',
        instancedShapeArgs: [blockW * 0.6, blockH - mortarT, T * 0.6],
        instancedPositions: vRebarPositions,
        color: STRUCTURAL_ELEMENT_COLORS.groutFill,
        opacity: 0.8,
        transparent: true,
      })
    }

    // ── 8. Bond beam course indicators — individual boxes ───────────────────
    let yBeam = bondBeamInterval
    let beamIdx = 0
    while (yBeam < H && beamIdx < 5) {
      inst.push({
        id: `struct-chb-bond-beam-${beamIdx}`,
        type: 'box',
        position: [repLeft + repWidth / 2, yBeam, 0],
        args: [repWidth, blockH, T + 0.002],
        color: STRUCTURAL_ELEMENT_COLORS.bondBeam,
        opacity: 0.4,
        transparent: true,
      })
      yBeam += bondBeamInterval
      beamIdx++
    }
  }

  return inst
}
