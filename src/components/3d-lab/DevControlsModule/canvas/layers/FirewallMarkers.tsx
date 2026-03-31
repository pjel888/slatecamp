'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR } from '../constants'

// Firewall markers — thin vertical planes on lot boundaries where firewalls are active.
// Only rendered when firewallActive is true.

export function FirewallMarkers() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const firewallActive = useDevControlsStore((s) => s.zoning.firewallActive)
  const firewallSides = useDevControlsStore((s) => s.zoning.firewallSides)

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLOR.FIREWALL,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  if (!firewallActive || firewallSides.length === 0) return null

  const wallHeight = 4
  const wallThickness = 0.08

  return (
    <group>
      {firewallSides.includes('left') && (
        <mesh position={[0, GEOMETRY_Y.BUILDING_BASE + wallHeight / 2, lotD / 2]} material={material}>
          <boxGeometry args={[wallThickness, wallHeight, lotD]} />
        </mesh>
      )}
      {firewallSides.includes('right') && (
        <mesh position={[lotW, GEOMETRY_Y.BUILDING_BASE + wallHeight / 2, lotD / 2]} material={material}>
          <boxGeometry args={[wallThickness, wallHeight, lotD]} />
        </mesh>
      )}
      {firewallSides.includes('rear') && (
        <mesh position={[lotW / 2, GEOMETRY_Y.BUILDING_BASE + wallHeight / 2, lotD]} material={material}>
          <boxGeometry args={[lotW, wallHeight, wallThickness]} />
        </mesh>
      )}
      {firewallSides.includes('front') && (
        <mesh position={[lotW / 2, GEOMETRY_Y.BUILDING_BASE + wallHeight / 2, 0]} material={material}>
          <boxGeometry args={[lotW, wallHeight, wallThickness]} />
        </mesh>
      )}
    </group>
  )
}
