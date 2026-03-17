// src/app/dashboard/3d-lab/_components/GeometryMesh.tsx
// Shared geometry renderer — single source of truth for all template scenes.
import type { GeometryInstruction } from '../_types/templates'

/**
 * Renders the correct Three.js geometry element for a GeometryInstruction.
 * Returns only the <xxxGeometry /> JSX — wrap in your own <mesh> for materials.
 *
 * No useMemo needed: geometry JSX elements are lightweight React intrinsics
 * that R3F handles efficiently, and upstream configs are already memoized.
 */
export function GeometryElement({ inst }: { inst: GeometryInstruction }) {
  switch (inst.type) {
    case 'box':
      return <boxGeometry args={inst.args as [number, number, number]} />
    case 'cylinder':
      return <cylinderGeometry args={inst.args as [number, number, number, number]} />
    case 'plane':
      return <planeGeometry args={inst.args as [number, number]} />
    case 'ring':
      return <ringGeometry args={inst.args as [number?, number?, number?, number?, number?, number?]} />
    case 'sphere':
      return <sphereGeometry args={inst.args as [number, number, number]} />
    case 'cone':
      return <coneGeometry args={inst.args as [number, number, number]} />
    case 'line':
      return <bufferGeometry />
    default:
      return <boxGeometry args={[0.1, 0.1, 0.1]} />
  }
}

/**
 * Full mesh with standard material — used by ParametricScene and CutawaySection.
 */
export function InstructionMesh({ inst }: { inst: GeometryInstruction }) {
  return (
    <mesh
      position={inst.position}
      rotation={inst.rotation ?? [0, 0, 0]}
      scale={inst.scale ?? [1, 1, 1]}
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
