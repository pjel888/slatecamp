import { ThreeEvent } from '@react-three/fiber'
import { GeometrySwitch } from '@/components/r3f/GeometrySwitch'
import type { GeometryInstruction } from '@/features/3d-lab/types/templates'

/**
 * Renders the correct Three.js geometry element for a GeometryInstruction.
 * Delegates to the shared GeometrySwitch primitive.
 */
export function GeometryElement({ inst }: { inst: GeometryInstruction }) {
  return (
    <GeometrySwitch
      type={inst.type}
      args={inst.args}
      profilePoints={inst.profilePoints}
      extrudeDepth={inst.extrudeDepth}
    />
  )
}

/**
 * Full mesh with standard material — used by ParametricScene and CutawaySection.
 */
export function InstructionMesh({ 
  inst,
  onClick
}: { 
  inst: GeometryInstruction
  onClick?: (e: ThreeEvent<MouseEvent>) => void
}) {
  return (
    <mesh
      position={inst.position}
      rotation={inst.rotation ?? [0, 0, 0]}
      scale={inst.scale ?? [1, 1, 1]}
      onClick={onClick}
    >
      <GeometryElement inst={inst} />
      <meshStandardMaterial
        color={inst.color}
        opacity={inst.opacity ?? 1}
        transparent={inst.transparent ?? (inst.opacity !== undefined && inst.opacity < 1)}
      />
    </mesh>
  )
}
