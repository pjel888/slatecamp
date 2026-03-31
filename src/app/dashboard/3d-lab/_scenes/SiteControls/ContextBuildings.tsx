'use client'

import { ArchMass } from '../../_components/ArchMass'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Context buildings on adjacent lots, properly positioned across streets.
 *
 * Road layout (from RoadInfrastructure):
 * - Front: RROW wide, centered on z < 0
 * - Rear: 6m access road starting at z = lotDepth
 * - Left side street: 6m wide, centered at x = -3
 * - Right side street: 6m wide, centered at x = lotWidth + 3
 *
 * Buildings are placed BEYOND each road's far sidewalk with setbacks.
 */
export function ContextBuildings() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const rrowWidth = useSiteControlsStore((s) => s.inputs.rrowWidth)

  const sideStreetW = 6
  const bldgSetback = 3 // building setback from lot line

  // ── Compute edges of each road ─────────────────────────────────────
  // Front road: far edge at z = -rrowWidth
  const frontBldgStart = -(rrowWidth + bldgSetback)

  // Rear road: starts at lotDepth, 6m wide, far edge at lotDepth + 6
  const rearBldgStart = lotDepth + sideStreetW + bldgSetback

  // Left side street: centered at x = -3, width 6 → left edge at x = -6
  const leftBldgStart = -(sideStreetW + bldgSetback)

  // Right side street: centered at x = lotWidth+3, width 6 → right edge at lotWidth+6
  const rightBldgStart = lotWidth + sideStreetW + bldgSetback

  const cx = lotWidth / 2

  // Building definitions: x/z = center position, w/d/h = dimensions
  // Heights follow step-down zoning (shorter near subject lot)

  const frontBuildings = [
    { x: cx - lotWidth * 0.35, w: Math.min(lotWidth * 0.28, 8), d: 10, h: 4 },
    { x: cx + 0.5, w: Math.min(lotWidth * 0.32, 10), d: 12, h: 5 },
    { x: cx + lotWidth * 0.35, w: Math.min(lotWidth * 0.22, 7), d: 8, h: 3.5 },
  ]

  const rearBuildings = [
    { x: cx - lotWidth * 0.25, w: Math.min(lotWidth * 0.35, 10), d: 8, h: 5 },
    { x: cx + lotWidth * 0.25, w: Math.min(lotWidth * 0.28, 8), d: 10, h: 6 },
  ]

  const leftBuildings = [
    { z: lotDepth * 0.25, w: 8, d: Math.min(lotDepth * 0.3, 8), h: 5 },
    { z: lotDepth * 0.7, w: 7, d: Math.min(lotDepth * 0.25, 7), h: 4 },
  ]

  const rightBuildings = [
    { z: lotDepth * 0.2, w: 8, d: Math.min(lotDepth * 0.35, 9), h: 6 },
    { z: lotDepth * 0.65, w: 7, d: Math.min(lotDepth * 0.28, 8), h: 4.5 },
  ]

  return (
    <group>
      {/* Front block */}
      {frontBuildings.map((b, i) => (
        <ArchMass key={`f-${i}`} position={[b.x, b.h / 2, frontBldgStart - b.d / 2]} isContext>
          <boxGeometry args={[b.w, b.h, b.d]} />
        </ArchMass>
      ))}

      {/* Rear block */}
      {rearBuildings.map((b, i) => (
        <ArchMass key={`r-${i}`} position={[b.x, b.h / 2, rearBldgStart + b.d / 2]} isContext>
          <boxGeometry args={[b.w, b.h, b.d]} />
        </ArchMass>
      ))}

      {/* Left block */}
      {leftBuildings.map((b, i) => (
        <ArchMass key={`l-${i}`} position={[leftBldgStart - b.w / 2, b.h / 2, b.z]} isContext>
          <boxGeometry args={[b.w, b.h, b.d]} />
        </ArchMass>
      ))}

      {/* Right block */}
      {rightBuildings.map((b, i) => (
        <ArchMass key={`ri-${i}`} position={[rightBldgStart + b.w / 2, b.h / 2, b.z]} isContext>
          <boxGeometry args={[b.w, b.h, b.d]} />
        </ArchMass>
      ))}

      {/* No ground planes under context lots — prevents overlap with road surfaces */}
    </group>
  )
}
