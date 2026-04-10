// ──────────────────────────────────────────────────────────────────────────────
// stairway-nosing.ts — Nosing Profile Geometry Builder
// Builds an extruded-profile GeometryInstruction for a single tread's nosing
// cross-section. Used in detail view mode (Phase 2).
// ──────────────────────────────────────────────────────────────────────────────

import type { GeometryInstruction } from '@/features/3d-lab/types/templates'

/**
 * Build a 2D cross-section profile for a tread nosing junction.
 *
 * Profile shape (side view, looking at the tread from the side):
 *
 *   ┌─────────── tread top ──────────────┐
 *   │                                     │ nosing projection
 *   │    ╭── radius                       ▼
 *   │    │                          ┌─────┐
 *   │    ╰─────────────────────────│     │ contrast strip
 *   │                               └─────┘
 *   │                                     │
 *   │         riser face (undercut)       │
 *   │                                     │
 *   └─────────────────────────────────────┘
 *
 * All dimensions in scene units (meters). Input in mm, converted internally.
 */
export const buildNosingProfile = (
  nosingProjectionMm: number,
  nosingRadiusMm: number,
  riserUndercutDeg: number,
  contrastStripWidthMm: number,
  stairWidthMm: number,
  treadDepthMm: number,
  riserHeightMm: number,
): GeometryInstruction => {
  // Convert mm to meters for scene units
  const proj = nosingProjectionMm / 1000
  const radius = nosingRadiusMm / 1000
  const tD = treadDepthMm / 1000
  const rH = riserHeightMm / 1000
  const sW = stairWidthMm / 1000
  const treadThk = 0.03 // 30mm tread thickness
  const undercutDepth = Math.min(
    Math.max(Math.tan((riserUndercutDeg * Math.PI) / 180) * treadThk, 0),
    tD * 0.25,
  )
  const stripDepth = Math.min(Math.max(contrastStripWidthMm / 1000, 0), tD + proj)

  // Build 2D profile points (in local XY space)
  // Origin at top-right corner of the riser face below
  // X = horizontal (depth direction), Y = vertical (height direction)
  const points: [number, number][] = []

  // Start at bottom-left of riser face
  points.push([0, 0])

  // Up the riser face
  points.push([0, rH])

  // Forward along tread top surface (past the riser face to include nosing projection)
  points.push([tD + proj, rH])
  if (stripDepth > 0) {
    points.push([Math.max(tD + proj - stripDepth, 0), rH])
    points.push([Math.max(tD + proj - stripDepth, 0), Math.max(rH - 0.004, 0)])
    points.push([tD + proj, Math.max(rH - 0.004, 0)])
  }

  // Down the nosing front face (with radius approximation via 3 points)
  if (radius > 0.001) {
    // Approximate rounded nosing edge with a few points
    points.push([tD + proj, rH - radius * 0.3])
    points.push([tD + proj - radius * 0.3, rH - radius * 0.7])
    points.push([tD + proj - radius, rH - radius])
  } else {
    points.push([tD + proj, rH - treadThk])
  }

  // Back along the underside of the tread (to the riser face)
  const undersideY = radius > 0.001 ? rH - radius : rH - treadThk
  points.push([Math.max(undercutDepth, 0.001), undersideY])
  points.push([0.001, Math.max(rH - treadThk, undersideY - treadThk)])

  // Close back to origin
  // (Shape auto-closes)

  return {
    id: 'nosing-detail',
    type: 'extruded-profile',
    position: [0, 0, 0], // Positioned by caller at the correct tread location
    args: [], // Not used for extruded-profile
    color: '#a1a1aa', // Neutral — caller may override
    profilePoints: points,
    extrudeDepth: sW,
  }
}
