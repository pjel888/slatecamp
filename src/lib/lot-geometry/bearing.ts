// src/lib/lot-geometry/bearing.ts
// ─── Surveyor bearing conversion to Cartesian coordinates ──────────────────
// Zero framework dependencies. Pure math.

import type { SurveyorBearing } from '@/types/lot'

/**
 * Convert surveyor quadrant bearing to mathematical azimuth (radians).
 *
 * Surveyor bearings measure from N or S, turning toward E or W.
 * Mathematical azimuth: 0 = North (+Z in our coord system), CW positive.
 *
 * Philippine TCT/OCT lot descriptions use this quadrant notation:
 *   "N 65° 30' E" means: start facing North, rotate 65°30' toward East.
 *
 * Quadrant mapping to azimuth:
 *   N-E quadrant:  azimuth = angle          (0° to 90°)
 *   S-E quadrant:  azimuth = 180° - angle   (90° to 180°)
 *   S-W quadrant:  azimuth = 180° + angle   (180° to 270°)
 *   N-W quadrant:  azimuth = 360° - angle   (270° to 360°)
 */
export function bearingToAzimuthRad(bearing: SurveyorBearing): number {
  const decimalDegrees =
    bearing.degrees + bearing.minutes / 60 + bearing.seconds / 3600

  let azimuthDeg: number

  if (bearing.base === 'N' && bearing.turn === 'E') {
    azimuthDeg = decimalDegrees
  } else if (bearing.base === 'S' && bearing.turn === 'E') {
    azimuthDeg = 180 - decimalDegrees
  } else if (bearing.base === 'S' && bearing.turn === 'W') {
    azimuthDeg = 180 + decimalDegrees
  } else {
    // N-W
    azimuthDeg = 360 - decimalDegrees
  }

  return (azimuthDeg * Math.PI) / 180
}

/**
 * Convert azimuth (radians, CW from North) to XZ displacement.
 *
 * In our Three.js coordinate system (Y-up, XZ ground plane):
 *   North = +Z direction
 *   East  = +X direction
 *
 * So:
 *   dx = distance * sin(azimuth)    // East component
 *   dz = distance * cos(azimuth)    // North component
 */
export function polarToCartesian(
  azimuthRad: number,
  distance: number
): { dx: number; dz: number } {
  return {
    dx: distance * Math.sin(azimuthRad),
    dz: distance * Math.cos(azimuthRad),
  }
}

/**
 * Format a bearing for display: "N 65° 30' 00" E"
 */
export function formatBearing(bearing: SurveyorBearing): string {
  const deg = bearing.degrees.toString().padStart(2, '0')
  const min = bearing.minutes.toString().padStart(2, '0')
  const sec = bearing.seconds.toString().padStart(2, '0')
  return `${bearing.base} ${deg}° ${min}' ${sec}" ${bearing.turn}`
}
