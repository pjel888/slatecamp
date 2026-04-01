// src/lib/lot-geometry/bowditch.ts
// ─── Bowditch (Compass Rule) adjustment ────────────────────────────────────
// Standard adjustment method used in Philippine land surveying.
// Distributes closure error proportionally to each leg's distance.

import type { LotVertex } from '@/types/lot'

/**
 * Bowditch (Compass Rule) adjustment.
 *
 * correction_x_i = -(closure_error_x) × (distance_i / total_perimeter)
 * correction_z_i = -(closure_error_z) × (distance_i / total_perimeter)
 *
 * @param rawVertices  Vertices including the unclosed final point (length = N + 1)
 * @param distances    Distance of each segment (length = N)
 * @returns            Adjusted vertices array (length = N, closed)
 */
export function bowditchAdjust(
  rawVertices: LotVertex[],    // length = N + 1 (origin + each endpoint)
  distances: number[]           // length = N
): LotVertex[] {
  const N = distances.length
  if (N < 3 || rawVertices.length < N + 1) return rawVertices.slice(0, N)

  const perimeter = distances.reduce((s, d) => s + d, 0)
  if (perimeter === 0) return rawVertices.slice(0, N)

  // Closure error = last computed point (should return to origin 0,0)
  const lastPt = rawVertices[N]
  const errorX = lastPt.x
  const errorZ = lastPt.z

  const adjusted: LotVertex[] = [{ x: 0, z: 0 }]  // origin stays fixed
  let cumulativeDistance = 0

  for (let i = 0; i < N - 1; i++) {
    cumulativeDistance += distances[i]
    const ratio = cumulativeDistance / perimeter

    adjusted.push({
      x: rawVertices[i + 1].x - errorX * ratio,
      z: rawVertices[i + 1].z - errorZ * ratio,
    })
  }

  return adjusted
}
