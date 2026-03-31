'use client'

import { ArchMass } from '../../_components/ArchMass'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Ghost white surrounding buildings per UX Plan §02.
 * isContext={true} — no castShadow, ghost white #EDEAE4, edges only.
 * Positioned just outside the lot boundary to give neighborhood context.
 */
export function ContextBuildings() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)

  // Context buildings placed around the lot — varied sizes for realism
  const buildings = [
    // Behind the lot (rear neighbor)
    { x: lotWidth * 0.3, z: lotDepth + 4, w: lotWidth * 0.5, d: 8, h: 6 },
    { x: lotWidth * 0.8, z: lotDepth + 5, w: lotWidth * 0.3, d: 6, h: 8 },
    // Left neighbor
    { x: -5, z: lotDepth * 0.4, w: 6, d: lotDepth * 0.4, h: 5 },
    // Right neighbor
    { x: lotWidth + 4, z: lotDepth * 0.3, w: 5, d: lotDepth * 0.5, h: 7 },
    // Across the street (front)
    { x: lotWidth * 0.5, z: -8, w: lotWidth * 0.6, d: 6, h: 4 },
  ]

  return (
    <group>
      {buildings.map((b, i) => (
        <ArchMass
          key={i}
          position={[b.x, b.h / 2, b.z]}
          isContext
        >
          <boxGeometry args={[b.w, b.h, b.d]} />
        </ArchMass>
      ))}
    </group>
  )
}
