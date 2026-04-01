# Custom Polygon Lot Plotting — Technical Implementation Plan

**Feature:** Advanced Surveyor-Mode Lot Generation with Boundary Tagging  
**Module:** Development Controls Calculator (Code Compliance Viz)  
**Status:** Pre-Implementation Planning  
**Date:** April 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architectural Constraints](#2-architectural-constraints)
3. [State Data Structure](#3-state-data-structure)
4. [Geometry Conversion & Closure Validation Logic](#4-geometry-conversion--closure-validation-logic)
5. [3D Rendering Implementation](#5-3d-rendering-implementation)
6. [Setback Bridge — Boundary Tags to Compliance Engine](#6-setback-bridge--boundary-tags-to-compliance-engine)
7. [UI/UX Implementation Strategy](#7-uiux-implementation-strategy)
8. [File Architecture](#8-file-architecture)
9. [Implementation Sequence](#9-implementation-sequence)
10. [Testing Matrix](#10-testing-matrix)

---

## 1. Executive Summary

The existing Development Controls Calculator operates on a simple rectangular lot defined by `width` and `depth`. This plan introduces a second lot input mode — **Advanced Surveyor Mode** — that accepts technical bearings and distances to plot arbitrary closed polygons. Each polygon edge is user-tagged as `front`, `rear`, `left_side`, or `right_side` so the existing `computeSetbacks()`, `computeAMBF()`, and `computePSO()` functions continue to work without modification.

**Non-negotiable constraints:**
- The default rectangular mode remains untouched and is the default on load.
- No external mapping APIs. All geometry is computed client-side.
- All internal geometry uses **meters**. Display values in **millimeters** where appropriate.
- Coordinate system: **Y-up** (Three.js default). Lot plane is the **XZ plane** at `Y=0`.
- Components touching R3F Canvas must be `'use client'`.

---

## 2. Architectural Constraints

### From `slatecamp-3d-parametric-engine`
- Units: meters internally, millimeters for display.
- Coordinate system: Y-up. Floor at Y=0.
- Preferred pipeline: **Runtime BufferGeometry** (no GLB needed — lot shape changes from user input).

### From `slatecamp-3d-code-compliance-viz`
- The compliance engine already expects a `LotData` interface with `width`, `depth`, `area`, `frontage`, `adjacentUse`.
- The `SetbackRequirements` interface expects `front`, `rear`, `left`, `right` in meters.
- `computeAMBF()` currently computes `buildableWidth` and `buildableDepth` from rectangular subtraction.
- **This is the primary integration challenge.** For irregular polygons, we must compute the setback-inset polygon geometrically (polygon offset) rather than simple subtraction.

### From `slatecamp-codebase-steward`
- Zero-behavior-change rule: the rectangular path must produce identical results before and after this feature lands.
- `page.tsx` files contain only auth + data fetching + layout. All logic lives in leaf components.
- Zustand for client-side state (per `slatecamp-nextjs-frontend`).

### From `slatecamp-r3f-api-master`
- No allocations inside `useFrame` loops.
- All geometry constructed via `useMemo` with proper dependency arrays.
- Dispose geometry on unmount.

---

## 3. State Data Structure

### 3.1 Core TypeScript Interfaces

```typescript
// ═══════════════════════════════════════════════════════════════
// src/types/lot.ts — Lot Geometry Types
// ═══════════════════════════════════════════════════════════════

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
 * Maps directly to SetbackRequirements fields in the compliance engine.
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
  length: number              // meters (redundant but convenient)
  normalOutward: LotVertex    // unit outward normal for setback offset direction
}

/**
 * Polygon closure validation result.
 */
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
```

### 3.2 Zustand Store

```typescript
// ═══════════════════════════════════════════════════════════════
// src/stores/useLotStore.ts — Unified Lot State
// ═══════════════════════════════════════════════════════════════

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  LotMode, LotSegment, ComputedLotPolygon, BoundaryTag
} from '@/types/lot'

interface RectangleLotState {
  width: number       // meters (existing field — DO NOT RENAME)
  depth: number       // meters (existing field — DO NOT RENAME)
}

interface SurveyorLotState {
  segments: LotSegment[]
  closureTolerance: number            // meters, default 0.05 (5cm)
  autoAdjust: boolean                 // apply Bowditch adjustment on close
}

interface LotStore {
  // ── Mode Toggle ─────────────────────────────────────────
  mode: LotMode
  setMode: (mode: LotMode) => void

  // ── Rectangle Mode (Existing — UNCHANGED) ───────────────
  rectangle: RectangleLotState
  setRectangleWidth: (w: number) => void
  setRectangleDepth: (d: number) => void

  // ── Surveyor Mode (New) ─────────────────────────────────
  surveyor: SurveyorLotState
  addSegment: (segment: LotSegment) => void
  updateSegment: (id: string, patch: Partial<LotSegment>) => void
  removeSegment: (id: string) => void
  reorderSegments: (fromIndex: number, toIndex: number) => void
  clearSegments: () => void
  setClosureTolerance: (m: number) => void
  setAutoAdjust: (v: boolean) => void

  // ── Computed Output (derived, shared by both modes) ─────
  computedPolygon: ComputedLotPolygon | null
  recompute: () => void

  // ── Compatibility Bridge ────────────────────────────────
  /**
   * Returns a LotData-compatible object regardless of mode.
   * Rectangle mode: returns width/depth directly.
   * Surveyor mode: returns bounding box width/depth + true polygon area.
   * This is what the compliance engine reads.
   */
  getLotData: () => {
    width: number
    depth: number
    area: number
    frontage: string
    adjacentUse: string
    polygon?: ComputedLotPolygon
  }
}
```

### 3.3 Key Design Decisions

| Decision | Rationale |
|---|---|
| Segments array, not vertex array | Users think in "walk the boundary" terms: bearing + distance per leg. Vertices are derived. |
| `BoundaryTag` per segment, not per vertex | A boundary classification applies to an edge (line between two corners), not a point. |
| `normalOutward` on each edge | The setback offset direction must be deterministic. Pre-computing the outward normal at edge creation prevents ambiguity in the compliance engine. |
| Bowditch adjustment optional | Real survey data never closes perfectly. The Compass Rule (Bowditch) distributes closure error proportionally. Users can toggle this. |
| Bounding box in `ComputedLotPolygon` | Provides fallback `width`/`depth` values so the existing `computeAMBF()` can still work as an approximation before the polygon offset engine is fully implemented. |

---

## 4. Geometry Conversion & Closure Validation Logic

### 4.1 Bearing to Azimuth Conversion

```typescript
// ═══════════════════════════════════════════════════════════════
// src/lib/lot-geometry/bearing.ts
// ═══════════════════════════════════════════════════════════════

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
```

### 4.2 Polygon Construction from Segments

```typescript
// ═══════════════════════════════════════════════════════════════
// src/lib/lot-geometry/polygon.ts
// ═══════════════════════════════════════════════════════════════

import type { LotSegment, LotVertex, LotEdge, ComputedLotPolygon } from '@/types/lot'
import { bearingToAzimuthRad, polarToCartesian } from './bearing'

/**
 * Build the full polygon from an ordered array of surveyor segments.
 *
 * Walk: Start at origin (0,0). For each segment, compute the azimuth,
 * convert to XZ displacement, accumulate position.
 *
 * The resulting vertices array has length = segments.length + 1
 * (first vertex is origin, last vertex is the "attempted return" to origin).
 */
export function buildPolygonFromSegments(
  segments: LotSegment[]
): ComputedLotPolygon | null {
  if (segments.length < 3) return null

  const vertices: LotVertex[] = [{ x: 0, z: 0 }]
  let currentX = 0
  let currentZ = 0
  let perimeter = 0

  for (const seg of segments) {
    const azimuth = bearingToAzimuthRad(seg.bearing)
    const { dx, dz } = polarToCartesian(azimuth, seg.distance)

    currentX += dx
    currentZ += dz
    perimeter += seg.distance

    vertices.push({ x: currentX, z: currentZ })
  }

  // ── Closure check ────────────────────────────────────────
  const lastVertex = vertices[vertices.length - 1]
  const closureErrorMeters = Math.sqrt(lastVertex.x ** 2 + lastVertex.z ** 2)
  const closureErrorRatio = perimeter > 0 ? closureErrorMeters / perimeter : Infinity

  const closure = {
    isClosed: closureErrorRatio < 1 / 5000,   // surveying standard
    closureErrorMeters,
    closureErrorRatio,
    perimeterMeters: perimeter,
  }

  // ── Build edges with outward normals ─────────────────────
  // Use vertices [0..N-1] (drop the unclosed last point, use origin as close)
  const closedVertices = vertices.slice(0, segments.length) // N vertices for N segments
  // Edge i goes from closedVertices[i] to closedVertices[(i+1) % N]

  const N = closedVertices.length
  const edges: LotEdge[] = segments.map((seg, i) => {
    const from = closedVertices[i]
    const to = closedVertices[(i + 1) % N]
    const edgeDx = to.x - from.x
    const edgeDz = to.z - from.z
    const len = Math.sqrt(edgeDx ** 2 + edgeDz ** 2)

    // Outward normal (perpendicular, pointing right when walking CW).
    // If polygon is CCW, flip sign. We'll determine winding after area calc.
    const nx = edgeDz / len
    const nz = -edgeDx / len

    return {
      from, to,
      segmentId: seg.id,
      boundaryTag: seg.boundaryTag,
      length: seg.distance,
      normalOutward: { x: nx, z: nz },
    }
  })

  // ── Area via Shoelace formula ────────────────────────────
  let signedArea = 0
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N
    signedArea += closedVertices[i].x * closedVertices[j].z
    signedArea -= closedVertices[j].x * closedVertices[i].z
  }
  signedArea /= 2

  const area = Math.abs(signedArea)

  // If signedArea < 0, polygon is CW → flip all outward normals
  if (signedArea < 0) {
    for (const edge of edges) {
      edge.normalOutward.x *= -1
      edge.normalOutward.z *= -1
    }
  }

  // ── Centroid ─────────────────────────────────────────────
  const centroid = {
    x: closedVertices.reduce((s, v) => s + v.x, 0) / N,
    z: closedVertices.reduce((s, v) => s + v.z, 0) / N,
  }

  // ── Bounding box ─────────────────────────────────────────
  const xs = closedVertices.map(v => v.x)
  const zs = closedVertices.map(v => v.z)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minZ = Math.min(...zs)
  const maxZ = Math.max(...zs)

  return {
    vertices: closedVertices,
    edges,
    area,
    perimeter,
    centroid,
    closure,
    boundingBox: {
      minX, maxX, minZ, maxZ,
      width: maxX - minX,
      depth: maxZ - minZ,
    },
  }
}
```

### 4.3 Bowditch (Compass Rule) Adjustment

```typescript
// ═══════════════════════════════════════════════════════════════
// src/lib/lot-geometry/bowditch.ts
// ═══════════════════════════════════════════════════════════════

import type { LotVertex } from '@/types/lot'

/**
 * Bowditch (Compass Rule) adjustment.
 *
 * Distributes closure error proportionally to each leg's distance.
 * This is the standard adjustment method used in Philippine land surveying.
 *
 * correction_x_i = -(closure_error_x) * (distance_i / total_perimeter)
 * correction_z_i = -(closure_error_z) * (distance_i / total_perimeter)
 *
 * @param rawVertices  Vertices including the unclosed final point
 * @param distances    Distance of each segment (same order as segments)
 * @returns            Adjusted vertices array (length = segments count, closed)
 */
export function bowditchAdjust(
  rawVertices: LotVertex[],    // length = N + 1 (origin + each endpoint)
  distances: number[]           // length = N
): LotVertex[] {
  const N = distances.length
  const perimeter = distances.reduce((s, d) => s + d, 0)

  // Closure error = last computed point (should be origin)
  const lastPt = rawVertices[N]  // the N+1th vertex
  const errorX = lastPt.x - 0   // should return to origin (0,0)
  const errorZ = lastPt.z - 0

  const adjusted: LotVertex[] = [{ x: 0, z: 0 }]  // origin stays fixed
  let cumulativeDistance = 0

  for (let i = 0; i < N; i++) {
    cumulativeDistance += distances[i]
    const ratio = cumulativeDistance / perimeter

    adjusted.push({
      x: rawVertices[i + 1].x - errorX * ratio,
      z: rawVertices[i + 1].z - errorZ * ratio,
    })
  }

  // Drop the last point (it's now back at origin after adjustment)
  return adjusted.slice(0, N)
}
```

### 4.4 Polygon Inset for Setback Computation

```typescript
// ═══════════════════════════════════════════════════════════════
// src/lib/lot-geometry/inset.ts
// ═══════════════════════════════════════════════════════════════

import type { LotVertex, LotEdge, BoundaryTag, ComputedLotPolygon } from '@/types/lot'
import type { SetbackRequirements } from '@/types/compliance'

/**
 * Compute the setback-inset polygon for an irregular lot.
 *
 * For a rectangular lot, this is trivial: subtract setback from each side.
 * For an irregular polygon, we must offset each edge inward by the setback
 * amount corresponding to its boundary tag, then find the intersection
 * of adjacent offset edges.
 *
 * This is the "straight skeleton" or "polygon offset" problem.
 * We use the simpler approach: offset each edge line, then intersect
 * adjacent offset lines to get new vertices.
 *
 * CRITICAL: This function is what bridges boundaryTag → setback values.
 */
export function computeSetbackInsetPolygon(
  polygon: ComputedLotPolygon,
  setbacks: SetbackRequirements
): LotVertex[] {
  const { edges } = polygon

  // Map boundary tag to setback distance
  const tagToSetback: Record<BoundaryTag, number> = {
    front: setbacks.front,
    rear: setbacks.rear,
    left_side: setbacks.left,
    right_side: setbacks.right,
  }

  // Offset each edge inward by its setback amount
  const offsetEdges: Array<{ from: LotVertex; to: LotVertex }> = edges.map(edge => {
    const setbackDist = tagToSetback[edge.boundaryTag]

    // Move edge inward along its outward normal (negate = inward)
    return {
      from: {
        x: edge.from.x - edge.normalOutward.x * setbackDist,
        z: edge.from.z - edge.normalOutward.z * setbackDist,
      },
      to: {
        x: edge.to.x - edge.normalOutward.x * setbackDist,
        z: edge.to.z - edge.normalOutward.z * setbackDist,
      },
    }
  })

  // Intersect adjacent offset edges to get inset vertices
  const N = offsetEdges.length
  const insetVertices: LotVertex[] = []

  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N
    const intersection = lineLineIntersection(
      offsetEdges[i].from, offsetEdges[i].to,
      offsetEdges[j].from, offsetEdges[j].to
    )

    if (intersection) {
      insetVertices.push(intersection)
    } else {
      // Parallel edges — use midpoint of shared region (fallback)
      insetVertices.push(offsetEdges[i].to)
    }
  }

  return insetVertices
}

/**
 * 2D line-line intersection in XZ plane.
 * Lines defined by two points each. Returns intersection point or null if parallel.
 */
function lineLineIntersection(
  p1: LotVertex, p2: LotVertex,
  p3: LotVertex, p4: LotVertex
): LotVertex | null {
  const d1x = p2.x - p1.x
  const d1z = p2.z - p1.z
  const d2x = p4.x - p3.x
  const d2z = p4.z - p3.z

  const denom = d1x * d2z - d1z * d2x
  if (Math.abs(denom) < 1e-10) return null  // parallel

  const t = ((p3.x - p1.x) * d2z - (p3.z - p1.z) * d2x) / denom

  return {
    x: p1.x + t * d1x,
    z: p1.z + t * d1z,
  }
}
```

---

## 5. 3D Rendering Implementation

### 5.1 Lot Polygon Mesh (R3F Component)

```typescript
// ═══════════════════════════════════════════════════════════════
// src/components/3d-lab/modules/LotConfigurator/LotPolygonMesh.tsx
// ═══════════════════════════════════════════════════════════════
'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { LotVertex } from '@/types/lot'

interface LotPolygonMeshProps {
  vertices: LotVertex[]
  color?: string
  opacity?: number
  wireframe?: boolean
  yOffset?: number       // slight Y lift to prevent z-fighting
}

/**
 * Renders an arbitrary polygon on the XZ ground plane.
 *
 * Uses THREE.ShapeGeometry for the fill and THREE.BufferGeometry
 * for the outline. The Shape is defined in 2D (XZ mapped to XY for Shape),
 * then rotated to lie flat on the ground.
 *
 * This handles convex AND concave polygons — ShapeGeometry uses
 * Earcut triangulation internally.
 */
export function LotPolygonMesh({
  vertices,
  color = '#E8E4DB',
  opacity = 1,
  wireframe = false,
  yOffset = 0,
}: LotPolygonMeshProps) {
  const geometry = useMemo(() => {
    if (vertices.length < 3) return null

    const shape = new THREE.Shape()
    shape.moveTo(vertices[0].x, vertices[0].z)
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo(vertices[i].x, vertices[i].z)
    }
    shape.closePath()

    const geo = new THREE.ShapeGeometry(shape)
    // ShapeGeometry creates in XY plane — rotate to XZ (ground)
    geo.rotateX(-Math.PI / 2)

    return geo
  }, [vertices])

  if (!geometry) return null

  return (
    <mesh geometry={geometry} position={[0, yOffset, 0]}>
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
  )
}
```

### 5.2 Boundary Edge Lines with Color-Coded Tags

```typescript
// ═══════════════════════════════════════════════════════════════
// src/components/3d-lab/modules/LotConfigurator/BoundaryEdgeLines.tsx
// ═══════════════════════════════════════════════════════════════
'use client'

import { Line, Html, Text } from '@react-three/drei'
import type { LotEdge, BoundaryTag } from '@/types/lot'

/**
 * SlateCamp brand-aligned boundary colors.
 * These match the compliance visualization color system.
 */
const BOUNDARY_COLORS: Record<BoundaryTag, string> = {
  front:      '#1B3FC4',   // SlateCamp primary blue — road/front
  rear:       '#E63329',   // Compliance red — rear
  left_side:  '#F5A623',   // Warning amber — side
  right_side: '#F5A623',   // Warning amber — side (same as left)
}

const BOUNDARY_LABELS: Record<BoundaryTag, string> = {
  front:      'FRONT (ROAD)',
  rear:       'REAR',
  left_side:  'LEFT SIDE',
  right_side: 'RIGHT SIDE',
}

interface BoundaryEdgeLinesProps {
  edges: LotEdge[]
  showLabels?: boolean
  showDimensions?: boolean
  selectedEdgeId?: string | null
}

export function BoundaryEdgeLines({
  edges,
  showLabels = true,
  showDimensions = true,
  selectedEdgeId = null,
}: BoundaryEdgeLinesProps) {
  return (
    <group>
      {edges.map(edge => {
        const midX = (edge.from.x + edge.to.x) / 2
        const midZ = (edge.from.z + edge.to.z) / 2
        const isSelected = edge.segmentId === selectedEdgeId
        const color = BOUNDARY_COLORS[edge.boundaryTag]

        return (
          <group key={edge.segmentId}>
            {/* Edge line */}
            <Line
              points={[
                [edge.from.x, 0.02, edge.from.z],
                [edge.to.x, 0.02, edge.to.z],
              ]}
              color={color}
              lineWidth={isSelected ? 4 : 2}
            />

            {/* Boundary tag label */}
            {showLabels && (
              <Html
                position={[
                  midX + edge.normalOutward.x * 0.8,
                  0.3,
                  midZ + edge.normalOutward.z * 0.8,
                ]}
                center
                distanceFactor={12}
              >
                <div className={`
                  px-2 py-0.5 rounded text-[9px] font-mono font-bold
                  border whitespace-nowrap
                  ${isSelected ? 'bg-white shadow-md' : 'bg-white/80'}
                `} style={{ color, borderColor: color }}>
                  {BOUNDARY_LABELS[edge.boundaryTag]}
                </div>
              </Html>
            )}

            {/* Distance dimension */}
            {showDimensions && (
              <Html position={[midX, 0.15, midZ]} center distanceFactor={10}>
                <div className="px-1.5 py-0.5 bg-gray-900/80 rounded text-[10px]
                  font-mono text-white whitespace-nowrap">
                  {(edge.length).toFixed(2)}m
                </div>
              </Html>
            )}
          </group>
        )
      })}
    </group>
  )
}
```

### 5.3 Setback Inset Overlay

```typescript
// ═══════════════════════════════════════════════════════════════
// src/components/3d-lab/modules/LotConfigurator/SetbackOverlay.tsx
// ═══════════════════════════════════════════════════════════════
'use client'

import { LotPolygonMesh } from './LotPolygonMesh'
import type { LotVertex } from '@/types/lot'

interface SetbackOverlayProps {
  lotVertices: LotVertex[]          // outer boundary
  insetVertices: LotVertex[]        // inner buildable boundary
}

/**
 * Renders the setback zone as a semi-transparent red overlay
 * between the lot boundary and the buildable envelope.
 *
 * The lot polygon is rendered in light red, and the buildable
 * area is "punched out" by rendering it in the base color on top.
 */
export function SetbackOverlay({ lotVertices, insetVertices }: SetbackOverlayProps) {
  return (
    <group>
      {/* Setback zone (red tint on entire lot) */}
      <LotPolygonMesh
        vertices={lotVertices}
        color="#E63329"
        opacity={0.1}
        yOffset={0.005}
      />

      {/* Buildable area (punches through the red) */}
      <LotPolygonMesh
        vertices={insetVertices}
        color="#1B3FC4"
        opacity={0.08}
        yOffset={0.006}
      />
    </group>
  )
}
```

### 5.4 Cleanup & Disposal

```typescript
// Add to the parent Canvas component's cleanup logic:
// All ShapeGeometry instances created via useMemo will be GC'd
// when the component unmounts. For explicit disposal:

useEffect(() => {
  return () => {
    // The LotPolygonMesh geometry is managed by useMemo
    // and will be disposed when deps change. But for safety:
    if (geometryRef.current) {
      geometryRef.current.dispose()
    }
  }
}, [])
```

---

## 6. Setback Bridge — Boundary Tags to Compliance Engine

### 6.1 The Bridge Function

This is the critical integration point. The existing compliance engine expects rectangular inputs. We provide a compatibility layer:

```typescript
// ═══════════════════════════════════════════════════════════════
// src/lib/compliance/lot-bridge.ts
// ═══════════════════════════════════════════════════════════════

import type { LotData, SetbackRequirements } from '@/types/compliance'
import type { ComputedLotPolygon, BoundaryTag } from '@/types/lot'
import { computeSetbackInsetPolygon } from '@/lib/lot-geometry/inset'
import { computeSetbacks } from '@/lib/compliance/setbacks'

/**
 * Bridge between the new polygon lot system and the existing compliance engine.
 *
 * KEY DESIGN:
 * - For RECTANGULAR mode: returns existing LotData unchanged. Zero behavior change.
 * - For SURVEYOR mode: wraps polygon data into LotData-compatible shape,
 *   and provides the polygon-aware AMBF computation.
 */
export function bridgeLotToCompliance(
  mode: 'rectangle' | 'surveyor',
  rectangle: { width: number; depth: number },
  polygon: ComputedLotPolygon | null,
  occupancy: string
): {
  lotData: LotData
  setbacks: SetbackRequirements
  buildablePolygon: { x: number; z: number }[] | null
  buildableArea: number
} {
  if (mode === 'rectangle' || !polygon) {
    // ── EXISTING BEHAVIOR — UNCHANGED ──────────────────────
    const lotData: LotData = {
      width: rectangle.width,
      depth: rectangle.depth,
      area: rectangle.width * rectangle.depth,
      frontage: 'road',
      adjacentUse: 'residential',
    }
    const setbacks = computeSetbacks(lotData, occupancy)
    const buildableWidth = rectangle.width - setbacks.left - setbacks.right
    const buildableDepth = rectangle.depth - setbacks.front - setbacks.rear
    const buildableArea = Math.max(0, buildableWidth * buildableDepth)

    return { lotData, setbacks, buildablePolygon: null, buildableArea }
  }

  // ── SURVEYOR MODE — NEW POLYGON-AWARE PATH ──────────────
  const lotData: LotData = {
    width: polygon.boundingBox.width,
    depth: polygon.boundingBox.depth,
    area: polygon.area,               // TRUE polygon area, not bbox
    frontage: 'road',
    adjacentUse: 'residential',
  }

  const setbacks = computeSetbacks(lotData, occupancy)

  // Compute the inset polygon using per-edge boundary tags
  const insetVertices = computeSetbackInsetPolygon(polygon, setbacks)
  const buildableArea = computePolygonArea(insetVertices)

  return {
    lotData,
    setbacks,
    buildablePolygon: insetVertices,
    buildableArea,
  }
}

/** Shoelace formula for any vertex array */
function computePolygonArea(vertices: { x: number; z: number }[]): number {
  const N = vertices.length
  let area = 0
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N
    area += vertices[i].x * vertices[j].z
    area -= vertices[j].x * vertices[i].z
  }
  return Math.abs(area / 2)
}
```

### 6.2 How Boundary Tags Flow Through the System

```
User Input                     State                    Compliance Engine
─────────                     ─────                    ─────────────────

Segment 1:                    LotSegment {              LotEdge {
  N 65° E, 45m                 boundaryTag: 'front'      boundaryTag: 'front'
  Tag: FRONT                  }                          normalOutward: {x, z}
                                                        }
                                        │                         │
                                        ▼                         ▼
                              computeSetbackInsetPolygon()
                                        │
                              tagToSetback['front'] = 4.5m
                                        │
                              Offset this edge 4.5m inward
                                        │
                                        ▼
                              Buildable polygon vertex at
                              intersection of adjacent offsets
                                        │
                                        ▼
                              computeAMBF() uses buildableArea
                              computePSO() uses lot.area - buildingFootprint
```

---

## 7. UI/UX Implementation Strategy

### 7.1 Mode Toggle — Zero Clutter

```
┌──────────────────────────────────────────┐
│  LOT PARAMETERS                          │
│                                          │
│  ┌─────────────┐ ┌───────────────────┐   │
│  │  Basic Lot  │ │  Surveyor Plot ▸  │   │
│  └─────────────┘ └───────────────────┘   │
│                                          │
│  [Mode-specific content below]           │
└──────────────────────────────────────────┘
```

- **Two tabs** at the top of the Lot Parameters panel (existing left toolbar area).
- "Basic Lot" is the default tab and shows the existing `width` + `depth` inputs unchanged.
- "Surveyor Plot" reveals the advanced segment input system.
- Switching modes triggers `setMode()` in the Zustand store, which triggers `recompute()`.
- The 3D viewport reads `computedPolygon` from the store — it doesn't care about mode.

### 7.2 Basic Lot Mode (Existing — No Changes)

```
┌──────────────────────────────────────────┐
│  LOT PARAMETERS    [Basic] [Surveyor]    │
│                                          │
│  Lot Width    ┌──────────────┐           │
│               │  15.00 m     │           │
│               └──────────────┘           │
│  Lot Depth    ┌──────────────┐           │
│               │  25.00 m     │           │
│               └──────────────┘           │
│                                          │
│  Lot Area:  375.00 sq.m.                 │
└──────────────────────────────────────────┘
```

### 7.3 Surveyor Mode — Segment Input

```
┌──────────────────────────────────────────┐
│  LOT PARAMETERS    [Basic] [Surveyor]    │
│                                          │
│  ┌─ Segment 1 ──────────────────────┐    │
│  │  Bearing: [N] [65]° [30]' [00]" [E]│  │
│  │  Distance: [45.00] m             │    │
│  │  Boundary: (●) Front  ( ) Rear   │    │
│  │            ( ) Left   ( ) Right   │    │
│  │                            [✕]    │    │
│  └───────────────────────────────────┘    │
│                                          │
│  ┌─ Segment 2 ──────────────────────┐    │
│  │  Bearing: [S] [25]° [00]' [00]" [E]│  │
│  │  Distance: [30.00] m             │    │
│  │  Boundary: ( ) Front  ( ) Rear   │    │
│  │            (●) Left   ( ) Right   │    │
│  │                            [✕]    │    │
│  └───────────────────────────────────┘    │
│                                          │
│  ┌─ Segment 3 ──────────────────────┐    │
│  │  ...                              │    │
│  └───────────────────────────────────┘    │
│                                          │
│  [+ Add Segment]                         │
│                                          │
│  ── Closure Status ──────────────────    │
│  ✓  Polygon closed (error: 0.02m)        │
│  ☐  Auto-adjust (Bowditch)               │
│                                          │
│  ── Summary ─────────────────────────    │
│  Area:      675.32 sq.m.                 │
│  Perimeter: 120.00 m                     │
│  Segments:  5                            │
└──────────────────────────────────────────┘
```

### 7.4 Component Breakdown

| Component | Directive | Responsibility |
|---|---|---|
| `LotParametersPanel.tsx` | `'use client'` | Mode toggle tabs, renders child based on `mode` |
| `BasicLotInputs.tsx` | `'use client'` | Existing width/depth inputs (extract from current code) |
| `SurveyorLotInputs.tsx` | `'use client'` | Segment list, add/remove/reorder, closure indicator |
| `SegmentInputCard.tsx` | `'use client'` | Single segment: bearing fields, distance, boundary tag radios |
| `BearingInput.tsx` | `'use client'` | Bearing entry with N/S select, degrees/minutes/seconds, E/W select |
| `ClosureStatusBadge.tsx` | `'use client'` | Shows closed/unclosed with error distance |
| `LotSummaryFooter.tsx` | `'use client'` | Area, perimeter, segment count |

### 7.5 Interaction Patterns

**Adding a segment:**
1. User clicks "+ Add Segment"
2. New `LotSegment` with default bearing (N 0° 0' 0" E), distance 10m, tag 'front' is appended.
3. `recompute()` fires → polygon updates → 3D viewport updates live.

**Real-time preview:**
- The 3D viewport shows the polygon updating as the user types. Unclosed polygons render as an open polyline with a dashed line from the last point back to origin showing the closure gap.

**Closure feedback:**
- Red badge: "Gap: 2.45m" when closure error > tolerance.
- Green badge: "Closed (error: 0.02m)" when within tolerance.
- Amber badge: "Adjusted (Bowditch)" when auto-adjust is active.

**Reordering segments:**
- Drag handle on each segment card for reordering (use `@dnd-kit/sortable`).
- Reorder changes polygon shape — preview updates in real-time.

**Presets:**
- "Load from Title" button — future feature to parse OCT/TCT lot descriptions.
- "Sample Lots" dropdown with 3-4 common Philippine lot shapes for experimentation.

---

## 8. File Architecture

```
src/
├── types/
│   └── lot.ts                               # All type definitions from §3.1
│
├── lib/
│   └── lot-geometry/
│       ├── bearing.ts                        # Bearing → azimuth → XZ (§4.1)
│       ├── polygon.ts                        # Segments → polygon (§4.2)
│       ├── bowditch.ts                       # Closure adjustment (§4.3)
│       ├── inset.ts                          # Setback polygon offset (§4.4)
│       └── __tests__/
│           ├── bearing.test.ts               # Unit tests for conversion
│           ├── polygon.test.ts               # Polygon construction tests
│           ├── bowditch.test.ts              # Adjustment accuracy tests
│           └── inset.test.ts                 # Setback inset tests
│
├── stores/
│   └── useLotStore.ts                        # Zustand store (§3.2)
│
├── components/
│   └── 3d-lab/
│       └── modules/
│           └── LotConfigurator/
│               ├── index.tsx                 # Module root
│               ├── LotParametersPanel.tsx    # Mode toggle + child rendering
│               ├── BasicLotInputs.tsx        # Existing rect inputs (extracted)
│               ├── SurveyorLotInputs.tsx     # Segment list manager
│               ├── SegmentInputCard.tsx       # Single segment card
│               ├── BearingInput.tsx          # Bearing entry component
│               ├── ClosureStatusBadge.tsx    # Closure indicator
│               ├── LotSummaryFooter.tsx      # Area/perimeter summary
│               ├── LotPolygonMesh.tsx        # 3D polygon renderer (§5.1)
│               ├── BoundaryEdgeLines.tsx     # Color-coded edges (§5.2)
│               └── SetbackOverlay.tsx        # Setback visualization (§5.3)
│
└── lib/
    └── compliance/
        └── lot-bridge.ts                     # Polygon → compliance adapter (§6.1)
```

---

## 9. Implementation Sequence

### Phase 1: Pure Geometry Library (No UI Changes)
**Estimate: 2-3 days**

1. Create `src/types/lot.ts` — all interfaces.
2. Implement `bearing.ts` — bearing-to-azimuth, polar-to-Cartesian.
3. Implement `polygon.ts` — segment array to polygon with area, edges, normals.
4. Implement `bowditch.ts` — closure adjustment.
5. Write unit tests for all three. Test with known Philippine lot descriptions.
6. **Verification:** Feed a real TCT lot description through the functions. Computed area must match title area within 0.1%.

### Phase 2: Zustand Store Extension
**Estimate: 1 day**

1. Extend `useLotStore.ts` with surveyor state and actions.
2. Implement `recompute()` — calls `buildPolygonFromSegments()` and stores result.
3. Implement `getLotData()` bridge function.
4. **Verification:** Unit test the store. Toggle modes, verify rectangle path is byte-identical to current behavior.

### Phase 3: 3D Rendering Components
**Estimate: 2 days**

1. Build `LotPolygonMesh.tsx` — renders any polygon on ground plane.
2. Build `BoundaryEdgeLines.tsx` — color-coded edges with labels.
3. Integrate into existing Canvas — polygon reads from `useLotStore`.
4. Verify rectangular mode still renders the same (it generates a 4-vertex polygon).
5. **Verification:** Load 5 different polygon shapes. Confirm visual correctness.

### Phase 4: UI Components
**Estimate: 3-4 days**

1. Extract existing lot inputs into `BasicLotInputs.tsx` (refactor, not rewrite).
2. Build `BearingInput.tsx` — the most complex input component.
3. Build `SegmentInputCard.tsx` — composed bearing + distance + tag.
4. Build `SurveyorLotInputs.tsx` — manages the segment list.
5. Build `LotParametersPanel.tsx` — mode toggle wrapping both modes.
6. Build `ClosureStatusBadge.tsx` and `LotSummaryFooter.tsx`.
7. **Verification:** Full user flow: enter 5 segments, see polygon update live, check closure.

### Phase 5: Compliance Bridge
**Estimate: 2 days**

1. Implement `inset.ts` — polygon offset for setback computation.
2. Implement `lot-bridge.ts` — adapts polygon data for compliance engine.
3. Build `SetbackOverlay.tsx` — visualizes setback zones on irregular lots.
4. Wire compliance computations (AMBF, PSO, TGFA) through the bridge.
5. **Verification:** Compare rectangular lot setback results before/after. Must be identical. Test irregular lot setbacks against hand-calculated values.

### Phase 6: Polish & Edge Cases
**Estimate: 2 days**

1. Handle self-intersecting polygons (detect and warn).
2. Add sample lot presets.
3. Mobile touch optimization for segment reordering.
4. Error states: < 3 segments, zero-length segments, zero-degree bearings.
5. Performance profiling: ensure polygon recomputation < 16ms for 20+ segments.

**Total estimate: 12-14 days**

---

## 10. Testing Matrix

### Unit Tests (Jest/Vitest)

| Test | Input | Expected Output |
|---|---|---|
| N 0° E bearing → azimuth | `{base:'N', deg:0, min:0, sec:0, turn:'E'}` | `0 rad` |
| N 90° E bearing → azimuth | `{base:'N', deg:90, min:0, sec:0, turn:'E'}` | `π/2 rad` |
| S 45° W bearing → azimuth | `{base:'S', deg:45, min:0, sec:0, turn:'W'}` | `225° = 5π/4 rad` |
| Square lot (4 segments, 10m each) | N0E/10, S90E/10, S0W/10, N90W/10 | Area = 100 sq.m., closed |
| Triangle lot closure | 3 segments forming equilateral | Area matches formula |
| Bowditch on 0.5m error | 5 segments with 0.5m gap | Adjusted area within 0.01% of manual calc |
| Polygon inset (square, 2m setback) | 10×10 square, all sides 2m | 6×6 inner = 36 sq.m. |
| Self-intersecting detection | Bowtie shape | Validation returns error |

### Integration Tests

| Test | Scenario | Assertion |
|---|---|---|
| Mode toggle doesn't reset rect values | Enter 15×25, switch to surveyor, switch back | Width=15, Depth=25 |
| Rect mode compliance unchanged | 300 sq.m. lot, Group A occupancy | Setbacks match current production values exactly |
| Surveyor polygon renders in viewport | 5-segment lot | Canvas contains mesh with correct vertex count |
| Boundary tags reach setback engine | Front=4.5m, Rear=2.0m, Sides=2.0m | Inset polygon area is correct |
| Real TCT lot description | Actual lot from sample TCT | Area within 0.1% of title area |

### Visual Regression Tests

| Test | Method |
|---|---|
| Rectangular lot appearance unchanged | Screenshot diff against current |
| Irregular polygon renders correctly | Screenshot of 5+ known shapes |
| Setback overlay aligns with edges | Manual visual inspection checklist |
| Boundary color coding visible | All 4 tag types show distinct colors |
| Closure gap visualization | Open polygon shows dashed return line |

---

## Appendix A: Philippine Surveyor Bearing Reference

For developers unfamiliar with the notation on Philippine land titles (TCT/OCT):

```
Bearing:    N 65° 30' 00" E
Meaning:    Start facing North.
            Rotate 65 degrees, 30 minutes, 0 seconds toward the East.
            Walk the specified distance.

Full lot description example (from a typical TCT):

  "...thence N. 65° 30' E., 45.00 m. to point 2;
   thence S. 25° 00' E., 30.00 m. to point 3;
   thence S. 65° 30' W., 45.00 m. to point 4;
   thence N. 25° 00' W., 30.00 m. to point of beginning."
```

This describes a parallelogram with 4 segments that returns to the starting point.

---

## Appendix B: Coordinate System Mapping

```
          +Z (North)
           │
           │
           │
  ─────────┼─────────── +X (East)
           │
           │
           │
          -Z (South)

  Three.js: Y is UP (out of screen for plan view)
  Lot plane: XZ at Y=0
  Camera for plan view: positioned at (0, 50, 0), looking down at (0, 0, 0)
```

---

## Appendix C: Existing Interface Compatibility

The current `LotData` interface in the compliance engine:

```typescript
interface LotData {
  width: number          // meters — PRESERVED (bbox width for surveyor mode)
  depth: number          // meters — PRESERVED (bbox depth for surveyor mode)
  area: number           // sq.m.  — UPGRADED (true polygon area for surveyor mode)
  frontage: string       // 'road' | 'alley' — PRESERVED
  adjacentUse: string    // PRESERVED
}
```

The `lot-bridge.ts` function ensures this interface is always satisfied regardless of mode. Downstream functions like `computeSetbacks()`, `computeAMBF()`, `computePSO()`, and `computeTGFA()` receive this interface unchanged. The only addition is the optional `polygon` field for functions that can benefit from the full polygon shape (like the inset setback computation).

---

*End of implementation plan.*
