import type { ComputedStairState } from './stairway-types'
import { LANDING_MIN_DEPTH_MM } from './stairway-constants'

export interface StraightStairJoinContract {
  landingDepth: number
  firstTreadCenterZ: number
  lastTreadCenterZ: number
  bottomJoinZ: number
  topJoinZ: number
  bottomLandingCenterZ: number
  topLandingCenterZ: number
}

export const computeVisualLandingDepthMeters = (stairWidthMm: number): number =>
  Math.max(stairWidthMm / 1000, LANDING_MIN_DEPTH_MM / 1000)

export const computeStepRiserHeightsMeters = (state: ComputedStairState): number[] =>
  Array.from({ length: state.numRisers }, (_, index) => {
    const deviation = state.toleranceMode
      ? (state.perStepRiserVariations[index] ?? 0) / 1000
      : 0

    return state.riserHeight / 1000 + deviation
  })

export const computeStepTopHeightsMeters = (state: ComputedStairState): number[] => {
  let cumulativeHeight = 0

  return computeStepRiserHeightsMeters(state).map((stepHeight) => {
    cumulativeHeight += stepHeight
    return cumulativeHeight
  })
}

export const computeStraightStairJoinContract = (
  treadDepthMeters: number,
  numRisers: number,
  landingDepth = treadDepthMeters,
): StraightStairJoinContract => {
  const firstTreadCenterZ = 0
  const lastTreadCenterZ = -((numRisers - 1) * treadDepthMeters)
  const bottomJoinZ = firstTreadCenterZ + treadDepthMeters / 2
  const topJoinZ = lastTreadCenterZ - treadDepthMeters / 2

  return {
    landingDepth,
    firstTreadCenterZ,
    lastTreadCenterZ,
    bottomJoinZ,
    topJoinZ,
    bottomLandingCenterZ: bottomJoinZ + landingDepth / 2,
    topLandingCenterZ: topJoinZ - landingDepth / 2,
  }
}
