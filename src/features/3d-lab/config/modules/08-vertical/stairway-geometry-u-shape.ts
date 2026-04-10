import type { GeometryInstruction } from '@/features/3d-lab/types/templates'
import type { ComputedStairState, StairParams } from './stairway-types'
import {
  TREAD_THICKNESS_M,
  RISER_THICKNESS_M,
  STRINGER_THICKNESS_M,
  HANDRAIL_RADIUS_M,
  BP344_GHOST_RAIL_RADIUS_M,
  BP344_GHOST_OPACITY,
  BP344_GHOST_OFFSET_M,
  WIDTH_DEFICIT_OPACITY,
  LAW_COLORS,
  NEUTRAL_COLORS,
} from './stairway-constants'
import { computeVisualLandingDepthMeters } from './stairway-geometry-contracts'
import { buildNosingProfile } from './stairway-nosing'
import { computeEgressRequirements } from './stairway-egress'

const mulberry32 = (seed: number): (() => number) => {
  let state = seed | 0
  return () => {
    state = (state + 0x6D2B79F5) | 0
    let next = Math.imul(state ^ (state >>> 15), 1 | state)
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export const buildUShapeGeometry = (
  state: ComputedStairState,
  rawParams: StairParams,
): GeometryInstruction[] => {
  const sW = state.stairWidth / 1000
  const rH = state.riserHeight / 1000
  const tD = state.treadDepth / 1000
  const n = state.numRisers
  const hrH = state.handrailHeight / 1000

  const rColor = state.riserColor ?? NEUTRAL_COLORS.RISER
  const tColor = state.treadColor ?? NEUTRAL_COLORS.TREAD
  const hrColor = state.handrailColor ?? NEUTRAL_COLORS.HANDRAIL

  const split = state.normalizedTurningFlightSplit
  const risersBeforeTurn = split?.before ?? (state.stairType.type === 'u-shape' ? state.stairType.risersBeforeTurn : Math.floor(n / 2))
  const risersAfterTurn = split?.after ?? (n - risersBeforeTurn)
  const landingDepth = computeVisualLandingDepthMeters(state.stairWidth)
  const gapBetweenFlights = 0.15
  const f2X = sW + gapBetweenFlights
  const landingCenterX = f2X / 2
  const totalLandingWidth = (sW * 2) + gapBetweenFlights
  const stepTopHeights = state.actualTreadElevations.map((height) => height / 1000)
  const stepRiserHeights = state.actualRiserHeights.map((height) => height / 1000)

  const g: GeometryInstruction[] = []

  // ── Flight 1 ──
  for (let i = 0; i < risersBeforeTurn; i++) {
    const currentTop = stepTopHeights[i] ?? ((i + 1) * rH)
    const thisRiserHeight = stepRiserHeights[i] ?? rH
    const z = -(i * tD)

    g.push({
      id: `tread-f1-${i}`,
      type: 'box',
      position: [0, currentTop - TREAD_THICKNESS_M / 2, z],
      args: [sW, TREAD_THICKNESS_M, tD],
      color: tColor,
    })
    g.push({
      id: `riser-f1-${i}`,
      type: 'box',
      position: [0, currentTop - thisRiserHeight / 2, z + tD / 2],
      args: [sW, thisRiserHeight, RISER_THICKNESS_M],
      color: rColor,
    })
  }

  // ── Intermediate Landing ──
  const landingY = stepTopHeights[risersBeforeTurn - 1] ?? (risersBeforeTurn * rH)
  const f1EndZ = -((risersBeforeTurn - 1) * tD)
  const landingZ = f1EndZ - tD / 2 - landingDepth / 2

  g.push({
    id: 'landing-intermediate',
    type: 'box',
    position: [landingCenterX, landingY - TREAD_THICKNESS_M / 2, landingZ],
    args: [totalLandingWidth, TREAD_THICKNESS_M, landingDepth],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── Flight 2 ──
  const f2StartZ = landingZ + landingDepth / 2 + tD / 2

  for (let i = 0; i < risersAfterTurn; i++) {
    const stepIndex = risersBeforeTurn + i
    const currentTop = stepTopHeights[stepIndex] ?? (landingY + ((i + 1) * rH))
    const thisRiserHeight = stepRiserHeights[stepIndex] ?? rH
    const z = f2StartZ + (i * tD)

    g.push({
      id: `tread-f2-${i}`,
      type: 'box',
      position: [f2X, currentTop - TREAD_THICKNESS_M / 2, z],
      args: [sW, TREAD_THICKNESS_M, tD],
      color: tColor,
    })
    g.push({
      id: `riser-f2-${i}`,
      type: 'box',
      position: [f2X, currentTop - thisRiserHeight / 2, z - tD / 2],
      args: [sW, thisRiserHeight, RISER_THICKNESS_M],
      color: rColor,
    })
  }

  // ── Top Landing ──
  const topY = stepTopHeights[n - 1] ?? state.actualTotalRise / 1000
  const lastFlightTreadZ = f2StartZ + ((risersAfterTurn - 1) * tD)
  const topJoinZ = lastFlightTreadZ + tD / 2
  const topLandingCenterZ = topJoinZ + landingDepth / 2

  g.push({
    id: 'top-landing',
    type: 'box',
    position: [f2X, topY - TREAD_THICKNESS_M / 2, topLandingCenterZ],
    args: [sW, TREAD_THICKNESS_M, landingDepth],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── Handrails ──
  const f1Run = Math.max((risersBeforeTurn - 1) * tD, 0.001)
  const f1Rise = Math.max(landingY - (stepTopHeights[0] ?? rH), 0)
  const f1Len = Math.sqrt(f1Rise ** 2 + f1Run ** 2)
  const f1Angle = Math.atan2(f1Rise, f1Run)

  g.push({
    id: 'handrail-f1-outer',
    type: 'cylinder',
    position: [
      -(sW / 2 + STRINGER_THICKNESS_M / 2),
      ((stepTopHeights[0] ?? rH) + landingY) / 2 + hrH * Math.cos(f1Angle),
      -(f1Run / 2) + hrH * Math.sin(f1Angle),
    ],
    rotation: [Math.PI / 2 + f1Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f1Len, 8],
    color: hrColor,
  })

  const f2Run = Math.max((risersAfterTurn - 1) * tD, 0.001)
  const f2Rise = Math.max(topY - landingY, 0)
  const f2Len = Math.sqrt(f2Rise ** 2 + f2Run ** 2)
  const f2Angle = Math.atan2(f2Rise, f2Run)
  const f2MidZ = f2StartZ + (f2Run / 2)
  const interiorX = sW + (gapBetweenFlights / 2)

  g.push({
    id: 'handrail-f2-outer',
    type: 'cylinder',
    position: [
      f2X + sW / 2 + STRINGER_THICKNESS_M / 2,
      (landingY + topY) / 2 + hrH * Math.cos(f2Angle),
      f2MidZ - hrH * Math.sin(f2Angle),
    ],
    rotation: [Math.PI / 2 - f2Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f2Len, 8],
    color: hrColor,
  })

  g.push({
    id: 'handrail-interior-f1',
    type: 'cylinder',
    position: [
      interiorX,
      ((stepTopHeights[0] ?? rH) + landingY) / 2 + hrH * Math.cos(f1Angle),
      -(f1Run / 2) + hrH * Math.sin(f1Angle),
    ],
    rotation: [Math.PI / 2 + f1Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f1Len, 8],
    color: hrColor,
  })

  g.push({
    id: 'handrail-interior-f2',
    type: 'cylinder',
    position: [
      interiorX,
      (landingY + topY) / 2 + hrH * Math.cos(f2Angle),
      f2MidZ - hrH * Math.sin(f2Angle),
    ],
    rotation: [Math.PI / 2 - f2Angle, 0, 0],
    args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, f2Len, 8],
    color: hrColor,
  })

  // ── Overlays & Detail Views ──

  // 1. Headroom clearance plane
  const midF1 = Math.floor(risersBeforeTurn / 2)
  g.push({
    id: 'headroom-plane',
    type: 'box',
    position: [0, (stepTopHeights[midF1] ?? ((midF1 + 1) * rH)) + state.headroom / 1000, -(midF1 * tD)],
    args: [sW * 1.05, 0.005, f1Run + tD],
    color: state.headroomViolation ? LAW_COLORS.PD_1096 : '#dbeafe',
    opacity: 0.3,
    transparent: true,
  })

  // 2. BP 344 Ghost Handrails
  if (state.isAccessibleRoute) {
    for (const hMm of [0.9, 0.7] as const) {
      // Outer Flight 1
      g.push({
        id: `bp344-rail-f1-outer-${hMm * 1000}`,
        type: 'cylinder',
        position: [
          -(sW / 2 + STRINGER_THICKNESS_M / 2 + BP344_GHOST_OFFSET_M),
          ((stepTopHeights[0] ?? rH) + landingY) / 2 + hMm * Math.cos(f1Angle),
          -(f1Run / 2) + hMm * Math.sin(f1Angle),
        ],
        rotation: [Math.PI / 2 + f1Angle, 0, 0],
        args: [BP344_GHOST_RAIL_RADIUS_M, BP344_GHOST_RAIL_RADIUS_M, f1Len, 8],
        color: LAW_COLORS.BP_344,
        opacity: BP344_GHOST_OPACITY,
        transparent: true,
      })
      // Outer Flight 2
      g.push({
        id: `bp344-rail-f2-outer-${hMm * 1000}`,
        type: 'cylinder',
        position: [
          f2X + sW / 2 + STRINGER_THICKNESS_M / 2 + BP344_GHOST_OFFSET_M,
          (landingY + topY) / 2 + hMm * Math.cos(f2Angle),
          f2MidZ - hMm * Math.sin(f2Angle),
        ],
        rotation: [Math.PI / 2 - f2Angle, 0, 0],
        args: [BP344_GHOST_RAIL_RADIUS_M, BP344_GHOST_RAIL_RADIUS_M, f2Len, 8],
        color: LAW_COLORS.BP_344,
        opacity: BP344_GHOST_OPACITY,
        transparent: true,
      })
    }
  }

  // 3. Width deficit indicator
  if (state.widthColor && state.widthDeficit > 0) {
    const deficit = state.widthDeficit / 1000
    // Flight 1
    g.push({
      id: `width-gap-f1-L`,
      type: 'box',
      position: [-(sW / 2 + deficit / 4), landingY / 2, -(f1Run / 2)],
      args: [deficit / 2, landingY, f1Run + tD],
      color: state.widthColor,
      opacity: WIDTH_DEFICIT_OPACITY,
      transparent: true,
    })
    // Flight 2
    g.push({
      id: `width-gap-f2-R`,
      type: 'box',
      position: [f2X + sW / 2 + deficit / 4, (landingY + topY) / 2, f2MidZ],
      args: [deficit / 2, topY - landingY, f2Run + tD],
      color: state.widthColor,
      opacity: WIDTH_DEFICIT_OPACITY,
      transparent: true,
    })
  }

  // 4. Evacuation dots
  if (rawParams.evacuationActive) {
    const egress = computeEgressRequirements(
      Number(rawParams.floorArea ?? 300),
      String(rawParams.occupancyType ?? 'business'),
      Number(rawParams.providedExits ?? 2),
      state.stairWidth,
      Boolean(rawParams.isSprinklered ?? false),
    )
    const dotCount = Math.min(Math.floor(egress.occupantLoad / 2), 200)
    const rngSeed = Math.round(state.stairWidth + state.numRisers * 31 + state.riserHeight * 17)
    const rng = mulberry32(rngSeed)

    for (let i = 0; i < dotCount; i++) {
      const t = i / Math.max(dotCount - 1, 1)
      const isF1 = t < 0.5
      const tt = isF1 ? t * 2 : (t - 0.5) * 2
      
      const dotId = `evac-dot-${i}`
      let dotPos: [number, number, number] = [0, 0, 0]

      if (isF1) {
        dotPos = [
          (rng() - 0.5) * sW * 0.6,
          landingY * (1 - tt) + rH,
          -(f1Run * (1 - tt)),
        ]
      } else {
        dotPos = [
          f2X + (rng() - 0.5) * sW * 0.6,
          landingY + (topY - landingY) * tt,
          f2StartZ + (f2Run * tt),
        ]
      }

      g.push({
        id: dotId,
        type: 'sphere',
        position: dotPos,
        args: [0.08, 4, 4],
        color: sW < 0.9 ? '#E74C3C' : '#3B82F6',
        opacity: 0.7,
        transparent: true,
      })
    }
  }

  // 5. Nosing detail view (Flight 1 midpoint)
  if (rawParams.detailViewActive) {
    const midIdx = Math.floor(risersBeforeTurn / 2)
    g.forEach((inst) => {
      if (inst.id.startsWith('tread-') || inst.id.startsWith('riser-')) {
        inst.opacity = 0.3
        inst.transparent = true
      }
    })
    const nosingInst = buildNosingProfile(
      Number(rawParams.nosingProjection ?? 25),
      Number(rawParams.nosingRadius ?? 10),
      Number(rawParams.riserUndercut ?? 15),
      Number(rawParams.contrastStripWidth ?? 38),
      state.stairWidth,
      state.treadDepth,
      state.riserHeight,
    )
    const midY = stepTopHeights[midIdx] ?? ((midIdx + 1) * rH)
    const midZ = -(midIdx * tD)
    nosingInst.position = [-sW / 2, midY - rH, midZ + tD / 2]
    nosingInst.id = `nosing-detail-${midIdx}`
    nosingInst.opacity = 1
    nosingInst.transparent = false
    g.push(nosingInst)
  }

  // 6. Handrail cross-section (Flight 1 midpoint)
  if (rawParams.handrailDetailActive) {
    const midN = Math.floor(risersBeforeTurn / 2)
    const sectionProfile = String(rawParams.handrailProfile ?? 'circular')
    const handrailDiameter = Number(rawParams.handrailDiameter ?? 35) / 1000
    const wallClearance = Number(rawParams.wallClearance ?? 45) / 1000
    const halfPrimary = handrailDiameter / 2
    const profilePoints: [number, number][] =
      sectionProfile === 'oval'
        ? Array.from({ length: 24 }, (_, index) => {
            const angle = (index / 24) * Math.PI * 2
            return [Math.cos(angle) * halfPrimary, Math.sin(angle) * (halfPrimary * 0.75)] as [number, number]
          })
        : sectionProfile === 'rectangular-rounded'
          ? [
              [-halfPrimary, -halfPrimary * 0.8],
              [halfPrimary, -halfPrimary * 0.8],
              [halfPrimary, halfPrimary * 0.8],
              [-halfPrimary, halfPrimary * 0.8],
            ]
          : Array.from({ length: 24 }, (_, index) => {
              const angle = (index / 24) * Math.PI * 2
              return [Math.cos(angle) * halfPrimary, Math.sin(angle) * halfPrimary] as [number, number]
            })
    g.push({
      id: 'handrail-cross-section',
      type: 'extruded-profile',
      position: [
        -(sW / 2 + STRINGER_THICKNESS_M / 2 + wallClearance),
        (stepTopHeights[midN] ?? (midN * rH)) + hrH,
        -(midN * tD),
      ],
      args: [],
      color: hrColor,
      profilePoints,
      extrudeDepth: 0.05,
    })
  }

  return g
}
