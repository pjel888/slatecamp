// ──────────────────────────────────────────────────────────────────────────────
// stairway-geometry-u-shape.ts — U-Shape (Switchback) Geometry Sub-Builder
// Produces two parallel flights with an intermediate landing and continuous
// interior handrail.
// ──────────────────────────────────────────────────────────────────────────────

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedStairState, StairParams } from './stairway-types'
import {
  TREAD_THICKNESS_M,
  RISER_THICKNESS_M,
  STRINGER_THICKNESS_M,
  HANDRAIL_RADIUS_M,
  LANDING_MIN_DEPTH_MM,
  LAW_COLORS,
  NEUTRAL_COLORS,
} from './stairway-constants'

export const buildUShapeGeometry = (state: ComputedStairState, _rawParams: StairParams): GeometryInstruction[] => {
  const sW = state.stairWidth / 1000
  const rH = state.riserHeight / 1000
  const tD = state.treadDepth / 1000
  const n = state.numRisers
  const hrH = state.handrailHeight / 1000

  const rColor = state.riserColor ?? NEUTRAL_COLORS.RISER
  const tColor = state.treadColor ?? NEUTRAL_COLORS.TREAD
  const hrColor = state.handrailColor ?? NEUTRAL_COLORS.HANDRAIL

  // Flight split
  const risersBeforeTurn = state.stairType.type === 'u-shape' ? state.stairType.risersBeforeTurn : Math.floor(n / 2)
  const risersAfterTurn = n - risersBeforeTurn

  // Landing and gap
  const landingDepth = Math.min(sW, LANDING_MIN_DEPTH_MM / 1000)
  const gapBetweenFlights = 0.15 // 150mm gap between parallel flights

  const g: GeometryInstruction[] = []

  // ── Base platform ──────────────────────────────────────────────────────────
  g.push({
    id: 'base-platform',
    type: 'box',
    position: [0, -TREAD_THICKNESS_M / 2, tD / 2],
    args: [sW, TREAD_THICKNESS_M, tD],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── Flight 1: Ascending in -Z direction ────────────────────────────────────
  let y = 0
  for (let i = 0; i < risersBeforeTurn; i++) {
    y += rH
    const z = -(i * tD)

    g.push({
      id: `tread-f1-${i}`,
      type: 'box',
      position: [0, y - TREAD_THICKNESS_M / 2, z],
      args: [sW, TREAD_THICKNESS_M, tD],
      color: tColor,
    })
    g.push({
      id: `riser-f1-${i}`,
      type: 'box',
      position: [0, y - rH / 2, z + tD / 2],
      args: [sW, rH, RISER_THICKNESS_M],
      color: rColor,
    })
  }

  // ── Intermediate Landing (U-turn) ──────────────────────────────────────────
  const landingY = y
  const f1EndZ = -((risersBeforeTurn - 1) * tD)
  const landingZ = f1EndZ - tD / 2 - landingDepth / 2

  // Landing spans both flight widths + gap
  const totalLandingWidth = sW * 2 + gapBetweenFlights
  const landingCenterX = (sW + gapBetweenFlights) / 2

  g.push({
    id: 'landing-intermediate',
    type: 'box',
    position: [landingCenterX / 2, landingY - TREAD_THICKNESS_M / 2, landingZ],
    args: [totalLandingWidth, TREAD_THICKNESS_M, landingDepth],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── Flight 2: Ascending in +Z direction (parallel, offset in X) ───────────
  const f2X = sW + gapBetweenFlights // Flight 2 offset to the right

  for (let i = 0; i < risersAfterTurn; i++) {
    y += rH
    const z = landingZ + landingDepth / 2 + tD / 2 + i * tD // Going back towards start

    g.push({
      id: `tread-f2-${i}`,
      type: 'box',
      position: [f2X, y - TREAD_THICKNESS_M / 2, z],
      args: [sW, TREAD_THICKNESS_M, tD],
      color: tColor,
    })
    g.push({
      id: `riser-f2-${i}`,
      type: 'box',
      position: [f2X, y - rH / 2, z - tD / 2],
      args: [sW, rH, RISER_THICKNESS_M],
      color: rColor,
    })
  }

  // ── Top landing ────────────────────────────────────────────────────────────
  const topY = y
  const topZ = landingZ + landingDepth / 2 + tD / 2 + (risersAfterTurn - 1) * tD + tD / 2

  g.push({
    id: 'top-landing',
    type: 'box',
    position: [f2X, topY - TREAD_THICKNESS_M / 2, topZ],
    args: [sW, TREAD_THICKNESS_M, tD],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── Flight 1 Handrails (outer) ─────────────────────────────────────────────
  const f1Run = (risersBeforeTurn - 1) * tD
  const f1Rise = risersBeforeTurn * rH
  const f1Len = Math.sqrt(f1Rise ** 2 + f1Run ** 2)
  const f1Angle = Math.atan2(f1Rise, f1Run)
  const f1CY = f1Rise / 2
  const f1CZ = -(f1Run / 2 - tD / 2)

  // Outer handrail (left side of flight 1)
  g.push({
    id: 'handrail-f1-outer',
    type: 'cylinder',
    position: [
      -(sW / 2 + STRINGER_THICKNESS_M / 2),
      f1CY + hrH * Math.cos(f1Angle),
      f1CZ + hrH * Math.sin(f1Angle),
    ],
    rotation: [Math.PI / 2 + f1Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f1Len, 8],
    color: hrColor,
  })

  // ── Flight 2 Handrails (outer) ─────────────────────────────────────────────
  const f2Run = (risersAfterTurn - 1) * tD
  const f2Rise = risersAfterTurn * rH
  const f2Len = Math.sqrt(f2Rise ** 2 + f2Run ** 2)
  const f2Angle = Math.atan2(f2Rise, f2Run)
  const f2CY = landingY + f2Rise / 2
  const f2StartZ = landingZ + landingDepth / 2 + tD / 2
  const f2CZ = f2StartZ + f2Run / 2

  // Outer handrail (right side of flight 2)
  g.push({
    id: 'handrail-f2-outer',
    type: 'cylinder',
    position: [
      f2X + sW / 2 + STRINGER_THICKNESS_M / 2,
      f2CY + hrH * Math.cos(f2Angle),
      f2CZ - hrH * Math.sin(f2Angle),
    ],
    rotation: [Math.PI / 2 - f2Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f2Len, 8],
    color: hrColor,
  })

  // ── Interior handrail (continuous, spanning both flights) ──────────────────
  // Simplified as two segments + landing segment for visual continuity
  const interiorX = sW / 2 + gapBetweenFlights / 2

  // Interior rail segment 1 (along flight 1)
  g.push({
    id: 'handrail-interior-f1',
    type: 'cylinder',
    position: [
      interiorX,
      f1CY + hrH * Math.cos(f1Angle),
      f1CZ + hrH * Math.sin(f1Angle),
    ],
    rotation: [Math.PI / 2 + f1Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f1Len, 8],
    color: hrColor,
  })

  // Interior rail segment 2 (along flight 2)
  g.push({
    id: 'handrail-interior-f2',
    type: 'cylinder',
    position: [
      interiorX,
      f2CY + hrH * Math.cos(f2Angle),
      f2CZ - hrH * Math.sin(f2Angle),
    ],
    rotation: [Math.PI / 2 - f2Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f2Len, 8],
    color: hrColor,
  })

  // ── Headroom plane ─────────────────────────────────────────────────────────
  const headroomM = state.headroom / 1000
  const midF1 = Math.floor(risersBeforeTurn / 2)
  g.push({
    id: 'headroom-plane',
    type: 'box',
    position: [0, midF1 * rH + headroomM, -(midF1 * tD)],
    args: [sW * 1.05, 0.005, f1Run + tD],
    color: state.headroomViolation ? LAW_COLORS.PD_1096 : '#dbeafe',
    opacity: 0.3,
    transparent: true,
  })

  return g
}
