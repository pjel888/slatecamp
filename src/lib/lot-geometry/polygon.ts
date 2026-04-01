// src/lib/lot-geometry/polygon.ts
// ─── Polygon construction from surveyor segments ───────────────────────────
// Zero framework dependencies. Pure math.

import type { LotSegment, LotVertex, LotEdge, ComputedLotPolygon } from '@/types/lot'
import { bearingToAzimuthRad, polarToCartesian } from './bearing'

/**
 * Build the full polygon from an ordered array of surveyor segments.
 *
 * Walk: Start at origin (0,0). For each segment, compute the azimuth,
 * convert to XZ displacement, accumulate position.
 *
 * The resulting vertices array has length = segments.length
 * (each vertex is the start point of the corresponding segment).
 */
export function buildPolygonFromSegments(
  segments: LotSegment[]
): ComputedLotPolygon | null {
  if (segments.length < 3) return null

  const allVertices: LotVertex[] = [{ x: 0, z: 0 }]
  let currentX = 0
  let currentZ = 0
  let perimeter = 0

  for (const seg of segments) {
    const azimuth = bearingToAzimuthRad(seg.bearing)
    const { dx, dz } = polarToCartesian(azimuth, seg.distance)

    currentX += dx
    currentZ += dz
    perimeter += seg.distance

    allVertices.push({ x: currentX, z: currentZ })
  }

  // ── Closure check ────────────────────────────────────────
  const lastVertex = allVertices[allVertices.length - 1]
  const closureErrorMeters = Math.sqrt(lastVertex.x ** 2 + lastVertex.z ** 2)
  const closureErrorRatio = perimeter > 0 ? closureErrorMeters / perimeter : Infinity

  const closure = {
    isClosed: closureErrorRatio < 1 / 5000,   // surveying standard
    closureErrorMeters,
    closureErrorRatio,
    perimeterMeters: perimeter,
  }

  // ── Build closed vertices (N vertices for N segments) ────
  const N = segments.length
  const closedVertices = allVertices.slice(0, N)

  // ── Build edges with outward normals ─────────────────────
  const edges: LotEdge[] = segments.map((seg, i) => {
    const from = closedVertices[i]
    const to = closedVertices[(i + 1) % N]
    const edgeDx = to.x - from.x
    const edgeDz = to.z - from.z
    const len = Math.sqrt(edgeDx ** 2 + edgeDz ** 2)

    // Outward normal (perpendicular to edge direction)
    const nx = len > 0 ? edgeDz / len : 0
    const nz = len > 0 ? -edgeDx / len : 0

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

/**
 * Build a rectangular lot polygon from width and depth.
 * Used as the compatibility bridge for rectangle mode.
 * Origin at (0,0), extends to (width, depth).
 */
export function buildRectangularPolygon(width: number, depth: number): ComputedLotPolygon {
  const vertices: LotVertex[] = [
    { x: 0, z: 0 },
    { x: width, z: 0 },
    { x: width, z: depth },
    { x: 0, z: depth },
  ]

  const edges: LotEdge[] = [
    { from: vertices[0], to: vertices[1], segmentId: 'rect-front', boundaryTag: 'front', length: width, normalOutward: { x: 0, z: -1 } },
    { from: vertices[1], to: vertices[2], segmentId: 'rect-right', boundaryTag: 'right_side', length: depth, normalOutward: { x: 1, z: 0 } },
    { from: vertices[2], to: vertices[3], segmentId: 'rect-rear', boundaryTag: 'rear', length: width, normalOutward: { x: 0, z: 1 } },
    { from: vertices[3], to: vertices[0], segmentId: 'rect-left', boundaryTag: 'left_side', length: depth, normalOutward: { x: -1, z: 0 } },
  ]

  return {
    vertices,
    edges,
    area: width * depth,
    perimeter: 2 * (width + depth),
    centroid: { x: width / 2, z: depth / 2 },
    closure: { isClosed: true, closureErrorMeters: 0, closureErrorRatio: 0, perimeterMeters: 2 * (width + depth) },
    boundingBox: { minX: 0, maxX: width, minZ: 0, maxZ: depth, width, depth },
  }
}
