'use client'

import { useMemo } from 'react'
import { Html, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { GEOMETRY_Y, COLOR } from '../constants'

// Firewall markers — vertical planes on lot property lines where firewalls are active.
// Height matches the proposed building. Positioned flush with lot boundary.
// Orange fill with white edge wireframe + floating label per side.

const WALL_THICKNESS = 0.12

interface FirewallPlaneProps {
  position: [number, number, number]
  size: [number, number, number]
  label: string
}

function FirewallPlane({ position, size, label }: FirewallPlaneProps) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: COLOR.FIREWALL,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  return (
    <group>
      <mesh position={position} material={material}>
        <boxGeometry args={size} />
        <Edges color="#FFFFFF" lineWidth={1} />
      </mesh>
      <Html
        position={[position[0], position[1] + size[1] / 2 + 0.5, position[2]]}
        style={{ pointerEvents: 'none' }}
      >
        <div className="rounded-sm bg-[#FF6B35]/90 px-1.5 py-0.5 text-[8px] font-mono font-medium text-white whitespace-nowrap">
          FW {label}
        </div>
      </Html>
    </group>
  )
}

export function FirewallMarkers() {
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const firewallActive = useDevControlsStore((s) => s.zoning.firewallActive)
  const firewallSides = useDevControlsStore((s) => s.zoning.firewallSides)
  const proposedHeight = useDevControlsStore((s) => s.result.proposedHeight)

  if (!firewallActive || firewallSides.length === 0) return null

  // Firewall height matches the proposed building, minimum 3m for visibility
  const wallH = Math.max(proposedHeight, 3)
  const baseY = GEOMETRY_Y.BUILDING_BASE + wallH / 2

  return (
    <group>
      {firewallSides.includes('left') && (
        <FirewallPlane
          position={[0, baseY, lotD / 2]}
          size={[WALL_THICKNESS, wallH, lotD]}
          label="Left"
        />
      )}
      {firewallSides.includes('right') && (
        <FirewallPlane
          position={[lotW, baseY, lotD / 2]}
          size={[WALL_THICKNESS, wallH, lotD]}
          label="Right"
        />
      )}
      {firewallSides.includes('rear') && (
        <FirewallPlane
          position={[lotW / 2, baseY, lotD]}
          size={[lotW, wallH, WALL_THICKNESS]}
          label="Rear"
        />
      )}
      {firewallSides.includes('front') && (
        <FirewallPlane
          position={[lotW / 2, baseY, 0]}
          size={[lotW, wallH, WALL_THICKNESS]}
          label="Front"
        />
      )}
    </group>
  )
}
