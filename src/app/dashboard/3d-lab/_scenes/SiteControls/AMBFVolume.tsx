'use client'

import { useMemo } from 'react'
import { Edges, Outlines } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Building footprint extruded box at Y=(height/2)+0.015.
 * Cobalt when compliant, red when violating. Dark edges always; outline on active.
 * When zoning-capped (AMBF < buildable area), building scales proportionally.
 */
export function AMBFVolume() {
  const computed = useSiteControlsStore((s) => s.computed)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const { ambf, buildableWidth, buildableDepth, setbacks, buildingHeight, compliance } = computed
  const isActive = activeZone === 'ambf'
  const isViolating = !compliance.ambfOk

  // When zoning-capped, scale building proportionally within buildable area
  const dims = useMemo(() => {
    if (buildableWidth <= 0 || buildableDepth <= 0 || ambf <= 0) {
      return { w: 0, h: 0, d: 0 }
    }
    const maxFromSetbacks = buildableWidth * buildableDepth
    if (ambf >= maxFromSetbacks) {
      return { w: buildableWidth, h: buildingHeight, d: buildableDepth }
    }
    // Zoning caps AMBF — the "aha" moment. Scale proportionally.
    const scale = Math.sqrt(ambf / maxFromSetbacks)
    return { w: buildableWidth * scale, h: buildingHeight, d: buildableDepth * scale }
  }, [ambf, buildableWidth, buildableDepth, buildingHeight])

  if (dims.w <= 0 || dims.d <= 0) return null

  // Center within buildable area
  const cx = setbacks.left + buildableWidth / 2
  const cz = setbacks.front + buildableDepth / 2
  const cy = dims.h / 2 + 0.015

  const color = isViolating ? '#E63329' : '#1B3FC4'

  return (
    <mesh
      position={[cx, cy, cz]}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation()
        setActiveZone(isActive ? null : 'ambf')
      }}
    >
      <boxGeometry args={[dims.w, dims.h, dims.d]} />
      <meshStandardMaterial
        color={color}
        roughness={isActive ? 0.35 : 0.4}
        metalness={0.0}
        emissive={isViolating ? '#E63329' : '#000000'}
        emissiveIntensity={isViolating ? 0.2 : 0.0}
      />
      <Edges threshold={15} color="#3A3A3A" lineWidth={1.0} scale={1.002} />
      {isActive && <Outlines thickness={0.02} color="#4A6FE8" screenspace={false} />}
    </mesh>
  )
}
