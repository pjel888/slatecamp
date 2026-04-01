// src/types/lot.ts
// ─── Lot Geometry Types for Custom Polygon Lot Plotting ────────────────────
// Supports both rectangular (Basic) and surveyor-plotted (Advanced) lot modes.
// Zero framework dependencies. Pure TypeScript.

/** Lot input mode discriminator */
export type LotMode = 'rectangle' | 'surveyor'

/** Cardinal direction for bearing quadrant notation */
export type BearingBaseDirection = 'N' | 'S'
export type BearingTurnDirection = 'E' | 'W'

/**
 * Surveyor bearing in quadrant notation.
 * Example: N 65° 30' 00" E → { base: 'N', degrees: 65, minutes: 30, seconds: 0, turn: 'E' }
 * This is the standard Philippine surveyor notation used on lot titles (TCT/OCT).
 */
export interface SurveyorBearing {
  base: BearingBaseDirection
  degrees: number    // 0–90
  minutes: number    // 0–59
  seconds: number    // 0–59
  turn: BearingTurnDirection
}

/**
 * Boundary classification tag.
 * Maps directly to setback fields in the compliance engine:
 * - 'front': faces the road → uses front setback value
 * - 'rear': opposite the road → uses rear setback value
 * - 'left_side' | 'right_side': lateral boundaries → uses side setback values
 */
export type BoundaryTag = 'front' | 'rear' | 'left_side' | 'right_side'

/**
 * A single lot boundary segment as entered by the user.
 * The polygon is defined as an ordered array of these segments.
 * Segment[0] starts at the origin (0,0). Each subsequent segment
 * starts where the previous one ended.
 */
export interface LotSegment {
  id: string                    // uuid for React keys and reordering
  bearing: SurveyorBearing      // direction of travel
  distance: number              // meters
  boundaryTag: BoundaryTag      // user-assigned classification
  label?: string                // optional label, e.g. "Along Road Lot 123-A"
}

/**
 * A computed vertex in Cartesian space (XZ plane, Y=0).
 * Derived from sequential bearing/distance conversions.
 */
export interface LotVertex {
  x: number   // meters, maps to Three.js X
  z: number   // meters, maps to Three.js Z (depth axis)
}

/**
 * Computed edge with both geometry and boundary metadata.
 * This is what the setback engine consumes.
 */
export interface LotEdge {
  from: LotVertex
  to: LotVertex
  segmentId: string           // links back to user input
  boundaryTag: BoundaryTag
  length: number              // meters
  normalOutward: LotVertex    // unit outward normal for setback offset direction
}

/** Polygon closure validation result. */
export interface ClosureResult {
  isClosed: boolean
  closureErrorMeters: number          // distance between last vertex and origin
  closureErrorRatio: number           // error / perimeter (surveying standard: < 1/5000)
  perimeterMeters: number
  adjustedVertices?: LotVertex[]      // Bowditch-adjusted vertices if correction applied
}

/**
 * Complete computed lot polygon ready for rendering and compliance.
 */
export interface ComputedLotPolygon {
  vertices: LotVertex[]               // ordered, CCW when viewed from above
  edges: LotEdge[]
  area: number                        // sq.m. (Shoelace formula)
  perimeter: number                   // meters
  centroid: LotVertex
  closure: ClosureResult
  boundingBox: {
    minX: number; maxX: number
    minZ: number; maxZ: number
    width: number; depth: number       // bounding box dims for fallback compatibility
  }
}

/** Boundary tag color mapping for 3D edge rendering */
export const BOUNDARY_TAG_COLORS: Record<BoundaryTag, string> = {
  front: '#1B3FC4',      // Cobalt — road-facing
  rear: '#D4951A',       // Amber — back boundary
  left_side: '#4A7C59',  // Trail green
  right_side: '#9CA3AF', // Grey
}
