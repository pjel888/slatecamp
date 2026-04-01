// src/lib/lot-geometry/polygonGeometry.ts
// ─── Utility to create Three.js BufferGeometry from polygon vertices ───────
// Fan triangulation from vertex 0 — works for convex and most concave lots.
// Used by floor slabs, BHL ceiling, FLAR ceiling, setback zones in surveyor mode.

import type { LotVertex } from '@/types/lot'

/**
 * Create a flat BufferGeometry in the XZ plane from polygon vertices.
 * No rotation needed — geometry is built directly in world space.
 * @param vertices — ordered polygon vertices (CCW or CW)
 * @param y — Y-axis position for all vertices
 * @returns Float32Array of positions (3 floats per vertex, 3 vertices per triangle)
 */
export function polygonToPositions(vertices: LotVertex[], y: number = 0): Float32Array {
  const N = vertices.length
  if (N < 3) return new Float32Array(0)

  // Fan triangulation: triangle(0, i, i+1) for i = 1..N-2
  const positions: number[] = []
  for (let i = 1; i < N - 1; i++) {
    positions.push(vertices[0].x, y, vertices[0].z)
    positions.push(vertices[i].x, y, vertices[i].z)
    positions.push(vertices[i + 1].x, y, vertices[i + 1].z)
  }

  return new Float32Array(positions)
}

/**
 * Create extrusion positions (walls) from polygon vertices.
 * Generates vertical quads between base Y and top Y for each edge.
 * Used for building volume visualization on polygon lots.
 */
export function polygonExtrusionPositions(
  vertices: LotVertex[],
  baseY: number,
  topY: number
): Float32Array {
  const N = vertices.length
  if (N < 3) return new Float32Array(0)

  const positions: number[] = []
  for (let i = 0; i < N; i++) {
    const curr = vertices[i]
    const next = vertices[(i + 1) % N]

    // Two triangles per wall quad
    // Triangle 1: bottom-left, bottom-right, top-right
    positions.push(curr.x, baseY, curr.z)
    positions.push(next.x, baseY, next.z)
    positions.push(next.x, topY, next.z)

    // Triangle 2: bottom-left, top-right, top-left
    positions.push(curr.x, baseY, curr.z)
    positions.push(next.x, topY, next.z)
    positions.push(curr.x, topY, curr.z)
  }

  return new Float32Array(positions)
}
