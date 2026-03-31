'use client'

import * as THREE from 'three'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Four flat planes representing required setback margins.
 * Red tint at low opacity; highlights when activeZone === 'setbacks'.
 */
export function SetbackZones() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const isActive = activeZone === 'setbacks'
  const baseOpacity = isActive ? 0.25 : 0.10
  const dimmed = activeZone !== null && !isActive
  const opacity = dimmed ? 0.05 : baseOpacity

  const color = '#D64545'
  const y = 0.005 // Slight elevation to prevent z-fighting with LotPlane

  const zones: Array<{
    key: string
    width: number
    depth: number
    px: number
    pz: number
  }> = [
    // Front setback — full lot width, setback depth
    {
      key: 'front',
      width: lotWidth,
      depth: setbacks.front,
      px: lotWidth / 2,
      pz: setbacks.front / 2,
    },
    // Rear setback
    {
      key: 'rear',
      width: lotWidth,
      depth: setbacks.rear,
      px: lotWidth / 2,
      pz: lotDepth - setbacks.rear / 2,
    },
    // Left setback — between front and rear setbacks
    {
      key: 'left',
      width: setbacks.left,
      depth: lotDepth - setbacks.front - setbacks.rear,
      px: setbacks.left / 2,
      pz: setbacks.front + (lotDepth - setbacks.front - setbacks.rear) / 2,
    },
    // Right setback
    {
      key: 'right',
      width: setbacks.right,
      depth: lotDepth - setbacks.front - setbacks.rear,
      px: lotWidth - setbacks.right / 2,
      pz: setbacks.front + (lotDepth - setbacks.front - setbacks.rear) / 2,
    },
  ]

  return (
    <group>
      {zones.map((z) => {
        if (z.width <= 0 || z.depth <= 0) return null
        return (
          <mesh
            key={z.key}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[z.px, y, z.pz]}
            onClick={(e) => {
              e.stopPropagation()
              setActiveZone(isActive ? null : 'setbacks')
            }}
          >
            <planeGeometry args={[z.width, z.depth]} />
            <meshStandardMaterial
              color={color}
              side={THREE.DoubleSide}
              transparent
              opacity={opacity}
              depthWrite={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}
