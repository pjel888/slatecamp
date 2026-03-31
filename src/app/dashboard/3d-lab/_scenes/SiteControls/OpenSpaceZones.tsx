'use client'

import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * ISA (paved) and USA (landscaped) open space planes.
 * Positioned at y=0.01 to prevent z-fighting.
 * ISA occupies the front setback area; USA occupies the rear.
 * Both clickable, both respect activeZone dimming.
 */
export function OpenSpaceZones() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)
  const buildableWidth = useSiteControlsStore((s) => s.computed.buildableWidth)
  const buildableDepth = useSiteControlsStore((s) => s.computed.buildableDepth)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const y = 0.01

  // ISA (paved open space) — front setback area + side strips in front zone
  const isaActive = activeZone === 'isa'
  const isaDimmed = activeZone !== null && !isaActive
  const isaOpacity = isaDimmed ? 0.25 : 0.85

  // USA (unpaved/landscaped) — rear setback area + side strips in rear zone
  const usaActive = activeZone === 'usa'
  const usaDimmed = activeZone !== null && !usaActive
  const usaOpacity = usaDimmed ? 0.25 : 0.85

  // ISA zone: front strip (full lot width × front setback depth)
  const isaFrontW = lotWidth
  const isaFrontD = setbacks.front

  // USA zone: rear strip (full lot width × rear setback depth)
  const usaRearW = lotWidth
  const usaRearD = setbacks.rear

  // Side strips allocated: left side strip goes to ISA, right side strip to USA
  // This is a visualization simplification — in practice, ISA/USA allocation is
  // the designer's choice within the TOSL. For teaching purposes, we show clear
  // spatial separation between the two zone types.
  const sideStripDepth = lotDepth - setbacks.front - setbacks.rear

  return (
    <group>
      {/* ISA — front paved zone */}
      {isaFrontD > 0 && isaFrontW > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth / 2, y, setbacks.front / 2]}
          onClick={(e) => {
            e.stopPropagation()
            setActiveZone(isaActive ? null : 'isa')
          }}
        >
          <planeGeometry args={[isaFrontW, isaFrontD]} />
          <meshStandardMaterial
            color="#C4BAA5"
            side={THREE.DoubleSide}
            transparent
            opacity={isaOpacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ISA — left side strip */}
      {setbacks.left > 0 && sideStripDepth > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[setbacks.left / 2, y, setbacks.front + sideStripDepth / 2]}
          onClick={(e) => {
            e.stopPropagation()
            setActiveZone(isaActive ? null : 'isa')
          }}
        >
          <planeGeometry args={[setbacks.left, sideStripDepth]} />
          <meshStandardMaterial
            color="#C4BAA5"
            side={THREE.DoubleSide}
            transparent
            opacity={isaOpacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* USA — rear landscaped zone */}
      {usaRearD > 0 && usaRearW > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth / 2, y, lotDepth - setbacks.rear / 2]}
          onClick={(e) => {
            e.stopPropagation()
            setActiveZone(usaActive ? null : 'usa')
          }}
        >
          <planeGeometry args={[usaRearW, usaRearD]} />
          <meshStandardMaterial
            color="#7B9E6A"
            side={THREE.DoubleSide}
            transparent
            opacity={usaOpacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* USA — right side strip */}
      {setbacks.right > 0 && sideStripDepth > 0 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth - setbacks.right / 2, y, setbacks.front + sideStripDepth / 2]}
          onClick={(e) => {
            e.stopPropagation()
            setActiveZone(usaActive ? null : 'usa')
          }}
        >
          <planeGeometry args={[setbacks.right, sideStripDepth]} />
          <meshStandardMaterial
            color="#7B9E6A"
            side={THREE.DoubleSide}
            transparent
            opacity={usaOpacity}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
