'use client'

import * as THREE from 'three'
import { Line } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Four flat planes representing required setback margins.
 * Amber wireframe per UX Plan §03 (was red).
 */
export function SetbackZones() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const setbacks = useSiteControlsStore((s) => s.computed.setbacks)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const isActive = activeZone === 'setbacks'
  const dimmed = activeZone !== null && !isActive
  const color = isActive ? '#1B3FC4' : dimmed ? '#B0B0B0' : '#F5A623'
  const opacity = isActive ? 0.35 : dimmed ? 0.05 : 0.12
  const y = 0.005

  const zones: Array<{
    key: string
    width: number
    depth: number
    px: number
    pz: number
  }> = [
    {
      key: 'front',
      width: lotWidth,
      depth: setbacks.front,
      px: lotWidth / 2,
      pz: setbacks.front / 2,
    },
    {
      key: 'rear',
      width: lotWidth,
      depth: setbacks.rear,
      px: lotWidth / 2,
      pz: lotDepth - setbacks.rear / 2,
    },
    {
      key: 'left',
      width: setbacks.left,
      depth: lotDepth - setbacks.front - setbacks.rear,
      px: setbacks.left / 2,
      pz: setbacks.front + (lotDepth - setbacks.front - setbacks.rear) / 2,
    },
    {
      key: 'right',
      width: setbacks.right,
      depth: lotDepth - setbacks.front - setbacks.rear,
      px: lotWidth - setbacks.right / 2,
      pz: setbacks.front + (lotDepth - setbacks.front - setbacks.rear) / 2,
    },
  ]

  // Dashed outline around the buildable envelope (inside all setbacks)
  const bx0 = setbacks.left
  const bx1 = lotWidth - setbacks.right
  const bz0 = setbacks.front
  const bz1 = lotDepth - setbacks.rear
  const by = 0.008
  const envelopePoints: [number, number, number][] = [
    [bx0, by, bz0],
    [bx1, by, bz0],
    [bx1, by, bz1],
    [bx0, by, bz1],
    [bx0, by, bz0],
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

      {/* Dashed buildable envelope outline */}
      {bx1 > bx0 && bz1 > bz0 && (
        <Line
          points={envelopePoints}
          color={color}
          lineWidth={1.5}
          dashed
          dashSize={0.3}
          gapSize={0.2}
        />
      )}
    </group>
  )
}
