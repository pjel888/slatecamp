// ──────────────────────────────────────────────────────────────────────────────
// stairway-egress.ts — Egress Calculator Engine (Pure Computation)
// Computes occupant load, required exits, exit width capacity, and travel
// distance compliance per RA 9514 and PD 1096.
// ZERO Three.js, React, or store imports.
// ──────────────────────────────────────────────────────────────────────────────

import {
  OCCUPANT_LOAD_FACTORS,
  RA9514_EXIT_THRESHOLDS,
  PD1096_LARGE_FLOOR_AREA_SQM,
  RA9514_WIDTH_PER_PERSON_MM,
  RA9514_MIN_EXIT_WIDTH_MM,
  TRAVEL_DISTANCE_UNSPRINKLERED,
  TRAVEL_DISTANCE_SPRINKLERED,
} from './stairway-constants'

export interface EgressCalculation {
  floorArea: number
  occupancyType: string
  loadFactor: number
  occupantLoad: number
  requiredExitsRA9514: number
  pd1096Override: boolean
  effectiveRequiredExits: number
  providedExits: number
  exitsCompliant: boolean
  requiredWidthPerExit: number    // mm
  totalRequiredWidth: number      // mm
  stairWidth: number              // mm
  stairCountsAsExit: boolean
  travelDistanceLimit: number     // meters
  isSprinklered: boolean
}

export const computeEgressRequirements = (
  floorArea: number,
  occupancyType: string,
  providedExits: number,
  stairWidth: number,
  isSprinklered: boolean,
): EgressCalculation => {
  // Occupant load calculation
  const loadFactor = OCCUPANT_LOAD_FACTORS[occupancyType] ?? 9.3
  const occupantLoad = Math.ceil(floorArea / loadFactor)

  // Required exits per RA 9514
  let requiredExitsRA9514 = 1
  for (const threshold of RA9514_EXIT_THRESHOLDS) {
    if (occupantLoad <= threshold.maxOccupants) {
      requiredExitsRA9514 = threshold.minExits
      break
    }
  }

  // PD 1096 override: >500 sqm = minimum 2 exits
  const pd1096Override = floorArea > PD1096_LARGE_FLOOR_AREA_SQM
  const effectiveRequiredExits = Math.max(
    requiredExitsRA9514,
    pd1096Override ? 2 : 1,
  )

  // Exit compliance
  const exitsCompliant = providedExits >= effectiveRequiredExits

  // Width calculation: 5.1mm per person, 710mm minimum per exit
  const rawWidthPerExit = (occupantLoad * RA9514_WIDTH_PER_PERSON_MM) / Math.max(providedExits, 1)
  const requiredWidthPerExit = Math.max(rawWidthPerExit, RA9514_MIN_EXIT_WIDTH_MM)
  const totalRequiredWidth = requiredWidthPerExit * Math.max(providedExits, 1)

  // Stair qualification
  const stairCountsAsExit = stairWidth >= RA9514_MIN_EXIT_WIDTH_MM

  // Travel distance
  const distanceTable = isSprinklered ? TRAVEL_DISTANCE_SPRINKLERED : TRAVEL_DISTANCE_UNSPRINKLERED
  const travelDistanceLimit = distanceTable[occupancyType] ?? 46

  return {
    floorArea,
    occupancyType,
    loadFactor,
    occupantLoad,
    requiredExitsRA9514,
    pd1096Override,
    effectiveRequiredExits,
    providedExits,
    exitsCompliant,
    requiredWidthPerExit,
    totalRequiredWidth,
    stairWidth,
    stairCountsAsExit,
    travelDistanceLimit,
    isSprinklered,
  }
}
