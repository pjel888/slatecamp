import type {
  ComputedStairState,
  NormalizedTurningFlightSplit,
  StairTypeConfig,
} from './stairway-types'
import { LANDING_MIN_DEPTH_MM } from './stairway-constants'

const DEFAULT_MIN_TURNING_RISERS_PER_FLIGHT = 2

export interface StraightStairJoinContract {
  landingDepth: number
  firstTreadCenterZ: number
  lastTreadCenterZ: number
  bottomJoinZ: number
  topJoinZ: number
  bottomLandingCenterZ: number
  topLandingCenterZ: number
}

export const normalizeTurningFlightSplit = (
  numRisers: number,
  requestedBeforeTurn: number,
): NormalizedTurningFlightSplit => {
  const minPerFlight = numRisers >= DEFAULT_MIN_TURNING_RISERS_PER_FLIGHT * 2
    ? DEFAULT_MIN_TURNING_RISERS_PER_FLIGHT
    : 1

  const maxBefore = Math.max(minPerFlight, numRisers - minPerFlight)
  const before = Math.min(
    Math.max(Math.round(requestedBeforeTurn), minPerFlight),
    maxBefore,
  )

  return {
    before,
    after: Math.max(numRisers - before, 0),
    minPerFlight,
  }
}

export const getNormalizedTurningFlightSplit = (
  stairType: StairTypeConfig,
  numRisers: number,
): NormalizedTurningFlightSplit | null => {
  if (stairType.type === 'straight') {
    return null
  }

  return normalizeTurningFlightSplit(numRisers, stairType.risersBeforeTurn)
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
