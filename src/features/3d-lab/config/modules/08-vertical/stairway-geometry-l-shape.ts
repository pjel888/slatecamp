// ──────────────────────────────────────────────────────────────────────────────
// stairway-geometry-l-shape.ts — L-Shape (Quarter-Turn) Geometry Sub-Builder
// Produces two flights at 90° with an intermediate landing.
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

export const buildLShapeGeometry = (state: ComputedStairState, _rawParams: StairParams): GeometryInstruction[] => {
  const sW = state.stairWidth / 1000
  const rH = state.riserHeight / 1000
  const tD = state.treadDepth / 1000
  const n = state.numRisers
  const hrH = state.handrailHeight / 1000

  const rColor = state.riserColor ?? NEUTRAL_COLORS.RISER
  const tColor = state.treadColor ?? NEUTRAL_COLORS.TREAD
  const hrColor = state.handrailColor ?? NEUTRAL_COLORS.HANDRAIL

  // Determine flight split
  const risersBeforeTurn = state.stairType.type === 'l-shape' ? state.stairType.risersBeforeTurn : Math.floor(n / 2)
  const turnDir = state.stairType.type === 'l-shape' ? state.stairType.turnDirection : 'right'
  const risersAfterTurn = n - risersBeforeTurn

  // Landing dimensions
  const landingDepth = Math.min(sW, LANDING_MIN_DEPTH_MM / 1000)

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

  // ── Intermediate Landing ───────────────────────────────────────────────────
  const landingY = y
  const landingZ = -((risersBeforeTurn - 1) * tD + tD / 2 + landingDepth / 2)
  const turnSign = turnDir === 'right' ? 1 : -1

  g.push({
    id: 'landing-intermediate',
    type: 'box',
    position: [0, landingY - TREAD_THICKNESS_M / 2, landingZ],
    args: [sW, TREAD_THICKNESS_M, landingDepth],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── Flight 2: Ascending in X direction (turned 90°) ────────────────────────
  const f2StartZ = landingZ - landingDepth / 2
  const f2StartX = turnSign * (sW / 2 + tD / 2)

  for (let i = 0; i < risersAfterTurn; i++) {
    y += rH
    const xOffset = turnSign * (i * tD)

    g.push({
      id: `tread-f2-${i}`,
      type: 'box',
      position: [f2StartX + xOffset, y - TREAD_THICKNESS_M / 2, f2StartZ],
      args: [tD, TREAD_THICKNESS_M, sW],
      color: tColor,
    })
    g.push({
      id: `riser-f2-${i}`,
      type: 'box',
      position: [f2StartX + xOffset - turnSign * tD / 2, y - rH / 2, f2StartZ],
      args: [RISER_THICKNESS_M, rH, sW],
      color: rColor,
    })
  }

  // ── Top landing ────────────────────────────────────────────────────────────
  const topY = y
  const topX = f2StartX + turnSign * ((risersAfterTurn - 1) * tD + tD / 2)

  g.push({
    id: 'top-landing',
    type: 'box',
    position: [topX, topY - TREAD_THICKNESS_M / 2, f2StartZ],
    args: [tD, TREAD_THICKNESS_M, sW],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── Flight 1 Handrails ─────────────────────────────────────────────────────
  const f1Run = (risersBeforeTurn - 1) * tD
  const f1Rise = risersBeforeTurn * rH
  const f1Len = Math.sqrt(f1Rise ** 2 + f1Run ** 2)
  const f1Angle = Math.atan2(f1Rise, f1Run)

  for (const s of [-1, 1] as const) {
    g.push({
      id: `handrail-f1-${s < 0 ? 'L' : 'R'}`,
      type: 'cylinder',
      position: [
        s * (sW / 2 + STRINGER_THICKNESS_M / 2),
        f1Rise / 2 + hrH * Math.cos(f1Angle),
        -(f1Run / 2 - tD / 2) + hrH * Math.sin(f1Angle),
      ],
      rotation: [Math.PI / 2 + f1Angle, 0, 0],
      args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f1Len, 8],
      color: hrColor,
    })
  }

  // ── Flight 2 Handrails ─────────────────────────────────────────────────────
  const f2Run = (risersAfterTurn - 1) * tD
  const f2Rise = risersAfterTurn * rH
  const f2Len = Math.sqrt(f2Rise ** 2 + f2Run ** 2)
  const f2Angle = Math.atan2(f2Rise, f2Run)

  for (const s of [-1, 1] as const) {
    g.push({
      id: `handrail-f2-${s < 0 ? 'L' : 'R'}`,
      type: 'cylinder',
      position: [
        f2StartX + turnSign * (f2Run / 2) + hrH * Math.cos(f2Angle) * turnSign,
        landingY + f2Rise / 2 + hrH * Math.cos(f2Angle),
        f2StartZ + s * (sW / 2 + STRINGER_THICKNESS_M / 2),
      ],
      rotation: [0, 0, turnSign * (Math.PI / 2 + f2Angle)],
      args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f2Len, 8],
      color: hrColor,
    })
  }

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
