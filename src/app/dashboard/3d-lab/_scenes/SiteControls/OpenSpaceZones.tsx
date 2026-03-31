'use client'

import { Edges } from '@react-three/drei'
import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * ISA (paved) and USA (landscaped) planes at Y=0.010.
 * ISA is positioned in front of the building; USA behind.
 * Depths computed so rectangular areas match the redistributed sqm values.
 */
export function OpenSpaceZones() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const lotDepth = useSiteControlsStore((s) => s.inputs.lotDepth)
  const computed = useSiteControlsStore((s) => s.computed)
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  const { isa, usa } = computed

  if (lotWidth <= 0) return null

  // Represent ISA and USA as front/rear strips whose areas equal the computed values
  const isaDepth = Math.min(isa / lotWidth, lotDepth * 0.6)
  const usaDepth = Math.min(usa / lotWidth, lotDepth * 0.6)

  const isaActive = activeZone === 'isa'
  const usaActive = activeZone === 'usa'

  return (
    <group>
      {/* ISA — paved open space in front portion of lot */}
      {isaDepth > 0.01 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth / 2, 0.01, isaDepth / 2]}
          onClick={(e) => {
            e.stopPropagation()
            setActiveZone(isaActive ? null : 'isa')
          }}
        >
          <planeGeometry args={[lotWidth, isaDepth]} />
          <meshStandardMaterial
            color="#C4BAA5"
            roughness={0.85}
            metalness={0.0}
            transparent
            opacity={isaActive ? 0.8 : 0.6}
          />
          <Edges threshold={15} color="#A09882" lineWidth={0.5} scale={1.001} />
        </mesh>
      )}

      {/* USA — landscaped open space in rear portion of lot */}
      {usaDepth > 0.01 && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[lotWidth / 2, 0.01, lotDepth - usaDepth / 2]}
          onClick={(e) => {
            e.stopPropagation()
            setActiveZone(usaActive ? null : 'usa')
          }}
        >
          <planeGeometry args={[lotWidth, usaDepth]} />
          <meshStandardMaterial
            color="#7B9E6A"
            roughness={0.8}
            metalness={0.0}
            transparent
            opacity={usaActive ? 0.8 : 0.6}
          />
          <Edges threshold={15} color="#5C7A4F" lineWidth={0.5} scale={1.001} />
        </mesh>
      )}
    </group>
  )
}
