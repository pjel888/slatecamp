'use client'

import { useSiteControlsStore } from '../../_stores/siteControlsStore'

/**
 * Procedural road + sidewalks in front of the subject lot.
 * Road runs along z<0 (the front property line faces the RROW).
 */
export function UrbanGrid() {
  const lotWidth = useSiteControlsStore((s) => s.inputs.lotWidth)
  const rrowWidth = useSiteControlsStore((s) => s.inputs.rrowWidth)

  const roadLength = lotWidth + 40
  const sidewalkWidth = 1.5

  return (
    <group>
      {/* Road surface — asphalt gray */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lotWidth / 2, -0.003, -(rrowWidth / 2)]}
      >
        <planeGeometry args={[roadLength, rrowWidth]} />
        <meshStandardMaterial color="#6B6B6B" roughness={0.95} metalness={0.0} />
      </mesh>

      {/* Sidewalk — lot side */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lotWidth / 2, -0.002, -(sidewalkWidth / 2) - 0.1]}
      >
        <planeGeometry args={[roadLength, sidewalkWidth]} />
        <meshStandardMaterial color="#C4C0B8" roughness={0.88} metalness={0.0} />
      </mesh>

      {/* Sidewalk — far side */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lotWidth / 2, -0.002, -rrowWidth + sidewalkWidth / 2 + 0.1]}
      >
        <planeGeometry args={[roadLength, sidewalkWidth]} />
        <meshStandardMaterial color="#C4C0B8" roughness={0.88} metalness={0.0} />
      </mesh>

      {/* Road center line */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[lotWidth / 2, -0.001, -(rrowWidth / 2)]}
      >
        <planeGeometry args={[roadLength, 0.12]} />
        <meshStandardMaterial color="#E8E4B0" roughness={0.6} metalness={0.0} />
      </mesh>
    </group>
  )
}
