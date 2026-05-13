'use client'

import { Instances, Instance } from '@react-three/drei'
import type { GeometryInstruction } from '@/features/3d-lab/types/templates'

interface InstancedMeshProps {
  inst: GeometryInstruction
}

/**
 * Renders instanced geometry — one draw call for many identical shapes at different positions.
 * Used by the wall configurator for repeated elements: studs, blocks, rebar, insulation batts.
 */
export const InstancedMesh = ({ inst }: InstancedMeshProps) => {
  if (!inst.instancedPositions || !inst.instancedShape || !inst.instancedShapeArgs) {
    return null
  }

  const positions = inst.instancedPositions
  const rotations = inst.instancedRotations
  const colors = inst.instancedColors

  // Build the base geometry element based on instancedShape
  const geometryElement = (() => {
    switch (inst.instancedShape) {
      case 'box':
        return <boxGeometry args={inst.instancedShapeArgs as [number, number, number]} />
      case 'cylinder':
        return <cylinderGeometry args={inst.instancedShapeArgs as [number, number, number, number]} />
      case 'sphere':
        return <sphereGeometry args={inst.instancedShapeArgs as [number, number, number]} />
      default:
        return <boxGeometry args={[0.1, 0.1, 0.1]} />
    }
  })()

  return (
    <group
      position={inst.position}
      rotation={inst.rotation ?? [0, 0, 0]}
      userData={{ slatecampCameraFitExclude: inst.cameraFitExclude === true }}
    >
      <Instances limit={positions.length} frustumCulled={false}>
        {geometryElement}
        {inst.material === 'basic' ? (
          <meshBasicMaterial
            color={inst.color}
            opacity={inst.opacity ?? 1}
            transparent={inst.transparent ?? (inst.opacity !== undefined && inst.opacity < 1)}
            depthWrite={inst.depthWrite ?? true}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial
            color={inst.color}
            opacity={inst.opacity ?? 1}
            transparent={inst.transparent ?? (inst.opacity !== undefined && inst.opacity < 1)}
            depthWrite={inst.depthWrite ?? true}
            roughness={0.86}
            metalness={0}
          />
        )}
        {positions.map((pos, i) => (
          <Instance
            key={i}
            position={pos}
            rotation={rotations?.[i] ?? [0, 0, 0]}
            color={colors?.[i] ?? undefined}
          />
        ))}
      </Instances>
    </group>
  )
}
