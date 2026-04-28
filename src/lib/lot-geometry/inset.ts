// src/lib/lot-geometry/inset.ts
// ─── Polygon inset for setback computation ─────────────────────────────────
// Offsets each edge inward by its boundary-tagged setback amount,
// then intersects adjacent offset edges to get the inset polygon.

import type { LotVertex, BoundaryTag, ComputedLotPolygon } from '@/types/lot'

interface SetbackValues {
  front: number
  rear: number
  left: number
  right: number
}

/**
 * Compute the setback-inset polygon for an irregular lot.
 *
 * For each edge: offset inward by the setback amount for its boundary tag.
 * Then intersect adjacent offset edges to get new inset vertices.
 *
 * CRITICAL: This function bridges boundaryTag → setback values.
 */
export function computeSetbackInsetPolygon(
  polygon: ComputedLotPolygon,
  setbacks: SetbackValues
): { vertices: LotVertex[]; area: number } {
  const { edges } = polygon

  // Map boundary tag to setback distance
  const tagToSetback: Record<BoundaryTag, number> = {
    front: setbacks.front,
    rear: setbacks.rear,
    left_side: setbacks.left,
    right_side: setbacks.right,
  }

  // Offset each edge inward along its outward normal (negate = inward)
  const offsetEdges = edges.map(edge => {
    const d = tagToSetback[edge.boundaryTag]
    return {
      from: {
        x: edge.from.x - edge.normalOutward.x * d,
        z: edge.from.z - edge.normalOutward.z * d,
      },
      to: {
        x: edge.to.x - edge.normalOutward.x * d,
        z: edge.to.z - edge.normalOutward.z * d,
      },
    }
  })

  // Intersect adjacent offset edges to get inset vertices
  const N = offsetEdges.length
  const insetVertices: LotVertex[] = []

  for (let i = 0; i < N; i++) {
    const curr = offsetEdges[i]
    const next = offsetEdges[(i + 1) % N]
    const pt = lineLineIntersection(curr.from, curr.to, next.from, next.to)
    if (pt) {
      insetVertices.push(pt)
    }
  }

  // Compute area of inset polygon (Shoelace)
  let area = 0
  const M = insetVertices.length
  for (let i = 0; i < M; i++) {
    const j = (i + 1) % M
    area += insetVertices[i].x * insetVertices[j].z
    area -= insetVertices[j].x * insetVertices[i].z
  }
  area = Math.abs(area / 2)

  return { vertices: insetVertices, area }
}

/**
 * Line-line intersection in 2D (XZ plane).
 * Returns the intersection point, or null if lines are parallel.
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
  if (Math.abs(denom) < 1e-10) return null // parallel

  const t = ((p3.x - p1.x) * d2z - (p3.z - p1.z) * d2x) / denom

  return {
    x: p1.x + t * d1x,
    z: p1.z + t * d1z,
  }
}
